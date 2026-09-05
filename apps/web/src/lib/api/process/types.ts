/**
 * Public types for the process bounded context.
 */

export interface ProcessStage {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  detail: string;
  timeline: string;
  budgetRange: string;
  clientDoes: string[];
  weDo: string[];
  deliverables: string[];
  image: string;
}

export interface ProcessFAQ {
  question: string;
  answer: string;
}

export interface ProcessMetric {
  value: string;
  label: string;
  suffix?: string;
}
