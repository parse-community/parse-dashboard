export function convertToDateTimeString(epoch) {
  const isoString = new Date(parseInt(epoch) * 1000).toISOString();
  const dateSplit = isoString.split("T");
  return `${dateSplit[0]} ${dateSplit[1]}`;
}

export function convertToDateTimeObject(epoch) {
  return new Date(parseInt(epoch) * 1000);
}
