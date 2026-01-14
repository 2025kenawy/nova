
import React from 'react';
import { 
  Award, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Target, 
  Zap, 
  Users,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { WALID_IDENTITY } from '../services/identityService';

const ExpoLanding: React.FC = () => {
  const categories = [
    { name: 'Core Operations', desc: 'Stables, Farms & Breeding Facilities', icon: Target },
    { name: 'Health & Performance', desc: 'Vets, Nutrition & Performance Analysis', icon: ShieldCheck },
    { name: 'Supply & Trade', desc: 'Equipment, Tack & Premium Supplies', icon: Zap },
    { name: 'Services', desc: 'Logistics, Construction & Care Systems', icon: Building2 },
  ];

  return (
    <div className="min-h-full bg-white flex flex-col animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative px-6 py-20 bg-slate-950 text-white overflow-hidden rounded-[3rem] mb-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Award className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Nova Intelligence</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-6 leading-[0.9]">
            Arab Market <br/>
            <span className="text-indigo-500">Equine Dominance</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md mb-10">
            Strategic network building and intelligence-led growth for the GCC equestrian sector. We bridge high-value suppliers with elite Arab market stakeholders.
          </p>
          <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl w-fit">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">Dubai International Horse Fair 2024</span>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 py-12 mb-12">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10 px-4">Market Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-600 transition-all">
                <cat.icon className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">{cat.name}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Profile / Contact Section */}
      <section className="bg-slate-50 rounded-[3rem] p-10 md:p-16 mb-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 bg-slate-900 rounded-[3rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shrink-0">
            {WALID_IDENTITY.fullName[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{WALID_IDENTITY.fullName}</h2>
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-6">Director • {WALID_IDENTITY.companyName}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto md:mx-0">
              <a href={`mailto:${WALID_IDENTITY.email}`} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all group">
                <Mail className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">{WALID_IDENTITY.email}</span>
              </a>
              <a href={`tel:${WALID_IDENTITY.phone}`} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all group">
                <Phone className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">{WALID_IDENTITY.phone}</span>
              </a>
              <a href={WALID_IDENTITY.website} target="_blank" className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all group sm:col-span-2">
                <Globe className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">{WALID_IDENTITY.website}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Meta */}
      <footer className="mt-auto py-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">N</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">NOVA | Sovereign Intel Instance</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Walid Encrypted Pipeline</span>
        </div>
      </footer>
    </div>
  );
};

export default ExpoLanding;
