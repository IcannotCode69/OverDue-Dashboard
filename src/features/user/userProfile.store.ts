import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  name: string;
  school?: string;
  major?: string;
  term?: string;
  timezone?: string;
  createdAt: number;
  updatedAt: number;
}

interface UserProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile(profile) {
        set({
          profile: {
            ...profile,
            updatedAt: Date.now(),
          },
        });
      },
      updateProfile(patch) {
        const current = get().profile;
        if (!current) return;
        set({
          profile: {
            ...current,
            ...patch,
            updatedAt: Date.now(),
          },
        });
      },
      clearProfile() {
        set({ profile: null });
      },
    }),
    {
      name: "od:userProfile:v1",
    }
  )
);
