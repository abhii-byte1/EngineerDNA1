import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function downloadReportAsPdf(element: HTMLElement | null, filename: string): Promise<void> {
  if (!element) {
    throw new Error('Report element ref is missing or null.');
  }

  // Capture rendered DOM component as canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#090d16', // Dark mode background alignment
    windowWidth: Math.max(element.scrollWidth, 1200), // Ensure desktop layout width when rendering PDF
  });

  const imgData = canvas.toDataURL('image/png');

  // A4 size parameters in mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Additional pages if content exceeds single page
  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  // Ensure file extension
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(safeFilename);
}
