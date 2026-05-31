import { createSelector } from '@reduxjs/toolkit';
import type { IRootState } from '../index.ts';

export function isFila2Eligible(patient: { haval: number | null; freq_horas: number | null }): boolean {
    if (patient.haval === null || patient.haval === 0) return false;

    if (patient.freq_horas != null) {
        return patient.haval >= patient.freq_horas * 0.8;
    }

    return patient.haval >= 12 && patient.haval <= 24;
}

export const selectFila1 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(p =>
        (p.sev === 'cr' || p.sev === 'al') && (p.haval ?? 0) > 18
    )
);

export const selectFila2 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(isFila2Eligible)
);

export const selectFila5 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(p => p.d7 === true)
);
