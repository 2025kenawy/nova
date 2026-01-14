
import React, { useState, useEffect } from 'react';
import { 
  Inbox, Loader2, Sparkles, Building2, Linkedin, Twitter, 
  Facebook, Instagram, CheckCircle2, XCircle, Archive, 
  ExternalLink, Mail, Trash2, Globe, Square, CheckSquare,
  Check, FileText
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { leadService } from '../services/leadService';

interface NovaLeadsProps {
  onSelectLead?: (id: string) => void;
}

const NovaLeads: React.FC<NovaLeadsProps> = ({ onSelectLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    const data = await leadService.getAllLeads();
    setLeads(data);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    await leadService.updateLeadStatus(id, status);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    // Clear from selection if status changes away from filter
    if (selectedIds.has(id)) {
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
    }
  };

  const handleBulkSave = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkOperating(true);
    const idsToSave: string[] = Array.from(selectedIds);
    await leadService.bulkUpdateLeadStatus(idsToSave, 'SAVED');
    setLeads(prev => prev.map(l => idsToSave.includes(l.id) ? { ...l, status: 'SAVED' } : l));
    setSelectedIds(new Set());
    setIsBulkOperating(false);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const filteredLeads = leads.filter(l => filter === 'ALL' || l.status === filter);

  const formatUrl = (url?: string): string => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Inbox</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-16">
            {leads.length} Persistent Leads Discovered by Nova
          </p>
        </div>

        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl animate-in slide-in-from-right-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedIds.size} Selected</span>
              <button 
                onClick={handleBulkSave}
                disabled={isBulkOperating}
                className="px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isBulkOperating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Bulk Save to CRM
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
            {['ALL', 'DISCOVERED', 'SAVED', 'IGNORED'].map(f => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Querying Sovereign DB...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
          <Sparkles className="w-16 h-16 text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-900">Inbox Clear</h3>
          <p className="text-slate-400 text-sm font-medium mt-2">Run a Market Search to populate your intelligence inbox.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="px-6 py-5 w-16 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-300 hover:text-indigo-600 transition-colors">
                    {selectedIds.size === filteredLeads.length ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-8 py-5">Lead / Role</th>
                <th className="px-8 py-5">Organization & Links</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Inbox Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className={`group transition-all ${selectedIds.has(lead.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-6 py-6 text-center">
                    <button onClick={() => toggleSelect(lead.id)} className="text-slate-300">
                      {selectedIds.has(lead.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                        {lead.firstName[0]}
                      </div>
                      <div className="cursor-pointer" onClick={() => onSelectLead?.(lead.id)}>
                        <span className="font-black text-slate-900 block leading-tight hover:text-indigo-600 transition-colors">{lead.firstName} {lead.lastName}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{lead.title}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-slate-300" /> {lead.companyName}
                      </span>
                      <div className="flex items-center gap-3">
                        {lead.linkedin && (
                          <a 
                            href={formatUrl(lead.linkedin)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-[#0077B5] transition-colors"
                          >
                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        )}
                        {lead.companyDomain && (
                          <a 
                            href={formatUrl(lead.companyDomain)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-indigo-500 transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                      lead.status === 'DISCOVERED' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                      lead.status === 'SAVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      lead.status === 'Enriched' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                      'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => onSelectLead?.(lead.id)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                        title="View Dossier"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {lead.status !== 'SAVED' && (
                        <button 
                          onClick={() => handleUpdateStatus(lead.id, 'SAVED')}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                          title="Save to CRM"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {lead.status !== 'IGNORED' && (
                        <button 
                          onClick={() => handleUpdateStatus(lead.id, 'IGNORED')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          title="Ignore Lead"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateStatus(lead.id, 'ARCHIVED')}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-200 transition-all"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NovaLeads;
