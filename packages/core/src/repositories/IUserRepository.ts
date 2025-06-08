import { UserProfile } from '@somni/types';

export interface IUserRepository {
  save(user: UserProfile): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | null>;
  update(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}