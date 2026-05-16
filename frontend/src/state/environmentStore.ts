import { create } from 'zustand';

interface Environment {
  name: string;
  variables: Record<string, string>;
}

interface EnvironmentState {
  activeEnv: string;
  environments: Record<string, Record<string, string>>;
  
  // Actions
  setActiveEnv: (name: string) => void;
  setEnvironments: (envs: Record<string, Record<string, string>>) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  activeEnv: 'No Environment',
  environments: {},

  setActiveEnv: (name) => set({ activeEnv: name }),
  setEnvironments: (envs) => set({ environments: envs }),
}));
