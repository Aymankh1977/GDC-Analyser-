import { jsPDF } from 'jspdf';
import { SpecificGuidelineResult } from '../types';

// This is a simplified markdown renderer for jsPDF.
// It supports headings (#), lists (* or -), and normal text with line wrapping.
const renderMarkdownToPdf = (doc: jsPDF, markdown: string, startY: number, startX: number, contentWidth: number) => {
    let y = startY;
    const lines = markdown.split('\n');
    
    doc.setFont('helvetica', 'normal');

    for (const line of lines) {
        if (y > doc.internal.pageSize.height - 20) { // Page break check
            doc.addPage();
            y = 20;
        }

        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('# ')) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            const text = doc.splitTextToSize(trimmedLine.substring(2), contentWidth);
            doc.text(text, startX, y);
            y += (text.length * 7) + 4;
        } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const text = doc.splitTextToSize(trimmedLine.substring(2), contentWidth - 5);
            doc.text('•', startX, y);
            doc.text(text, startX + 5, y);
            y += (text.length * 5) + 2;
        } else if (trimmedLine) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const text = doc.splitTextToSize(trimmedLine, contentWidth);
            doc.text(text, startX, y);
            y += (text.length * 5) + 2;
        } else { // Empty line
            y += 5;
        }
    }
    return y;
};


export function generatePdf(data: SpecificGuidelineResult) {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("DentEdTeck", margin, y);
    y += 15;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text(`GDC Compliance Report`, pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Program: ${data.programName}`, pageWidth / 2, y, { align: 'center' });
    y += 25;

    // Helper to render each section
    const renderSection = (title: string, content: string) => {
        if (y > pageHeight - margin - 20) {
            doc.addPage();
            y = margin;
        }
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(title, margin, y);
        y += 7;
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
        y = renderMarkdownToPdf(doc, content, y, margin, contentWidth);
        y += 10; // Spacing after section
    };
    
    renderSection("Executive Summary", data.executiveSummary);
    renderSection("Identified Strengths", data.strengths);
    renderSection("Areas for Improvement", data.areasForImprovement);
    renderSection("Actionable Recommendations", data.recommendations);
    
    // Footer with page number and copyright
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerText = `Page ${i} of ${pageCount} | Copyright © ${new Date().getFullYear()} DentEdTeck`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`GDC_Report_${data.programName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}