
import React, { useState, useEffect } from 'react';
import { 
  Users, Loader2, Search, Filter, Mail, Phone, 
  Linkedin, ExternalLink, Globe, MoreHorizontal,
  ChevronRight, Thermometer, Calendar, Target,
  Star, MessageSquare, MessageCircle
} from 'lucide-react';
import { Lead, RelationshipTemperature } from '../types';
import { leadService } from '../services/leadService';

interface CrmListProps {
  onSelectLead: (id: string) => void;
}

const CrmList: React.FC<CrmListProps> = ({ onSelectLead }) => {
  const [contacts, setContacts] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    const data = await leadService.getCrmContacts();
    setContacts(data);
    setIsLoading(false);
  };

  const getTemperatureColor = (temp?: RelationshipTemperature) => {
    switch (temp) {
      case 'Hot': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Warm': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startWhatsApp = (e: React.MouseEvent, whatsapp?: string) => {
    e.stopPropagation();
    if (!whatsapp) return;
    const sanitized = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${sanitized}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-xl">
              <Star className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Sovereign CRM</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-16">
            {contacts.length} Strategic Relationships • Pre-vetted
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Filter CRM Contacts..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Accessing CRM Vault...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
          <Target className="w-16 h-16 text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-900">No Intentional Contacts</h3>
          <p className="text-slate-400 text-sm font-medium mt-2 max-w-sm text-center">
            Your CRM is empty. Save discovered leads from the Intelligence Inbox to build your strategic network.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => onSelectLead(contact.id)}
              className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                    {contact.firstName[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{contact.firstName} {contact.lastName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{contact.title}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getTemperatureColor(contact.temperature)}`}>
                  {contact.temperature}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold text-slate-600 truncate">{contact.companyName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Added {new Date(contact.discoveredAt || '').toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                <button className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                  View Dossier <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  {contact.whatsapp && (
                    <button 
                      onClick={(e) => startWhatsApp(e, contact.whatsapp)}
                      className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
                      title="Start WhatsApp Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                  <div className="p-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:text-indigo-600 hover:bg-white transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:text-[#0077B5] hover:bg-white transition-all">
                    <Linkedin className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrmList;
