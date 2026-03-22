import { createSlice } from "@reduxjs/toolkit";

export type AlaType = "UTI" | "B" | "C";
export type SeverityType = "cr" | "al" | "md" | "bx";
export type GlimDiag = "nd" | "mod" | "grave" | null;

export interface InstItem {
  t: "lab" | "clin" | "rx";
  d: string;
}

export interface HistEntry {
  h: string;       // "DD/MM HH:MM"
  p: string;       // professional name
  c: string;       // conduta text
  freq: string;    // visit frequency
  ing: number | null; // ingestion %
}

export interface NutritionalPatient {
  id: number;
  leito: string;
  ala: AlaType;
  nome: string;
  idade: number;
  dias: number;
  mnutric: number | null;
  nrs: number;
  sev: SeverityType;
  pri: number;
  mn_dims?: {
    idade: number;
    apache: number;
    sofa: number;
    comor: number;
    dias: number;
  };
  nrs_dims: { nut: number; doenca: number; idade: number };
  apache?: number;
  sofa?: number;
  dieta: string;
  npo: number;
  peso: string;
  imc: number | null;
  haval: number;
  glim_diag: GlimDiag;
  glim_fen: string[];
  glim_etiol: string[];
  inst: InstItem[];
  conduta: string;
  alergia: string | null;
  alOk: boolean;
  d7: boolean;
  hist: HistEntry[];
}

export interface AcknowledgedEntry {
  hora: string;
  prof: string;
}

interface NutritionalState {
  patients: NutritionalPatient[];
  acknowledged: Record<number, AcknowledgedEntry>;
}

const MOCK_PATIENTS: NutritionalPatient[] = [
  {
    id: 1,
    leito: "UTI-03",
    ala: "UTI",
    nome: "Paciente 1",
    idade: 67,
    dias: 14,
    mnutric: 9,
    nrs: 5,
    sev: "cr",
    pri: 1,
    mn_dims: { idade: 2, apache: 3, sofa: 3, comor: 1, dias: 0 },
    nrs_dims: { nut: 3, doenca: 1, idade: 1 },
    dieta: "NPO > 52h",
    npo: 52,
    peso: "58kg",
    imc: 17.2,
    haval: 38,
    glim_diag: "grave",
    glim_fen: ["perda_peso", "baixo_imc"],
    glim_etiol: ["doenca_inflamacao", "reducao_ingestao"],
    inst: [
      { t: "lab", d: "Albumina 1,8 g/dL" },
      { t: "lab", d: "Hb 8,4 g/dL" },
      { t: "lab", d: "Fósforo baixo" },
      { t: "clin", d: "NPO 52h" },
    ],
    conduta: "TN parenteral urgente",
    alergia: null,
    alOk: true,
    d7: true,
    hist: [
      {
        h: "12/03 08:14",
        p: "Nutr. Silva",
        c: "Iniciado NPT. Meta 1800 kcal, 100g proteína.",
        freq: "24h",
        ing: 0,
      },
    ],
  },
  {
    id: 2,
    leito: "UTI-07",
    ala: "UTI",
    nome: "Paciente 2",
    idade: 54,
    dias: 8,
    mnutric: 7,
    nrs: 4,
    sev: "cr",
    pri: 2,
    mn_dims: { idade: 1, apache: 3, sofa: 2, comor: 1, dias: 0 },
    nrs_dims: { nut: 2, doenca: 2, idade: 0 },
    dieta: "Enteral contínua",
    npo: 0,
    peso: "62kg",
    imc: 19.8,
    haval: 29,
    glim_diag: "mod",
    glim_fen: ["perda_peso"],
    glim_etiol: ["doenca_inflamacao"],
    inst: [
      { t: "lab", d: "Albumina 2,3 g/dL" },
      { t: "lab", d: "PCR elevado" },
    ],
    conduta: "Revisar protocolo enteral",
    alergia: null,
    alOk: true,
    d7: false,
    hist: [
      {
        h: "14/03 10:22",
        p: "Nutr. Santos",
        c: "Ajustado volume enteral 60mL/h.",
        freq: "48h",
        ing: 65,
      },
    ],
  },
  {
    id: 3,
    leito: "B-12",
    ala: "B",
    nome: "Paciente 3",
    idade: 71,
    dias: 5,
    mnutric: null,
    nrs: 5,
    sev: "al",
    pri: 3,
    nrs_dims: { nut: 3, doenca: 1, idade: 1 },
    dieta: "VO parcial",
    npo: 0,
    peso: "71kg",
    imc: 20.4,
    haval: 25,
    glim_diag: "mod",
    glim_fen: ["perda_peso"],
    glim_etiol: ["reducao_ingestao"],
    inst: [
      { t: "lab", d: "Hb 9,2 g/dL" },
      { t: "clin", d: "Perda 6% peso" },
    ],
    conduta: "Suporte nutricional oral",
    alergia: "Frutos do mar",
    alOk: false,
    d7: true,
    hist: [],
  },
  {
    id: 4,
    leito: "B-04",
    ala: "B",
    nome: "Paciente 4",
    idade: 48,
    dias: 3,
    mnutric: null,
    nrs: 3,
    sev: "al",
    pri: 4,
    nrs_dims: { nut: 2, doenca: 1, idade: 0 },
    dieta: "VO livre",
    npo: 0,
    peso: "68kg",
    imc: 22.1,
    haval: 27,
    glim_diag: null,
    glim_fen: [],
    glim_etiol: [],
    inst: [{ t: "lab", d: "Albumina 2,9 g/dL" }],
    conduta: "Aguarda avaliação GLIM",
    alergia: null,
    alOk: true,
    d7: false,
    hist: [],
  },
  {
    id: 5,
    leito: "C-05",
    ala: "C",
    nome: "Paciente 5",
    idade: 55,
    dias: 9,
    mnutric: null,
    nrs: 4,
    sev: "al",
    pri: 5,
    nrs_dims: { nut: 2, doenca: 2, idade: 0 },
    dieta: "NPT em uso",
    npo: 0,
    peso: "55kg",
    imc: 18.5,
    haval: 18,
    glim_diag: "grave",
    glim_fen: ["perda_peso", "baixo_imc", "massa_muscular"],
    glim_etiol: ["reducao_ingestao", "doenca_inflamacao"],
    inst: [
      { t: "lab", d: "Fósforo 2,1 mg/dL" },
      { t: "lab", d: "Magnésio baixo" },
      { t: "rx", d: "NPT em uso" },
    ],
    conduta: "Corrigir eletrólitos – risco realimentação",
    alergia: null,
    alOk: true,
    d7: true,
    hist: [
      {
        h: "15/03 14:10",
        p: "Nutr. Silva",
        c: "Risco de síndrome de realimentação. Repor fósforo EV.",
        freq: "24h",
        ing: null,
      },
    ],
  },
  {
    id: 6,
    leito: "B-09",
    ala: "B",
    nome: "Paciente 6",
    idade: 60,
    dias: 6,
    mnutric: null,
    nrs: 3,
    sev: "md",
    pri: 6,
    nrs_dims: { nut: 1, doenca: 2, idade: 0 },
    dieta: "Enteral noturna",
    npo: 0,
    peso: "88kg",
    imc: 26.3,
    haval: 14,
    glim_diag: "nd",
    glim_fen: [],
    glim_etiol: [],
    inst: [{ t: "rx", d: "Troca de fórmula enteral" }],
    conduta: "Ajuste fórmula",
    alergia: null,
    alOk: true,
    d7: false,
    hist: [],
  },
  {
    id: 7,
    leito: "C-01",
    ala: "C",
    nome: "Paciente 7",
    idade: 38,
    dias: 2,
    mnutric: null,
    nrs: 1,
    sev: "bx",
    pri: 7,
    nrs_dims: { nut: 0, doenca: 1, idade: 0 },
    dieta: "VO livre",
    npo: 0,
    peso: "61kg",
    imc: 23.0,
    haval: 10,
    glim_diag: "nd",
    glim_fen: [],
    glim_etiol: [],
    inst: [{ t: "clin", d: "Alergia sem confirmação" }],
    conduta: "Dieta sem lactose",
    alergia: "Lactose",
    alOk: false,
    d7: false,
    hist: [],
  },
];

