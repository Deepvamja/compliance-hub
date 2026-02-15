// This file is kept as a minimal stub for compatibility.
// All data operations now use Supabase via hooks in src/hooks/.
// If any component still imports useAppStore, it will get empty defaults.

import { create } from "zustand";

interface AppState {
  // Stub - all data now comes from Supabase hooks
}

export const useAppStore = create<AppState>(() => ({}));
