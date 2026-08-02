import React from 'react';
import ExternalToolPage from './ExternalToolPage';
import { REGEX_TESTER_SPEC } from '../../data/externalTools';

const RegexTester: React.FC = () => <ExternalToolPage spec={REGEX_TESTER_SPEC} />;

export default RegexTester;
