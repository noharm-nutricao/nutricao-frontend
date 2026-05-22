import { SeverityType, AlaType, NutritionalPatient } from "./NutritionalSlice";

export const REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutos

export const SEV_CONFIG: Record<
  SeverityType,
  { color: string; bg: string; border: string; label: string; leftBorder: string }
> = {
  cr: {
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fca5a5",
    leftBorder: "#ef4444",
    label: "Crítico",
  },
  al: {
    color: "#9a3412",
    bg: "#fff7ed",
    border: "#fdba74",
    leftBorder: "#f97316",
    label: "Alto",
  },
  md: {
    color: "#854d0e",
    bg: "#fefce8",
    border: "#fde047",
    leftBorder: "#eab308",
    label: "Médio",
  },
  bx: {
    color: "#166534",
    bg: "#f0fdf4",
    border: "#86efac",
    leftBorder: "#22c55e",
    label: "Baixo",
  },
};

export const ALA_ORDER: AlaType[] = ["UTI", "B", "C"];

export const ALA_COLORS: Record<AlaType, string> = {
  UTI: "#7e57c2",
  B: "#4dd0e1",
  C: "#80cbc4",
};

export const ALA_CONFIG: Record<
  AlaType,
  { nome: string; color: string; total: number; protocol: string }
> = {
  UTI: { nome: "UTI Geral", color: "#7e57c2", total: 10, protocol: "mNUTRIC + NRS-2002" },
  B:   { nome: "Ala B",    color: "#4dd0e1", total: 14, protocol: "NRS-2002" },
  C:   { nome: "Ala C",    color: "#80cbc4", total: 10, protocol: "NRS-2002" },
};

export const EMPTY_BEDS: Record<AlaType, string[]> = {
  UTI: ["UTI-01", "UTI-02", "UTI-04", "UTI-05", "UTI-06", "UTI-08", "UTI-09", "UTI-10"],
  B:   ["B-01", "B-02", "B-03", "B-05", "B-06", "B-07", "B-08", "B-10", "B-11", "B-13", "B-14"],
  C:   ["C-02", "C-03", "C-04", "C-06", "C-07", "C-08", "C-09", "C-10"],
};

export const FILA_BTNS = [
  { key: "FILA1", label: "Alta Prioridade", color: "#7e57c2" },
  { key: "FILA2", label: "Avaliar 24h",     color: "#7e57c2" },
  { key: "FILA3", label: "Alerta Crítico",  color: "#c41e3a" },
  { key: "FILA4", label: "Desnut. Grave",   color: "#7f0d1f" },
  { key: "FILA5", label: "D7 pendente",     color: "#7e57c2" },
];

export const RISCO_BTNS = [
  { key: "cr", label: "Crítico", color: "#c41e3a" },
  { key: "al", label: "Alto", color: "#e24b4a" },
  { key: "md", label: "Médio", color: "#d4931a" },
  { key: "bx", label: "Baixo", color: "#c0641a" },
];

export const GLIM_LABEL: Record<string, string> = {
  nd: "Sem desnutrição",
  mod: "Desnutrição moderada",
  grave: "Desnutrição grave",
};

export const GLIM_FEN_LABEL: Record<string, string> = {
  perda_peso:          "Perda de peso",
  baixo_imc:           "Baixo IMC",
  massa_muscular:      "↓ Massa muscular",
  massa_muscular_baixa:"↓ Massa muscular",  // chave retornada pela API
};

export const GLIM_ETIOL_LABEL: Record<string, string> = {
  reducao_ingestao: "Redução ingestão",
  doenca_inflamacao:"Doença/inflamação",
  inflamacao:       "Inflamação",           // chave retornada pela API
  doenca_cronica:   "Doença crônica",       // chave retornada pela API
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
  if (p.ala === "UTI" && p.mnutric != null) {
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
