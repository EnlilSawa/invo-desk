import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { InvoiceFormData } from '@/types/invoice';

export async function generateInvoicePDF(data: InvoiceFormData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  
  // Get the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Colors
  const primaryColor = rgb(0.2, 0.2, 0.2);
  const secondaryColor = rgb(0.4, 0.4, 0.4);
  const accentColor = rgb(0.1, 0.4, 0.8);
  
  // Helper function to draw text
  const drawText = (text: string, x: number, y: number, fontSize: number, fontType: any = font, color: any = primaryColor) => {
    page.drawText(text, {
      x,
      y: height - y,
      size: fontSize,
      font: fontType,
      color,
    });
  };
  
  // Helper function to draw line
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: any = primaryColor, thickness: number = 1) => {
    page.drawLine({
      start: { x: x1, y: height - y1 },
      end: { x: x2, y: height - y2 },
      thickness,
      color,
    });
  };
  
  // Header
  drawText('INVOICE', width / 2 - 50, 50, 24, boldFont, accentColor);
  drawLine(50, 80, width - 50, 80, accentColor, 2);
  
  // Freelancer Information (Left side)
  drawText('From:', 50, 120, 12, boldFont);
  drawText(data.freelancerName, 50, 140, 14, boldFont);
  if (data.freelancerEmail) drawText(data.freelancerEmail, 50, 160, 10);
  if (data.freelancerPhone) drawText(data.freelancerPhone, 50, 175, 10);
  if (data.freelancerAddress) drawText(data.freelancerAddress, 50, 190, 10);
  if (data.freelancerWebsite) drawText(data.freelancerWebsite, 50, 205, 10);
  
  // Client Information (Right side)
  drawText('Bill To:', width - 200, 120, 12, boldFont);
  drawText(data.clientName, width - 200, 140, 14, boldFont);
  if (data.clientCompany) drawText(data.clientCompany, width - 200, 160, 10);
  drawText(data.clientEmail, width - 200, 175, 10);
  if (data.clientAddress) drawText(data.clientAddress, width - 200, 190, 10);
  
  // Invoice Details
  drawText('Invoice Details:', 50, 250, 12, boldFont);
  drawLine(50, 270, width - 50, 270);
  
  // Project Information
  drawText('Project:', 50, 290, 10, boldFont);
  drawText(data.projectTitle, 120, 290, 10);
  
  drawText('Description:', 50, 310, 10, boldFont);
  drawText(data.serviceDescription, 120, 310, 10);
  
  drawText('Start Date:', 50, 330, 10, boldFont);
  drawText(data.projectStartDate, 120, 330, 10);
  
  drawText('End Date:', 50, 350, 10, boldFont);
  drawText(data.projectEndDate, 120, 350, 10);
  
  drawText('Due Date:', 50, 370, 10, boldFont);
  drawText(data.dueDate, 120, 370, 10);
  
  // Service Details Table
  drawText('Service Details:', 50, 420, 12, boldFont);
  drawLine(50, 440, width - 50, 440);
  
  // Table Headers
  drawText('Description', 50, 460, 10, boldFont);
  drawText('Hours', 300, 460, 10, boldFont);
  drawText('Rate', 380, 460, 10, boldFont);
  drawText('Amount', 460, 460, 10, boldFont);
  
  drawLine(50, 470, width - 50, 470);
  
  // Service Row
  drawText(data.serviceDescription, 50, 490, 10);
  drawText(data.totalHours.toString(), 300, 490, 10);
  drawText(`$${data.hourlyRate.toFixed(2)}`, 380, 490, 10);
  drawText(`$${data.totalAmount.toFixed(2)}`, 460, 490, 10);
  
  drawLine(50, 500, width - 50, 500);
  
  // Totals
  const totalsY = 540;
  drawText('Subtotal:', width - 200, totalsY, 10, boldFont);
  drawText(`$${data.totalAmount.toFixed(2)}`, width - 100, totalsY, 10);
  
  drawText('Tax:', width - 200, totalsY + 20, 10, boldFont);
  drawText(`$${data.taxAmount.toFixed(2)}`, width - 100, totalsY + 20, 10);
  
  drawLine(width - 200, totalsY + 30, width - 50, totalsY + 30);
  
  drawText('Total:', width - 200, totalsY + 50, 12, boldFont);
  drawText(`$${data.finalAmount.toFixed(2)}`, width - 100, totalsY + 50, 12, boldFont);
  
  // Payment Terms
  if (data.paymentTerms) {
    drawText('Payment Terms:', 50, totalsY + 100, 10, boldFont);
    drawText(data.paymentTerms, 50, totalsY + 120, 10);
  }
  
  // Notes
  if (data.notes) {
    drawText('Notes:', 50, totalsY + 160, 10, boldFont);
    drawText(data.notes, 50, totalsY + 180, 10);
  }
  
  // Footer
  drawLine(50, height - 100, width - 50, height - 100);
  drawText('Thank you for your business!', width / 2 - 80, height - 120, 10, font, secondaryColor);
  
  // Generate the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 