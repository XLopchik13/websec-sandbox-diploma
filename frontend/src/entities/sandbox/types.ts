export interface LevelMeta {
  id: string;
  title: string;
  description: string;
  owasp: string;
  category: string;
}

export interface SandboxLevel extends LevelMeta {
  component: React.ComponentType<{ onSuccess: () => void }>;
}
