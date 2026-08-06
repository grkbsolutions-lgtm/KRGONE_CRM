import React from 'react';
import { Columns, ArrowRight, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { ColumnMappingItem, LeadFieldKey } from '../../types';

export const FIELD_OPTIONS: { key: LeadFieldKey; label: string; description: string; required?: boolean }[] = [
  { key: 'companyName', label: 'Company Name', description: 'Business / Firm / Entity Name', required: true },
  { key: 'contactPerson', label: 'Contact Person', description: 'Representative / Owner / Manager' },
  { key: 'designation', label: 'Designation', description: 'Role / Title' },
  { key: 'mobile', label: 'Mobile Number', description: 'Direct Cell / Primary Mobile' },
  { key: 'phone', label: 'Phone Number', description: 'Office Tel / Landline' },
  { key: 'email', label: 'Email Address', description: 'Corporate / Contact Email' },
  { key: 'website', label: 'Website URL', description: 'Web Domain / Portal' },
  { key: 'category', label: 'Category / Industry', description: 'Business Domain / Sector' },
  { key: 'products', label: 'Products / Services', description: 'Offerings / Line of business' },
  { key: 'officeAddress', label: 'Office Address', description: 'HQ or Branch Address' },
  { key: 'factoryAddress', label: 'Factory Address', description: 'Plant or Works Address' },
  { key: 'city', label: 'City', description: 'Town / City Name' },
  { key: 'state', label: 'State', description: 'State / Province' },
  { key: 'pincode', label: 'PIN Code', description: 'Zip Code / Postal Code' },
  { key: 'ignore', label: '— Ignore Column —', description: 'Do not import this column' },
];

export function autoDetectColumn(headerName: string): LeadFieldKey {
  const norm = headerName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (/company|firm|business|organization|orgname|vendor|client|entity|title/.test(norm)) {
    return 'companyName';
  }
  if (/person|contactname|owner|rep|representative|name|director|manager/.test(norm) && !/company/.test(norm)) {
    return 'contactPerson';
  }
  if (/designation|role|jobtitle|position/.test(norm)) {
    return 'designation';
  }
  if (/mobile|cell|whatsapp|contactno|handphone/.test(norm)) {
    return 'mobile';
  }
  if (/phone|telephone|tel|landline/.test(norm)) {
    return 'phone';
  }
  if (/email|mail|e-mail/.test(norm)) {
    return 'email';
  }
  if (/website|url|domain|web/.test(norm)) {
    return 'website';
  }
  if (/category|industry|type|segment|sector/.test(norm)) {
    return 'category';
  }
  if (/product|service|items|dealing/.test(norm)) {
    return 'products';
  }
  if (/factory|plant|works/.test(norm) && /address|location/.test(norm)) {
    return 'factoryAddress';
  }
  if (/address|street|location|addr/.test(norm)) {
    return 'officeAddress';
  }
  if (/city|town|district/.test(norm)) {
    return 'city';
  }
  if (/state|province|region/.test(norm)) {
    return 'state';
  }
  if (/pin|pincode|zip|zipcode|postal/.test(norm)) {
    return 'pincode';
  }

  return 'ignore';
}

interface ColumnMapperProps {
  mappings: ColumnMappingItem[];
  onMappingChange: (excelHeader: string, targetField: LeadFieldKey) => void;
  onAutoMapAll: () => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  mappings,
  onMappingChange,
  onAutoMapAll,
}) => {
  const mappedCount = mappings.filter((m) => m.targetField !== 'ignore').length;
  const hasCompanyMapped = mappings.some((m) => m.targetField === 'companyName');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Columns className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Map Excel Columns to Database Fields</h3>
            <p className="text-xs text-slate-500">
              AI automatically detected {mappedCount} out of {mappings.length} columns. Review or edit below.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onAutoMapAll}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Re-run AI Auto-Detect</span>
          </button>
        </div>
      </div>

      {!hasCompanyMapped && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Notice: At least one column must be mapped to "Company Name" to complete import.</span>
        </div>
      )}

      {/* Mapping Rows Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <th className="px-4 py-3">Excel Header</th>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Target Database Field</th>
              <th className="px-4 py-3 text-right">Mapping Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {mappings.map((item) => {
              const currentField = FIELD_OPTIONS.find((f) => f.key === item.targetField);

              return (
                <tr key={item.excelHeader} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                      {item.excelHeader}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <ArrowRight className="w-4 h-4 text-slate-400 mx-auto" />
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={item.targetField}
                      onChange={(e) => onMappingChange(item.excelHeader, e.target.value as LeadFieldKey)}
                      className="w-full sm:w-72 bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                    >
                      {FIELD_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label} {opt.required ? '*' : ''}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {item.targetField !== 'ignore' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mapped</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Ignored
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
