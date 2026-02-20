import React from 'react';
import { toast } from 'sonner';
import ToolLayout from '../ui/ToolLayout';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
import { getPasswordStrength } from '../../lib/passwordStrength';
import {
  buildCharsetOptions,
  getActiveCharsetSetCount,
  getCharacterPoolSize,
  getEntropyBits,
  PasswordGuidancePanel,
  PasswordOptionsPanel,
  PasswordOutputPanel,
  type CharsetKey,
} from './password-generator';

const PasswordGenerator: React.FC = () => {
  const {
    length,
    setLength,
    includeUpper,
    setIncludeUpper,
    includeLower,
    setIncludeLower,
    includeNumbers,
    setIncludeNumbers,
    includeSymbols,
    setIncludeSymbols,
    password,
    generatePassword,
  } = usePasswordGenerator();

  const [revealPassword, setRevealPassword] = React.useState(false);

  const strength = getPasswordStrength({
    length,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
  });

  const enabledSets = {
    upper: includeUpper,
    lower: includeLower,
    numbers: includeNumbers,
    symbols: includeSymbols,
  };

  const activeSetCount = getActiveCharsetSetCount(enabledSets);
  const characterPool = getCharacterPoolSize(enabledSets);
  const entropyBits = getEntropyBits(length, characterPool);

  const handleSetToggle = (key: CharsetKey, nextChecked: boolean) => {
    const isCurrentlyEnabled = enabledSets[key];
    if (isCurrentlyEnabled && !nextChecked && activeSetCount === 1) {
      toast.error('At least one character set must remain enabled');
      return;
    }

    if (key === 'upper') setIncludeUpper(nextChecked);
    if (key === 'lower') setIncludeLower(nextChecked);
    if (key === 'numbers') setIncludeNumbers(nextChecked);
    if (key === 'symbols') setIncludeSymbols(nextChecked);
  };

  const charsetOptions = buildCharsetOptions(enabledSets);

  const maskedPassword = password ? '•'.repeat(Math.max(password.length, 12)) : '';
  const previewPassword = revealPassword ? password : maskedPassword;

  return (
    <ToolLayout className="mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <PasswordOutputPanel
            password={password}
            previewPassword={previewPassword}
            revealPassword={revealPassword}
            length={length}
            characterPool={characterPool}
            entropyBits={entropyBits}
            strength={strength}
            onToggleReveal={() => setRevealPassword((previous) => !previous)}
            onGenerate={generatePassword}
          />

          <PasswordGuidancePanel />
        </div>

        <div className="lg:col-span-2">
          <PasswordOptionsPanel
            length={length}
            activeSetCount={activeSetCount}
            charsetOptions={charsetOptions}
            onLengthChange={setLength}
            onToggleCharset={handleSetToggle}
            onRegenerate={generatePassword}
          />
        </div>
      </div>
    </ToolLayout>
  );
};

export default PasswordGenerator;
