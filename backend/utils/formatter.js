export function convertStringToNumber(str) {
  if (typeof str !== "string" || str.trim() === "") return undefined;
  return Number(str);
}
