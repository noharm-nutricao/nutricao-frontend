import { createSelector } from '@reduxjs/toolkit';
import { IRootState } from '../index';

export const selectFila1 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(p =>
        (p.sev === 'cr' || p.sev === 'al') && (p.haval ?? 0) > 18
    )
);

export const selectFila5 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(p => p.d7 === true)
);
