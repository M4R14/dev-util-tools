import { z } from 'zod';
import type { FamilyFailure, FamilyMember } from './types';

/**
 * The edge where a tree crosses in or out of this app — localStorage, and the export/import box.
 *
 * The only file here that knows about zod. Everything inside the app works with `FamilyMember`
 * values that are already the right shape; validation belongs at the door, not scattered through
 * the operations.
 */

const memberSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  // Optional as well as nullable: a hand-written import that simply omits the key means a root.
  parentId: z.string().nullable().optional(),
  /**
   * Both shapes are accepted. `spouseId` is what every tree exported before remarriage was
   * supported carries, and someone's saved file is not a reason to lose their tree.
   */
  spouseId: z.string().nullable().optional(),
  spouseIds: z.array(z.string()).optional(),
  otherParentId: z.string().nullable().optional(),
  // Anything unrecognised reads as unknown rather than failing the whole import for one bad cell.
  gender: z.enum(['male', 'female', 'unknown']).catch('unknown').optional(),
  relationship: z.string(),
  // Absent in every tree exported before dates existed, so optional rather than a failed import.
  birth: z.string().optional(),
  death: z.string().optional(),
  note: z.string(),
});

/**
 * Fills in what the schema allows to be absent.
 *
 * This project compiles without `strictNullChecks`, so the type zod infers for an optional
 * nullable key is `parentId?: string` — which will not sit in a `FamilyMember[]` on its own.
 * Rebuilding each member here settles that without a cast, and does the normalising the import
 * path wanted anyway.
 */
const toMembers = (parsed: z.infer<typeof familyMembersSchema>): FamilyMember[] =>
  parsed.map((entry) => ({
    id: entry.id,
    name: entry.name,
    parentId: entry.parentId ?? null,
    // The old single-partner key is lifted into the list, so an older export opens unchanged.
    spouseIds: entry.spouseIds ?? (entry.spouseId ? [entry.spouseId] : []),
    otherParentId: entry.otherParentId ?? null,
    gender: entry.gender ?? 'unknown',
    relationship: entry.relationship,
    birth: entry.birth ?? '',
    death: entry.death ?? '',
    note: entry.note,
  }));

export const familyMembersSchema = z.array(memberSchema);

/** Validates and normalises in one step, for callers holding an unvalidated tree. */
export const normalizeMembers = (parsed: unknown): FamilyMember[] => {
  const result = familyMembersSchema.safeParse(parsed);
  return result.success ? toMembers(result.data) : [];
};

export const serializeFamily = (members: FamilyMember[]): string =>
  JSON.stringify(members, null, 2);

export type ParseFamilyResult = { ok: true; members: FamilyMember[] } | FamilyFailure;

/**
 * Reads an exported file back. Rejects rather than repairs: a partly-understood family tree that
 * silently drops the rows it could not read is the failure worth avoiding here.
 */
export const parseFamily = (raw: string): ParseFamilyResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'That is not valid JSON.' };
  }

  const result = familyMembersSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, reason: 'That JSON is not a family tree export.' };
  }

  const ids = new Set(result.data.map((member) => member.id));
  if (ids.size !== result.data.length) {
    return { ok: false, reason: 'That export has two members sharing an id.' };
  }

  return { ok: true, members: toMembers(result.data) };
};
