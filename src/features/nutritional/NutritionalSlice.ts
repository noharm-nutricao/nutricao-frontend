import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api, { instance, setHeaders } from "services/api";

export type AlaType = "UTI" | "B" | "C";
export type SeverityType = "cr" | "al" | "md" | "bx";
export type GlimDiag = "nd" | "mod" | "grave" | null;

export interface InstItem {
  id: number;
  t: "lab" | "clin" | "rx";
  d: string;
<<<<<<< Updated upstream
  ack: boolean;
=======
  id: number;
  reconhecido?: boolean;
>>>>>>> Stashed changes
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
  sev: SeverityType | null;
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
  dados_incompletos?: boolean;
  nrs_completo?: boolean;
  hist: HistEntry[];
}

export interface AcknowledgedEntry {
  hora: string;
  prof: string;
}

interface NutritionalState {
  patients: NutritionalPatient[];
  acknowledged: Record<number, AcknowledgedEntry>;
  loading: boolean;
  error: string | null;
  filtFila: string;
  alertsLoading: Record<number, boolean>;
}


const initialState: NutritionalState = {
  patients: [],
  acknowledged: {},
  loading: false,
  error: null,
  filtFila: "",
  alertsLoading: {},
};

const ALA_MAP: Record<string, AlaType> = {
  "UTI":        "UTI",
  "Ala B":      "B",
  "Ala C":      "C",
};

function normalizeAla(raw: string | null | undefined): AlaType {
  if (!raw) return "C";
  return ALA_MAP[raw] ?? (raw as AlaType);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeApiPatient(raw: any): NutritionalPatient {
  const c1 = raw.campo1 ?? {};
  return {
    id: raw.id,
    leito: raw.leito ?? "—",
    ala: normalizeAla(raw.nome_setor ?? raw.ala),
    nome: raw.nome ?? "",
    idade: raw.idade ?? 0,
    dias: raw.dias ?? 0,
    // Campo 1 — scores dentro de campo1 (null quando backend ainda não calculou)
    mnutric: c1.mnutric_total ?? c1.mnutric ?? null,
    nrs: c1.nrs_total ?? c1.nrs ?? 0,
    // sev null → card cinza (sem classificação calculada)
    sev: (raw.sev ?? null) as SeverityType | null,
    pri: raw.pri ?? 0,
    mn_dims: c1.mn_dims ?? null,
    nrs_dims: c1.nrs_dims ?? { nut: 0, doenca: 0, idade: 0 },
    apache: c1.apache ?? c1.mn_apache_manual ?? undefined,
    sofa: c1.sofa ?? c1.mn_sofa_manual ?? undefined,
    // Clínico
    dieta: raw.dieta ?? "",
    npo: raw.npo ?? 0,
    peso: raw.peso != null ? `${raw.peso} kg` : "",
    imc: raw.imc ?? null,
    // Acompanhamento
    haval: raw.haval ?? 999,
    glim_diag: raw.glim_diag ?? null,
<<<<<<< Updated upstream
    glim_fen: (raw.glim_fen ?? []).map((k: string) => FEN_FROM_BACKEND[k] ?? k),
    glim_etiol: (raw.glim_etiol ?? []).map((k: string) => ETIOL_FROM_BACKEND[k] ?? k),
    inst: (raw.inst ?? []).map((i: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      id: i.id ?? 0,
      t: i.t,
      d: i.d,
      ack: i.ack ?? false,
    })),
=======
    glim_fen: raw.glim_fen ?? [],
    glim_etiol: raw.glim_etiol ?? [],
    inst: (raw.inst ?? []).map((i: any, idx: number) => ({ ...i, id: i.id ?? idx, reconhecido: i.reconhecido ?? false })),
>>>>>>> Stashed changes
    conduta: raw.conduta ?? "",
    alergia: raw.alergia ?? null,
    alOk: raw.al_ok ?? raw.alOk ?? true,
    d7: raw.d7 ?? false,
    // campo1 é a fonte canônica para flags de completude
    dados_incompletos: c1.dados_incompletos ?? raw.dados_incompletos ?? false,
    nrs_completo: c1.nrs_completo ?? raw.nrs_completo,
    hist: raw.hist ?? [],
  };
}

