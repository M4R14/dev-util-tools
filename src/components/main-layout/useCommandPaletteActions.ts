import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Settings2, Trash2 } from 'lucide-react';
import { checkForServiceWorkerUpdate, clearOfflineCache } from '../../hooks/pwa-settings';
import type { CommandPaletteAction } from '../CommandPalette';

/**
 * Quick actions offered by the command palette. The PWA actions delegate to
 * `hooks/pwa-settings/operations` so they stay identical to the Settings page buttons —
 * this file used to carry its own copy, including a second `devpulse-static-` constant.
 */
export const useCommandPaletteActions = () => {
  const navigate = useNavigate();

  return useMemo<CommandPaletteAction[]>(
    () => [
      {
        id: 'open-settings',
        name: 'Open settings',
        description: 'Go to app settings page.',
        icon: Settings2,
        keywords: ['settings', 'preferences', 'config', 'pwa'],
        onSelect: () => navigate('/settings'),
      },
      {
        id: 'check-updates',
        name: 'Check updates',
        description: 'Check for a newer app version.',
        icon: RefreshCw,
        keywords: ['update', 'service worker', 'refresh'],
        onSelect: checkForServiceWorkerUpdate,
      },
      {
        id: 'clear-offline-cache',
        name: 'Clear offline cache',
        description: 'Delete cached offline app assets.',
        icon: Trash2,
        keywords: ['cache', 'offline', 'pwa', 'storage'],
        // The palette has no derived cache stats to refresh, so the success flag is discarded.
        onSelect: async () => {
          await clearOfflineCache();
        },
      },
    ],
    [navigate],
  );
};
