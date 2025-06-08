import type { DreamEntry } from '@somni/types'; 

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getDreamTitle = (dream: DreamEntry): string => {
  return dream.title;
};