import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, Venture } from '../types';
import { formatCurrency, aggregateConsolidatedMaterials } from './costCalculator';

export function exportBudgetToPDF(budget: Budget, venture: Venture) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = venture.currency || '$';
  const primaryColor: [number, number, number] = [30, 41, 59]; // slate-800
  const accentColor: [number, number, number] = [14, 116, 144]; // cyan-700
  const lightBg: [number, number, number] = [248, 250, 252]; // slate-50

  // 1. Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 28, 'F');

  // Title & Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('MEDINA FACTORY', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`Sistema de Presupuestos de Producción • ${venture.name}`, 14, 20);

  // Budget Code & Status Badge (Right side of banner)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(budget.code, 196, 13, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(165, 243, 252);
  doc.text(`ESTADO: ${budget.status.toUpperCase()}`, 196, 20, { align: 'right' });

  // 2. Info Cards (Venture / Client Details)
  let y = 35;

  // Venture Card
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, y, 88, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 88, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text('DATOS DEL PRODUCTOR / EMPRENDIMIENTO', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(venture.name, 18, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  if (venture.taxId) doc.text(`CUIT/RUT: ${venture.taxId}`, 18, y + 17);
  if (venture.address) doc.text(`Dir: ${venture.address}`, 18, y + 22);
  if (venture.phone || venture.email) {
    doc.text(`Tel: ${venture.phone || '-'} | ${venture.email || ''}`, 18, y + 27);
  }

  // Client Card
  doc.setFillColor(...lightBg);
  doc.roundedRect(108, y, 88, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, y, 88, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text('DATOS DEL CLIENTE / RECEPTOR', 112, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(budget.clientName, 112, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha Emisión: ${budget.issueDate}  |  Validez: ${budget.validUntil}`, 112, y + 17);
  if (budget.clientTaxId) doc.text(`Doc / CUIT: ${budget.clientTaxId}`, 112, y + 22);
  if (budget.clientPhone || budget.clientEmail) {
    doc.text(`Contacto: ${budget.clientPhone || '-'} ${budget.clientEmail ? '• ' + budget.clientEmail : ''}`, 112, y + 27);
  }

  y += 38;

  // 3. Products Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('1. DESGLOSE DE PRODUCTOS Y COSTOS DE PRODUCCIÓN', 14, y);
  y += 4;

  const tableBody = budget.items.map((item, index) => {
    return [
      `${index + 1}. ${item.productName}`,
      `${item.quantity} ${item.unit}`,
      formatCurrency(item.unitVariableCost, currency),
      formatCurrency(item.unitFixedCost, currency),
      formatCurrency(item.unitTotalCost, currency),
      formatCurrency(item.unitSalePrice, currency),
      formatCurrency(item.totalSalePrice, currency),
      `+${formatCurrency(item.profit, currency)} (${item.profitMarginPercent.toFixed(1)}%)`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [
      [
        'Producto',
        'Cant.',
        'C. Var. U.',
        'C. Fijo U.',
        'Costo Tot. U.',
        'Precio Vta. U.',
        'Total Venta',
        'Margen Ganancia',
      ],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      7: { halign: 'right', cellWidth: 24, textColor: [15, 118, 110] },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  y = doc.lastAutoTable.finalY + 8;

  // 4. Raw Materials Required Table (Materia Prima Consolidada para Fabricación)
  const consolidatedMaterials = aggregateConsolidatedMaterials(budget.items);
  if (consolidatedMaterials.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('2. REQUERIMIENTO CONSOLIDADO DE MATERIAS PRIMAS E INSUMOS (PLANTA)', 14, y);
    y += 4;

    const materialsBody = consolidatedMaterials.map((mat) => [
      mat.materialName,
      `${mat.totalQuantity.toLocaleString('es-AR', { maximumFractionDigits: 3 })} ${mat.unit}`,
      formatCurrency(mat.unitCost, currency),
      formatCurrency(mat.totalCost, currency),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Material / Insumo Requerido', 'Cantidad Necesaria para el Lote', 'Costo Unit. Insumo', 'Costo Total']],
      body: materialsBody,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 26 },
        3: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
    y = doc.lastAutoTable.finalY + 8;
  }

  // Check if we need a new page for the summary if y is too close to bottom
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  // 5. Financial Summary Box (Cuadro Resumen de Costos y Rentabilidad)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('RESUMEN ECONÓMICO Y FINANCIERO DEL PRESUPUESTO', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Left column: Cost breakdown
  doc.text(`Total Costos Variables (Materia Prima/MO):`, 18, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(budget.totalVariableCost, currency), 95, y + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Costos Fijos Asignados (Planta):`, 18, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(budget.totalFixedCost, currency), 95, y + 21, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`COSTO TOTAL DE PRODUCCIÓN:`, 18, y + 28);
  doc.text(formatCurrency(budget.totalProductionCost, currency), 95, y + 28, { align: 'right' });

  // Right column: Sale & Margins
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`TOTAL PRECIO DE VENTA:`, 110, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(budget.totalSalePrice, currency), 190, y + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Margen de Ganancia Neto:`, 110, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(formatCurrency(budget.totalProfit, currency), 190, y + 21, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`RENTABILIDAD SOBRE COSTO:`, 110, y + 28);
  doc.text(`+${budget.profitMarginPercent.toFixed(2)} %`, 190, y + 28, { align: 'right' });

  y += 44;

  // 6. Notes & Signatures
  if (budget.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Observaciones y Condiciones de Fabricación:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(budget.notes, 182);
    doc.text(splitNotes, 14, y + 5);
    y += 6 + splitNotes.length * 4;
  }

  // Signatures section at bottom
  const sigY = Math.max(y + 12, 255);
  if (sigY <= 275) {
    doc.setDrawColor(203, 213, 225);
    doc.line(20, sigY, 80, sigY);
    doc.line(130, sigY, 190, sigY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Firma y Aclaración Emisor', 50, sigY + 4, { align: 'center' });
    doc.text('Firma y Aceptación de Presupuesto (Cliente)', 160, sigY + 4, { align: 'center' });
  }

  // Footer on page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generado por Medina Factory • Presupuestos de Producción • Fecha de impresión: ${new Date().toLocaleDateString('es-AR')}`,
    105,
    290,
    { align: 'center' }
  );

  // Trigger download
  const cleanCode = budget.code.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Presupuesto_${cleanCode}_MedinaFactory.pdf`);
}