const initialState: NutritionalState = {
  patients: MOCK_PATIENTS,
  acknowledged: {},
};

const nutritionalSlice = createSlice({
  name: "nutritional",
  initialState,
  reducers: {
    acknowledgePatient(
      state,
      action: { payload: { id: number; hora: string; prof: string } }
    ) {
      const { id, hora, prof } = action.payload;
      state.acknowledged[id] = { hora, prof };
    },
    saveGlim(
      state,
      action: {
        payload: {
          id: number;
          glim_fen: string[];
          glim_etiol: string[];
          glim_diag: GlimDiag;
        };
      }
    ) {
      const { id, glim_fen, glim_etiol, glim_diag } = action.payload;
      const patient = state.patients.find((p) => p.id === id);
      if (patient) {
        patient.glim_fen = glim_fen;
        patient.glim_etiol = glim_etiol;
        patient.glim_diag = glim_diag;
      }
    },
    saveNrsNut(
      state,
      action: { payload: { id: number; nut: number } }
    ) {
      const { id, nut } = action.payload;
      const patient = state.patients.find((p) => p.id === id);
      if (patient) {
        patient.nrs_dims.nut = nut;
        patient.nrs =
          nut + patient.nrs_dims.doenca + (patient.idade >= 70 ? 1 : 0);
      }
    },
    saveAval(
      state,
      action: {
        payload: { id: number; conduta: string; freq: string; ing: number };
      }
    ) {
      const { id, conduta, freq, ing } = action.payload;
      const patient = state.patients.find((p) => p.id === id);
      if (patient) {
        patient.haval = 0;
        patient.conduta = conduta;
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        patient.hist.unshift({
          h: `${dd}/${mm} ${hh}:${min}`,
          p: "Nutr. Silva",
          c: conduta,
          freq,
          ing,
        });
      }
    },
    confirmAllergy(state, action: { payload: { id: number } }) {
      const { id } = action.payload;
      const patient = state.patients.find((p) => p.id === id);
      if (patient) {
        patient.alOk = true;
        patient.inst = patient.inst.filter((i) => !i.d.includes("Alergia"));
      }
    },
    reset() {
      return { ...initialState, acknowledged: {} };
    },
  },
});

export const {
  saveGlim,
  saveNrsNut,
  saveAval,
  confirmAllergy,
  acknowledgePatient,
  reset,
} = nutritionalSlice.actions;
export default nutritionalSlice.reducer;
