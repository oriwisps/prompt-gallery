export type Theme =
  "glow" | "orbit" | "glass" | "type" | "particles" | "loader" | "plain";
export interface Version {
  id: string;
  name: string;
  prompt: string;
  provider: string;
  model: string;
  parameters: string;
  notes: string;
  html: string;
  css: string;
  js: string;
  createdAt: string;
}
export interface Case {
  id: string;
  title: string;
  tags: string[];
  favorite: boolean;
  cover: string;
  theme: Theme;
  versions: Version[];
  bestVersionId: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
}
export interface Auth {
  initialized: boolean;
  authenticated: boolean;
  username?: string;
}
