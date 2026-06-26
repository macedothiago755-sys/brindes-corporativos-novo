/**
 * Métodos de personalização aceitos e operados pela Paint Colors Company.
 * Fonte única de verdade — usado no schema (enum CustomizationMethod), nos
 * formulários do site e nas telas do admin.
 */
export const CUSTOMIZATION_METHODS = ["GRAVACAO_LASER", "SILK_SCREEN", "DIGITAL_UV", "TRANSFER"] as const;

export type CustomizationMethodValue = (typeof CUSTOMIZATION_METHODS)[number];

export const CUSTOMIZATION_METHOD_LABELS: Record<CustomizationMethodValue, string> = {
  GRAVACAO_LASER: "Gravação a laser",
  SILK_SCREEN: "Silk screen",
  DIGITAL_UV: "Digital UV",
  TRANSFER: "Transfer",
};

export const CUSTOMIZATION_METHOD_OPTIONS = CUSTOMIZATION_METHODS.map((value) => ({
  value,
  label: CUSTOMIZATION_METHOD_LABELS[value],
}));

// Métodos que simulam gravação monocromática (sem reproduzir a cor da arte).
export const MONOCHROME_CUSTOMIZATION_METHODS = new Set<CustomizationMethodValue>(["GRAVACAO_LASER"]);
