export const SAMPLE_ORIGINAL = `function sum(a, b) {
  return a + b;
}

console.log(sum(1, 2));`;

export const SAMPLE_MODIFIED = `function sum(a, b, c = 0) {
  return a + b + c;
}

console.log(sum(1, 2, 3));`;
