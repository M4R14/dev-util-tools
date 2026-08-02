import React from 'react';
import ExternalToolPage from './ExternalToolPage';
import { VIN_TOOL_SPEC } from '../../data/externalTools';

const VinTool: React.FC = () => <ExternalToolPage spec={VIN_TOOL_SPEC} />;

export default VinTool;
