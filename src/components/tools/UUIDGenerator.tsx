import React, { useEffect, useRef } from 'react';
import ToolLayout from '../ui/ToolLayout';
import { useUUIDGenerator } from '../../hooks/useUUIDGenerator';
import {
  getUUIDFormatPreview,
  QUICK_QUANTITY_PRESETS,
  UUIDOptionsPanel,
  UUIDResultsHeader,
  UUIDResultsList,
} from './uuid-generator';

const UUIDGenerator: React.FC = () => {
  const {
    uuids,
    options,
    setOptions,
    setQuantity,
    hasSecureUUID,
    generateUUID,
    clear,
    copyAll,
    download,
    minQuantity,
    maxQuantity,
  } = useUUIDGenerator();

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      generateUUID();
    }
  }, [generateUUID]);

  const handleOptionChange = (key: keyof typeof options, value: string | number | boolean) => {
    setOptions((previous) => ({ ...previous, [key]: value }));
  };

  const formattedPreview = getUUIDFormatPreview({
    hyphens: options.hyphens,
    uppercase: options.uppercase,
  });

  return (
    <ToolLayout className="max-w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <UUIDOptionsPanel
          options={options}
          minQuantity={minQuantity}
          maxQuantity={maxQuantity}
          quickQuantityPresets={QUICK_QUANTITY_PRESETS}
          formattedPreview={formattedPreview}
          onSetQuantity={setQuantity}
          onOptionChange={handleOptionChange}
          onGenerate={generateUUID}
        />

        <div className="lg:col-span-2 flex flex-col h-full gap-4">
          <UUIDResultsHeader
            count={uuids.length}
            hasSecureUUID={hasSecureUUID}
            onDownload={download}
            onClear={clear}
            onCopyAll={copyAll}
          />
          <UUIDResultsList uuids={uuids} />
        </div>
      </div>
    </ToolLayout>
  );
};

export default UUIDGenerator;
