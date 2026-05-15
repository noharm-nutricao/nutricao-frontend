import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "services/nutritional/api";

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
  meta_kcal?: number;
  meta_prot?: number;
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
}


const initialState: NutritionalState = {
  patients: [],
  acknowledged: {},
  loading: false,
  error: null,
  filtFila: "",
};

export const fetchPatients = createAsyncThunk(
  "nutritional/fetchPatients",
  async (params: { setor?: number } = {}, thunkAPI) => {
    try {
      const response = await api.nutritional.getPatients(params);
      const payload = response.data;
      const rawList = Array.isArray(payload) ? payload : payload?.data ?? [];
      return rawList.map((p: any) => {
        let nrs = 0;
        let mnutric = null;
        let nrs_dims = { nut: 0, doenca: 0, idade: 0 };
        let mn_dims = undefined;
        let dados_incompletos = false;
        
        if (p.campo1) {
          nrs = p.campo1.nrs_total ?? 0;
          if (p.campo1.nrs_dims) nrs_dims = p.campo1.nrs_dims;
          if (p.campo1.mnutric_total !== undefined) mnutric = p.campo1.mnutric_total;
          if (p.campo1.mn_dims) mn_dims = p.campo1.mn_dims;
          if (p.campo1.dados_incompletos) dados_incompletos = true;
        }

        let ala = p.ala;
        if (ala === "Segmento Adulto") ala = "UTI";
        else if (ala === "Segmento Infantil") ala = "B";
        else if (!["UTI", "B", "C"].includes(ala)) ala = "C";

        return {
          ...p,
          ala,
          nome: p.nome || `Paciente ${p.id}`,
          nrs,
          mnutric,
          nrs_dims,
          mn_dims,
          dados_incompletos,
          hist: p.hist || [],
          inst: p.inst || [],
          leito: p.leito || `L${p.id}`,
        };
      }) as NutritionalPatient[];
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

export const fetchAssessmentHistory = createAsyncThunk(
  "nutritional/fetchAssessmentHistory",
  async (patientId: number, thunkAPI) => {
    try {
      const response = await api.nutritional.getAssessmentHistory(patientId);
      return { id: patientId, history: response.data.data || response.data };
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg = axiosErr.response?.data?.error ?? axiosErr.message ?? "Failed to load assessments";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const saveAssessment = createAsyncThunk(
  "nutritional/saveAssessment",
  async (payload: { id: number; data: import('services/nutritional/api').AssessmentPayload }, thunkAPI) => {
    try {
      const response = await api.nutritional.postAssessment(payload.id, payload.data);
      return { id: payload.id, response: response.data, submittedData: payload.data };
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg = axiosErr.response?.data?.error ?? axiosErr.message ?? "Failed to save assessment";
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
    confirmAllergy(state, action: { payload: { id: number } }) {
      const { id } = action.payload;
      const patient = state.patients.find((p) => p.id === id);
      if (patient) {
        patient.alOk = true;
        patient.inst = patient.inst.filter((i) => !i.d.includes("Alergia"));
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
      .addCase(fetchAssessmentHistory.fulfilled, (state, action) => {
        const patient = state.patients.find((p) => p.id === action.payload.id);
        if (patient) {
          // Transforma formato da API para formato do hist do frontend
          patient.hist = (action.payload.history || []).map((item: any) => {
            // Se já tem os campos do frontend (h, c, freq), retorna direto
            if (item.h && item.c) return item;
            // Senão, transforma do formato da API
            const dt = item.created_at ? new Date(item.created_at) : new Date();
            const dd = String(dt.getDate()).padStart(2, "0");
            const mm = String(dt.getMonth() + 1).padStart(2, "0");
            const hh = String(dt.getHours()).padStart(2, "0");
            const min = String(dt.getMinutes()).padStart(2, "0");
            return {
              h: `${dd}/${mm} ${hh}:${min}`,
              p: item.prof || item.p || "Nutricionista",
              c: item.conduta || item.c || "",
              freq: item.prox_visita || item.frequencia || item.freq || "",
              ing: item.ingestao ?? item.ing ?? null,
              meta_kcal: item.meta_kcal || null,
              meta_prot: item.meta_prot || null,
            };
          });
        }
      })
      .addCase(saveAssessment.fulfilled, (state, action) => {
        const { id, submittedData } = action.payload;
        const patient = state.patients.find((p) => p.id === id);
        if (patient) {
          patient.haval = 0;
          patient.conduta = submittedData.conduta;
          const now = new Date();
          const dd = String(now.getDate()).padStart(2, "0");
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const hh = String(now.getHours()).padStart(2, "0");
          const min = String(now.getMinutes()).padStart(2, "0");
          patient.hist.unshift({
            h: `${dd}/${mm} ${hh}:${min}`,
            p: "You",
            c: submittedData.conduta,
            freq: submittedData.prox_visita || submittedData.frequencia,
            ing: submittedData.ingestao || null,
            meta_kcal: submittedData.meta_kcal,
            meta_prot: submittedData.meta_prot,
          });
        }
      });
  },
});

export const {
  saveGlim,
  saveNrsNut,
  confirmAllergy,
  acknowledgePatient,
  setFiltFila,
  reset,
} = nutritionalSlice.actions;
export default nutritionalSlice.reducer;
