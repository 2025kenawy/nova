
import supabase from '../lib/supabase';
import { MemoryEntry } from '../types';

/**
 * Nova Intelligence Memory Store
 * 
 * Provides hybrid persistence.
 * 1. Supabase: Sovereign Horse Database (Global/Long-term)
 * 2. localMemory: In-memory session store (Local/Emergency Fallback)
 */

let localMemory: MemoryEntry[] = [];

export const saveMemory = async (memory: Omit<MemoryEntry, 'id' | 'timestamp'>) => {
  const entry = {
    entityId: memory.entityId,
    type: memory.type,
    content: memory.content,
    metadata: memory.metadata,
    timestamp: new Date().toISOString()
  };

  // Always save to local session store first for immediate consistency
  const fallbackEntry = { 
    ...entry, 
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
  } as MemoryEntry;
  localMemory.push(fallbackEntry);

  const { data, error } = await supabase
    .from('memories')
    .insert([entry])
    .select()
    .single();

  if (error) {
    // FIX: Extract actual error message or stringify the object
    console.error("Supabase Persistence Failure:", error.message || JSON.stringify(error));
    return fallbackEntry;
  }

  return data as MemoryEntry;
};

export const getMemoriesForEntity = async (entityId: string): Promise<MemoryEntry[]> => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('entityId', entityId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error("Supabase Retrieval Error:", error.message || JSON.stringify(error));
    // Fallback to searching local session memory
    return localMemory.filter(m => m.entityId === entityId);
  }

  return (data as MemoryEntry[]) || [];
};

export const getAllMemories = async (): Promise<MemoryEntry[]> => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    // FIX: Extract actual error message
    console.error("Supabase Global Audit Error:", error.message || JSON.stringify(error));
    // Fallback: Return sorted local memory so the dashboard isn't empty
    return [...localMemory].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  // Merge results if needed, or prefer DB
  return (data as MemoryEntry[]) || [];
};

export const getMemoryContext = async (entityId: string): Promise<string> => {
  const memories = await getMemoriesForEntity(entityId);
  if (memories.length === 0) return "Fresh lead. No historical equestrian context available.";
  
  return memories
    .map(m => `[${new Date(m.timestamp).toLocaleDateString()}] ${m.type.toUpperCase()}: ${m.content}`)
    .join('\n');
};
