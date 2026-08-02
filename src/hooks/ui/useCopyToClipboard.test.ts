import { describe, it, expect } from 'vitest';
import { resolveCopyMessages } from './useCopyToClipboard';

/**
 * Only the message-resolution rules are covered. The `copied` flag and its timer cleanup need a
 * React renderer, and this project has no working jsdom — those are verified in the browser.
 */
describe('resolveCopyMessages', () => {
  it('falls back to the built-in messages', () => {
    expect(resolveCopyMessages()).toEqual({
      success: 'Copied to clipboard',
      error: 'Failed to copy',
    });
  });

  it('lets the hook set defaults', () => {
    expect(resolveCopyMessages({ success: 'Anchor copied' })).toEqual({
      success: 'Anchor copied',
      error: 'Failed to copy',
    });
  });

  it('lets a call override the hook', () => {
    expect(
      resolveCopyMessages({ success: 'Anchor copied' }, { success: 'Password copied' }),
    ).toEqual({ success: 'Password copied', error: 'Failed to copy' });
  });

  it('treats null as "stay silent", not as "use the default"', () => {
    expect(resolveCopyMessages({ success: null, error: null })).toEqual({
      success: null,
      error: null,
    });
    expect(resolveCopyMessages({}, { success: null })).toEqual({
      success: null,
      error: 'Failed to copy',
    });
  });

  it('lets a call re-enable a message the hook silenced', () => {
    expect(resolveCopyMessages({ success: null }, { success: 'Copied' }).success).toBe('Copied');
  });

  it('resolves success and error independently', () => {
    expect(resolveCopyMessages({}, { error: 'Unable to copy all date formats' })).toEqual({
      success: 'Copied to clipboard',
      error: 'Unable to copy all date formats',
    });
  });
});
