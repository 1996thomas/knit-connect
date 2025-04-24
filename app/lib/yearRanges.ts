import { endOfMonth, format } from "date-fns";

interface YearRange {
  key: string;
  start: Date;
  end: Date;
  label: string;
}

export default function getYearRanges(): YearRange[] {
  const currentYear = new Date().getFullYear();
  const yearRanges: YearRange[] = [];

  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(currentYear, month, 1);
    const monthEnd = endOfMonth(monthStart);
    const monthKey = format(monthStart, "MMM").toUpperCase();

    // Première période : du 1er au 14 (jusqu'à 23h59:59)
    const firstRange: YearRange = {
      key: `${monthKey}-01`,
      start: monthStart,
      end: new Date(currentYear, month, 14, 23, 59, 59),
      label: `${format(monthStart, "MMM")} (1ère période)`,
    };

    // Deuxième période : du 15 à la fin du mois
    const secondRange: YearRange = {
      key: `${monthKey}-02`,
      start: new Date(currentYear, month, 15),
      end: monthEnd,
      label: `${format(monthStart, "MMM")} (2ème période)`,
    };

    yearRanges.push(firstRange, secondRange);
  }

  return yearRanges;
}
