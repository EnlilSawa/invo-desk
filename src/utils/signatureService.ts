// Simple demo signature service - no external API required
export interface SignatureData {
  clientName: string;
  clientEmail: string;
  signature: string;
  signedAt: string;
  invoiceId: string;
}

// Store signatures in localStorage for demo purposes
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