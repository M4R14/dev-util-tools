import React from 'react';
import { ToolLayout } from '../ui/ToolLayout';
import { useApiKeyGenerator } from '../../hooks/tools/useApiKeyGenerator';
import {
  buildApiKeyEnvAssignment,
  buildApiKeyScanPattern,
  buildApiKeyInsertSql,
  parseScopeList,
} from '../../lib/tools/apiKeyGenerator';
import {
  ApiKeyGuidancePanel,
  ApiKeyHandoffPanel,
  ApiKeyOptionsPanel,
  ApiKeyResultsPanel,
} from './api-key-generator';

const ApiKeyGenerator: React.FC = () => {
  const {
    environment,
    setEnvironment,
    format,
    setFormat,
    vendorPrefixInput,
    setVendorPrefixInput,
    vendorPrefix,
    quantity,
    setQuantity,
    consumer,
    setConsumer,
    scopeInput,
    setScopeInput,
    ticket,
    setTicket,
    issuedBy,
    setIssuedBy,
    keys,
    regenerate,
  } = useApiKeyGenerator();

  // Keys start hidden: this page is the kind of thing that gets screen-shared while someone
  // reads the SQL out loud.
  const [revealed, setRevealed] = React.useState(false);

  const context = {
    consumer,
    scopes: parseScopeList(scopeInput),
    ticket,
    issuedBy,
  };

  return (
    <ToolLayout className="mx-auto">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <ApiKeyResultsPanel
            keys={keys}
            revealed={revealed}
            onToggleReveal={() => setRevealed((previous) => !previous)}
          />

          <ApiKeyHandoffPanel
            insertSql={buildApiKeyInsertSql(keys, context)}
            envAssignment={buildApiKeyEnvAssignment(keys, context)}
            scanPattern={buildApiKeyScanPattern(vendorPrefix)}
            revealed={revealed}
          />

          <ApiKeyGuidancePanel />
        </div>

        <div className="lg:col-span-2">
          <ApiKeyOptionsPanel
            environment={environment}
            format={format}
            vendorPrefixInput={vendorPrefixInput}
            vendorPrefix={vendorPrefix}
            quantity={quantity}
            consumer={consumer}
            scopeInput={scopeInput}
            ticket={ticket}
            issuedBy={issuedBy}
            onEnvironmentChange={setEnvironment}
            onFormatChange={setFormat}
            onVendorPrefixChange={setVendorPrefixInput}
            onQuantityChange={setQuantity}
            onConsumerChange={setConsumer}
            onScopeInputChange={setScopeInput}
            onTicketChange={setTicket}
            onIssuedByChange={setIssuedBy}
            onGenerate={regenerate}
          />
        </div>
      </div>
    </ToolLayout>
  );
};

export default ApiKeyGenerator;
