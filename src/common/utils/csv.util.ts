export type CsvRow = Record<string, any>;

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function csvHeader(headers: string[]): string {
  return headers.map(escapeCsvValue).join(',');
}

export function csvRow(headers: string[], row: CsvRow): string {
  return headers.map((h) => escapeCsvValue(row[h])).join(',');
}

export function toCsv(headers: string[], rows: CsvRow[]): string {
  const lines: string[] = [];
  lines.push(csvHeader(headers));
  for (const row of rows) {
    lines.push(csvRow(headers, row));
  }
  return lines.join('\n');
}
