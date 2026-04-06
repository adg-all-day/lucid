// user profile store
// keeps track of who's logged in so we don't have to pass props around everywhere
// suggestion: the profile should be fetched from the API on app load instead of relying on hardcoded values
import { create } from 'zustand';

const useUserStore = create((set) => ({
  // all empty by default, gets filled in once we have a real profile endpoint
  name: '',
  email: '',
  avatar: '',
  phone: '',
  address: '',

  // takes a profile object and sets whatever fields it has
  setUser: (data) =>
    set(() => {
      const firstName = data?.first_name || '';
      const lastName = data?.last_name || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

      return {
        name: data?.name || fullName || '',
        email: data?.email || '',
        avatar: data?.avatar || '',
        phone: data?.phone || '',
        address: data?.address || '',
      };
    }),

  // wipe everything on logout
  clearUser: () =>
    set({
      name: '',
      email: '',
      avatar: '',
      phone: '',
      address: '',
    }),
}));

export default useUserStore;
