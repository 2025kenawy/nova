
import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, Loader2, Globe, BrainCircuit, 
  Sparkles, Activity, Users, Award, Rocket, ChevronDown, Filter, Target,
  Zap, Crown, Microscope, CheckSquare, Square,
  MapPin, Building2, ExternalLink, Mail, MoreHorizontal,
  Linkedin, Twitter, Facebook, Instagram, Check, Save, CheckCircle2
} from 'lucide-react';
import { Lead, Company, HorseCategory } from '../types';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { leadService } from '../services/leadService';

const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-slate-400 px-0.5">
      <span>{label}</span>
      <span>{score}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${score}%` }} />
    </div>
  </div>
);

const LeadSearch: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HorseCategory | 'All'>('All');

  const horseCategories: { name: HorseCategory; icon: any }[] = [
    { name: 'Core Operations', icon: Target },
    { name: 'Gov & Elite', icon: Crown },
    { name: 'Health & Performance', icon: Microscope },
    { name: 'Supply & Trade', icon: Zap },
    { name: 'Services', icon: Activity },
    { name: 'Competition', icon: Award },
    { name: 'Media & Influence', icon: Users },
  ];

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    const data = await leadService.getAllLeads();
    setLeads(data);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    novaOrchestrator.recalibrateIntelligence().then(() => {
      loadSavedData();
      setIsRefreshing(false);
      setFeedback({ message: 'Market intelligence recalibrated.', type: 'info' });
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const handleBulkSave = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkSaving(true);
    const count = await leadService.bulkUpdateLeadStatus(Array.from(selectedIds), 'SAVED');
    
    await loadSavedData();
    setIsBulkSaving(false);
    setSelectedIds(new Set());
    setFeedback({ message: `${count} leads successfully saved to CRM.`, type: 'success' });
    setTimeout(() => setFeedback(null), 4000);
  };

  const toggleSelect = (id: string, isSaved?: boolean) => {
    if (isSaved) return; // Prevent selection of already saved leads if desired, or allow re-saving
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
    
    return matchesKeyword && matchesCategory;
  });

  const formatUrl = (url: string): string => {
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] -m-6 md:-m-8 bg-white overflow-hidden border-t border-slate-200 relative">
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 bg-white">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Market Filters
              </h2>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-tight flex items-center gap-2">
                   <MapPin className="w-3.5 h-3.5" /> Filter by Name/Company
                 </label>
                 <input 
                   type="text" 
                   className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                   placeholder="Type to filter..."
                   value={keyword}
                   onChange={(e) => setKeyword(e.target.value)}
                 />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-tight flex items-center gap-2">
                   <Target className="w-3.5 h-3.5" /> Sector Depth
                 </label>
                 <div className="space-y-1">
                   <button 
                     onClick={() => setSelectedCategory('All')}
                     className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-3 transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                   >
                     <Globe className="w-4 h-4" /> All Horse Industry
                   </button>
                   {horseCategories.map(cat => (
                     <button 
                       key={cat.name}
                       onClick={() => setSelectedCategory(cat.name)}
                       className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-3 transition-all ${selectedCategory === cat.name ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                     >
                       <cat.icon className="w-4 h-4" /> {cat.name}
                     </button>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {selectedIds.size} Selected
              </span>
              <div className="w-px h-4 bg-white/10" />
              <button 
                onClick={handleBulkSave}
                disabled={isBulkSaving}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {isBulkSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save Selected to CRM
              </button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div className="absolute top-6 right-10 z-40 animate-in fade-in slide-in-from-right-4">
            <div className={`px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
              {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">{feedback.message}</span>
            </div>
          </div>
        )}

        <div className="px-10 py-8 border-b border-slate-200 flex flex-col gap-8 bg-white shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                 Discovered Intelligence
               </h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Showing {filteredLeads.length} of {leads.length} precomputed leads
               </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="px-8 py-3 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
              >
                 {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                 Force Scan
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
           <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-200 shadow-sm">
                 <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em]">
                    <th className="px-6 py-5 w-16 text-center">
                      <button onClick={toggleSelectAll} className="text-slate-300 hover:text-indigo-600 transition-colors">
                        {selectedIds.size > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                      </button>
                    </th>
                    <th className="px-8 py-5 w-[30%]">Decision Maker</th>
                    <th className="px-8 py-5 w-[20%]">Organization</th>
                    <th className="px-8 py-5 w-[25%]">Big Brain Priority</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredLeads.map((item) => (
                   <tr key={item.id} className={`group hover:bg-slate-50/80 transition-all ${item.isSaved ? 'opacity-80' : ''}`}>
                     <td className="px-6 py-8 text-center">
                        <button 
                          onClick={() => toggleSelect(item.id, item.isSaved)} 
                          className={`transition-colors ${item.isSaved ? 'text-emerald-500 cursor-default' : 'text-slate-300'}`}
                        >
                          {item.isSaved ? <CheckCircle2 className="w-5 h-5" /> : selectedIds.has(item.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                        </button>
                     </td>
                     
                     <td className="px-8 py-8">
                        <div className="flex items-center gap-5">
                           <div className={`w-12 h-12 ${item.isSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'} rounded-2xl flex items-center justify-center font-black text-lg shadow-sm shrink-0 uppercase`}>
                             {item.firstName[0]}
                           </div>
                           <div className="min-w-0 flex items-center gap-4">
                              <div className="min-w-0">
                                <span className={`font-black text-base leading-none block mb-1.5 truncate group-hover:text-indigo-600 transition-colors ${item.isSaved ? 'text-slate-500' : 'text-slate-900'}`}>
                                  {item.firstName} {item.lastName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate block">
                                  {item.title}
                                </span>
                              </div>
                           </div>
                        </div>
                     </td>

                     <td className="px-8 py-8">
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                             <Building2 className="w-3 h-3 text-slate-400" /> {item.companyName}
                           </span>
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded w-fit border border-indigo-100">
                               {item.horseCategory}
                             </span>
                             {item.isSaved && (
                               <span className="text-[7px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                 Saved
                               </span>
                             )}
                           </div>
                        </div>
                     </td>

                     <td className="px-8 py-8">
                        <div className="w-full max-w-[180px]">
                           <ScoreBar 
                             label="Strategic Value" 
                             score={item.scoring?.overall || 0} 
                             color={item.isSaved ? "bg-emerald-500" : "bg-indigo-600"} 
                           />
                        </div>
                     </td>

                     <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                           {item.companyDomain && (
                             <a 
                               href={formatUrl(item.companyDomain)} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400"
                             >
                               <Globe className="w-4 h-4" />
                             </a>
                           )}
                           <button className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </main>
    </div>
  );
};

export default LeadSearch;
