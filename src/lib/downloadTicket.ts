import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { devLog } from './logger';

export interface TicketData {
  ticket_number: string;
  event?: {
    title: string;
    date: string;
    time: string;
    venue: string;
    location: string;
  };
  category?: {
    name: string;
  };
  quantity: number;
  total_price: number;
  qr_code_url: string;
  purchase_time: string;
}

/**
 * Generate and download ticket as PDF
 * Includes ticket details, QR code, and event information
 */
export async function downloadTicketPDF(ticket: TicketData): Promise<void> {
  try {
    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.backgroundColor = '#1a1a1a';
    container.style.color = '#ffffff';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Build HTML content
    const purchaseDate = new Date(ticket.purchase_time).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const purchaseTime = new Date(ticket.purchase_time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    container.innerHTML = `
      <div style="border: 2px solid #ff6b35; border-radius: 12px; padding: 30px; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ff6b35; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 32px; color: #ff6b35; font-weight: bold;">ASTRA TICKETS</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Event Ticket Confirmation</p>
        </div>

        <!-- Ticket Number & Status -->
        <div style="margin-bottom: 25px; padding: 15px; background: rgba(255, 107, 53, 0.1); border-left: 4px solid #ff6b35; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Ticket Number</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #ff6b35; font-weight: bold; font-family: monospace;">${ticket.ticket_number}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Status</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #4caf50; font-weight: bold;">✓ CONFIRMED</p>
            </div>
          </div>
        </div>

        <!-- Event Details -->
        <div style="margin-bottom: 25px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #ff6b35; text-transform: uppercase;">Event Information</h2>
          
          <div style="margin-bottom: 12px;">
            <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Event</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; color: #fff; font-weight: bold;">${ticket.event?.title || 'N/A'}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
            <div>
              <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Date & Time</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #fff;">
                ${ticket.event?.date || 'N/A'} at ${ticket.event?.time || 'N/A'}
              </p>
            </div>
            <div>
              <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Category</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #fff;">${ticket.category?.name || 'N/A'}</p>
            </div>
          </div>

          <div>
            <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Venue</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #fff;">${ticket.event?.venue || 'N/A'}</p>
          </div>

          <div style="margin-top: 12px;">
            <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Location</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #fff;">${ticket.event?.location || 'N/A'}</p>
          </div>
        </div>

        <!-- Ticket Details -->
        <div style="margin-bottom: 25px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #ff6b35; text-transform: uppercase;">Ticket Details</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Quantity</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #fff; font-weight: bold;">${ticket.quantity} Ticket(s)</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Total Amount</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #4caf50; font-weight: bold;">₹${ticket.total_price.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <!-- QR Code -->
        <div style="text-align: center; margin-bottom: 25px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          <p style="margin: 0 0 15px 0; font-size: 10px; color: #999; text-transform: uppercase;">Scan for Entry</p>
          <img src="${ticket.qr_code_url}" alt="QR Code" style="width: 200px; height: 200px; border: 2px solid #ff6b35; border-radius: 4px;" />
        </div>

        <!-- Purchase Information -->
        <div style="padding: 15px; background: rgba(255, 107, 53, 0.1); border-left: 4px solid #ff6b35; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase;">Purchase Date & Time</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #fff;">${purchaseDate} at ${purchaseTime}</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #666; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0; font-size: 10px; color: #999;">
            This is your digital ticket. Please keep it safe and present the QR code at the venue for entry.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 9px; color: #666;">
            Generated on ${new Date().toLocaleDateString('en-IN')} • ASTRA Movies & Events
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#1a1a1a',
      logging: false,
    });

    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions to fit on page
    const ratio = canvas.width / canvas.height;
    let width = pdfWidth - 10;
    let height = width / ratio;

    if (height > pdfHeight - 10) {
      height = pdfHeight - 10;
      width = height * ratio;
    }

    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;

    pdf.addImage(imgData, 'PNG', x, y, width, height);

    // Download PDF
    const filename = `ASTRA-${ticket.ticket_number}.pdf`;
    pdf.save(filename);

    // Cleanup
    document.body.removeChild(container);
  } catch (error) {
    devLog.error('Error generating PDF:', error);
    throw new Error('Failed to generate ticket PDF');
  }
}
