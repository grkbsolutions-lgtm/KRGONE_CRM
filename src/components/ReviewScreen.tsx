import React, { useState } from 'react';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  Globe,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Save,
  Plus,
  RefreshCw,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { ExtractedCompany } from '../types';

interface ReviewScreenProps {
  extractedCompanies: ExtractedCompany[];
  processingTimeMs: number;
  onUpdateCompany: (tempId: string, updated: Partial<ExtractedCompany>) => void;
  onDeleteCompany: (tempId: string) => void;
  onSaveIndividual: (company: ExtractedCompany) => void;
  onSaveBatch: (selectedCompanies: ExtractedCompany[]) => void;
  onAddCompanyManually: () => void;
  onClearBatch: () => void;
  isSavingBatch: boolean;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  extractedCompanies,
  processingTimeMs,
  onUpdateCompany,
  onDeleteCompany,
  onSaveIndividual,
  onSaveBatch,
  onAddCompanyManually,
  onClearBatch,
  isSavingBatch,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'new' | 'duplicates'>('all');

  const selectedCompanies = extractedCompanies.filter((c) => c.selected);
  const duplicateCount = extractedCompanies.filter((c) => c.duplicateStatus?.isDuplicate).length;
  const newCount = extractedCompanies.length - duplicateCount;

  const filteredList = extractedCompanies.filter((c) => {
    if (filterType === 'duplicates') return c.duplicateStatus?.isDuplicate;
    if (filterType === 'new') return !c.duplicateStatus?.isDuplicate;
    return true;
  });

  const handleToggleSelectAll = () => {
    const allSelected = extractedCompanies.every((c) => c.selected);
    extractedCompanies.forEach((c) => {
      onUpdateCompany(c.tempId, { selected: !allSelected });
    });
  };

