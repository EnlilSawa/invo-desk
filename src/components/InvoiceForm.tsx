'use client';

import { useState, useEffect, useRef } from 'react';
import { InvoiceFormData } from '@/types/invoice';
import { generateInvoicePDF, downloadPDF } from '@/utils/pdfGenerator';
import { sendInvoiceEmail, generateEmailContent, generateEmailTemplate } from '@/utils/emailService';
import { generateSignatureLink, generateInvoiceId, createDocuSignEnvelope, isDocuSignConfigured } from '@/utils/signatureService';

const initialFormData: InvoiceFormData = {
  // Client Information
  clientName: '',
  clientEmail: '',
  clientCompany: '',
  clientAddress: '',
  
  // Project Information
  projectTitle: '',
  serviceDescription: '',
  projectStartDate: '',
  projectEndDate: '',
  
  // Financial Information
  hourlyRate: 0,
  totalHours: 0,
  totalAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  finalAmount: 0,
  
  // Additional Information
  paymentTerms: 'Net 30',
  dueDate: '',
  notes: '',
  
  // Freelancer Information
  freelancerName: '',
  freelancerEmail: '',
  freelancerPhone: '',
  freelancerAddress: '',
  freelancerWebsite: '',
};

export default function InvoiceForm() {
  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<Partial<InvoiceFormData>>({});
  const [action, setAction] = useState<'download' | 'email' | 'copy'>('download');
  const [emailSent, setEmailSent] = useState(false);
  const [signatureLink, setSignatureLink] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const isTypingRef = useRef(false);

  // Calculate totals when rate or hours change
  useEffect(() => {
    if (!isTypingRef.current) {
      const totalAmount = formData.hourlyRate * formData.totalHours;
      const taxAmount = totalAmount * (formData.taxRate / 100);
      const finalAmount = totalAmount + taxAmount;
      
      setFormData(prev => ({
        ...prev,
        totalAmount,
        taxAmount,
        finalAmount,
      }));
    }
  }, [formData.hourlyRate, formData.totalHours, formData.taxRate]);

  const handleStringInputChange = (field: keyof InvoiceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleNumberInputChange = (field: keyof InvoiceFormData, value: string) => {
    isTypingRef.current = true;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
    
    // Reset typing flag after a short delay
    setTimeout(() => {
      isTypingRef.current = false;
    }, 100);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<InvoiceFormData> = {};
    
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.clientEmail.trim()) newErrors.clientEmail = 'Client email is required';
    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
    if (!formData.serviceDescription.trim()) newErrors.serviceDescription = 'Service description is required';
    if (formData.hourlyRate <= 0) newErrors.hourlyRate = 'Hourly rate must be greater than 0';
    if (formData.totalHours <= 0) newErrors.totalHours = 'Total hours must be greater than 0';
    if (!formData.freelancerName.trim()) newErrors.freelancerName = 'Freelancer name is required';
    if (!formData.freelancerEmail.trim()) newErrors.freelancerEmail = 'Freelancer email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (action === 'download') {
      await handleDownload();
    } else if (action === 'email') {
      await handleEmail();
    } else {
      await handleCopyEmail();
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const pdfBytes = await generateInvoicePDF(formData);
      const filename = `invoice-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBytes, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmail = async () => {
    setIsSending(true);
    
    try {
      // Generate PDF
      const pdfBytes = await generateInvoicePDF(formData);
      
      let signatureLink = '';
      let docusignEnvelope = null;
      
      // Try to create DocuSign envelope if configured
      if (isDocuSignConfigured()) {
        docusignEnvelope = await createDocuSignEnvelope(pdfBytes, formData);
        if (docusignEnvelope?.signingUrl) {
          signatureLink = docusignEnvelope.signingUrl;
        }
      }
      
      // Fallback to demo signature link if DocuSign not available
      if (!signatureLink) {
        const invoiceId = generateInvoiceId();
        signatureLink = generateSignatureLink(invoiceId);
      }
      
      setSignatureLink(signatureLink);
      
      // Generate email content
      const emailData = generateEmailContent({
        ...formData,
        signing_link: signatureLink,
      });
      
      // Try to send email via EmailJS
      const success = await sendInvoiceEmail(emailData);
      
      if (success) {
        setEmailSent(true);
        alert('Invoice sent successfully via EmailJS!');
      } else {
        // Fallback to copy email template
        const template = generateEmailTemplate(formData, signatureLink);
        setEmailTemplate(template);
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      // Fallback to copy email template
      const invoiceId = generateInvoiceId();
      const signatureLink = generateSignatureLink(invoiceId);
      setSignatureLink(signatureLink);
      const template = generateEmailTemplate(formData, signatureLink);
      setEmailTemplate(template);
      setEmailSent(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyEmail = async () => {
    setIsSending(true);
    
    try {
      // Generate PDF
      const pdfBytes = await generateInvoicePDF(formData);
      
      let signatureLink = '';
      
      // Try to create DocuSign envelope if configured
      if (isDocuSignConfigured()) {
        const docusignEnvelope = await createDocuSignEnvelope(pdfBytes, formData);
        if (docusignEnvelope?.signingUrl) {
          signatureLink = docusignEnvelope.signingUrl;
        }
      }
      
      // Fallback to demo signature link if DocuSign not available
      if (!signatureLink) {
        const invoiceId = generateInvoiceId();
        signatureLink = generateSignatureLink(invoiceId);
      }
      
      setSignatureLink(signatureLink);
      
      // Generate email template
      const template = generateEmailTemplate(formData, signatureLink);
      setEmailTemplate(template);
      setEmailSent(true);
    } catch (error) {
      console.error('Error generating email template:', error);
      alert('Error generating email template. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      alert('Email template copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error copying to clipboard. Please copy manually.');
    }
  };

  const InputField = ({ 
    label, 
    field, 
    type = 'text', 
    placeholder = '', 
    required = false 
  }: {
    label: string;
    field: keyof InvoiceFormData;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => {
    const isNumberField = ['hourlyRate', 'totalHours', 'totalAmount', 'taxRate', 'taxAmount', 'finalAmount'].includes(field);
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={isNumberField ? (formData[field] as number).toString() : formData[field] as string}
          onChange={(e) => {
            const value = e.target.value;
            if (isNumberField) {
              handleNumberInputChange(field, value);
            } else {
              handleStringInputChange(field, value);
            }
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
            errors[field] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors[field] && (
          <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
        )}
      </div>
    );
  };

  if (emailSent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Ready to Send!</h1>
          <p className="text-gray-600 mb-6">
            Your invoice is ready to be sent to {formData.clientEmail}
          </p>
          
          {signatureLink && (
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Signature Link</h3>
              <p className="text-blue-600 mb-4">
                Share this link with your client to sign the invoice:
              </p>
              <div className="bg-white p-3 rounded border break-all">
                <code className="text-sm">{signatureLink}</code>
              </div>
            </div>
          )}
          
          {emailTemplate && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Template</h3>
              <p className="text-gray-600 mb-4">
                Copy this email template and send it to your client:
              </p>
              <div className="bg-white p-4 rounded border">
                <pre className="text-sm whitespace-pre-wrap">{emailTemplate}</pre>
              </div>
              <button
                onClick={copyToClipboard}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setEmailSent(false);
                setSignatureLink('');
                setEmailTemplate('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Create Another Invoice
            </button>
            <button
              onClick={handleDownload}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Create Invoice
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Client Name" field="clientName" required />
              <InputField label="Client Email" field="clientEmail" type="email" required />
              <InputField label="Company (Optional)" field="clientCompany" />
              <InputField label="Address (Optional)" field="clientAddress" />
            </div>
          </div>

          {/* Project Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Project Title" field="projectTitle" required />
              <InputField label="Start Date" field="projectStartDate" type="date" />
              <InputField label="End Date" field="projectEndDate" type="date" />
              <InputField label="Due Date" field="dueDate" type="date" />
            </div>
            <div className="mt-4">
              <InputField 
                label="Service Description" 
                field="serviceDescription" 
                placeholder="Describe the services provided..."
                required 
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Hourly Rate ($)" field="hourlyRate" type="number" required />
              <InputField label="Total Hours" field="totalHours" type="number" required />
              <InputField label="Tax Rate (%)" field="taxRate" type="number" />
            </div>
            
            <div className="mt-6 bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${formData.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold">${formData.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between col-span-2 border-t pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">${formData.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Freelancer Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Your Name" field="freelancerName" required />
              <InputField label="Your Email" field="freelancerEmail" type="email" required />
              <InputField label="Phone (Optional)" field="freelancerPhone" type="tel" />
              <InputField label="Website (Optional)" field="freelancerWebsite" />
            </div>
            <div className="mt-4">
              <InputField label="Address (Optional)" field="freelancerAddress" />
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Payment Terms" field="paymentTerms" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleStringInputChange('notes', e.target.value)}
                placeholder="Additional notes or terms..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>

          {/* Action Selection */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What would you like to do?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="download"
                  checked={action === 'download'}
                  onChange={(e) => setAction(e.target.value as 'download' | 'email' | 'copy')}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">Download PDF</div>
                  <div className="text-sm text-gray-600">Generate and download the invoice</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="email"
                  checked={action === 'email'}
                  onChange={(e) => setAction(e.target.value as 'download' | 'email' | 'copy')}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">Auto Email</div>
                  <div className="text-sm text-gray-600">Send via EmailJS (if configured)</div>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="copy"
                  checked={action === 'copy'}
                  onChange={(e) => setAction(e.target.value as 'download' | 'email' | 'copy')}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">Copy Email</div>
                  <div className="text-sm text-gray-600">Get email template to copy</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isGenerating || isSending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating PDF...</span>
                </>
              ) : isSending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Preparing...</span>
                </>
              ) : (
                <span>
                  {action === 'download' ? 'Generate Invoice PDF' : 
                   action === 'email' ? 'Send Invoice to Client' : 
                   'Generate Email Template'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 