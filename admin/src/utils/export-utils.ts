const SYSTEM_FIELDS = [
  "id", "createdAt", "created_at", "updatedAt", "updated_at", "publishedAt", "published_at"
];

export function stripUnsafeFields(obj: any): any {
  const res: any = {};
  for (const key in obj) {
    if (!SYSTEM_FIELDS.includes(key)) {
      res[key] = obj[key];
    }
  }
  return res;
}

// CSV парсер с учётом кавычек
export function csvToJson(csvString: string, delimiter: string = ","): any[] {
  let csv = csvString.replace(/^\uFEFF/, '').trim();
  let lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  // Продвинутый split с учётом кавычек
  const splitCsvRow = (row: string) => {
    const re = new RegExp(
      `\\s*(?:(?:"([^"]*(?:""[^"]*)*)")|([^"${delimiter}]+))\\s*(?:${delimiter}|$)`,
      "g"
    );
    const result = [];
    let match;
    let lastIndex = 0;
    while ((match = re.exec(row)) !== null && lastIndex < row.length) {
      lastIndex = re.lastIndex;
      result.push(match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2]);
    }
    return result;
  };
  const header = splitCsvRow(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = splitCsvRow(line);
    const obj: any = {};
    header.forEach((key, i) => {
      obj[key] = values[i] ?? "";
    });
    return obj;
  });
}

export function jsonToCsv(items: any[]): string {
  if (!items.length) return "";
  const replacer = (_: string, value: any) =>
    value === null || value === undefined ? "" : value;
  const header = Object.keys(items[0]);
  const csv = [
    header.join(","),
    ...items.map((row) =>
      header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(",")
    ),
  ].join("\r\n");
  return csv;
}

export function downloadAsFile({
                                 data,
                                 fileName,
                                 mime,
                               }: {
  data: string;
  fileName: string;
  mime: string;
}) {
  const blob = new Blob([data], {type: mime});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
