export interface Concept {
  id: string;
  title: string;
  category: string;
  description: string;
  formula?: string;
  formulaLabel?: string;
  tags: string[];
  chartType?: ChartType;
  details?: string[];
}

export type ChartType =
  | 'long-forward'
  | 'short-forward'
  | 'long-call'
  | 'short-call'
  | 'long-put'
  | 'short-put'
  | 'long-straddle';

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category?: string;
}

export type Theme = 'dark' | 'light';
