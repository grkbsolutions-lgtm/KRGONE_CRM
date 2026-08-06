import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Layers,
} from 'lucide-react';
import { ExcelParsedRow, ExtractedCompany } from '../../types';

interface PreviewTableProps {
  rows: ExcelParsedRow[];
  onToggleRowSelect: (rowNumber: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteRow: (rowNumber: number) => void;
  onUpdateRowLead: (rowNumber: number, updatedField: keyof ExtractedCompany, value: string) => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  rows,
  onToggleRowSelect,
  onSelectAll,
  onDeselectAll,
  onDeleteRow,
  onUpdateRowLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'duplicate' | 'error' | 'warning'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [editingRow, setEditingRow] = useState<number | null>(null);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Status filter
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const lead = row.mappedLead;
        const matchesName = lead.companyName?.toLowerCase().includes(q);
        const matchesContact = lead.contactPerson?.toLowerCase().includes(q);
        const matchesMobile = lead.mobile?.toLowerCase().includes(q);
        const matchesEmail = lead.email?.toLowerCase().includes(q);
        const matchesCity = lead.city?.toLowerCase().includes(q);
        return matchesName || matchesContact || matchesMobile || matchesEmail || matchesCity;
      }
      return true;
    });
  }, [rows, statusFilter, searchTerm]);

  // Paginated rows for memory & speed efficiency
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const selectedCount = rows.filter((r) => r.isSelected).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Extracted Lead Data Preview</h3>
            <p className="text-[11px] text-slate-500">
              Showing {filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} rows
            </p>
          </div>
        </div>

        {/* Search & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, contact, mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-48 sm:w-64 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
            >
              All ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('valid'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'valid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'}`}
            >
              Valid
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('duplicate'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'duplicate' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600'}`}
            >
              Duplicates
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('error'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'error' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600'}`}
            >
              Errors
            </button>
          </div>
        </div>
      </div>

      {/* Select Actions Bar */}
      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 border border-slate-200 rounded-xl">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition shadow-xs"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Select All ({rows.length})</span>
          </button>

          <button
            type="button"
            onClick={onDeselectAll}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition shadow-xs"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span>Deselect All</span>
          </button>

          <span className="text-slate-500 font-medium pl-2">
            Selected: <strong className="text-slate-900">{selectedCount}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Page Size:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
              <th className="p-3 w-10 text-center">Select</th>
              <th className="p-3 w-12">Row #</th>
              <th className="p-3">Company Name</th>
              <th className="p-3">Contact Person</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Email</th>
              <th className="p-3">City / Category</th>
              <th className="p-3 text-center">Validation</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  No rows matching filter criteria.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => {
                const lead = r.mappedLead;
                const isEditing = editingRow === r.rowNumber;

                return (
                  <tr
                    key={r.rowNumber}
                    className={`transition ${
                      r.isSelected ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={r.isSelected}
                        onChange={() => onToggleRowSelect(r.rowNumber)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Row Number */}
                    <td className="p-3 font-mono text-slate-400 font-medium">#{r.rowNumber}</td>

                    {/* Company Name */}
                    <td className="p-3 font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={lead.companyName || ''}
                          onChange={(e) => onUpdateRowLead(r.rowNumber, 'companyName', e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-xs font-bold text-slate-900"
                        />
                      ) : (
                        lead.companyName || <span className="text-red-500 italic">Missing Name</span>
                      )}
                    </td>

                    {/* Contact Person */}
                    <td className="p-3 text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={lead.contactPerson || ''}
                          onChange={(e) => onUpdateRowLead(r.rowNumber, 'contactPerson', e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        lead.contactPerson || '—'
                      )}
                    </td>

                    {/* Mobile */}
                    <td className="p-3 font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={lead.mobile || ''}
                          onChange={(e) => onUpdateRowLead(r.rowNumber, 'mobile', e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-xs font-mono"
                        />
                      ) : (
                        lead.mobile || '—'
                      )}
                    </td>

                    {/* Email */}
                    <td className="p-3 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={lead.email || ''}
                          onChange={(e) => onUpdateRowLead(r.rowNumber, 'email', e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        lead.email || '—'
                      )}
                    </td>

                    {/* City / Category */}
                    <td className="p-3">
                      <span className="block font-semibold text-slate-800">{lead.city || '—'}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{lead.category || 'General'}</span>
                    </td>

                    {/* Validation Badge */}
                    <td className="p-3 text-center">
                      {r.status === 'valid' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Valid
                        </span>
                      )}
                      {r.status === 'duplicate' && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
                          title="Duplicate detected in Excel file or Database"
                        >
                          <Copy className="w-3 h-3 mr-1 text-amber-600" />
                          Duplicate
                        </span>
                      )}
                      {r.status === 'error' && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 cursor-help"
                          title={r.errors.map((e) => e.errorMessage).join(', ')}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
                          Error
                        </span>
                      )}
                      {r.status === 'warning' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Warning
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => setEditingRow(isEditing ? null : r.rowNumber)}
                          className={`p-1 rounded-lg transition ${
                            isEditing ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title="Edit Row Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteRow(r.rowNumber)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredRows.length.toLocaleString()} items)
        </span>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
