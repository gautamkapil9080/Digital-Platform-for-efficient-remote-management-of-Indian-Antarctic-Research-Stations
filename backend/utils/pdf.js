const PDFDocument = require('pdfkit');

// Renders a simple tabular report: title, station, generated-at, then one
// line per row. Streams straight to the HTTP response.
function streamPdfReport(res, { title, stationName, columns, rows, filename }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(16).text(title, { align: 'left' });
  doc.fontSize(10).fillColor('#555').text(`Station: ${stationName}`);
  doc.text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();

  const colWidth = (515) / columns.length;
  doc.fontSize(9).fillColor('#000');
  columns.forEach((c, i) => doc.text(c.label, 40 + i * colWidth, doc.y, { width: colWidth, continued: i < columns.length - 1 }));
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
  doc.moveDown(0.3);

  rows.forEach((row) => {
    const y = doc.y;
    columns.forEach((c, i) => {
      doc.text(String(c.get(row) ?? ''), 40 + i * colWidth, y, { width: colWidth, continued: i < columns.length - 1 });
    });
    doc.moveDown(0.4);
    if (doc.y > 780) doc.addPage();
  });

  doc.end();
}

module.exports = { streamPdfReport };
