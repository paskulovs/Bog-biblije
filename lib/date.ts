const padNumber = (value: number) => String(value).padStart(2, "0");

export const formatSerbianDate = (value: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const day = padNumber(parsed.getUTCDate());
  const month = padNumber(parsed.getUTCMonth() + 1);
  const year = parsed.getUTCFullYear();

  return `${day}.${month}.${year}.`;
};
