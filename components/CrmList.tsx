
import React, { useState, useEffect } from 'react';
import { 
  Users, Loader2, Search, Filter, Mail, Phone, 
  Linkedin, ExternalLink, Globe, MoreHorizontal,
  ChevronRight, Thermometer, Calendar, Target,
  Star, MessageSquare, MessageCircle, Square, CheckSquare,
  Trash2, Download, Check, CheckCircle2, MapPin
} from 'lucide-react';
import { Lead, RelationshipTemperature } from '../types';
import { leadService } from '../services/leadService';
import { exportLeadsToCsv } from '../utils/exportUtils';
import { serverGetMapsDirections } from '../services/aiService';

interface CrmListProps {
  onSelectLead: (id: string) => void;
}

const CrmList: React.FC<CrmListProps> = ({ onSelectLead }) => {
  const [contacts, setContacts] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [mappingId, setMappingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    const data = await leadService.getCrmContacts();
    setContacts(data);
    setIsLoading(false);
  };

  const handleGetDirections = async (e: React.MouseEvent, contact: Lead) => {
    e.stopPropagation();
    setMappingId(contact.id);
    
    const country = contact.lastName.replace(/[()]/g, '');
    const company = contact.companyName;

    const navigateToMap = (lat?: number, lng?: number) => {
      serverGetMapsDirections(company, country, lat, lng).then(url => {
        window.open(url, '_blank');
        setMappingId(null);
      }).catch(() => {
        const fallback = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${company}, ${country}`)}`;
        window.open(fallback, '_blank');
        setMappingId(null);
      });
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => navigateToMap(pos.coords.latitude, pos.coords.longitude),
        () => navigateToMap()
      );
    } else {
      navigateToMap();
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove ${selectedIds.size} contacts from CRM?`)) return;
    setIsBulkOperating(true);
    const idsToRemove: string[] = Array.from(selectedIds);
    await leadService.bulkRemoveFromCrm(idsToRemove);
    setContacts(prev => prev.filter(c => !selectedIds.has(c.id)));
    setFeedback(`Successfully removed ${selectedIds.size} contacts.`);
    setSelectedIds(new Set());
    setIsBulkOperating(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExport = () => {
    const toExport = contacts.filter(c => selectedIds.has(c.id));
    exportLeadsToCsv(toExport.length > 0 ? toExport : filteredContacts, 'crm_contacts_export.csv');
    setFeedback('CRM Data Exported.');
    setTimeout(() => setFeedback(null), 3000);
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
    <div className="flex flex-col h-full gap-8 animate-in fade-in duration-500 relative">
      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {selectedIds.size} Contacts Selected
              </span>
              <span className="text-[8px] font-bold text-slate-400">Manage bulk relationships</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkDelete}
                disabled={isBulkOperating}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-red-600/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
              >
                {isBulkOperating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete Selected
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed top-24 right-10 z-[110] animate-in slide-in-from-right-4">
          <div className="px-6 py-3 rounded-2xl shadow-2xl bg-slate-900 text-white border border-white/10 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">{feedback}</span>
          </div>
        </div>
      )}

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
          {contacts.length > 0 && (
            <button 
              onClick={toggleSelectAll}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white transition-all flex items-center gap-2"
            >
              {selectedIds.size === filteredContacts.length ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
              {selectedIds.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
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
              className={`bg-white border rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative ${selectedIds.has(contact.id) ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-slate-200'}`}
            >
              <button 
                onClick={(e) => toggleSelect(e, contact.id)}
                className={`absolute top-6 left-6 z-10 p-1 rounded-lg transition-colors ${selectedIds.has(contact.id) ? 'text-indigo-600' : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-indigo-400'}`}
              >
                {selectedIds.has(contact.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>

              <div className="flex items-start justify-between mb-6 pl-10">
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
                  <button 
                    onClick={(e) => handleGetDirections(e, contact)}
                    className={`p-3 border rounded-xl shadow-sm transition-all ${mappingId === contact.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'}`}
                    title="Get Directions"
                  >
                    {mappingId === contact.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  </button>
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
