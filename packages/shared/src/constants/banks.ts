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

export const PHILIPPINE_BANKS = [
  { code: "BDO", name: "Banco de Oro (BDO)" },
  { code: "BPI", name: "Bank of the Philippine Islands (BPI)" },
  { code: "METROBANK", name: "Metropolitan Bank & Trust (Metrobank)" },
  { code: "PNB", name: "Philippine National Bank (PNB)" },
  { code: "SECURITYBANK", name: "Security Bank Corporation" },
  { code: "UNIONBANK", name: "Union Bank of the Philippines" },
  { code: "CHINABANK", name: "Chinabank" },
  { code: "RCBC", name: "Rizal Commercial Banking (RCBC)" },
  { code: "MAYBANK", name: "Maybank Philippines" },
  { code: "AUB", name: "Asia United Bank (AUB)" },
] as const;

export type IndonesianBankCode = (typeof INDONESIAN_BANKS)[number]["code"];
export type PhilippineBankCode = (typeof PHILIPPINE_BANKS)[number]["code"];