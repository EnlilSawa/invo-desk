// EmailJS configuration (optional)
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';

export interface EmailData {
  to_email: string;
  to_name: string;
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
  signing_link?: string;
}

export async function sendInvoiceEmail(emailData: EmailData): Promise<boolean> {
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    console.warn('EmailJS not configured. Skipping email send.');
    return false;
  }

  try {
    // Dynamic import to avoid issues if EmailJS is not installed
    const emailjs = await import('@emailjs/browser');
    
    // Initialize EmailJS
    emailjs.default.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      from_name: emailData.from_name,
      from_email: emailData.from_email,
      subject: emailData.subject,
      message: emailData.message,
      signing_link: emailData.signing_link,
    };

    const response = await emailjs.default.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generateEmailContent(invoiceData: any): EmailData {
  const subject = `Invoice for ${invoiceData.projectTitle} - ${invoiceData.freelancerName}`;
  
  const message = `
Dear ${invoiceData.clientName},

Thank you for choosing my services for your project: "${invoiceData.projectTitle}".

I have prepared your invoice for the work completed. Please find the details below:

Project: ${invoiceData.projectTitle}
Service: ${invoiceData.serviceDescription}
Total Amount: $${invoiceData.finalAmount.toFixed(2)}
Due Date: ${invoiceData.dueDate}

${invoiceData.signing_link ? `To sign this invoice digitally, please click here: ${invoiceData.signing_link}` : ''}

If you have any questions about this invoice, please don't hesitate to contact me.

Best regards,
${invoiceData.freelancerName}
${invoiceData.freelancerEmail}
${invoiceData.freelancerPhone ? `Phone: ${invoiceData.freelancerPhone}` : ''}
  `.trim();

  return {
    to_email: invoiceData.clientEmail,
    to_name: invoiceData.clientName,
    from_name: invoiceData.freelancerName,
    from_email: invoiceData.freelancerEmail,
    subject,
    message,
  };
}

// Simple email template for manual sending
export function generateEmailTemplate(invoiceData: any, signatureLink?: string): string {
  return `
Subject: Invoice for ${invoiceData.projectTitle} - ${invoiceData.freelancerName}

Dear ${invoiceData.clientName},

Thank you for choosing my services for your project: "${invoiceData.projectTitle}".

I have prepared your invoice for the work completed. Please find the details below:

Project: ${invoiceData.projectTitle}
Service: ${invoiceData.serviceDescription}
Total Amount: $${invoiceData.finalAmount.toFixed(2)}
Due Date: ${invoiceData.dueDate}

${signatureLink ? `To sign this invoice digitally, please click here: ${signatureLink}` : ''}

If you have any questions about this invoice, please don't hesitate to contact me.

Best regards,
${invoiceData.freelancerName}
${invoiceData.freelancerEmail}
${invoiceData.freelancerPhone ? `Phone: ${invoiceData.freelancerPhone}` : ''}
  `.trim();
} 