  if (extractedCompanies.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Extracted Leads to Review</h3>
        <p className="text-slate-500 text-sm mb-6">
          Scan a document or image from the dashboard to extract companies and review them here.
        </p>
        <button
          onClick={onAddCompanyManually}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company Profile Manually</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Review Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-900">Extracted Leads Review Screen</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {extractedCompanies.length} Detected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Processed in {(processingTimeMs / 1000).toFixed(2)}s • Review, edit, resolve duplicates, and save to database.
          </p>
        </div>

        {/* Filter Badges & Batch Save Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({extractedCompanies.length})
            </button>
            <button
              onClick={() => setFilterType('new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === 'new' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New ({newCount})
            </button>
            <button
              onClick={() => setFilterType('duplicates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === 'duplicates' ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Duplicates ({duplicateCount})
            </button>
          </div>

          <button
            onClick={onAddCompanyManually}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manual</span>
          </button>

          <button
            onClick={() => onSaveBatch(selectedCompanies)}
            disabled={selectedCompanies.length === 0 || isSavingBatch}
            className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Selected ({selectedCompanies.length})</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Select All / Deselect All */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-2">
        <button onClick={handleToggleSelectAll} className="flex items-center space-x-1.5 hover:text-slate-900 transition">
          {selectedCompanies.length === extractedCompanies.length ? (
            <CheckSquare className="w-4 h-4 text-blue-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>Select All / Deselect All ({selectedCompanies.length}/{extractedCompanies.length})</span>
        </button>

        <button onClick={onClearBatch} className="text-slate-500 hover:text-red-600 transition">
          Clear Entire Review Batch
        </button>
      </div>

      {/* Extracted Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredList.map((company, index) => {
          const isDup = company.duplicateStatus?.isDuplicate;
          const matchedFields = company.duplicateStatus?.matchedFields || [];
          const currentAction = company.duplicateStatus?.action || 'save_new';

          return (
            <div
              key={company.tempId}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition relative flex flex-col justify-between ${
                company.selected
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onUpdateCompany(company.tempId, { selected: !company.selected })}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      {company.selected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Company</span>
                      <input
                        type="text"
                        value={company.companyName}
                        onChange={(e) => onUpdateCompany(company.tempId, { companyName: e.target.value })}
                        placeholder="Company Name"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-900 text-base font-bold transition mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Actions: Save Single & Delete Single */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDeleteCompany(company.tempId)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Duplicate Warning Shield if duplicate detected */}
                {isDup && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-amber-900 font-semibold">
                      <span className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Duplicate Conflict Detected</span>
                      </span>
                      <span className="text-amber-800 text-[10px] bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        Matched: {matchedFields.join(', ')}
                      </span>
                    </div>

                    <p className="text-slate-700 text-[11px]">
                      Conflicting Record in Database: <strong className="text-slate-900">{company.duplicateStatus?.existingCompanyName}</strong>
                    </p>

                    {/* Action Selector: Save New, Update Existing, Skip */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCompany(company.tempId, {
                            duplicateStatus: { ...company.duplicateStatus!, action: 'save_new' },
                          })
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          currentAction === 'save_new'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Save as New
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCompany(company.tempId, {
                            duplicateStatus: { ...company.duplicateStatus!, action: 'update_existing' },
                          })
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          currentAction === 'update_existing'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Update Existing
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCompany(company.tempId, {
                            duplicateStatus: { ...company.duplicateStatus!, action: 'skip' },
                          })
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          currentAction === 'skip'
                            ? 'bg-red-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}

                {/* Editable Fields Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Category */}
                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <Tag className="w-3 h-3 mr-1 text-blue-600" />
                      <span>Category</span>
                    </label>
                    <input
                      type="text"
                      value={company.category}
                      onChange={(e) => onUpdateCompany(company.tempId, { category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="Product / Business Category"
                    />
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <User className="w-3 h-3 mr-1 text-indigo-600" />
                      <span>Contact Person</span>
                    </label>
                    <input
                      type="text"
                      value={company.contactPerson}
                      onChange={(e) => onUpdateCompany(company.tempId, { contactPerson: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="Contact Name / Proprietor"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <Phone className="w-3 h-3 mr-1 text-emerald-600" />
                      <span>Mobile</span>
                    </label>
                    <input
                      type="text"
                      value={company.mobile}
                      onChange={(e) => onUpdateCompany(company.tempId, { mobile: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="+91 98000 00000"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <Phone className="w-3 h-3 mr-1 text-teal-600" />
                      <span>Office Phone</span>
                    </label>
                    <input
                      type="text"
                      value={company.phone}
                      onChange={(e) => onUpdateCompany(company.tempId, { phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="022 2800 0000"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <Mail className="w-3 h-3 mr-1 text-purple-600" />
                      <span>Email</span>
                    </label>
                    <input
                      type="text"
                      value={company.email}
                      onChange={(e) => onUpdateCompany(company.tempId, { email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="info@company.com"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <Globe className="w-3 h-3 mr-1 text-sky-600" />
                      <span>Website</span>
                    </label>
                    <input
                      type="text"
                      value={company.website}
                      onChange={(e) => onUpdateCompany(company.tempId, { website: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="www.company.com"
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <MapPin className="w-3 h-3 mr-1 text-rose-600" />
                      <span>Office Address</span>
                    </label>
                    <input
                      type="text"
                      value={company.officeAddress}
                      onChange={(e) => onUpdateCompany(company.tempId, { officeAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="Street, Suite, Office address"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-medium flex items-center mb-1">
                      <MapPin className="w-3 h-3 mr-1 text-amber-600" />
                      <span>Factory Address</span>
                    </label>
                    <input
                      type="text"
                      value={company.factoryAddress}
                      onChange={(e) => onUpdateCompany(company.tempId, { factoryAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-slate-800"
                      placeholder="Plant, Industrial estate address"
                    />
                  </div>

                  {/* City / State / Pincode */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <input
                        type="text"
                        value={company.city}
                        onChange={(e) => onUpdateCompany(company.tempId, { city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2 py-1 text-slate-800"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={company.state}
                        onChange={(e) => onUpdateCompany(company.tempId, { state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2 py-1 text-slate-800"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={company.pincode}
                        onChange={(e) => onUpdateCompany(company.tempId, { pincode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2 py-1 text-slate-800"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Card Footer Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => onSaveIndividual(company)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Single Lead</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
