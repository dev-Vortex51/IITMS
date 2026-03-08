const PDFDocument = require("pdfkit");

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const createCsvBuffer = (columns, rows) => {
  const headerRow = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const dataRows = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column.key])).join(","),
  );
  const csv = [headerRow, ...dataRows].join("\n");
  return Buffer.from(csv, "utf-8");
};

const createPdfBuffer = async ({
  title,
  subtitle,
  generatedAt,
  columns,
  rows,
  summary,
}) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).text(title, { align: "left" });
  if (subtitle) {
    doc.moveDown(0.25);
    doc.fontSize(10).fillColor("#555").text(subtitle);
    doc.fillColor("#000");
  }
  if (generatedAt) {
    doc.moveDown(0.25);
    doc.fontSize(9).fillColor("#555").text(`Generated: ${generatedAt}`);
    doc.fillColor("#000");
  }

  if (summary && summary.length) {
    doc.moveDown(0.8);
    doc.fontSize(12).text("Summary");
    doc.moveDown(0.3);
    summary.forEach((item) => {
      doc.fontSize(10).text(`- ${item.label}: ${item.value}`);
    });
  }

  doc.moveDown(0.8);
  doc.fontSize(12).text("Data");
  doc.moveDown(0.3);

  const header = columns.map((column) => column.label).join(" | ");
  doc.fontSize(10).text(header);
  doc.moveDown(0.2);
  doc.fontSize(9);

  rows.forEach((row) => {
    const line = columns
      .map((column) => {
        const value = row[column.key];
        return value === undefined || value === null ? "" : String(value);
      })
      .join(" | ");
    doc.text(line);
  });

  doc.end();
  return done;
};

module.exports = {
  createCsvBuffer,
  createPdfBuffer,
};
