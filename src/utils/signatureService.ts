// DocuSign API configuration
const DOCUSIGN_ACCOUNT_ID = process.env.NEXT_PUBLIC_DOCUSIGN_ACCOUNT_ID || '';
const DOCUSIGN_INTEGRATION_KEY = process.env.NEXT_PUBLIC_DOCUSIGN_INTEGRATION_KEY || '';
const DOCUSIGN_USER_ID = process.env.NEXT_PUBLIC_DOCUSIGN_USER_ID || '';
const DOCUSIGN_PRIVATE_KEY = process.env.NEXT_PUBLIC_DOCUSIGN_PRIVATE_KEY || '';

export interface SignatureData {
  clientName: string;
  clientEmail: string;
  signature: string;
  signedAt: string;
  invoiceId: string;
}

export interface DocuSignEnvelope {
  envelopeId: string;
  status: string;
  signingUrl?: string;
}

// Store signatures in localStorage for demo purposes (fallback)
const STORAGE_KEY = 'invoicedesk_signatures';

export function generateSignatureLink(invoiceId: string): string {
  return `${window.location.origin}/sign-invoice/${invoiceId}`;
}

export function saveSignature(signatureData: SignatureData): void {
  try {
    const existingSignatures = getSignatures();
    existingSignatures.push(signatureData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSignatures));
  } catch (error) {
    console.error('Error saving signature:', error);
  }
}

export function getSignatures(): SignatureData[] {
  try {
    const signatures = localStorage.getItem(STORAGE_KEY);
    return signatures ? JSON.parse(signatures) : [];
  } catch (error) {
    console.error('Error getting signatures:', error);
    return [];
  }
}

export function getSignatureByInvoiceId(invoiceId: string): SignatureData | null {
  const signatures = getSignatures();
  return signatures.find(sig => sig.invoiceId === invoiceId) || null;
}

// Generate a unique invoice ID
export function generateInvoiceId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// DocuSign integration functions
export async function createDocuSignEnvelope(
  pdfBytes: Uint8Array,
  invoiceData: any
): Promise<DocuSignEnvelope | null> {
  // Check if DocuSign is configured
  if (!DOCUSIGN_ACCOUNT_ID || !DOCUSIGN_INTEGRATION_KEY || !DOCUSIGN_USER_ID) {
    console.warn('DocuSign not configured. Using demo signature system.');
    return null;
  }

  try {
    // Convert PDF bytes to base64
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
    
    // Create envelope request
    const envelopeRequest = {
      emailSubject: `Please sign invoice for ${invoiceData.projectTitle}`,
      emailBlurb: `Dear ${invoiceData.clientName},\n\nPlease review and sign the attached invoice for the project: "${invoiceData.projectTitle}".\n\nTotal Amount: $${invoiceData.finalAmount.toFixed(2)}\nDue Date: ${invoiceData.dueDate}\n\nThank you for your business.\n\nBest regards,\n${invoiceData.freelancerName}`,
      documents: [{
        documentBase64: pdfBase64,
        name: `Invoice-${invoiceData.projectTitle}`,
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: [{
          email: invoiceData.clientEmail,
          name: invoiceData.clientName,
          recipientId: '1',
          routingOrder: '1'
        }]
      },
      status: 'sent'
    };

    // In a real implementation, you would make an API call to DocuSign here
    // For now, we'll return a mock response
    console.log('DocuSign envelope request:', envelopeRequest);
    
    return {
      envelopeId: `env-${Date.now()}`,
      status: 'sent',
      signingUrl: `https://demo.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=...`
    };
  } catch (error) {
    console.error('Error creating DocuSign envelope:', error);
    return null;
  }
}

export async function getDocuSignEnvelopeStatus(envelopeId: string): Promise<string | null> {
  try {
    // In a real implementation, you would make an API call to DocuSign here
    // For now, we'll return a mock status
    return 'completed';
  } catch (error) {
    console.error('Error getting DocuSign envelope status:', error);
    return null;
  }
}

// Helper function to check if DocuSign is configured
export function isDocuSignConfigured(): boolean {
  return !!(DOCUSIGN_ACCOUNT_ID && DOCUSIGN_INTEGRATION_KEY && DOCUSIGN_USER_ID);
} 