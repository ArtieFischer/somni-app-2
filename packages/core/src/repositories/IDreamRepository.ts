import { Dream } from '@somni/types';

export interface IDreamRepository {
  save(dream: Dream): Promise<Dream>;
  findById(id: string): Promise<Dream | null>;
  findByUserId(userId: string): Promise<Dream[]>;
  update(id: string, updates: Partial<Dream>): Promise<Dream>;
  delete(id: string): Promise<void>;
  search(query: string, userId?: string): Promise<Dream[]>;
}