export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export interface ServiceWorkerMessagePayload {
  type?: string;
  timestamp?: number;
}

export interface UsePwaSettingsOptions {
  loadCacheStatsOnMount?: boolean;
}
