
import React from 'react';
import { Search, Bell, ExternalLink, RotateCcw, ShieldCheck } from 'lucide-react';
import { WALID_IDENTITY } from '../services/identityService';

interface HeaderProps {
    onResetKey?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onResetKey }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Query Market Intelligence..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
        />
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nova Secure</span>
        </div>
        
        <button 
            onClick={onResetKey}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group"
            title="Update API Key"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        </button>

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 border-2 border-white rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        
        <a 
          href={WALID_IDENTITY.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-all group"
          title="Visit Nobel Spirit Labs"
        >
          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs group-hover:bg-indigo-600 transition-colors">
            {WALID_IDENTITY.fullName[0]}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-none mb-1 flex items-center gap-1">
              {WALID_IDENTITY.fullName}
              <ExternalLink className="w-2.5 h-2.5 text-slate-300 group-hover:text-indigo-400" />
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{WALID_IDENTITY.companyName}</p>
          </div>
        </a>
      </div>
    </header>
  );
};

export default Header;
