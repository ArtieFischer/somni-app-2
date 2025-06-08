import { UserProfile } from '@somni/types';

export class User {
  constructor(
    public readonly id: string,
    public readonly username?: string,
    public readonly displayName?: string,
    public readonly avatarUrl?: string,
    public readonly isPremium: boolean = false,
    public readonly onboardingCompleted: boolean = false,
    public readonly sleepSchedule?: { bedtime: string; wake_time: string },
    public readonly lucidDreamSettings?: object,
    public readonly createdAt?: string,
    public readonly updatedAt?: string
  ) {}

  static create(userData: Partial<UserProfile>): User {
    this.validateUserData(userData);
    
    return new User(
      userData.id!,
      userData.username,
      userData.display_name,
      userData.avatar_url,
      userData.is_premium || false,
      userData.onboarding_completed || false,
      userData.sleep_schedule,
      userData.lucid_dream_settings,
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  private static validateUserData(data: Partial<UserProfile>): void {
    if (!data.id) {
      throw new Error('User ID is required');
    }
    if (data.username && (data.username.length < 3 || data.username.length > 24)) {
      throw new Error('Username must be between 3 and 24 characters');
    }
  }

  updateProfile(updates: Partial<UserProfile>): User {
    return new User(
      this.id,
      updates.username ?? this.username,
      updates.display_name ?? this.displayName,
      updates.avatar_url ?? this.avatarUrl,
      updates.is_premium ?? this.isPremium,
      updates.onboarding_completed ?? this.onboardingCompleted,
      updates.sleep_schedule ?? this.sleepSchedule,
      updates.lucid_dream_settings ?? this.lucidDreamSettings,
      this.createdAt,
      new Date().toISOString()
    );
  }

  toDTO(): UserProfile {
    return {
      id: this.id,
      username: this.username,
      display_name: this.displayName,
      avatar_url: this.avatarUrl,
      is_premium: this.isPremium,
      onboarding_completed: this.onboardingCompleted,
      sleep_schedule: this.sleepSchedule,
      lucid_dream_settings: this.lucidDreamSettings
    };
  }
}