import React from 'react';
import { AlertTriangle, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { CodeHighlight } from '../ui/CodeHighlight';
import { useJwtDecoder } from '../../hooks/tools/useJwtDecoder';

const formatDate = (date: Date | null) =>
  date ? date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : '—';

const JwtDecoder: React.FC = () => {
  const {
    token,
    setToken,
    decoded,
    error,
    clear,
    secret,
    setSecret,
    verification,
    verifyError,
    isVerifying,
    verify,
  } = useJwtDecoder();

  const headerJson = decoded ? JSON.stringify(decoded.header, null, 2) : '';
  const payloadJson = decoded ? JSON.stringify(decoded.payload, null, 2) : '';

  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ToolLayout.Section
            title="Token"
            actions={
              <Button
                variant="ghost"
                size="icon"
                onClick={clear}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Clear"
                aria-label="Clear token"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            }
          >
            <div className="p-4 space-y-3">
              <Textarea
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste a JWT (header.payload.signature)..."
                className="w-full h-40 font-mono text-sm resize-none"
                aria-label="JWT token"
              />

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </ToolLayout.Section>

          <ToolLayout.Section title="Claims">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {[
                    { label: 'Algorithm', value: decoded?.algorithm ?? '—' },
                    { label: 'Issued at (iat)', value: formatDate(decoded?.issuedAt ?? null) },
                    { label: 'Not before (nbf)', value: formatDate(decoded?.notBefore ?? null) },
                    { label: 'Expires at (exp)', value: formatDate(decoded?.expiresAt ?? null) },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 p-4">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-mono text-foreground">{row.value}</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-3 p-4">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {decoded?.isExpired === null || !decoded ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <span
                        className={
                          decoded.isExpired
                            ? 'inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive'
                            : 'inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300'
                        }
                      >
                        {decoded.isExpired ? 'Expired' : 'Not expired'}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ToolLayout.Section>

          <ToolLayout.Section title="Signature">
            <div className="p-4 space-y-3">
              {decoded && (
                <code className="block text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1.5 rounded border border-border/50 break-all">
                  {decoded.signature || '(unsigned)'}
                </code>
              )}

              <div className="space-y-2">
                <label htmlFor="jwt-verify-secret" className="text-sm font-medium text-foreground">
                  Shared secret (HMAC)
                </label>
                <Input
                  id="jwt-verify-secret"
                  type="password"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="Enter the HS256/384/512 secret to verify"
                  className="font-mono"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Checked in this tab only — the secret is never put in the URL or sent anywhere.
                  Prefer a throwaway secret over a production one.
                </p>
              </div>

              <Button
                onClick={verify}
                disabled={isVerifying || !decoded}
                variant="outline"
                className="w-full gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isVerifying ? 'Verifying…' : 'Verify signature'}
              </Button>

              {verifyError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{verifyError}</span>
                </div>
              )}

              {verification?.valid === true && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Signature is valid for this secret.</span>
                </div>
              )}

              {verification?.valid === false && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <ShieldOff className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{verification.reason}</span>
                </div>
              )}

              {!verification && !verifyError && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Until you verify, the values above are only what the token <em>claims</em> —
                  tokens signed with <code className="font-mono">alg: none</code> decode just as
                  happily. Asymmetric algorithms (RS256/ES256) are not supported here yet.
                </p>
              )}
            </div>
          </ToolLayout.Section>
        </div>

        <div className="space-y-8">
          <ToolLayout.Section
            title="Header"
            actions={
              headerJson ? (
                <CopyButton value={headerJson} successMessage="Header copied" />
              ) : undefined
            }
          >
            <div className="p-4">
              {headerJson ? (
                <CodeHighlight code={headerJson} language="json" />
              ) : (
                <p className="text-xs text-muted-foreground">Paste a token to see its header.</p>
              )}
            </div>
          </ToolLayout.Section>

          <ToolLayout.Section
            title="Payload"
            actions={
              payloadJson ? (
                <CopyButton value={payloadJson} successMessage="Payload copied" />
              ) : undefined
            }
          >
            <div className="p-4">
              {payloadJson ? (
                <CodeHighlight code={payloadJson} language="json" />
              ) : (
                <p className="text-xs text-muted-foreground">Paste a token to see its claims.</p>
              )}
            </div>
          </ToolLayout.Section>
        </div>
      </div>
    </ToolLayout>
  );
};

export default JwtDecoder;
