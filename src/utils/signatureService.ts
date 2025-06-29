// SignRequest API configuration
const SIGNREQUEST_API_URL = 'https://signrequest.com/api/v1';
const SIGNREQUEST_API_TOKEN = process.env.NEXT_PUBLIC_SIGNREQUEST_API_TOKEN || '';

export interface SignatureRequest {
  name: string;
  from_email: string;
  subject: string;
  message: string;
  redirect_url?: string;
  redirect_url_declined?: string;
  who: 'o' | 'm'; // o = only me, m = me and others
  send_reminders: boolean;
  days_before_expiry: number;
  documents: string[]; // Array of document URLs
  signers: Signer[];
}

export interface Signer {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface SignatureResponse {
  url: string;
  uuid: string;
  status: string;
}

export async function createSignatureRequest(
  pdfUrl: string,
  invoiceData: any
): Promise<SignatureResponse | null> {
  try {
    const signatureRequest: SignatureRequest = {
      name: `Invoice - ${invoiceData.projectTitle}`,
      from_email: invoiceData.freelancerEmail,
      subject: `Please sign invoice for ${invoiceData.projectTitle}`,
      message: `Dear ${invoiceData.clientName},

Please review and sign the attached invoice for the project: "${invoiceData.projectTitle}".

Total Amount: $${invoiceData.finalAmount.toFixed(2)}
Due Date: ${invoiceData.dueDate}

Thank you for your business.

Best regards,
${invoiceData.freelancerName}`,
      redirect_url: `${window.location.origin}/invoice-signed`,
      redirect_url_declined: `${window.location.origin}/invoice-declined`,
      who: 'm',
      send_reminders: true,
      days_before_expiry: 7,
      documents: [pdfUrl],
      signers: [
        {
          email: invoiceData.clientEmail,
          first_name: invoiceData.clientName.split(' ')[0] || invoiceData.clientName,
          last_name: invoiceData.clientName.split(' ').slice(1).join(' ') || '',
          role: 'Client',
        },
      ],
    };

    const response = await fetch(`${SIGNREQUEST_API_URL}/signrequests/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${SIGNREQUEST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signatureRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      url: data.url,
      uuid: data.uuid,
      status: data.status,
    };
  } catch (error) {
    console.error('Error creating signature request:', error);
    return null;
  }
}

export async function getSignatureStatus(uuid: string): Promise<string | null> {
  try {
    const response = await fetch(`${SIGNREQUEST_API_URL}/signrequests/${uuid}/`, {
      headers: {
        'Authorization': `Token ${SIGNREQUEST_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error('Error getting signature status:', error);
    return null;
  }
}

// Alternative: Simple signature link generation (for demo purposes)
export function generateDemoSignatureLink(invoiceId: string): string {
  return `${window.location.origin}/sign-invoice/${invoiceId}`;
} 