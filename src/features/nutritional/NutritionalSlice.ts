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
  ack: boolean;
  sev?: SeverityType;
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

export interface LlmSummaryEntry {
  summary: string;
  generated_at: string;
  loading: boolean;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  timestamp: string;
  error?: boolean;
}

interface NutritionalState {
  patients: NutritionalPatient[];
  acknowledged: Record<number, AcknowledgedEntry>;
  loading: boolean;
  error: string | null;
  filtFila: string;
  alertsLoading: Record<number, boolean>;
  llmSummaries: Record<number, LlmSummaryEntry>;
  chatOpen: boolean;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
}


const initialState: NutritionalState = {
  patients: [],
  acknowledged: {},
  loading: false,
  error: null,
  filtFila: "",
  alertsLoading: {},
  llmSummaries: {},
  chatOpen: false,
  chatMessages: [],
  chatLoading: false,
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
    glim_fen: (raw.glim_fen ?? []).map((k: string) => FEN_FROM_BACKEND[k] ?? k),
    glim_etiol: (raw.glim_etiol ?? []).map((k: string) => ETIOL_FROM_BACKEND[k] ?? k),
    inst: (raw.inst ?? []).map((i: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      id: i.id ?? 0,
      t: i.t,
      d: i.d,
      ack: i.ack ?? false,
      sev: i.sev ?? undefined,
    })),
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

// ── LLM token cache (session-scoped, not persisted) ──────────────────────────
let _llmTokenCache: { token: string; expiresAt: number } | null = null;

async function getLlmToken(): Promise<string> {
  if (_llmTokenCache && Date.now() < _llmTokenCache.expiresAt - 60_000) {
    return _llmTokenCache.token;
  }
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id:     import.meta.env.VITE_APP_LLM_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_LLM_CLIENT_SECRET,
    scope:         import.meta.env.VITE_APP_LLM_SCOPE,
  });
  const resp = await fetch(import.meta.env.VITE_APP_LLM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!resp.ok) throw new Error("Falha ao obter token LLM.");
  const { access_token, expires_in } = await resp.json();
  _llmTokenCache = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}

function buildLlmPrompt(p: NutritionalPatient): string {
  const glimLabel: Record<string, string> = {
    nd: "sem desnutrição pelo GLIM",
    mod: "desnutrição moderada (GLIM)",
    grave: "desnutrição grave (GLIM)",
  };
  const instLines = p.inst.length > 0
    ? p.inst.map((i) => `  - ${i.d} (${i.t}, sev=${i.sev})`).join("\n")
    : "  - sem alertas ativos";
  const havalStr = p.haval >= 999 ? "sem avaliação registrada" : `${p.haval}h atrás`;
  const histLine = p.hist.length > 0
    ? `última conduta: "${p.hist[0].c}" (${p.hist[0].h})`
    : "sem conduta registrada";

  return `Você é um assistente de suporte clínico para nutricionistas hospitalares.
Gere um resumo clínico objetivo (máx. 4 frases) para o seguinte paciente:

- Idade: ${p.idade} anos | Ala: ${p.ala} | Internação: ${p.dias} dias
- Campo 1 — Risco: ${p.ala === "UTI" ? `mNUTRIC ${p.mnutric ?? "—"}/10` : ""} NRS-2002: ${p.nrs} | Classificação: ${p.sev ?? "sem classificação"}
- Campo 2 — GLIM: ${p.glim_diag ? glimLabel[p.glim_diag] : "diagnóstico pendente"} | Fenotípicos: ${p.glim_fen.join(", ") || "nenhum"} | Etiológicos: ${p.glim_etiol.join(", ") || "nenhum"}
- Campo 3 — Instabilidade:
${instLines}
- Última avaliação: ${havalStr}
- ${histLine}

Responda em português, de forma concisa, focando em achados relevantes e próximos passos clínicos.`;
}

export const fetchLlmSummary = createAsyncThunk(
  "nutritional/fetchLlmSummary",
  async (nratendimento: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { nutritional: { patients: NutritionalPatient[] } };
      const patient = state.nutritional.patients.find((p) => p.id === nratendimento);
      if (!patient) return rejectWithValue("Paciente não encontrado no estado.");

      const token = await getLlmToken();
      const prompt = buildLlmPrompt(patient);

      const resp = await fetch(
        `${import.meta.env.VITE_APP_LLM_BASE_URL}/llm/chat?model=${import.meta.env.VITE_APP_LLM_MODEL}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: prompt }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return rejectWithValue(err?.message ?? `Erro ${resp.status} ao gerar resumo.`);
      }
      const { response } = await resp.json();
      return { nratendimento, summary: response as string, generated_at: new Date().toISOString() };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Erro ao gerar resumo.");
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "nutritional/sendChatMessage",
  async (
    payload: { message: string; imageBase64?: string; imageFormat?: string; history: ChatMessage[] },
    { rejectWithValue }
  ) => {
    try {
      const token = await getLlmToken();
      const { message, imageBase64, imageFormat, history } = payload;

      // Build conversation context from history (last 10 turns)
      const recent = history.slice(-10);
      const contextStr = recent.length > 0
        ? recent.map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`).join("\n") + "\n\nUsuário: " + message
        : message;

      let resp: Response;
      if (imageBase64 && imageFormat) {
        resp = await fetch(
          `${import.meta.env.VITE_APP_LLM_BASE_URL}/llm/chat/image?model=${import.meta.env.VITE_APP_LLM_MODEL}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message: contextStr, imageBase64, imageFormat }),
          }
        );
      } else {
        resp = await fetch(
          `${import.meta.env.VITE_APP_LLM_BASE_URL}/llm/chat?model=${import.meta.env.VITE_APP_LLM_MODEL}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message: contextStr }),
          }
        );
      }

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return rejectWithValue((err as any)?.message ?? `Erro ${resp.status}`); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      const { response } = await resp.json();
      return { response: response as string };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Erro ao enviar mensagem.");
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
    clearLlmSummary(state, action: { payload: number }) {
      delete state.llmSummaries[action.payload];
    },
    openChat(state) { state.chatOpen = true; },
    closeChat(state) { state.chatOpen = false; },
    toggleChat(state) { state.chatOpen = !state.chatOpen; },
    addChatMessage(state, action: { payload: ChatMessage }) {
      state.chatMessages.push(action.payload);
    },
    clearChat(state) { state.chatMessages = []; },
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
      .addCase(sendChatMessage.pending, (state) => {
        state.chatLoading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          id: Date.now().toString(),
          role: "assistant",
          content: action.payload.response,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          id: Date.now().toString(),
          role: "assistant",
          content: (action.payload as string) ?? "Erro ao processar mensagem.",
          timestamp: new Date().toISOString(),
          error: true,
        });
      })
      .addCase(fetchLlmSummary.pending, (state, action) => {
        state.llmSummaries[action.meta.arg] = { summary: "", generated_at: "", loading: true, error: null };
      })
      .addCase(fetchLlmSummary.fulfilled, (state, action) => {
        const { nratendimento, summary, generated_at } = action.payload;
        state.llmSummaries[nratendimento] = { summary, generated_at, loading: false, error: null };
      })
      .addCase(fetchLlmSummary.rejected, (state, action) => {
        state.llmSummaries[action.meta.arg] = { summary: "", generated_at: "", loading: false, error: action.payload as string };
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
  markAlertAcknowledged,
  revertAlert,
  clearLlmSummary,
  openChat,
  closeChat,
  toggleChat,
  addChatMessage,
  clearChat,
  setFiltFila,
  reset,
} = nutritionalSlice.actions;
export default nutritionalSlice.reducer;
