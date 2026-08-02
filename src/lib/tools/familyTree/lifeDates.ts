/**
 * Reading a year out of what someone typed in a birth or death field.
 *
 * The field stays free text on purpose. A family tree is filled in from memory and from what is
 * written on the back of photographs — "2510", "ราวๆ 2495", "1967", "12 มี.ค. 2503" — and a date
 * picker that demands a full valid date turns "some time in the sixties" into a blank.
 *
 * Only the year is extracted, and only to order siblings and show a lifespan. Nothing else depends
 * on it, so a value this cannot read costs the owner nothing but the sorting.
 */

/**
 * Buddhist years are 543 ahead of Common Era ones, and Thai family records are written in them.
 *
 * Anything at or above this reads as Buddhist. The boundary is CE 1757, so a Common Era year in a
 * family tree can never reach it, and a Buddhist year below it would be a person born before the
 * Ayutthaya period.
 */
const BUDDHIST_THRESHOLD = 2300;
const BUDDHIST_OFFSET = 543;

/** Rejects years no living record could carry, so a phone number in the field is not read as one. */
const PLAUSIBLE = { min: 1000, max: 2999 };

/**
 * The Common Era year, or `null` when nothing usable is there.
 *
 * Takes the first four-digit run rather than the whole string, so a full date in any order still
 * yields its year.
 */
export const parseLifeYear = (text: string): number | null => {
  const match = text.match(/\d{4}/);
  if (!match) return null;

  const year = Number(match[0]);
  if (year < PLAUSIBLE.min || year > PLAUSIBLE.max) return null;

  return year >= BUDDHIST_THRESHOLD ? year - BUDDHIST_OFFSET : year;
};

/**
 * The bit shown under a name — "1967–2015", "b. 1967", "d. 2015", or nothing.
 *
 * A dagger is not used: it carries a religious reading that does not fit every family this tool is
 * for, and "d." says the same thing without one.
 */
export const formatLifespan = (birth: string, death: string): string => {
  const born = parseLifeYear(birth);
  const died = parseLifeYear(death);

  if (born !== null && died !== null) return `${born}–${died}`;
  if (born !== null) return `b. ${born}`;
  if (died !== null) return `d. ${died}`;

  // Nothing parseable, but a death entry still means the person is gone, whatever it says.
  return death.trim().length > 0 ? 'deceased' : '';
};

/** True when anything at all was entered under death. */
export const isDeceased = (death: string): boolean => death.trim().length > 0;

/**
 * Compares two members by birth year, oldest first, with unknowns last.
 *
 * Returns 0 for two unknowns so a stable sort leaves them in the order the owner entered them —
 * which is the only ordering information left at that point.
 */
export const byBirthYear = (
  left: { birth: string },
  right: { birth: string },
): number => {
  const a = parseLifeYear(left.birth);
  const b = parseLifeYear(right.birth);

  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  return a - b;
};
