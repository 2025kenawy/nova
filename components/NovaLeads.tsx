import React, { useState, useEffect } from 'react';
import { 
  Inbox, Loader2, Sparkles, Building2, Linkedin, Twitter, 
  Facebook, Instagram, CheckCircle2, XCircle, Archive, 
  ExternalLink, Mail, Trash2, Globe, Square, CheckSquare,
  Check, FileText, Download, X, Save
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { leadService } from '../services/leadService';
import { exportLeadsToCsv } from '../utils/exportUtils';

interface NovaLeadsProps {
  onSelectLead?: (id: string) => void;
}

const NovaLeads: React.FC<NovaLeadsProps> = ({ onSelectLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    const data = await leadService.getDiscoveryInbox();
    setLeads(data);
    setIsLoading(false);
  };

  const handlePromote = async (lead: Lead) => {
    const success = await leadService.promoteToCrm(lead);
    if (success) {
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      setFeedback({ message: `${lead.firstName} saved to CRM.`, type: 'success' });
    } else {
      setFeedback({ message: `${lead.firstName} is already in CRM.`, type: 'info' });
    }
    if (selectedIds.has(lead.id)) {
      const next = new Set(selectedIds);
      next.delete(lead.id);
      setSelectedIds(next);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleBulkSave = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkOperating(true);
    setFeedback({ message: `Promoting ${selectedIds.size} leads...`, type: 'info' });
    
    const idsToSave: string[] = Array.from(selectedIds);
    try {
      const count = await leadService.bulkUpdateLeadStatus(idsToSave, 'SAVED');
      setLeads(prev => prev.filter(l => !idsToSave.includes(l.id)));
      
      if (count === 0) {
        setFeedback({ message: 'No new leads saved. Selected leads might already exist in CRM.', type: 'info' });
      } else {
        setFeedback({ message: `Successfully promoted ${count} leads to CRM.`, type: 'success' });
      }
      
      setSelectedIds(new Set());
    } catch (err) {
      setFeedback({ message: 'Error during bulk promotion.', type: 'error' });
    }
    
    setIsBulkOperating(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExport = () => {
    const toExport = leads.filter(l => selectedIds.has(l.id));
    exportLeadsToCsv(toExport.length > 0 ? toExport : filteredLeads, 'discovery_inbox_export.csv');
    setFeedback({ message: 'Exported to CSV.', type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length && filteredLeads.length > 0) {
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
    <div className="flex flex-col h-full gap-8 animate-in fade-in duration-500 relative">
      {/* BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-8 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                {selectedIds.size} Leads Selected
              </span>
              <span className="text-[8px] font-bold text-slate-400">Intelligence Verification</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkSave}
                disabled={isBulkOperating}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-xl shadow-indigo-500/20"
              >
                {isBulkOperating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Selected to CRM
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all border border-white/5"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK TOASTS */}
      {feedback && (
        <div className="fixed top-24 right-10 z-[110] animate-in slide-in-from-right-4">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            feedback.type === 'success' ? 'bg-slate-900 border-emerald-500/30' : 
            feedback.type === 'error' ? 'bg-rose-900 border-rose-500/30' : 
            'bg-slate-900 border-blue-500/30'
          } text-white`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
             feedback.type === 'error' ? <XCircle className="w-4 h-4 text-rose-500" /> : 
             <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Intelligence Inbox</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-16">
            {leads.length} Discovered Leads • Verification Required
          </p>
        </div>

        <div className="flex items-center gap-4">
           {/* Summary items removed since the floating bar takes over bulk actions */}
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {leads.length} Entities pending review
           </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Querying Intelligence Store...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
          <Sparkles className="w-16 h-16 text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-900">Inbox Clear</h3>
          <p className="text-slate-400 text-sm font-medium mt-2">Activate the Big Brain to discover new market entities.</p>
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
                <th className="px-8 py-5">Value Score</th>
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
                            <Globe className="w-3.5 h-3.5" /> Site
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1 w-24">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${lead.scoring?.overall || 0}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{lead.scoring?.overall || 0}% Priority</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handlePromote(lead)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                        title="Save to CRM"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => leadService.updateLeadStatus(lead.id, 'IGNORED')}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        title="Ignore Lead"
                      >
                        <XCircle className="w-4 h-4" />
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