export interface LevelMeta {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface SandboxLevel extends LevelMeta {
  component: React.ComponentType<{ onSuccess: () => void }>;
}
