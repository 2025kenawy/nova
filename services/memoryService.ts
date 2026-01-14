
import supabase from '../lib/supabase';
import { MemoryEntry, MemoryCategory } from '../types';

let localMemory: MemoryEntry[] = [];
const DECAY_DAYS = 90;

async function safeDbCall<T>(call: () => Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> {
  try {
    const { data, error } = await call();
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export const saveMemory = async (memory: Omit<MemoryEntry, 'id' | 'timestamp'>) => {
  const entry = {
    entityId: memory.entityId,
    type: memory.type,
    category: memory.category || 'SYSTEM',
    content: memory.content,
    metadata: memory.metadata,
    timestamp: new Date().toISOString()
  };

  const fallbackEntry = { 
    ...entry, 
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
  } as MemoryEntry;
  localMemory.push(fallbackEntry);

  return safeDbCall(
    () => supabase.from('memories').insert([entry]).select().single(),
    fallbackEntry
  );
};

export const getMemoriesForEntity = async (entityId: string): Promise<MemoryEntry[]> => {
  return safeDbCall(
    () => supabase.from('memories').select('*').eq('entityId', entityId).order('timestamp', { ascending: true }),
    localMemory.filter(m => m.entityId === entityId)
  );
};

/**
 * Returns a high-density context summary.
 * Filters out noise (decay) but preserves permanent signals (Trust, Culture).
 */
export const getMemoryContext = async (entityId: string): Promise<string> => {
  const memories = await getMemoriesForEntity(entityId);
  if (memories.length === 0) return "Fresh relationship. No historical context available.";
  
  const now = new Date();
  
  const filtered = memories.filter(m => {
    // Preserve permanent signals
    if (m.category === 'TRUST_SIGNAL' || m.category === 'CULTURAL_NOTE' || m.category === 'BUYING_CYCLE') return true;
    
    // Decay engagement noise
    const diff = Math.ceil(Math.abs(now.getTime() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60 * 24));
    return diff <= DECAY_DAYS;
  });

  if (filtered.length === 0) return "Historical data is outdated. Re-initiating discovery signals.";

  return filtered
    .map(m => `[${new Date(m.timestamp).toLocaleDateString()}] ${m.category}: ${m.content}`)
    .join('\n');
};

export const getAllMemories = async (): Promise<MemoryEntry[]> => {
  const fallback = [...localMemory].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return safeDbCall(
    () => supabase.from('memories').select('*').order('timestamp', { ascending: false }).limit(100),
    fallback
  );
};
