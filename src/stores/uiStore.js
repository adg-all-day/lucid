// ui store - tiny but useful
// keeps things like the selected tab alive when you navigate away and come back
import { create } from 'zustand';

const useUiStore = create((set) => ({
  activeTab: 'All Transactions',
  searchText: '',
  darkMode: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchText: (searchText) => set({ searchText }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

export default useUiStore;
