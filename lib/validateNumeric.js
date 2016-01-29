let numeric = /^[-+]?\d*\.?\d*$/;

export default function validateNumeric(str) {
  return numeric.test(str);
}
