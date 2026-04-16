import { SeverityType, AlaType, NutritionalPatient } from "./NutritionalSlice";

export const SEV_CONFIG: Record<
  SeverityType,
  { color: string; bg: string; border: string; label: string; leftBorder: string }
> = {
  cr: {
    color: "#7f0d1f",
    bg: "#f8e4e8",
    border: "#e06080",
    leftBorder: "#c41e3a",
    label: "Crítico",
  },
  al: {
    color: "#a32d2d",
    bg: "#fcebeb",
    border: "#f09595",
    leftBorder: "#e24b4a",
    label: "Alto",
  },
  md: {
    color: "#b7770d",
    bg: "#fdf3dc",
    border: "#fac775",
    leftBorder: "#d4931a",
    label: "Médio",
  },
  bx: {
    color: "#b05a10",
    bg: "#fef0e3",
    border: "#f5c39a",
    leftBorder: "#c0641a",
    label: "Baixo",
  },
};

export const ALA_CONFIG: Record<
  AlaType,
  { nome: string; color: string; total: number; protocol: string }
> = {
  UTI: { nome: "UTI Geral", color: "#7e57c2", total: 10, protocol: "mNUTRIC + NRS-2002" },
  B: { nome: "Ala B", color: "#4dd0e1", total: 14, protocol: "NRS-2002" },
  C: { nome: "Ala C", color: "#80cbc4", total: 10, protocol: "NRS-2002" },
};

export const EMPTY_BEDS: Record<AlaType, string[]> = {
  UTI: ["UTI-01", "UTI-02", "UTI-04", "UTI-05", "UTI-06", "UTI-08", "UTI-09", "UTI-10"],
  B: ["B-01", "B-02", "B-03", "B-05", "B-06", "B-07", "B-08", "B-10", "B-11", "B-13", "B-14"],
  C: ["C-02", "C-03", "C-04", "C-06", "C-07", "C-08", "C-09", "C-10"],
};

export const GLIM_LABEL: Record<string, string> = {
  nd: "Sem desnutrição",
  mod: "Desnutrição moderada",
  grave: "Desnutrição grave",
};

export const GLIM_FEN_LABEL: Record<string, string> = {
  perda_peso: "Perda de peso",
  baixo_imc: "Baixo IMC",
  massa_muscular: "↓ Massa muscular",
};

export const GLIM_ETIOL_LABEL: Record<string, string> = {
  reducao_ingestao: "Redução ingestão",
  doenca_inflamacao: "Doença/inflamação",
};

export function sevMNUTRIC(v: number): SeverityType {
  if (v >= 7) return "cr";
  if (v >= 5) return "al";
  if (v >= 3) return "md";
  return "bx";
}

export function sevNRS(v: number): SeverityType {
  if (v >= 5) return "cr";
  if (v >= 3) return "al";
  if (v >= 1) return "md";
  return "bx";
}

export function calcMbcd(p: Pick<NutritionalPatient, "ala" | "mnutric" | "nrs">): number {
  if (p.ala === "UTI" && p.mnutric !== null) {
    return Math.min(Math.max(Math.floor(p.mnutric / 2.5), 1), 4);
  }
  return p.nrs >= 5 ? 4 : p.nrs >= 3 ? 3 : p.nrs >= 1 ? 2 : 1;
}

export function getPatientScore(patient: Pick<NutritionalPatient, "ala" | "mnutric" | "nrs">): number {
  return patient.ala === "UTI"
    ? Math.max(patient.mnutric ?? 0, patient.nrs)
    : patient.nrs;
}

export function scoreColorMnutric(v: number): string {
  return SEV_CONFIG[sevMNUTRIC(v)].leftBorder;
}

export function scoreColorNrs(v: number): string {
  return SEV_CONFIG[sevNRS(v)].leftBorder;
}
