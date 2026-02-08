export interface SandboxLevel {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{ onSuccess: () => void }>;
}
