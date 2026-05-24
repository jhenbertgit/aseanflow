export const INDONESIAN_BANKS = [
  { code: "BCA", name: "Bank Central Asia (BCA)" },
  { code: "BNI", name: "Bank Negara Indonesia (BNI)" },
  { code: "BRI", name: "Bank Rakyat Indonesia (BRI)" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "PERMATA", name: "Bank Permata" },
  { code: "BSI", name: "Bank Syariah Indonesia" },
  { code: "CIMB", name: "CIMB Niaga" },
  { code: "DANAMON", name: "Bank Danamon" },
  { code: "MEGA", name: "Bank Mega" },
  { code: "PANIN", name: "Panin Bank" },
] as const;

export type IndonesianBankCode = (typeof INDONESIAN_BANKS)[number]["code"];