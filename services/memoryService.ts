
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

/**
 * Helper to safely execute Supabase calls with silent local fallbacks
 */
async function safeDbCall<T>(call: () => Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> {
  try {
    const { data, error } = await call();
    if (error) {
      // Log only on real database errors, not network failures
      if (!error.message?.includes('failed to fetch') && !error.message?.includes('Load failed')) {
        console.warn("Nova Intelligence: Supabase operational error handled via fallback.");
      }
      return fallback;
    }
    return data ?? fallback;
  } catch (err) {
    // Silent catch for "TypeError: Load failed" which usually indicates network/URL issues
    return fallback;
  }
}

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

export const getAllMemories = async (): Promise<MemoryEntry[]> => {
  const fallback = [...localMemory].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return safeDbCall(
    () => supabase.from('memories').select('*').order('timestamp', { ascending: false }).limit(100),
    fallback
  );
};

export const getMemoryContext = async (entityId: string): Promise<string> => {
  const memories = await getMemoriesForEntity(entityId);
  if (memories.length === 0) return "Fresh lead. No historical equestrian context available.";
  
  return memories
    .map(m => `[${new Date(m.timestamp).toLocaleDateString()}] ${m.type.toUpperCase()}: ${m.content}`)
    .join('\n');
};
