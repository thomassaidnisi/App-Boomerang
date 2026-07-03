import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { AuthorizedUser, UserRole } from '../types';
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportUsersDialogProps {
  onImportUsers: (users: Omit<AuthorizedUser, 'id' | 'active'>[]) => void;
  onClose: () => void;
}

interface ParsedRow {
  nombre: string;
  apellido: string;
  email: string;
  tipo: string;
  curso: string;
  division: string;
  isValid: boolean;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = ['estudiante', 'docente'];

const TEMPLATE_ROWS = [
  { nombre: 'Ana', apellido: 'Martínez', email: 'ana.martinez@ija.edu.ar', tipo: 'Estudiante', curso: '3', division: 'A' },
  { nombre: 'Diego', apellido: 'López', email: 'diego.lopez@ija.edu.ar', tipo: 'Estudiante', curso: '5', division: 'B' },
  { nombre: 'Prof. Laura', apellido: 'Suárez', email: 'laura.suarez@ija.edu.ar', tipo: 'Docente', curso: '', division: '' },
];

function normalizeRow(raw: any): ParsedRow {
  // Header keys may come with different casing/spacing depending on the sheet
  const getVal = (keys: string[]) => {
    for (const key of Object.keys(raw)) {
      if (keys.includes(key.trim().toLowerCase())) {
        return String(raw[key] ?? '').trim();
      }
    }
    return '';
  };

  const nombre = getVal(['nombre']);
  const apellido = getVal(['apellido']);
  const email = getVal(['email']);
  const tipo = getVal(['tipo']);
  const curso = getVal(['curso']);
  const division = getVal(['division', 'división']);

  const errors: string[] = [];
  if (!nombre) errors.push('Falta nombre');
  if (!apellido) errors.push('Falta apellido');
  if (!email || !EMAIL_REGEX.test(email)) errors.push('Email inválido');
  if (!tipo || !VALID_TYPES.includes(tipo.trim().toLowerCase())) errors.push('Tipo inválido');

  const normalizedTipo = tipo.trim().toLowerCase() === 'docente' ? 'Docente' : 'Estudiante';
  if (normalizedTipo === 'Estudiante') {
    if (!curso) errors.push('Falta curso');
    if (!division) errors.push('Falta división');
  }

  return {
    nombre,
    apellido,
    email,
    tipo: normalizedTipo,
    curso,
    division,
    isValid: errors.length === 0,
    errors,
  };
}

export const ImportUsersDialog: React.FC<ImportUsersDialogProps> = ({ onImportUsers, onClose }) => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(TEMPLATE_ROWS, {
      header: ['nombre', 'apellido', 'email', 'tipo', 'curso', 'division']
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'usuarios');
    XLSX.writeFile(workbook, 'plantilla_usuarios_boomerang.xlsx');
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      setRows(rawRows.map(normalizeRow));
    };
    reader.readAsBinaryString(file);
    setFileName(file.name);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const validCount = rows.filter(r => r.isValid).length;

  const handleConfirmImport = () => {
    const validUsers: Omit<AuthorizedUser, 'id' | 'active'>[] = rows
      .filter(r => r.isValid)
      .map(r => ({
        email: r.email,
        name: `${r.nombre} ${r.apellido}`,
        role: r.tipo as UserRole,
        course: r.tipo === 'Estudiante' ? `${r.curso}°${r.division}` : undefined,
      }));

    onImportUsers(validUsers);
    onClose();
  };

  return (
    <div
      id="import-users-dialog-backdrop"
      className="absolute inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in"
    >
      <div
        id="import-users-dialog"
        className="bg-white w-full max-h-[88%] rounded-t-3xl flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-extrabold text-neutral-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#CC0000]" />
            Importar Usuarios desde Excel
          </h3>
          <button
            id="btn-close-import-dialog"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-[#CC0000] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none">
          {/* Template download */}
          <button
            id="btn-download-template"
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-neutral-700 font-bold text-xs px-4 py-3 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar plantilla Excel
          </button>
          <p className="text-[10px] text-gray-400 -mt-2 leading-relaxed">
            Columnas: nombre, apellido, email, tipo (Estudiante/Docente), curso (1-6), division (A/B/C).
          </p>

          {/* Drag & drop zone */}
          <div
            id="import-dropzone"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl px-4 py-8 cursor-pointer transition-colors ${
              isDragging ? 'border-[#CC0000] bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-xs font-bold text-neutral-600 text-center">
              Arrastrá tu archivo .xlsx o .csv acá,<br />o hacé click para elegirlo
            </span>
            {fileName && (
              <span className="text-[10px] font-mono text-[#CC0000] font-bold mt-1">{fileName}</span>
            )}
            <input
              ref={fileInputRef}
              id="import-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Vista previa ({rows.length} filas)
                </span>
                <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {validCount} válidas
                </span>
              </div>

              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto scrollbar-none">
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    id={`import-row-${idx}`}
                    className={`flex flex-col gap-1 p-2.5 rounded-xl border text-[10px] ${
                      row.isValid
                        ? 'bg-white border-gray-100'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold truncate ${row.isValid ? 'text-neutral-800' : 'text-[#CC0000]'}`}>
                        {row.nombre || '(sin nombre)'} {row.apellido}
                      </span>
                      {row.isValid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
                      )}
                    </div>
                    <span className="font-mono text-gray-400 truncate">{row.email || '(sin email)'}</span>
                    <span className="text-gray-400">
                      {row.tipo}{row.tipo === 'Estudiante' && row.curso ? ` • ${row.curso}°${row.division}` : ''}
                    </span>
                    {!row.isValid && (
                      <span className="text-[#CC0000] font-bold">{row.errors.join(' · ')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            id="btn-confirm-import"
            onClick={handleConfirmImport}
            disabled={validCount === 0}
            className="w-full bg-[#CC0000] hover:bg-red-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-extrabold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Confirmar Importación {validCount > 0 ? `(${validCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
