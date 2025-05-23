import {Box, Main,} from "@strapi/design-system";
import React, {useEffect, useRef, useState} from "react";
import {handleDownload, importFile} from "./../utils/import-export-utils";
import {Export} from "./Export";
import {Header} from "./Header";
import {Import} from "./Import";
import {Output} from "./Output";

export const HomePage = () => {
  const [tables, setTables] = useState<
    { uid: string; tableName: string; displayName: string }[]
  >([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [downloading, setDownloading] = useState<"csv" | "json" | false>(false);
  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<string>("");
  const [csvDelimiter, setCsvDelimiter] = useState<string>(",");
  const [debugLog, setDebugLog] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    fetch("/tablify/tables")
      .then((res) => res.json())
      .then((data) => setTables(data))
      .catch(() => setTables([]));
  }, []);

  useEffect(() => {
    if (selected) {
      fetch(`/tablify/schema?uid=${encodeURIComponent(selected)}`)
        .then((res) => res.json())
        .then(setTableSchema)
        .catch(() => setTableSchema(null));
    } else {
      setTableSchema(null);
    }
  }, [selected]);

  const getSelectedTable = () => tables.find((t) => t.uid === selected);

  const onDownload = async (type: "json" | "csv") => {
    setDownloading(type);
    try {
      await handleDownload({
        type,
        selected,
        getSelectedTable,
      });
    } catch (e: any) {
      alert("Download failed: " + (e.message || e));
    }
    setDownloading(false);
  };

  const onImport = async () => {
    setImportLog("");
    setDebugLog("");
    if (!selected || !fileInputRef.current?.files?.length) {
      setDebugLog("Нет выбранной таблицы или файла.");
      return;
    }
    setImporting(true);
    try {
      const file = fileInputRef.current.files[0];
      const table = getSelectedTable();
      if (!table) throw new Error("Table not found");
      const {log, debug} = await importFile({
        file,
        tableName: table.tableName,
        tableSchema,
        csvDelimiter,
      });
      setImportLog(log);
      setDebugLog(debug);
    } catch (e: any) {
      setImportLog("Import error: " + (e.message || e));
      setDebugLog(String(e));
    }
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setFileName("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  return (
    <Main>

      <Box padding={8} background="neutral0" shadow="tableShadow" hasRadius>

        <Header/>

        <Export
          tables={tables}
          selected={selected}
          setSelected={setSelected}
          onDownload={onDownload}
          downloading={downloading}/>

        <Import
          selected={selected}
          csvDelimiter={csvDelimiter}
          setCsvDelimiter={setCsvDelimiter}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          onImport={onImport}
          fileName={fileName}
          importing={importing}/>

        <Output debugLog={debugLog} importLog={importLog}/>

      </Box>

    </Main>
  );
};
