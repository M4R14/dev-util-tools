import { parseUrl } from '../../urlUtils';
import { assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runUrlParser: ToolRunner = (operation, input, context, _options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  if (operation !== 'parse') {
    throw new Error(`Unsupported operation "${operation}" for url-parser`);
  }

  const raw = asString(input, 'input');
  const { parsed, error, params } = parseUrl(raw);
  if (!parsed || error) {
    throw new Error(error || 'Invalid URL format');
  }

  return {
    href: parsed.href,
    protocol: parsed.protocol,
    username: parsed.username,
    password: parsed.password,
    host: parsed.host,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    params,
  };
};
