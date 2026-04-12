/**
 * Seletores Redux para filtragem de filas de prioridade nutricional.
 * selectFila1: pacientes críticos/altos com avaliação atrasada (>18h).
 * selectFila5: pacientes com flag D7 ativa.
 * Issue #33 – US-FE-06
 */
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
