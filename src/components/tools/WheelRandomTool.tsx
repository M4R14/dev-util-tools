import React from 'react';
import ExternalToolPage from './ExternalToolPage';
import { WHEEL_RANDOM_SPEC } from '../../data/externalTools';

const WheelRandomTool: React.FC = () => <ExternalToolPage spec={WHEEL_RANDOM_SPEC} />;

export default WheelRandomTool;
