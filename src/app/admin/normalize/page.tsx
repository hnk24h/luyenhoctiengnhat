"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { FaWandMagicSparkles } from 'react-icons/fa6';
import AdminPageHeader from '../_components/AdminPageHeader';

export default function NormalizePage() {
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [preview, setPreview] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [headerLine, setHeaderLine] = useState(0);

  const standardColumns = ["term", "meaning", "example", "note"];
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);

  const parseFile = (file: File, headerLineIdx: number) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        setRawRows(rows);
        const headerRowRaw = rows[headerLineIdx] || rows[0];
        const headerRow = Array.isArray(headerRowRaw) ? headerRowRaw.map(String) : [];
        setHeaders(headerRow);
        const dataRows = rows.slice(headerLineIdx + 1);
        setRawData(dataRows);
        const autoMap: { [key: string]: string } = {};
        standardColumns.forEach(col => {
          const found = headerRow.find((h: string) => h.toLowerCase().includes(col));
          if (found) autoMap[col] = found;
        });
        setMapping(autoMap);
        setPreview(dataRows.slice(0, 10));
      },
      error: (err) => {
        setError("Lỗi đọc file: " + err.message);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileObj(file);
    setError("");
    parseFile(file, headerLine);
  };

  const handleLoadFile = () => {
    if (fileObj) {
      parseFile(fileObj, headerLine);
    }
  };

  const handleMappingChange = (col: string, value: string) => {
    setMapping(prev => ({ ...prev, [col]: value }));
    if (rawData.length) {
      setPreview(rawData.slice(0, 10));
    }
  };

  const handleExport = () => {
    if (!rawData.length) return;
    const normalized = rawData.map(row => {
      const obj: any = {};
      standardColumns.forEach(col => {
        obj[col] = row[mapping[col]] || "";
      });
      return obj;
    });
    const csv = Papa.unparse(normalized);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "normalized_" + fileName.replace(/\.[^.]+$/, ".csv");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <AdminPageHeader icon={<FaWandMagicSparkles size={18}/>} title="Chuẩn hóa dữ liệu" breadcrumb="Chuẩn hóa txt/csv" />
      <div className="w-full rounded-2xl p-6 border flex flex-col md:flex-row gap-8" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        {/* Left: Upload, setting, mapping */}
        <div className="flex-1 min-w-[320px]">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Chuẩn hóa dữ liệu (txt/csv)</h1>
          <div className="mb-4 flex flex-col gap-3">
            <input type="file" accept=".csv,.txt" className="border rounded px-3 py-2" onChange={handleFileUpload} />
            <div className="flex items-center gap-2">
              <label className="font-medium text-sm" style={{ color: 'var(--primary)' }}>Dòng header:</label>
              <input
                type="number"
                min={0}
                max={rawRows.length > 0 ? rawRows.length - 1 : 100}
                value={headerLine}
                onChange={e => setHeaderLine(Number(e.target.value))}
                className="border rounded px-2 py-1 w-16 text-sm"
              />
              <button
                className="btn-primary text-sm px-3 py-1"
                onClick={handleLoadFile}
                disabled={!fileObj}
              >
                Load
              </button>
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {fileName && <div className="text-sm mb-2">File: <span className="font-semibold">{fileName}</span></div>}
          </div>
          {rawRows.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>Nội dung file txt/csv</h2>
              <div className="overflow-x-auto rounded-lg border max-h-64" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
                <table className="min-w-full border text-xs">
                  <tbody>
                    {rawRows.slice(0, 20).map((row: any, idx: number) => (
                      <tr key={idx}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        {Array.isArray(row)
                          ? row.map((cell: any, cidx: number) => <td key={cidx} className="px-2 py-1 border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>{cell}</td>)
                          : Object.values(row).map((cell: any, cidx: number) => <td key={cidx} className="px-2 py-1 border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Hiển thị tối đa 20 dòng đầu tiên.</div>
            </div>
          )}
          {headers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>Mapping cột chuẩn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standardColumns.map(col => (
                  <div key={col} className="flex items-center gap-2">
                    <span className="w-24 font-medium text-sm" style={{ color: 'var(--primary)' }}>{col}</span>
                    <select
                      className="input text-sm"
                      value={mapping[col] || ""}
                      onChange={e => handleMappingChange(col, e.target.value)}
                    >
                      <option value="">-- Chọn cột --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Right: Preview, mapping result, export */}
        <div className="flex-1 min-w-[320px]">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Preview &amp; Kết quả mapping</h2>
          {preview.length > 0 && (
            <div className="mb-6">
              <div className="overflow-x-auto rounded-lg border" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      {standardColumns.map(col => (
                      <th key={col} className="px-2 py-1 border font-semibold" style={{ background: 'var(--bg-surface)', color: 'var(--primary)', borderColor: 'var(--border)' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row: any, idx: number) => (
                      <tr key={idx}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        {standardColumns.map(col => (
                          <td key={col} className="px-2 py-1 border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>{row[mapping[col]] || ""}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {rawData.length > 0 && (
            <button
              className="btn-primary px-6 py-2 text-lg mt-2"
              onClick={handleExport}
            >
              Xuất file csv chuẩn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}