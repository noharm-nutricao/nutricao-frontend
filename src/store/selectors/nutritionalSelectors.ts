import { createSelector } from '@reduxjs/toolkit';
import type { IRootState } from '../index.ts';
import { isFila1, isFila2, isFila3, isFila4, isFila5 } from 'features/nutritional/nutritionalUtils';

export function isFila2Eligible(patient: { haval: number | null; freq_horas: number | null }): boolean {
    if (patient.haval === null || patient.haval === 0) return false;

    if (patient.freq_horas != null) {
        return patient.haval >= patient.freq_horas * 0.8;
    }

    return patient.haval >= 12 && patient.haval <= 24;
}

export const selectFila1 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(isFila1)
);

export const selectFila2 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(isFila2)
);

export const selectFila3 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(isFila3)
);

export const selectFila4 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(isFila4)
    (patients) => patients.filter(isFila2Eligible)
);

export const selectFila5 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(isFila5)
);
