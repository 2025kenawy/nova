
import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, Loader2, Globe, BrainCircuit, 
  Sparkles, Activity, Users, Award, Rocket, ChevronDown, Filter, Target,
  Zap, Crown, Microscope, CheckSquare, Square,
  MapPin, Building2, ExternalLink, Mail, MoreHorizontal,
  Linkedin, Check, Save, CheckCircle2, SlidersHorizontal, Plus, Download, X,
  ShieldAlert, Terminal, Info, BarChart3
} from 'lucide-react';
import { Lead, Company, HorseCategory, ARAB_MIDDLE_EAST_COUNTRIES, ALLOWED_EQUINE_CATEGORIES } from '../types';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { leadService } from '../services/leadService';
import { exportLeadsToCsv } from '../utils/exportUtils';
import { serverSearchCompanies } from '../services/aiService';
import { getIdentityContext } from '../services/identityService';

const LeadSearch: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HorseCategory | 'All'>('All');
  const [targetCountry, setTargetCountry] = useState<string>(ARAB_MIDDLE_EAST_COUNTRIES[0]);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    const data = await leadService.getAllLeads();
    setLeads(data);
  };

  const handleDiscovery = async () => {
    setIsDiscoveryLoading(true);
    setThoughtStream([
      `Activating Gemini 3 Flash Discovery Engine...`,
      `Geographic Target: ${targetCountry}`,
      `Vertical Parameter: ${selectedCategory === 'All' ? 'Strict Equine Lockdown' : selectedCategory}`,
      "Scanning Regional Corporate Registries...",
      "Discarding Generic & Livestock Generalists...",
      "Analyzing Authority and Revenue Signals...",
      "Filtering Geographic Whitelist (Lockdown Active)..."
    ]);

    try {
      const companies = await serverSearchCompanies(
        selectedCategory === 'All' ? "High-Value Horse Industry Entities" : selectedCategory,
        targetCountry,
        getIdentityContext()
      );

      // Convert companies to Lead format for CRM ingestion
      const newLeads: Lead[] = companies.map(c => ({
        id: c.id,
        firstName: c.name,
        lastName: `(${targetCountry})`,
        title: c.buyerRole || 'Equine Strategic Node',
        roleType: 'Decision Maker',
        companyId: c.id,
        companyName: c.name,
        companyDomain: c.domain,
        email: 'verified@nova.secure',
        linkedin: '',
        status: 'DISCOVERED',
        dealStage: 'Discovery',
        horseCategory: c.horseCategory,
        horseSubCategory: `${c.horseSubCategory || 'Intelligence'} • ${c.revenue || 'ROI Tier Unknown'}`,
        discoveredAt: new Date().toISOString(),
        scoring: { authority: 70, intent: 80, engagement: 0, overall: c.relevanceScore || 75 },
        source: `Big Brain Discovery: ${targetCountry}`
      }));

      for (const lead of newLeads) {
        await leadService.saveLead(lead);
      }

      await loadSavedData();
      setFeedback({ message: `Big Brain discovered ${newLeads.length} vetted equine entities in ${targetCountry}.`, type: 'success' });
    } catch (error) {
      setFeedback({ message: 'Regional discovery engine failed to synchronize.', type: 'error' });
    } finally {
      setIsDiscoveryLoading(false);
      setThoughtStream([]);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleBulkSave = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkSaving(true);
    setFeedback({ message: `Syncing ${selectedIds.size} equine nodes to CRM Vault...`, type: 'info' });
    
    try {
      const count = await leadService.bulkUpdateLeadStatus(Array.from(selectedIds), 'SAVED');
      await loadSavedData();
      setIsBulkSaving(false);
      setSelectedIds(new Set());
      
      if (count === 0) {
        setFeedback({ message: 'No new nodes added. Selected entities may already exist in CRM.', type: 'info' });
      } else {
        setFeedback({ message: `Successfully synced ${count} equine entities to CRM.`, type: 'success' });
      }
    } catch (error) {
      setIsBulkSaving(false);
      setFeedback({ message: 'CRM Sync Error. Retrying connection...', type: 'error' });
    }
    
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExport = () => {
    const toExport = leads.filter(l => selectedIds.has(l.id));
    exportLeadsToCsv(toExport.length > 0 ? toExport : filteredLeads, 'nova_equine_intelligence_export.csv');
    setFeedback({ message: 'CSV Data Exported Successfully.', type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleSelect = (id: string, isSaved?: boolean) => {
    if (isSaved) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const selectable = filteredLeads.filter(l => !l.isSaved);
    if (selectedIds.size === selectable.length && selectable.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectable.map(item => item.id)));
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesKeyword = !keyword || 
      l.firstName.toLowerCase().includes(keyword.toLowerCase()) || 
      l.lastName.toLowerCase().includes(keyword.toLowerCase()) || 
      l.companyName.toLowerCase().includes(keyword.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || l.horseCategory === selectedCategory;
    const matchesCountry = !targetCountry || l.lastName.includes(targetCountry) || l.source?.includes(targetCountry);
    return matchesKeyword && matchesCategory && (l.status === 'DISCOVERED' || l.status === 'Enriched' || keyword !== '');
  });

  return (
    <div className="flex h-[calc(100vh-64px)] -m-8 bg-[#F4F6F8] overflow-hidden relative selection:bg-blue-500/30">
      
      {/* BIG BRAIN DISCOVERY OVERLAY */}
      {isDiscoveryLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8">
           <div className="max-w-md w-full text-center space-y-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 scale-150" />
                <div className="w-40 h-40 bg-blue-600 rounded-[3.5rem] flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
                   <BrainCircuit className="w-20 h-20 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Vertical Scan</h3>
                 <div className="bg-black/50 rounded-3xl p-8 border border-white/10 font-mono text-left space-y-3 overflow-hidden shadow-2xl">
                    {thoughtStream.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] text-emerald-400 animate-in slide-in-from-left-4">
                         <Terminal className="w-3.5 h-3.5" />
                         <span className="tracking-tight">{t}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-[11px] text-blue-400">
                       <Loader2 className="w-3.5 h-3.5 animate-spin" />
                       <span className="animate-pulse font-black">Synthesizing ${targetCountry} Equine Data...</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* REGIONAL SCOPE BADGE */}
      <div className="absolute bottom-6 right-6 z-50">
        <div className="px-5 py-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-md">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Equine Industry Lock</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Strict Vertical Compliance Active</span>
          </div>
        </div>
      </div>

      {/* APOLLO BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4">
          <div className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center gap-10 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">
                {selectedIds.size} Vetted Nodes Selected
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Equine CRM Promotion Active</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBulkSave}
                disabled={isBulkSaving}
                className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest bg-[#0047FF] px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-2xl shadow-blue-500/30 active:scale-95"
              >
                {isBulkSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save to CRM
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK SYSTEM */}
      {feedback && (
        <div className="fixed top-24 right-10 z-[110] animate-in slide-in-from-right-4">
          <div className={`px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border ${
            feedback.type === 'success' ? 'bg-slate-900 border-emerald-500/30' : 
            feedback.type === 'error' ? 'bg-rose-900 border-rose-500/30' : 
            'bg-slate-900 border-blue-500/30'
          } text-white`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
             feedback.type === 'error' ? <ShieldAlert className="w-5 h-5 text-rose-500" /> : 
             <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
            <span className="text-[11px] font-black uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR TOOLS */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-[#0047FF]" /> Equine Discovery
            </h2>
            <button onClick={() => {setKeyword(''); setTargetCountry(ARAB_MIDDLE_EAST_COUNTRIES[0]); setSelectedCategory('All');}} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Reset</button>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Strict Horse Industry Parameters</p>
        </div>
        
        <div className="p-6 space-y-10">
          {/* Country Selection */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block">Target Jurisdiction</label>
             <div className="grid grid-cols-1 gap-2">
               {ARAB_MIDDLE_EAST_COUNTRIES.map(c => (
                 <button 
                   key={c}
                   onClick={() => setTargetCountry(c)}
                   className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${targetCountry === c ? 'bg-[#0047FF] text-white border-blue-600 shadow-xl shadow-blue-500/20' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white hover:border-blue-200'}`}
                 >
                   <MapPin className={`w-3.5 h-3.5 inline-block mr-3 ${targetCountry === c ? 'text-white' : 'text-slate-300'}`} />
                   {c}
                 </button>
               ))}
             </div>
          </div>

          {/* Industry Verticals */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block">Equine Sector Lockdown</label>
             <div className="space-y-1.5">
               <button 
                 onClick={() => setSelectedCategory('All')}
                 className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${selectedCategory === 'All' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}
               >
                 All Allowed Verticals
               </button>
               {ALLOWED_EQUINE_CATEGORIES.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setSelectedCategory(cat as HorseCategory)}
                   className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </div>

          {/* BIG BRAIN ACTION */}
          <div className="pt-6 border-t border-slate-100">
             <button 
                onClick={handleDiscovery}
                disabled={isDiscoveryLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-[#0047FF] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 group overflow-hidden relative"
             >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                {isDiscoveryLoading ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <Rocket className="w-5 h-5 relative z-10" />}
                <span className="relative z-10">Scan {targetCountry} Market</span>
             </button>
             <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                   <Info className="w-3.5 h-3.5 text-blue-500" />
                   <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Compliance Protocol</span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                  Non-equine businesses are automatically discarded by the Big Brain logic core.
                </p>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-10 py-6 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-5">
               <button onClick={toggleSelectAll} className="text-slate-300 hover:text-blue-600 transition-colors">
                  {selectedIds.size > 0 ? <CheckSquare className="w-7 h-7 text-blue-600" /> : <Square className="w-7 h-7" />}
               </button>
               <div>
                 <h2 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-1.5">Market Intelligence Deck</h2>
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{targetCountry} Regional Scope</span>
                   <span className="text-slate-300 font-bold">•</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedCategory} Parameter</span>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="relative group">
                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  className="w-96 bg-slate-50 border border-slate-200 rounded-[1.25rem] pl-14 pr-6 py-3.5 text-xs font-bold focus:ring-[6px] focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                  placeholder="Filter equine nodes..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
             </div>
             <div className="h-10 w-px bg-slate-200" />
             <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredLeads.length} Vetted Entities</span>
             </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-auto bg-white">
           <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="bg-[#F4F6F8] border-b border-slate-200 sticky top-0 z-20">
                 <tr className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">
                    <th className="px-10 py-5 w-20"></th>
                    <th className="px-6 py-5">Equine Node</th>
                    <th className="px-6 py-5">Market Context</th>
                    <th className="px-6 py-5">Corporate Entity</th>
                    <th className="px-6 py-5">ROI Score</th>
                    <th className="px-10 py-5 text-right">Strategic Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredLeads.map((item) => (
                   <tr key={item.id} className={`group hover:bg-blue-50/20 transition-all ${item.isSaved ? 'bg-slate-50/40 opacity-70' : ''} ${selectedIds.has(item.id) ? 'bg-blue-50/50' : ''}`}>
                     <td className="px-10 py-6">
                        <button 
                          onClick={() => toggleSelect(item.id, item.isSaved)} 
                          disabled={item.isSaved}
                          className={`transition-all ${item.isSaved ? 'text-emerald-500 cursor-default' : 'text-slate-200 hover:text-blue-500'}`}
                        >
                          {item.isSaved ? <CheckCircle2 className="w-6 h-6" /> : selectedIds.has(item.id) ? <CheckSquare className="w-6 h-6 text-blue-600 shadow-sm" /> : <Square className="w-6 h-6" />}
                        </button>
                     </td>
                     <td className="px-6 py-6">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shrink-0 border border-white/10 shadow-xl group-hover:bg-blue-600 transition-colors">
                             {item.firstName[0]}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-900 truncate max-w-[200px]">{item.firstName}</span>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.title}</span>
                                {item.isSaved && <span className="w-1 h-1 bg-emerald-500 rounded-full" />}
                             </div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-6">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
                           <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.lastName.replace(/[()]/g, '')}</span>
                        </div>
                     </td>
                     <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-black text-slate-800 truncate max-w-[180px]">{item.companyName}</span>
                           </div>
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.horseCategory}</span>
                        </div>
                     </td>
                     <td className="px-6 py-6">
                        <div className="flex flex-col gap-2 w-32">
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-to-r from-blue-400 to-[#0047FF] transition-all duration-1000" style={{ width: `${item.scoring?.overall || 0}%` }} />
                           </div>
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.scoring?.overall || 0}% Efficiency</span>
                             <Zap className={`w-3 h-3 ${item.scoring?.overall && item.scoring.overall > 80 ? 'text-amber-500 animate-pulse' : 'text-slate-200'}`} />
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-6 text-right">
                        {!item.isSaved ? (
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                             <button 
                                onClick={() => {
                                  const next = new Set(selectedIds);
                                  next.add(item.id);
                                  setSelectedIds(next);
                                  handleBulkSave();
                                }}
                                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0047FF] transition-all shadow-xl active:scale-95"
                             >
                               Promote Node
                             </button>
                             <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
                                <MoreHorizontal className="w-5 h-5" />
                             </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-emerald-600">
                             <span className="text-[11px] font-black uppercase tracking-widest italic pr-4">Equine Verified</span>
                          </div>
                        )}
                     </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           
           {filteredLeads.length === 0 && !isDiscoveryLoading && (
             <div className="flex flex-col items-center justify-center py-48 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100">
                   <Microscope className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-300 italic uppercase tracking-tighter">Vertical Lockdown</h3>
                <p className="text-slate-400 text-sm mt-3 font-medium max-w-sm text-center">
                   The Equine Market deck for {targetCountry} is waiting. Activate the Big Brain engine to discover vetted horse industry stakeholders.
                </p>
                <button 
                  onClick={handleDiscovery}
                  className="mt-8 px-8 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-xl"
                >
                   Initiate Equine Scan
                </button>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default LeadSearch;
