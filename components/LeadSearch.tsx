
import React, { useState } from 'react';
import { 
  Search as SearchIcon, Loader2, Globe, BrainCircuit, 
  Sparkles, Activity, Users, Award, Rocket, ChevronDown, Filter, Target,
  Zap, Crown, Microscope, CheckSquare, Square,
  MapPin, Building2, ExternalLink, Mail, MoreHorizontal,
  Linkedin, Twitter, Facebook, Instagram
} from 'lucide-react';
import { Lead, Company, HorseCategory } from '../types';
import { novaOrchestrator } from '../services/novaOrchestrator';

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
  const [step, setStep] = useState<'companies' | 'people'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isQualifying, setIsQualifying] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState<string | null>(null);
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

  const isValidEmail = (email: string | undefined): boolean => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isPlaceholder = email.includes('nova.secure') || email.includes('secure.node') || email.includes('Contact Via');
    return emailRegex.test(email) && !isPlaceholder;
  };

  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    if (url === 'TBD' || url === 'N/A' || url.length < 4) return false;
    return url.includes('.');
  };

  const formatUrl = (url: string): string => {
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    // Don't clear results, show last known results while refreshing
    setStep('companies');
    
    console.log('[LeadSearch] Refreshing Intelligence via Orchestrator...');
    const results = await novaOrchestrator.runMarketScan(keyword, location || 'Global Equine Market');
    console.log('[LeadSearch] Results received from Orchestrator:', results);
    
    setCompanies(results);
    setIsSearching(false);
  };

  const handleQualify = async (company: Company) => {
    setIsQualifying(company.id);
    const intel = await novaOrchestrator.qualifyCompany(company);
    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, ...intel } : c));
    setIsQualifying(null);
  };

  const handleViewPeople = async (company: Company) => {
    const results = await novaOrchestrator.findDecisionMakers(company);
    setLeads(results);
    setStep('people');
    setSelectedIds(new Set());
  };

  const handleAnalyzeLead = async (lead: Lead) => {
    setIsEnriching(lead.id);
    const result = await novaOrchestrator.analyzeLeadPriority(lead);
    if (result) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { 
        ...l, 
        status: result.status,
        dealStage: result.dealStage,
        scoring: result.scoring,
        twitter: result.social?.twitter || l.twitter,
        facebook: result.social?.facebook || l.facebook,
        instagram: result.social?.instagram || l.instagram
      } : l));
    }
    setIsEnriching(null);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const currentItems = step === 'companies' ? filteredCompanies : leads;
    if (selectedIds.size === currentItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentItems.map(item => item.id)));
    }
  };

  // Temporarily disable strict sector filtering to verify all raw results flow through
  const filteredCompanies = companies;

  return (
    <div className="flex h-[calc(100vh-140px)] -m-6 md:-m-8 bg-white overflow-hidden border-t border-slate-200">
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
                   <MapPin className="w-3.5 h-3.5" /> Region
                 </label>
                 <select 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                 >
                    <option value="">Global Equine Market</option>
                    <option value="UAE">UAE / Dubai</option>
                    <option value="Saudi Arabia">Saudi Arabia (NEOM/Riyadh)</option>
                    <option value="Qatar">Qatar / Doha</option>
                    <option value="Poland">Poland / Janów Podlaski</option>
                 </select>
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

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="px-10 py-8 border-b border-slate-200 flex flex-col gap-8 bg-white shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               {step === 'people' && (
                 <button onClick={() => setStep('companies')} className="p-3 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-200 transition-all"><ChevronDown className="w-5 h-5 rotate-90" /></button>
               )}
               <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                    {step === 'companies' ? 'Equine Market Prospecting' : 'Decision Maker Audit'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {step === 'companies' ? `${companies.length} entities found` : `${leads.length} contacts found`}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSearch} 
                disabled={isSearching && companies.length === 0}
                className="px-8 py-3 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3"
              >
                 {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                 Refresh Intelligence
              </button>
            </div>
          </div>

          <div className="relative group">
             <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
             <input 
               type="text" 
               placeholder="Search Stables, Breeding Farms, or Horse Suppliers..." 
               className="w-full pl-14 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
               value={keyword}
               onChange={(e) => setKeyword(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
           {isSearching && companies.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
               <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
               <p className="text-[10px] font-black uppercase tracking-widest">Nova Intelligence Refreshing...</p>
             </div>
           ) : (
           <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-200 shadow-sm">
                 <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em]">
                    <th className="px-6 py-5 w-16 text-center">
                      <button onClick={toggleSelectAll} className="text-slate-300 hover:text-indigo-600 transition-colors">
                        {selectedIds.size > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                      </button>
                    </th>
                    <th className="px-8 py-5 w-[30%]">{step === 'companies' ? 'Entity / Name' : 'Decision Maker'}</th>
                    <th className="px-8 py-5 w-[20%]">Sector Alignment</th>
                    <th className="px-8 py-5 w-[25%]">Nova Market Intel</th>
                    <th className="px-8 py-5 text-right">Strategic Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {(step === 'companies' ? filteredCompanies : leads).map((item: any) => (
                   <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                     <td className="px-6 py-8 text-center">
                        <button onClick={() => toggleSelect(item.id)} className="text-slate-300">
                          {selectedIds.has(item.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                        </button>
                     </td>
                     
                     <td className="px-8 py-8">
                        <div className="flex items-center gap-5">
                           <div className={`w-12 h-12 ${step === 'companies' ? 'bg-slate-900' : 'bg-indigo-100 text-indigo-700'} rounded-2xl flex items-center justify-center font-black text-lg shadow-sm shrink-0 uppercase`}>
                             {step === 'companies' ? item.name[0] : item.firstName[0]}
                           </div>
                           <div className="min-w-0 flex items-center gap-4">
                              <div className="min-w-0">
                                <span className="font-black text-slate-900 text-base leading-none block mb-1.5 truncate group-hover:text-indigo-600 transition-colors">
                                  {step === 'companies' ? item.name : `${item.firstName} ${item.lastName}`}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate block">
                                  {step === 'companies' ? item.domain : item.title}
                                </span>
                              </div>
                              {/* Social Intelligence Stack */}
                              <div className="flex flex-col gap-1 items-center shrink-0 border-l border-slate-100 pl-3">
                                {isValidUrl(item.linkedin) && (
                                  <a href={formatUrl(item.linkedin)} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-100 rounded-lg transition-all" title="LinkedIn Profile">
                                    <Linkedin className="w-3.5 h-3.5 text-slate-400 hover:text-[#0077B5]" />
                                  </a>
                                )}
                                {step === 'people' && isValidUrl(item.twitter) && (
                                  <a href={formatUrl(item.twitter)} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-sky-50 rounded-lg transition-all" title="Twitter Profile">
                                    <Twitter className="w-3.5 h-3.5 text-slate-400 hover:text-[#1DA1F2]" />
                                  </a>
                                )}
                                {step === 'people' && isValidUrl(item.facebook) && (
                                  <a href={formatUrl(item.facebook)} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-blue-50 rounded-lg transition-all" title="Facebook Profile">
                                    <Facebook className="w-3.5 h-3.5 text-slate-400 hover:text-[#1877F2]" />
                                  </a>
                                )}
                                {step === 'people' && isValidUrl(item.instagram) && (
                                  <a href={formatUrl(item.instagram)} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-pink-50 rounded-lg transition-all" title="Instagram Profile">
                                    <Instagram className="w-3.5 h-3.5 text-slate-400 hover:text-[#E4405F]" />
                                  </a>
                                )}
                              </div>
                           </div>
                        </div>
                     </td>

                     <td className="px-8 py-8">
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                             <Building2 className="w-3 h-3 text-slate-400" /> {step === 'companies' ? item.horseCategory : item.companyName}
                           </span>
                           <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded w-fit border border-indigo-100">
                             {step === 'companies' ? item.horseSubCategory : 'Decision Maker'}
                           </span>
                        </div>
                     </td>

                     <td className="px-8 py-8">
                        <div className="w-full max-w-[180px]">
                           <ScoreBar 
                             label={step === 'companies' ? "Market Fit" : "Sales Priority"} 
                             score={step === 'companies' ? item.relevanceScore : (item.scoring?.overall || 0)} 
                             color={step === 'companies' ? "bg-emerald-500" : "bg-indigo-600"} 
                           />
                           {step === 'companies' && item.qualificationStatus === 'qualified' && (
                             <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-1">
                               <Sparkles className="w-2.5 h-2.5" /> Verified High Capacity
                             </p>
                           )}
                           {step === 'people' && item.status === 'Enriched' && (
                             <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mt-2 flex items-center gap-1">
                               <Sparkles className="w-2.5 h-2.5" /> Social Intel Verified
                             </p>
                           )}
                        </div>
                     </td>

                     <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                           {step === 'companies' ? (
                             <>
                               {isValidUrl(item.domain) && (
                                 <a 
                                   href={formatUrl(item.domain)} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 group/link"
                                   title="Visit Website"
                                 >
                                   <Globe className="w-4 h-4 group-hover/link:text-indigo-500 transition-colors" />
                                 </a>
                               )}
                               {item.qualificationStatus === 'qualified' ? (
                                 <button 
                                   onClick={() => handleViewPeople(item)} 
                                   className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
                                 >
                                   <Users className="w-4 h-4" /> Personnel
                                 </button>
                               ) : (
                                 <button 
                                   onClick={() => handleQualify(item)} 
                                   className="px-6 py-2.5 bg-white text-indigo-600 border border-indigo-200 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"
                                 >
                                    {isQualifying === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Audit
                                 </button>
                               )}
                             </>
                           ) : (
                             <>
                               {isValidEmail(item.email) && (
                                 <a 
                                   href={`mailto:${item.email}`}
                                   className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 group/link"
                                   title={`Email ${item.firstName}`}
                                 >
                                   <Mail className="w-4 h-4 group-hover/link:text-indigo-500 transition-colors" />
                                 </a>
                               )}
                               <button 
                                 onClick={() => handleAnalyzeLead(item)} 
                                 className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                               >
                                  {isEnriching === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                                  Enrich
                               </button>
                             </>
                           )}
                           <button className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
                 {(!isSearching && (step === 'companies' ? filteredCompanies : leads).length === 0) && (
                   <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-40">
                          <Target className="w-16 h-16 text-slate-300" />
                          <div>
                            <p className="text-xl font-black text-slate-900 tracking-tight">Recommendation Message</p>
                            <p className="text-sm font-medium text-slate-400 mt-2">No intelligence yet. Recommend running a market scan.</p>
                          </div>
                        </div>
                      </td>
                   </tr>
                 )}
              </tbody>
           </table>
           )}
        </div>
      </main>
    </div>
  );
};

export default LeadSearch;
