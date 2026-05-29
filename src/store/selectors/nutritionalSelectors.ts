import { createSelector } from '@reduxjs/toolkit';
import { IRootState } from '../index';

export const selectFila1 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(p =>
        (p.sev === 'cr' || p.sev === 'al') && (p.haval ?? 0) > 18
    )
);

export const selectFila2 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(p => (p.haval ?? 0) >= 12 && (p.haval ?? 0) <= 24)
);

export const selectFila5 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(p => p.d7 === true)
);
