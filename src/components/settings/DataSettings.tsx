import React from 'react';
import { Clock, KeyRound, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useGeminiApiKey } from '../../hooks/useGeminiApiKey';

/**
 * Everything the app has stored about this user, and a way to remove each piece.
 *
 * These controls existed nowhere before: favourites could only be removed one at a time from the
 * tool pages, recents could not be cleared at all, and the Gemini key could only be overwritten
 * from a modal buried inside the AI assistant — never deleted.
 */
export const DataSettings: React.FC = () => {
  const { favorites, recents, clearFavorites, clearRecents } = useUserPreferences();
  const { hasApiKey, clearApiKey } = useGeminiApiKey();

  return (
    <Card className="border-border/70 bg-background/70">
      <CardHeader className="pb-3">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <Trash2 className="h-4 w-4 text-primary" />
          Stored Data
        </CardTitle>
        <CardDescription>
          Everything below is kept in this browser only. Nothing is sent to a DevPulse server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
          <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
            <Star className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Favorites
            <span className="font-semibold">{favorites.length}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={favorites.length === 0}
            onClick={() => {
              clearFavorites();
              toast.success('Favorites cleared');
            }}
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
          <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Recently used
            <span className="font-semibold">{recents.length}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={recents.length === 0}
            onClick={() => {
              clearRecents();
              toast.success('Recent tools cleared');
            }}
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
          <span className="inline-flex min-w-0 items-center gap-2 whitespace-nowrap text-sm text-foreground">
            <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            Gemini key
            <span className="font-semibold">{hasApiKey ? 'Saved' : 'Not set'}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={!hasApiKey}
            onClick={() => {
              clearApiKey();
              toast.success('API key removed');
            }}
          >
            Remove
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          The API key is obfuscated in storage, not encrypted — anyone with access to this browser
          profile can recover it. Set it from the AI Smart Assistant.
        </p>
      </CardContent>
    </Card>
  );
};
