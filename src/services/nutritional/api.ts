import { instance, setHeaders } from '../api';

export interface NrsNutPayload {
  apache_ii: number; // APACHE II (0-71) -- ICU only
  sofa: number; // SOFA (0-24) -- ICU only
};

export interface GlimPayload {
  diagnostico: 'nd' | 'mod' | 'grave';
  fenotipos: string[];
  etiologias: string[];
};

// Field names match backend REST contract (PT) -- do not rename
export interface AssessmentPayload {
  conduta: string;
  prox_visita: '24h' | '48h' | 'semanal' | 'D7' | 'rotina'; // Changed from 'frequencia' to match backend model
  ingestao?: number;
  meta_kcal?: number;
  meta_prot?: number;
};

const nutritional = {
  getPatients: (params?: { setor?: number; ala?: string }) =>
    instance.get('/nutritional/patients', {
      params,
      ...setHeaders(),
    }),

  saveNrsNut: (patientId: number, data: NrsNutPayload) =>
    instance.put(
      `/patients/${patientId}/nrs-nut`,
      data,
      setHeaders(),
    ),

  saveGlim: (patientId: number, data: GlimPayload) =>
    instance.put(
      `/patients/${patientId}/glim`,
      data,
      setHeaders(),
    ),

  postAssessment: (patientId: number, data: AssessmentPayload) =>
    instance.post(
      `/nutritional/patients/${patientId}/assessments`,
      data,
      setHeaders(),
    ),

  getAssessmentHistory: (patientId: number) =>
    instance.get(
      `/nutritional/patients/${patientId}/assessments`,
      setHeaders(),
    ),

  acknowledgePatient: (patientId: number) =>
    instance.post(
      `/patients/${patientId}/acknowledge`,
      {},
      setHeaders(),
    ),
};

const api = { nutritional };

export default api;
