import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as nutritionalApi from 'services/nutritional/api';
import {NrsNutPayload} from "services/nutritional/api.ts";

export const fetchPatients = createAsyncThunk(
    'nutritional/fetchPatients',
    async (params?: { setor?: number; ala?: string }) => {
        const res = await nutritionalApi.default.nutritional.getPatients(params);
        return res.data.data;
    }
);

export const saveNrsNut = createAsyncThunk(
    'nutritional/saveNrsNut',
    async ({ id, payload }: { id: number; payload: NrsNutPayload }) => {
        // payload contem apenas apache_ii e sofa -- nrs_nut e automatico
        const res = await nutritionalApi.default.nutritional.saveNrsNut(id, payload);
        return { id, campo1: res.data.campo1 };
    }
);

interface NutritionalState {
    patients: any[];
    loading:  boolean;
    error:    string | null;
}

const nutritionalSlice = createSlice({
    name: 'nutritional',
    initialState: { patients: [], loading: false, error: null } as NutritionalState,
    reducers: {
        updatePatientCampo1(state, action) {
            const p = state.patients.find(p => p.id === action.payload.id);
            if (p) p.campo1 = action.payload.campo1;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPatients.pending,   s => { s.loading = true; s.error = null; })
            .addCase(fetchPatients.fulfilled, (s, a) => { s.loading = false; s.patients = a.payload; })
            .addCase(fetchPatients.rejected,  (s, a) => { s.loading = false; s.error = a.error.message ?? 'Erro'; })
            .addCase(saveNrsNut.fulfilled, (s, a) => {
                const p = s.patients.find(p => p.id === a.payload.id);
                if (p) p.campo1 = a.payload.campo1;
            });
    },
});

export const { updatePatientCampo1 } = nutritionalSlice.actions;
export default nutritionalSlice.reducer;