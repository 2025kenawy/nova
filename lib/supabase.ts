
/**
 * Nova Supabase Client (Personal Implementation)
 */

// Simulated Supabase persistence using localStorage
const getStore = (table: string) => JSON.parse(localStorage.getItem(`nova_${table}`) || '[]');
const setStore = (table: string, data: any[]) => localStorage.setItem(`nova_${table}`, JSON.stringify(data));

export const supabase = {
  from: (table: string) => ({
    select: () => ({
      order: (col: string, { ascending = false } = {}) => ({
        limit: (n: number) => {
          const data = getStore(table);
          return Promise.resolve({ data: data.slice(0, n), error: null });
        }
      }),
      eq: (col: string, val: any) => {
        const data = getStore(table).filter((r: any) => r[col] === val);
        return Promise.resolve({ data, error: null });
      }
    }),
    insert: (newData: any) => {
      const data = getStore(table);
      const rows = Array.isArray(newData) ? newData : [newData];
      const updated = [...rows, ...data];
      setStore(table, updated);
      return Promise.resolve({ data: updated, error: null });
    },
    update: (updates: any) => ({
      eq: (col: string, val: any) => {
        const data = getStore(table);
        const updated = data.map((r: any) => r[col] === val ? { ...r, ...updates } : r);
        setStore(table, updated);
        return Promise.resolve({ data: updated, error: null });
      }
    }),
    delete: () => ({
      eq: (col: string, val: any) => {
        const data = getStore(table);
        const updated = data.filter((r: any) => r[col] !== val);
        setStore(table, updated);
        return Promise.resolve({ data: updated, error: null });
      }
    })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: { email: 'nova@personal.use' } }, error: null }),
    signIn: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
};

export default supabase;
