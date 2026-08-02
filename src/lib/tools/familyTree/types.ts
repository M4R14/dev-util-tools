/**
 * The shapes a family tree is made of, and nothing that acts on them.
 *
 * Split out because most of this feature only needs the nouns: five of the components import
 * `FamilyMember` or `FamilyNode` to type a prop and never call a single operation. Keeping the
 * declarations free of zod, of `randomUUID`, and of each other means naming a type costs nothing.
 *
 * A tree is stored as a **flat list**, each member pointing at one parent. Every operation the tool
 * offers — rename, re-parent, delete, import — is a lookup by id, and a nested shape turns each of
 * those into a recursive rewrite. The nesting is derived on read by `buildHierarchy`.
 */
export type Gender = 'male' | 'female' | 'unknown';

export interface FamilyMember {
  id: string;
  name: string;
  /** `null` marks a root. Ids that point at nobody are surfaced by `buildHierarchy`, not dropped. */
  parentId: string | null;
  /**
   * The partner drawn beside this member, with their children hanging from the pair.
   *
   * Symmetric — both sides carry the link. Only a partner who has no parent of their own is drawn
   * beside someone; a partner who is themselves a descendant stays under their own parent, because
   * a tree cannot put one person in two places at once.
   */
  spouseId: string | null;
  /**
   * Drives the shape and colour in the diagram.
   *
   * A field rather than a guess from `relationship`: that is free text, and reading "ลูกสาว" out
   * of it works right up until someone writes "ลูก" or "ลูกคนโต", at which point the diagram is
   * confidently wrong with nothing on screen to explain why.
   */
  gender: Gender;
  /** How this member relates to their parent — "ลูกชาย", "ภรรยา". Free text; presets are a UI concern. */
  relationship: string;
  /**
   * Free text, not a date: a family tree is filled in from memory and from the back of
   * photographs. See `lifeDates.ts` for what is read out of it and why the field stays loose.
   */
  birth: string;
  /** Anything at all here means the person is gone, whether or not it carries a year. */
  death: string;
  /** Occupation, birthplace, anything else the owner wants to remember. */
  note: string;
}

export interface FamilyNode {
  member: FamilyMember;
  /** The married-in partner sharing this node's slot, if any. Has no children of their own. */
  spouse: FamilyMember | null;
  depth: number;
  children: FamilyNode[];
  /** Set by `collapseHierarchy` when this node's branch is folded away. */
  hiddenDescendants?: number;
}

export interface Hierarchy {
  roots: FamilyNode[];
  /** Members whose `parentId` names someone absent from the list. Shown as roots so nobody vanishes. */
  orphanedIds: string[];
  /** Members caught in a parent cycle. Also shown as roots, for the same reason. */
  cycleIds: string[];
}

export interface CreateMemberInput {
  name: string;
  parentId?: string | null;
  /** Marries the new member to this one, so the pair is drawn together. */
  spouseId?: string | null;
  gender?: Gender;
  relationship?: string;
  birth?: string;
  death?: string;
  note?: string;
}

export interface FamilyFailure {
  ok: false;
  reason: string;
}

export type MembersResult = { ok: true; members: FamilyMember[] } | FamilyFailure;

/**
 * Narrows to the failure arm.
 *
 * Without `strictNullChecks` — which this project does not enable — TypeScript will narrow a
 * discriminated union on the `true` side (`if (result.ok) { … }`) but not on the `false` side, so
 * `if (!result.ok) toast.error(result.reason)` does not compile. An explicit guard says the same
 * thing and works either way.
 */
export const isFamilyFailure = (result: { ok: boolean }): result is FamilyFailure => !result.ok;

/** Offered in the UI as a `<datalist>`; `relationship` itself stays free text. */
export const RELATIONSHIP_PRESETS = [
  'พ่อ',
  'แม่',
  'สามี',
  'ภรรยา',
  'ลูกชาย',
  'ลูกสาว',
  'พี่ชาย',
  'พี่สาว',
  'น้องชาย',
  'น้องสาว',
  'ปู่',
  'ย่า',
  'ตา',
  'ยาย',
  'ลุง',
  'ป้า',
  'น้า',
  'อา',
  'หลาน',
] as const;
