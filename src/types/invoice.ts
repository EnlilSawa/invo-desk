export interface InvoiceFormData {
  // Client Information
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientAddress?: string;
  
  // Project Information
  projectTitle: string;
  serviceDescription: string;
  projectStartDate: string;
  projectEndDate: string;
  
  // Financial Information
  hourlyRate: number;
  totalHours: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  finalAmount: number;
  
  // Additional Information
  paymentTerms: string;
  dueDate: string;
  notes?: string;
  
  // Freelancer Information
  freelancerName: string;
  freelancerEmail: string;
  freelancerPhone?: string;
  freelancerAddress?: string;
  freelancerWebsite?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
} 