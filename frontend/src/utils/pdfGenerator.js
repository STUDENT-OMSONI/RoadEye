import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSinglePotholeSeverity } from '../services/api';

/**
 * Generate and download an official RoadSense AI Municipal Inspection PDF
 */
export async function generateDetectionPdf({
  reportId,
  method = 'Image Detection',
  date = new Date().toLocaleString(),
  potholeCount = 0,
  overallSeverity = 'Low',
  confidence = 0,
  detections = [],
  location = 'Urban Arterial Corridor — Sector 4',
  originalImageUrl = null,
  detectedImageUrl = null,
  summaryNotes = 'Automated computer vision survey generated via RoadSense AI YOLOv8 inference pipeline.'
}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const navyDark = [16, 24, 39];
  const blueElectric = [37, 99, 235];
  const roadOrange = [245, 158, 11];
  const redHigh = [239, 68, 68];
  const greenLow = [16, 185, 129];
  const slateText = [71, 85, 105];

  // Header Banner
  doc.setFillColor(...navyDark);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Decorative Accent Line
  doc.setFillColor(...roadOrange);
  doc.rect(0, 36, pageWidth, 2.5, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ROADEYE', 16, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('AI POTHOLE DETECTION & SEVERITY ASSESSMENT', 16, 25);
  doc.text('FINAL YEAR PROJECT, SATI VIDISHA', 16, 30);

  // Report Reference in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`AUDIT ID: ${reportId || 'REP-' + Date.now().toString().slice(-6)}`, pageWidth - 16, 17, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${date}`, pageWidth - 16, 25, { align: 'right' });
  doc.text(`Method: ${method}`, pageWidth - 16, 30, { align: 'right' });

  let currentY = 48;

  // Overview / Key Metrics Box (Clean 4-column balanced grid with vertical dividers)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'S');

  // Vertical column dividers
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(59.5, currentY + 4, 59.5, currentY + 24);
  doc.line(105.0, currentY + 4, 105.0, currentY + 24);
  doc.line(150.5, currentY + 4, 150.5, currentY + 24);

  // Column 1: Total Potholes (Center = 36.75)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(`${potholeCount}`, 36.75, currentY + 12, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateText);
  doc.text('Potholes Detected', 36.75, currentY + 18, { align: 'center' });

  // Column 2: Hazard Severity (Center = 82.25)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  if (overallSeverity === 'High') {
    doc.setTextColor(...redHigh);
  } else if (overallSeverity === 'Medium') {
    doc.setTextColor(...roadOrange);
  } else {
    doc.setTextColor(...greenLow);
  }
  doc.text(`${overallSeverity.toUpperCase()}`, 82.25, currentY + 12, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateText);
  doc.text('Road Hazard Rating', 82.25, currentY + 18, { align: 'center' });

  // Column 3: Avg Confidence (Center = 127.75)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...blueElectric);
  const confFormatted = typeof confidence === 'number'
    ? `${(confidence > 1 ? confidence : confidence * 100).toFixed(1)}%`
    : `${confidence}`;
  doc.text(`${confFormatted}`, 127.75, currentY + 12, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateText);
  doc.text('Avg YOLOv8 Conf', 127.75, currentY + 18, { align: 'center' });

  // Column 4: Location / Sector (Center = 173.25)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const safeLoc = (location || 'Road Survey Section').slice(0, 20);
  doc.text(safeLoc, 173.25, currentY + 12, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateText);
  doc.text('Survey Sector', 173.25, currentY + 18, { align: 'center' });

  currentY += 36;

  // Section Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Pothole Detections & Geometry', 14, currentY);
  currentY += 6;

  // Table rows
  const tableRows = detections.length > 0 ? detections.map((d, index) => {
    const sev = d.severity || getSinglePotholeSeverity(d);
    const confVal = typeof d.confidence === 'number'
      ? `${(d.confidence > 1 ? d.confidence : d.confidence * 100).toFixed(1)}%`
      : 'N/A';
    return [
      `#${d.id || index + 1}`,
      confVal,
      sev,
      `${d.width || '-'} x ${d.height || '-'} px`,
      `(${d.x1 || 0}, ${d.y1 || 0}) to (${d.x2 || 0}, ${d.y2 || 0})`,
      sev === 'High' ? 'Immediate Patch Required' : sev === 'Medium' ? 'Schedule Repair (7 Days)' : 'Monitor Surface'
    ];
  }) : [
    ['None', '100%', 'None', '0 x 0', 'N/A', 'No roadway defects identified in scan']
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['ID', 'Confidence', 'Severity', 'Dimensions', 'Bounding Box (px)', 'Recommended Action']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: navyDark,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center',
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 42 },
      5: { cellWidth: 'auto', halign: 'left' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'High') {
          data.cell.styles.textColor = redHigh;
        } else if (data.cell.raw === 'Medium') {
          data.cell.styles.textColor = roadOrange;
        } else if (data.cell.raw === 'Low') {
          data.cell.styles.textColor = greenLow;
        }
      }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // Summary box
  if (finalY < pageHeight - 55) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, finalY, pageWidth - 28, 24, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...navyDark);
    doc.text('SURVEY AUDIT SUMMARY', 18, finalY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slateText);
    const splitSummary = doc.splitTextToSize(
      `${summaryNotes} | All bounding box predictions verified via YOLO neural network. Data archived for smart city highway maintenance dispatch and contractor billing audit.`,
      pageWidth - 36
    );
    doc.text(splitSummary, 18, finalY + 13);
  }

  // Footer & Sign-off
  const footerY = pageHeight - 16;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('RoadEye AI Pothole Detection | Final year project, SATI Vidisha', 14, footerY);
  doc.text(`Page 1 of 1`, pageWidth - 14, footerY, { align: 'right' });

  // Save the PDF
  const filename = `${(reportId || 'roadeye_report').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
}
