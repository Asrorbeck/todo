export const EXPENSE_CATEGORIES = [
  { value: "transport", label: "Transport" },
  { value: "oilaga", label: "Oilaga" },
  { value: "ozimga", label: "O'zimga" },
  { value: "qarzlarga", label: "Qarzlarga" },
  { value: "kommunallarga", label: "Kommunallarga" },
  { value: "tibbiy", label: "Tibbiy" },
  { value: "taom", label: "Taom" },
  { value: "kiyim", label: "Kiyim" },
  { value: "oqi", label: "O'qi" },
  { value: "xonadon", label: "Xonadon" },
  { value: "internet", label: "Internet va Telefon" },
  { value: "sport", label: "Sport" },
  { value: "hordiq", label: "Hordiq va Ko'ngil ochar" },
  { value: "boshqa", label: "Boshqa" },
];

export const INCOME_CATEGORIES = [
  { value: "ish", label: "Ishdan" },
  { value: "biznes", label: "Biznes" },
  { value: "investitsiya", label: "Investitsiya" },
  { value: "sovg", label: "Sovg'a" },
  { value: "boshqa", label: "Boshqa" },
];

export function getCategoryLabel(value: string): string {
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  return allCategories.find((cat) => cat.value === value)?.label || value;
}

