import React from 'react';
import ExternalToolPage from './ExternalToolPage';
import { DUMMY_IMAGE_SPEC } from '../../data/externalTools';

const DummyImageTool: React.FC = () => <ExternalToolPage spec={DUMMY_IMAGE_SPEC} />;

export default DummyImageTool;
