import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  Calendar,
  X,
  Check,
  Tag,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { FullLeadRecord } from '../types';

interface LeadsListProps {
  leads: FullLeadRecord[];
  onUpdateLead: (companyId: string, updated: Partial<FullLeadRecord>) => void;
  onDeleteLead: (companyId: string) => void;
  onRefreshLeads: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  onUpdateLead,
  onDeleteLead,
  onRefreshLeads,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingLead, setEditingLead] = useState<FullLeadRecord | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(leads.map((l) => l.company.category || 'General Industry'))).filter(Boolean);

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      lead.company.companyName.toLowerCase().includes(term) ||
      lead.contact.contactPerson.toLowerCase().includes(term) ||
      lead.contact.mobile.includes(term) ||
      lead.contact.email.toLowerCase().includes(term) ||
      lead.address.city.toLowerCase().includes(term);

    const matchCategory =
      selectedCategory === 'all' || lead.company.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = [
      'Company Name',
      'Category',
      'Contact Person',
      'Mobile',
      'Phone',
      'Email',
      'Office Address',
      'Factory Address',
      'City',
      'State',
      'Pincode',
      'Website',
      'Created At',
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.company.companyName.replace(/"/g, '""')}"`,
      `"${l.company.category.replace(/"/g, '""')}"`,
      `"${l.contact.contactPerson.replace(/"/g, '""')}"`,
      `"${l.contact.mobile.replace(/"/g, '""')}"`,
      `"${l.contact.phone.replace(/"/g, '""')}"`,
      `"${l.contact.email.replace(/"/g, '""')}"`,
      `"${l.address.officeAddress.replace(/"/g, '""')}"`,
      `"${l.address.factoryAddress.replace(/"/g, '""')}"`,
      `"${l.address.city.replace(/"/g, '""')}"`,
      `"${l.address.state.replace(/"/g, '""')}"`,
      `"${l.address.pincode.replace(/"/g, '""')}"`,
      `"${(l.company.website || '').replace(/"/g, '""')}"`,
      `"${l.company.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ai_smart_scanner_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-900">Database of Structured Leads</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filteredLeads.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Persisted business leads stored without cluttering raw images or OCR text.
          </p>
        </div>

        {/* Actions & CSV Export */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredLeads.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Field */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company name, contact person, mobile, email, or city..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none transition appearance-none cursor-pointer shadow-xs"
          >
            <option value="all">All Product Categories ({leads.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 my-8 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-800 font-semibold mb-1">No Leads Found</h4>
          <p className="text-xs text-slate-500">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try clearing your search or category filter.'
              : 'Scan documents from the dashboard to save leads.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map(({ company, contact, address }) => (
            <div
              key={company.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Header Title + Category */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                      {company.category || 'General Industry'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                      {company.companyName}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditingLead({ company, contact, address })}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Edit Lead"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteLead(company.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs text-slate-600 pt-1">
                  {/* Contact Person */}
                  {contact.contactPerson && (
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{contact.contactPerson}</span>
                    </div>
                  )}

                  {/* Mobile & Phone */}
                  {(contact.mobile || contact.phone) && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-mono text-emerald-700 font-semibold">
                        {contact.mobile} {contact.phone ? `/ ${contact.phone}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Email */}
                  {contact.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:underline text-slate-700 truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}

                  {/* Address */}
                  {(address.officeAddress || address.city) && (
                    <div className="flex items-start space-x-2 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-500 line-clamp-2">
                        {address.officeAddress}{' '}
                        {address.city && <strong className="text-slate-700">({address.city})</strong>}
                      </span>
                    </div>
                  )}

                  {/* Website */}
                  {company.website && (
                    <div className="flex items-center space-x-2 pt-1">
                      <Globe className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline flex items-center space-x-1"
                      >
                        <span className="truncate">{company.website}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Created Date */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Added {new Date(company.createdAt).toLocaleDateString()}</span>
                </span>
                <span className="font-mono text-slate-400">ID: {company.id.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal Drawer */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Company Lead Record</h3>
              <button
                onClick={() => setEditingLead(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  value={editingLead.company.companyName}
                  onChange={(e) =>
                    setEditingLead({
                      ...editingLead,
                      company: { ...editingLead.company, companyName: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-sm focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Category</label>
                  <input
                    type="text"
                    value={editingLead.company.category}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        company: { ...editingLead.company, category: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={editingLead.contact.contactPerson}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        contact: { ...editingLead.contact, contactPerson: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Mobile</label>
                  <input
                    type="text"
                    value={editingLead.contact.mobile}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        contact: { ...editingLead.contact, mobile: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Email</label>
                  <input
                    type="text"
                    value={editingLead.contact.email}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        contact: { ...editingLead.contact, email: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Office Address</label>
                <input
                  type="text"
                  value={editingLead.address.officeAddress}
                  onChange={(e) =>
                    setEditingLead({
                      ...editingLead,
                      address: { ...editingLead.address, officeAddress: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">City</label>
                  <input
                    type="text"
                    value={editingLead.address.city}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        address: { ...editingLead.address, city: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">State</label>
                  <input
                    type="text"
                    value={editingLead.address.state}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        address: { ...editingLead.address, state: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Website</label>
                  <input
                    type="text"
                    value={editingLead.company.website || ''}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        company: { ...editingLead.company, website: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateLead(editingLead.company.id, editingLead);
                  setEditingLead(null);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