export const fetchPatients = createAsyncThunk(
  "nutritional/fetchPatients",
  async (params: { setor?: number } = {}, thunkAPI) => {
    try {
      const response = await api.nutritional.getPatients(params);
      const payload = response.data;
      const rawList: any[] = Array.isArray(payload) ? payload : payload?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
      return rawList.map(normalizeApiPatient);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const status = axiosErr.response?.status;
      const msg =
        axiosErr.response?.data?.error ??
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        "Erro ao carregar pacientes";
      return thunkAPI.rejectWithValue(status ? `${status} — ${msg}` : msg);
    }
  }
);

export const saveMnutricManual = createAsyncThunk(
  "nutritional/saveMnutricManual",
  async (
    { id, apache_ii, sofa }: { id: number; apache_ii: number; sofa: number },
    thunkAPI
  ) => {
    try {
      const response = await api.nutritional.saveNrsNut(id, { apache_ii, sofa });
      const campo1 = response.data?.campo1 ?? response.data ?? {};
      return { id, campo1 };
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg =
        axiosErr.response?.data?.error ??
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        "Erro ao salvar APACHE/SOFA";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  "nutritional/fetchAlerts",
  async (patientId: number, thunkAPI) => {
    try {
      const response = await api.nutritional.getAlerts(patientId);
      const raw: any[] = Array.isArray(response.data) ? response.data : response.data?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
      return {
        patientId,
        alerts: raw.map((i: any) => ({ id: i.id ?? 0, t: i.t, d: i.d, ack: i.ack ?? false })), // eslint-disable-line @typescript-eslint/no-explicit-any
      };
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg = axiosErr.response?.data?.error ?? axiosErr.response?.data?.message ?? axiosErr.message ?? "Error loading alerts";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  "nutritional/acknowledgeAlert",
  async ({ patientId, alertId }: { patientId: number; alertId: number }, thunkAPI) => {
    try {
      await api.nutritional.acknowledgeAlert(patientId, alertId);
      return { patientId, alertId };
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg = axiosErr.response?.data?.error ?? axiosErr.response?.data?.message ?? axiosErr.message ?? "Error acknowledging alert";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const FEN_TO_BACKEND: Record<string, string> = {
  perda_peso: "perda_peso",
  baixo_imc: "imc_baixo",
  massa_muscular: "reducao_mm",
};

const ETIOL_TO_BACKEND: Record<string, string> = {
  reducao_ingestao: "ingestao_reduzida",
  doenca_inflamacao: "inflamacao_aguda",
};

const FEN_FROM_BACKEND: Record<string, string> = {
  perda_peso: "perda_peso",
  imc_baixo: "baixo_imc",
  reducao_mm: "massa_muscular",
};

const ETIOL_FROM_BACKEND: Record<string, string> = {
  ingestao_reduzida: "reducao_ingestao",
  inflamacao_aguda: "doenca_inflamacao",
  inflamacao_cronica: "doenca_inflamacao",
  inflamacao: "doenca_inflamacao",
  ma_absorcao: "reducao_ingestao",
};

export const saveGlimToServer = createAsyncThunk(
  "nutritional/saveGlimToServer",
  async (
    { id, glim_fen, glim_etiol, glim_diag, observacao }: {
      id: number;
      glim_fen: string[];
      glim_etiol: string[];
      glim_diag: GlimDiag;
      observacao?: string;
    },
    thunkAPI
  ) => {
    try {
      await instance.post(
        `/nutritional/patients/${id}/glim`,
        {
          diagnostico: glim_diag,
          fenotipos: glim_fen.map((k) => FEN_TO_BACKEND[k] ?? k),
          etiologias: glim_etiol.map((k) => ETIOL_TO_BACKEND[k] ?? k),
          observacao: observacao || undefined,
        },
        setHeaders(),
      );
      return { id, glim_fen, glim_etiol, glim_diag };
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg = axiosErr.response?.data?.error ?? axiosErr.response?.data?.message ?? axiosErr.message ?? "Erro ao salvar GLIM";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const saveAvalToServer = createAsyncThunk(
  "nutritional/saveAvalToServer",
  async (
    { id, conduta, freq, ing, kcal, prot }: {
      id: number;
      conduta: string;
      freq: string;
      ing: number;
      kcal?: number | null;
      prot?: number | null;
    },
    thunkAPI
  ) => {
    try {
      await instance.post(
        `/nutritional/patients/${id}/assessments`,
        {
          conduta,
          prox_visita: freq === "d7" ? "D7" : freq,
          ingestao: ing,
          meta_kcal: kcal ?? undefined,
          meta_prot: prot ?? undefined,
        },
        setHeaders(),
      );
      return { id, conduta, freq, ing };
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg = axiosErr.response?.data?.error ?? axiosErr.response?.data?.message ?? axiosErr.message ?? "Erro ao salvar avaliação";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

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
    markAlertAcknowledged(state, action: { payload: { patientId: number; alertId: number } }) {
      const { patientId, alertId } = action.payload;
      const patient = state.patients.find((p) => p.id === patientId);
      if (patient) {
        const alert = patient.inst.find((i) => i.id === alertId);
        if (alert) alert.ack = true;
      }
    },
    revertAlert(state, action: { payload: { patientId: number; alertId: number } }) {
      const { patientId, alertId } = action.payload;
      const patient = state.patients.find((p) => p.id === patientId);
      if (patient) {
        const alert = patient.inst.find((i) => i.id === alertId);
        if (alert) alert.ack = false;
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
    marcarAlertaReconhecido(state, action: { payload: { patientId: number; alertaId: number } }) {
      const { patientId, alertaId } = action.payload;
      const patient = state.patients.find((p) => p.id === patientId);
      if (patient) {
        const item = patient.inst.find((i) => i.id === alertaId);
        if (item) item.reconhecido = true;
      }
    },
    reverterAlerta(state, action: { payload: { patientId: number; alertaId: number } }) {
      const { patientId, alertaId } = action.payload;
      const patient = state.patients.find((p) => p.id === patientId);
      if (patient) {
        const item = patient.inst.find((i) => i.id === alertaId);
        if (item) item.reconhecido = false;
      }
    },
    setFiltFila(state, action: { payload: string }) {
      state.filtFila = action.payload;
    },
    reset() {
      return { ...initialState, acknowledged: {} };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? action.error.message ?? "Erro desconhecido";
      })
      .addCase(fetchAlerts.pending, (state, action) => {
        state.alertsLoading[action.meta.arg] = true;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        const { patientId, alerts } = action.payload;
        state.alertsLoading[patientId] = false;
        const patient = state.patients.find((p) => p.id === patientId);
        if (patient) patient.inst = alerts;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.alertsLoading[action.meta.arg] = false;
      })
      .addCase(saveMnutricManual.fulfilled, (state, action) => {
        const { id, campo1 } = action.payload;
        const patient = state.patients.find((p) => p.id === id);
        if (patient) {
          patient.dados_incompletos = false;
          patient.mnutric = campo1.mnutric_total ?? campo1.mnutric ?? patient.mnutric;
          patient.sev = campo1.classificacao ?? patient.sev;
          patient.mn_dims = campo1.mn_dims ?? patient.mn_dims;
          patient.nrs_completo = campo1.nrs_completo ?? patient.nrs_completo;
        }
      })
      .addCase(saveGlimToServer.fulfilled, (state, action) => {
        const { id, glim_fen, glim_etiol, glim_diag } = action.payload;
        const patient = state.patients.find((p) => p.id === id);
        if (patient) {
          patient.glim_fen = glim_fen;
          patient.glim_etiol = glim_etiol;
          patient.glim_diag = glim_diag;
        }
      })
      .addCase(saveAvalToServer.fulfilled, (state, action) => {
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
          patient.hist.unshift({ h: `${dd}/${mm} ${hh}:${min}`, p: "Nutr. Silva", c: conduta, freq, ing });
        }
      });
  },
});

export const {
  saveGlim,
  saveNrsNut,
  saveAval,
  confirmAllergy,
  acknowledgePatient,
<<<<<<< Updated upstream
  markAlertAcknowledged,
  revertAlert,
=======
  marcarAlertaReconhecido,
  reverterAlerta,
>>>>>>> Stashed changes
  setFiltFila,
  reset,
} = nutritionalSlice.actions;
export default nutritionalSlice.reducer;
