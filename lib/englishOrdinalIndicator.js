let numberSuffix = (number) => {
  if (number > 3 && number < 21) {
    return 'th';
  }
  switch (number % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export default function englishOrdinalIndicator(number) {
  return number + numberSuffix(number);
}
