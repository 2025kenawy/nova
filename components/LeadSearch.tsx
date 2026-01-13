
import React, { useState } from 'react';
import { 
  Search as SearchIcon, Loader2, Globe, History, BrainCircuit, ShieldCheck, 
  Sparkles, Activity, Users, Award, Rocket, ChevronDown, Filter, Target,
  Zap, Crown, Microscope, Linkedin, Mail, ExternalLink
} from 'lucide-react';
import { Lead, Company, MemoryEntry, HorseCategory } from '../types';
import { novaClient } from '../services/novaClient';
import { getMemoriesForEntity } from '../services/memoryService';

const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">
      <span>{label}</span>
      <span>{score}%</span>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${score}%` }} />
    </div>
  </div>
);

const LeadSearch: React.FC = () => {
  const [step, setStep] = useState<'companies' | 'people'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isQualifying, setIsQualifying] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HorseCategory | 'All'>('All');
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [entityMemories, setEntityMemories] = useState<MemoryEntry[]>([]);

  const horseCategories: { name: HorseCategory; icon: any }[] = [
    { name: 'Core Operations', icon: Target },
    { name: 'Gov & Elite', icon: Crown },
    { name: 'Health & Performance', icon: Microscope },
    { name: 'Supply & Trade', icon: Zap },
    { name: 'Services', icon: Activity },
    { name: 'Competition', icon: Award },
    { name: 'Media & Influence', icon: Users },
  ];

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setStep('companies');
    const results = await novaClient.discoverCompanies(keyword, location || 'Middle East');
    setCompanies(results);
    setIsSearching(false);
  };

  const handleQualify = async (company: Company) => {
    setIsQualifying(company.id);
    const intel = await novaClient.qualifyCompany(company);
    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, ...intel, qualificationStatus: 'qualified' } : c));
    setIsQualifying(null);
  };

  const handleViewPeople = async (company: Company) => {
    const results = await novaClient.findDecisionMakers(company);
    setLeads(results);
    setStep('people');
  };

  const handleAnalyzeLead = async (lead: Lead) => {
    setIsEnriching(lead.id);
    const decision = await novaClient.analyzeLeadPriority(lead);
    if (decision) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { 
        ...l, 
        status: 'Enriched',
        dealStage: decision.dealStage,
        scoring: {
           authority: decision.horseAuthorityScore,
           intent: decision.horseIntentScore,
           engagement: decision.horseEngagementScore,
           overall: decision.priorityScore
        }
      } : l));
    }
    setIsEnriching(null);
  };

  const filteredCompanies = selectedCategory === 'All' 
    ? companies 
    : companies.filter(c => c.horseCategory === selectedCategory);

  const formatUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div className="flex h-[calc(100vh-120px)] -m-6 md:-m-8 bg-white">
      {/* Search Sidebar */}
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Market Filters</h2>
              <Filter className="w-4 h-4 text-slate-300" />
           </div>
           
           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-tight">Geographic Focus</label>
                 <select 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/10"
                 >
                    <option value="">Middle East Region</option>
                    <option value="UAE">UAE</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Oman">Oman</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Morocco">Morocco</option>
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-tight">Ecosystem Map</label>
                 {horseCategories.map(cat => (
                   <button 
                     key={cat.name}
                     onClick={() => setSelectedCategory(cat.name)}
                     className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${selectedCategory === cat.name ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                   >
                     <cat.icon className="w-4 h-4" /> {cat.name}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-8 border-b border-slate-200 flex gap-4">
          <div className="flex-1 relative">
             <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
             <input 
               type="text" 
               placeholder="Find Endurance Stables, Vet Clinics, Royal Operations..." 
               className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
               value={keyword}
               onChange={(e) => setKeyword(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             />
          </div>
          <button onClick={handleSearch} className="px-12 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-3">
             {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
             Audit
          </button>
        </div>

        <div className="flex-1 overflow-auto px-8 py-4">
           <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                 <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                    <th className="px-6 py-2">Equestrian Entity</th>
                    <th className="px-6 py-2">Classification & Role</th>
                    <th className="px-6 py-2 text-right">Market Action</th>
                 </tr>
              </thead>
              <tbody>
                 {step === 'companies' ? filteredCompanies.map(c => (
                   <tr key={c.id} className="group bg-white border border-slate-100 hover:shadow-xl transition-all">
                     <td className="px-6 py-8 rounded-l-2xl border-l border-y border-slate-100">
                        <div className="flex items-start gap-5">
                           <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-xl shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {c.name[0]}
                           </div>
                           <div>
                              <div className="flex items-center gap-3">
                                 <span className="font-black text-slate-900 text-lg leading-none">{c.name}</span>
                                 <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{c.location}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <a 
                                  href={formatUrl(c.domain)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-indigo-500 font-black uppercase tracking-widest hover:text-indigo-700 flex items-center gap-1 transition-colors"
                                >
                                  {c.domain} <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                                {c.linkedin && (
                                  <a 
                                    href={formatUrl(c.linkedin)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-1 text-slate-400 hover:text-[#0077b5] transition-colors"
                                  >
                                    <Linkedin className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-8 border-y border-slate-100">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.horseCategory}</span>
                              <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
                              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{c.horseSubCategory}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${c.buyerRole === 'Buyer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {c.buyerRole}
                              </span>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-8 text-right rounded-r-2xl border-r border-y border-slate-100">
                        {c.qualificationStatus === 'qualified' ? (
                          <button onClick={() => handleViewPeople(c)} className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-3 ml-auto">
                             <Users className="w-4 h-4" /> Decision Makers
                          </button>
                        ) : (
                          <button onClick={() => handleQualify(c)} className="px-8 py-4 bg-white text-indigo-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-2 ml-auto">
                             {isQualifying === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                             Qualify
                          </button>
                        )}
                     </td>
                   </tr>
                 )) : leads.map(l => (
                   <tr key={l.id} className="bg-white border border-slate-100 hover:shadow-xl transition-all">
                     <td className="px-6 py-6 rounded-l-2xl border-l border-y border-slate-100">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                              {l.firstName[0]}{l.lastName[0]}
                           </div>
                           <div>
                              <p className="font-black text-slate-900 leading-none">{l.firstName} {l.lastName}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{l.title}</p>
                                <div className="flex items-center gap-1.5 ml-1 border-l border-slate-200 pl-2">
                                   {l.linkedin && (
                                     <a 
                                       href={formatUrl(l.linkedin)} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="text-[#0077b5] hover:opacity-70 transition-all"
                                       title="LinkedIn Profile"
                                     >
                                       <Linkedin className="w-3.5 h-3.5" />
                                     </a>
                                   )}
                                   {l.email && l.email !== 'Contact Via Nova' && (
                                     <a 
                                       href={`mailto:${l.email}`}
                                       className="text-indigo-600 hover:opacity-70 transition-all"
                                       title={`Compose to ${l.email}`}
                                     >
                                       <Mail className="w-3.5 h-3.5" />
                                     </a>
                                   )}
                                </div>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-6 border-y border-slate-100">
                        <div className="grid grid-cols-2 gap-4 max-w-xs">
                           <ScoreBar label="Authority" score={(l as any).scoring?.authority || 0} color="bg-indigo-600" />
                           <ScoreBar label="Intent" score={(l as any).scoring?.intent || 0} color="bg-emerald-500" />
                        </div>
                     </td>
                     <td className="px-6 py-6 text-right rounded-r-2xl border-r border-y border-slate-100">
                        <div className="flex justify-end gap-3">
                           <button onClick={() => handleAnalyzeLead(l)} className="px-8 py-4 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                              {isEnriching === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                              Enrich
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
