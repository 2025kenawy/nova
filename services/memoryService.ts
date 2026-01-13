
import supabase from '../lib/supabase';
import { MemoryEntry } from '../types';

export const saveMemory = async (memory: Omit<MemoryEntry, 'id' | 'timestamp'>) => {
  const entry: MemoryEntry = {
    ...memory,
    id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  await supabase.from('memories').insert(entry);
  return entry;
};

export const getMemoriesForEntity = async (entityId: string): Promise<MemoryEntry[]> => {
  const { data } = await supabase.from('memories').select().eq('entityId', entityId);
  return (data as MemoryEntry[]) || [];
};

export const getAllMemories = async (): Promise<MemoryEntry[]> => {
  const { data } = await supabase.from('memories').select().order('timestamp', { ascending: false }).limit(100);
  return (data as MemoryEntry[]) || [];
};

/**
 * Summarizes the memory for AI context injection
 */
export const getMemoryContext = async (entityId: string): Promise<string> => {
  const memories = await getMemoriesForEntity(entityId);
  if (memories.length === 0) return "No previous interaction history found.";
  
  return memories
    .map(m => `[${new Date(m.timestamp).toLocaleDateString()}] ${m.type.toUpperCase()}: ${m.content}`)
    .join('\n');
};
