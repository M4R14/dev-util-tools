import React from 'react';
import {
  Activity,
  CloudCog,
  CloudDownload,
  Download,
  RefreshCcw,
  Settings2,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { formatPwaBytes, formatPwaLastUpdated, usePwaSettings } from '../hooks/usePwaSettings';

const Settings: React.FC = () => {
  const {
    isOnline,
    isInstalled,
    canInstallApp,
    cacheSizeBytes,
    isLoadingCacheStats,
    isCheckingUpdates,
    isClearingCache,
    lastUpdatedAt,
    installApp,
    refreshCacheStats,
    checkForUpdates,
    clearOfflineCache,
  } = usePwaSettings({ loadCacheStatsOnMount: true });

  const cacheSizeLabel = isLoadingCacheStats ? 'Calculating…' : formatPwaBytes(cacheSizeBytes);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <Settings2 className="h-6 w-6 text-primary" />
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage offline availability, app installation, and service-worker updates from one
              place.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-border/70 bg-background/70">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/70">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Download className="h-4 w-4 text-primary" />
              Install App
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canInstallApp ? (
              <Button size="sm" onClick={() => void installApp()}>
                Install App
              </Button>
            ) : (
              <p className="text-sm font-semibold text-foreground">
                {isInstalled ? 'App installed' : 'Install unavailable'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/70">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <CloudDownload className="h-4 w-4 text-primary" />
              Offline Cache Size
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-semibold text-foreground">{cacheSizeLabel}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshCacheStats()}
              disabled={isLoadingCacheStats}
            >
              {isLoadingCacheStats ? 'Refreshing…' : 'Refresh cache size'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/70">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <CloudCog className="h-4 w-4 text-primary" />
              Last App Update
            </CardTitle>
            <CardDescription>Recorded when the active service worker finishes activation.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-foreground">
              {formatPwaLastUpdated(lastUpdatedAt)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="border-border/70 bg-background/70">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <RefreshCcw className="h-4 w-4 text-primary" />
              Service Worker Actions
            </CardTitle>
            <CardDescription>
              Check for new app version and manage cached offline assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void checkForUpdates()} disabled={isCheckingUpdates}>
              {isCheckingUpdates ? 'Checking…' : 'Check for updates'}
            </Button>
            <Button
              variant="outline"
              onClick={() => void clearOfflineCache()}
              disabled={isClearingCache}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearingCache ? 'Clearing…' : 'Clear offline cache'}
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Settings;
