import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildShareableSearchParams, type ShareableQueryParam } from '../lib/platform/shareableUrlState';

/**
 * Mirror a tool's state into the query string so its URL is shareable.
 *
 * Callers pass every param the tool owns in ONE call. That is deliberate: React Router's
 * `setSearchParams` derives its base from the current render's `searchParams`, so two
 * separate calls in the same commit would both start from the same base and the second
 * would clobber the first. One call per tool keeps every key in a single write.
 *
 * Handles seeding-independent concerns for the caller: default elision, the
 * compare-before-write guard that prevents a navigation loop, and `replace: true` so
 * typing does not fill the browser history.
 *
 * Read the initial value with `useSearchParams()` in the caller — seeding stays explicit
 * because each tool parses its params differently (see `readBooleanParam` and friends).
 */
export const useShareableUrlState = (params: ShareableQueryParam[]): void => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.toString();

  // Callers pass a fresh array literal each render; key off the serialized value instead
  // of array identity so the effect runs when the state actually changes.
  const paramsKey = JSON.stringify(params);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, paramsRef.current);
    const nextQuery = nextParams.toString();

    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [paramsKey, currentQuery, setSearchParams]);
};
