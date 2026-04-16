
interface NrsDims {
  nut: number | null;
  doenca: number;
  idade: number;
}

interface MnDims {
  idade: number;
  apache: number;
  sofa: number;
  comor: number;
  dias: number;
}

export interface Campo1Display {
  protocolo: 'MNUTRIC' | 'NRS2002';
  mnutric_total: number | null;
  mn_dims: MnDims | null;
  mn_apache_manual: boolean;
  mn_sofa_manual: boolean;
  dados_incompletos: boolean;
  nrs_total: number;
  nrs_dims: NrsDims;
  nrs_completo: boolean;
  classificacao: 'cr' | 'al' | 'md' | 'bx' | null;
  calculado_at: string;
}

export interface Patient {
  id: number;
  leito: string;
  ala: string;
  protocolo: 'MNUTRIC' | 'NRS2002';
  campo1: Campo1Display;
  sev: 'cr' | 'al' | 'md' | 'bx' | null;
  pri: number;
  haval: number;
  d7: boolean;
  idade?: string;
  dataNasc?: string;
  sexo?: string;
}