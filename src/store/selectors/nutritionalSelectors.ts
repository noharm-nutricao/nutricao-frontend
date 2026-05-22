import { createSelector } from '@reduxjs/toolkit';
import { IRootState } from '../index';
import { isFila1, isFila2, isFila3, isFila4, isFila5 } from 'features/nutritional/nutritionalUtils';

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
);

export const selectFila5 = createSelector(
    (s: IRootState) => s.nutritional.patients,
    (patients) => patients.filter(isFila5)
);
