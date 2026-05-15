import apiModule, { instance, setHeaders } from '../api';


interface NutritionalAPI {
  getPatients: (params?: { setor?: number; ala?: string }) => any;
  saveNrsNut: (nratendimento: number, data: NrsNutPayload) => any;
  saveGlim: (nratendimento: number, data: GlimPayload) => any;
  saveAval: (nratendimento: number, data: AvalPayload) => any;
  acknowledgePatient: (nratendimento: number) => any;
  getAlerts: (nratendimento: number) => any;
  acknowledgeAlert: (nratendimento: number, alertId: number) => any;
};


type API = typeof apiModule & {
  nutritional: NutritionalAPI;
};


const api = apiModule as API;


/**
 * Retrieves a list of patients with nutritional scores (Campo 1) calculated by the backend.
 * @param params - Optional filtering parameters:
 *   - setor: Sector ID for filtering
 *   - ala: Wing/ward identifier for filtering
 * @returns Promise with the list of patients and their nutritional scores
 */
api.nutritional.getPatients = (params?: { setor?: number; ala?: string }) =>
  instance.get('/nutritional/patients', {
    params,
    ...setHeaders(),
  });


/**
 * Saves manual APACHE II and SOFA scores for ICU patients.
 * Triggers immediate recalculation of mNUTRIC and returns updated Campo 1.
 * Note: Component A of NRS-2002 is calculated automatically and not sent here.
 * @param nratendimento - Patient admission number
 * @param data - Payload with APACHE II (0-71) and SOFA (0-24) scores for ICU patients
 * @returns Promise with updated nutritional assessment
 */
api.nutritional.saveNrsNut = (nratendimento: number, data: NrsNutPayload) =>
  instance.put(
    `/nutritional/patients/${nratendimento}/nrs-nut`,
    data,
    setHeaders(),
  );

/**
 * Saves GLIM (Global Leadership Initiative on Malnutrition) diagnosis.
 * Stores phenotypes and etiologies of malnutrition for the patient.
 * @param nratendimento - Patient admission number
 * @param data - Payload with diagnosis level ('nd'=non-disease, 'mod'=moderate, 'grave'=severe), phenotypes, and etiologies
 * @returns Promise with saved GLIM diagnosis
 */
api.nutritional.saveGlim = (nratendimento: number, data: GlimPayload) =>
  instance.put(
    `/nutritional/patients/${nratendimento}/glim`,
    data,
    setHeaders(),
  );


/**
 * Records the nutritional assessment and feeding protocol for the patient.
 * Stores clinical conduct, monitoring frequency, and nutritional goals.
 * @param nratendimento - Patient admission number
 * @param data - Payload with conduct protocol, monitoring frequency (12h/24h/48h/7d/routine), and optional intake/caloric/protein goals
 * @returns Promise with saved assessment
 */
api.nutritional.saveAval = (nratendimento: number, data: AvalPayload) =>
  instance.post(
    `/nutritional/patients/${nratendimento}/assessments`,
    data,
    setHeaders(),
  );


/**
 * Acknowledges/dismisses a nutritional alert for the patient.
 * Marks that a healthcare provider has reviewed and acknowledged the alert.
 * @param nratendimento - Patient admission number
 * @returns Promise with acknowledgment confirmation
 */
api.nutritional.acknowledgePatient = (nratendimento: number) =>
  instance.post(
    `/nutritional/patients/${nratendimento}/acknowledge`,
    {},
    setHeaders(),
  );


// Tipos
export interface NrsNutPayload {
  apache_ii: number; // APACHE II (0-71) -- apenas UTI
  sofa: number; // SOFA (0-24) -- apenas UTI
  // nrs_nut NAO existe: componente A e automatico via nutricional_nrs (hospital)
};

export interface GlimPayload {
  diagnostico: 'nd' | 'mod' | 'grave';
  fenotipos: string[];
  etiologias: string[];
};

export interface AvalPayload {
  conduta: string;
  frequencia: '12h' | '24h' | '48h' | '7d' | 'rotina';
  ingestao?: number;
  meta_kcal?: number;
  meta_prot?: number;
};


api.nutritional.getAlerts = (nratendimento: number) =>
  instance.get(`/nutritional/patients/${nratendimento}/alerts`, setHeaders());

api.nutritional.acknowledgeAlert = (nratendimento: number, alertId: number) =>
  instance.post(
    `/nutritional/patients/${nratendimento}/alerts/${alertId}/acknowledge`,
    {},
    setHeaders(),
  );


export default api;
