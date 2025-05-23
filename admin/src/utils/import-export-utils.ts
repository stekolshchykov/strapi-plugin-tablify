// tablify/admin/src/utils/import-export-logic.ts

import {csvToJson, downloadAsFile, jsonToCsv} from "./export-utils";

// System fields to exclude from user operations
export const SYSTEM_FIELDS = [
  "id",
  "createdAt",
  "created_at",
  "updatedAt",
  "updated_at",
  "publishedAt",
  "published_at",
];

// Normalizes value based on the schema field type
export function normalizeValueByType(value: any, type: string) {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    value === "undefined"
  ) {
    return null;
  }
  switch (type) {
    case "integer":
    case "biginteger":
    case "float":
    case "decimal": {
      const n = Number(value);
      return isNaN(n) ? null : n;
    }
    case "boolean":
      if (typeof value === "boolean") return value;
      if (value === "true" || value === true || value === 1 || value === "1") return true;
      if (value === "false" || value === false || value === 0 || value === "0") return false;
      return null;
    case "date":
    case "datetime":
    case "timestamp":
      // Accept ISO date strings, otherwise null
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
      return null;
    default:
      return value;
  }
}

// Returns a new object containing only fields defined in the schema, normalized
export function stripAndNormalizeBySchema(obj: any, schema: any): any {
  const result: any = {};
  for (const key in schema) {
    if (!SYSTEM_FIELDS.includes(key)) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = normalizeValueByType(obj[key], schema[key].type);
      }
    }
  }
  return result;
}

// Handles exporting the selected table as JSON or CSV
export async function handleDownload({
                                       type,
                                       selected,
                                       getSelectedTable,
                                     }: {
  type: "json" | "csv";
  selected: string | undefined;
  getSelectedTable: () => any;
}) {
  if (!selected) return;
  const table = getSelectedTable();
  if (!table) return;

  const res = await fetch("/tablify/dump-collection", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({name: table.tableName}),
  });

  if (!res.ok) throw new Error("Failed to fetch data from the server.");
  const {data} = await res.json();

  if (type === "json") {
    downloadAsFile({
      data: JSON.stringify(data, null, 2),
      fileName: `${table.tableName}.json`,
      mime: "application/json",
    });
  } else if (type === "csv") {
    const csv = jsonToCsv(data);
    downloadAsFile({
      data: csv,
      fileName: `${table.tableName}.csv`,
      mime: "text/csv;charset=utf-8;",
    });
  }
}

// Handles importing a file (JSON or CSV) into the selected table
export async function importFile({
                                   file,
                                   tableName,
                                   tableSchema,
                                   csvDelimiter,
                                 }: {
  file: File;
  tableName: string;
  tableSchema: any;
  csvDelimiter: string;
}): Promise<{ log: string; debug: string }> {
  let debug = "";
  let log = "";
  let records: any[] = [];

  debug += `File name: ${file.name}\nFile size: ${file.size} bytes\n`;
  const text = await file.text();
  debug += `First 1kB of file:\n${text.slice(0, 1000)}\n`;

  const fileName = file.name.toLowerCase();

  // Detect file format by extension or content
  let format: "json" | "csv" = "json";
  if (fileName.endsWith(".csv")) format = "csv";
  else if (fileName.endsWith(".json")) format = "json";
  else {
    if (text.trim().startsWith("{") || text.trim().startsWith("[")) format = "json";
    else format = "csv";
  }
  debug += `Detected format: ${format}\n`;

  try {
    if (format === "json") {
      records = JSON.parse(text);
      debug += `JSON parsed successfully. Type: ${Array.isArray(records) ? "array" : typeof records}\n`;
      if (!Array.isArray(records)) throw new Error("JSON file must be an array of objects.");
    } else if (format === "csv") {
      debug += `CSV delimiter: "${csvDelimiter || ","}"\n`;
      const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean);
      debug += `CSV row count: ${lines.length}\n`;
      debug += `Header: ${lines[0]}\n`;
      if (lines.length > 1) debug += `First data row: ${lines[1]}\n`;
      records = csvToJson(text, csvDelimiter || ",");
      debug += `CSV parsed successfully. Number of objects: ${records.length}\n`;
      if (records.length > 0) {
        debug += `First object: ${JSON.stringify(records[0], null, 2)}\n`;
      }
    }
    if (!records.length) {
      log = "No data found in the file to import.";
      debug += log + "\n";
      return {log, debug};
    }
  } catch (e: any) {
    log = "Parsing error: " + (e.message || e);
    debug += log + "\n";
    return {log, debug};
  }

  // Strip unwanted fields and normalize values according to schema
  records = records.map((row) => stripAndNormalizeBySchema(row, tableSchema));

  debug += `Prepared for upload: ${records.length} objects\n`;

  try {
    const res = await fetch("/tablify/import-collection", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: tableName,
        data: records,
        format,
      }),
    });
    const result = await res.json();
    debug += `Server response: ${JSON.stringify(result, null, 2)}\n`;
    if (result.success) {
      log = `Import complete: ${result.created} records added, ${result.failed} errors.`;
      if (result.failedDetails && result.failedDetails.length) {
        log += "\nErrors:\n" + result.failedDetails.join("\n");
      }
    } else {
      log = "Import failed: " + (result.message || "Unknown server error.");
    }
  } catch (e: any) {
    log = "Import error: " + (e.message || e);
    debug += log + "\n";
  }
  return {log, debug};
}

// Don't forget to export stripAndNormalizeBySchema if used elsewhere.
