import React from 'react';
import ExternalToolPage from './ExternalToolPage';
import { WORD_COUNTER_SPEC } from '../../data/externalTools';

const WordCounterTool: React.FC = () => <ExternalToolPage spec={WORD_COUNTER_SPEC} />;

export default WordCounterTool;
