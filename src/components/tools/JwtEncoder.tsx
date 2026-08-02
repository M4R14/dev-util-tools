import React from 'react';
import { AlertTriangle, KeyRound, ShieldOff, Signature } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { useJwtEncoder } from '../../hooks/useJwtEncoder';
import { JWT_SIGNING_ALGORITHMS } from '../../lib/jwtSign';

const JwtEncoder: React.FC = () => {
  const {
    payload,
    setPayload,
    secret,
    setSecret,
    algorithm,
    setAlgorithm,
    token,
    error,
    isEncoding,
    isSigned,
    encode,
  } = useJwtEncoder();

  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ToolLayout.Section title="Payload">
            <div className="p-4 space-y-3">
              <Textarea
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                placeholder='{ "sub": "1234567890" }'
                className="w-full h-48 font-mono text-sm resize-none"
                aria-label="JWT payload JSON"
              />
              <p className="text-xs text-muted-foreground">
                Standard claims apply as usual — <code className="font-mono">exp</code> and{' '}
                <code className="font-mono">iat</code> are seconds since the epoch.
              </p>
            </div>
          </ToolLayout.Section>

          <ToolLayout.Section title="Signing">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="jwt-secret" className="text-sm font-medium text-foreground">
                  Shared secret
                </label>
                <Input
                  id="jwt-secret"
                  type="password"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="Leave empty for an unsigned token"
                  className="font-mono"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Stays in this tab: it is never put in the URL and never sent anywhere. Even so,
                  prefer a throwaway secret over a production one.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="jwt-alg" className="text-sm font-medium text-foreground">
                  Algorithm
                </label>
                <select
                  id="jwt-alg"
                  value={algorithm}
                  onChange={(event) =>
                    setAlgorithm(event.target.value as (typeof JWT_SIGNING_ALGORITHMS)[number])
                  }
                  disabled={!isSigned}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                >
                  {JWT_SIGNING_ALGORITHMS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={encode} disabled={isEncoding} className="w-full gap-2">
                <Signature className="w-4 h-4" />
                {isEncoding
                  ? 'Signing…'
                  : isSigned
                    ? `Sign with ${algorithm}`
                    : 'Build unsigned token'}
              </Button>

              {!isSigned && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  <ShieldOff className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    No secret means <code className="font-mono">alg: none</code> — anyone can edit
                    the claims. Fine for fixtures, rejected by any server that checks signatures.
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </ToolLayout.Section>
        </div>

        <ToolLayout.Section
          title="Token"
          actions={token ? <CopyButton value={token} successMessage="Token copied" /> : undefined}
        >
          <div className="p-4">
            {token ? (
              <Card className="border-border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <KeyRound className="w-4 h-4 text-primary" />
                    {isSigned ? `Signed with ${algorithm}` : 'Unsigned (alg: none)'}
                  </div>
                  <code className="block text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-2 rounded border border-border/50 break-all">
                    {token}
                  </code>
                </CardContent>
              </Card>
            ) : (
              <p className="text-xs text-muted-foreground">
                Fill in a payload and press the button to build a token.
              </p>
            )}
          </div>
        </ToolLayout.Section>
      </div>
    </ToolLayout>
  );
};

export default JwtEncoder;
