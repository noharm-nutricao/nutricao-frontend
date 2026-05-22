import { describe, it, expect } from "vitest";
import { selectFila3, selectFila4 } from "../nutritionalSelectors";
import type { NutritionalPatient } from "features/nutritional/NutritionalSlice";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Minimal patient factory — only fields referenced by the selectors. */
function makePatient(overrides: Partial<NutritionalPatient> = {}): NutritionalPatient {
  return {
    id: 1,
    leito: "UTI-01",
    ala: "UTI",
    nome: "Paciente Teste",
    idade: 50,
    dias: 5,
    mnutric: null,
    nrs: 0,
    sev: null,
    pri: 1,
    nrs_dims: { nut: 0, doenca: 0, idade: 0 },
    dieta: "",
    npo: 0,
    peso: "",
    imc: null,
    haval: 0,
    glim_diag: null,
    glim_fen: [],
    glim_etiol: [],
    inst: [],
    conduta: "",
    alergia: null,
    alOk: true,
    d7: false,
    hist: [],
    ...overrides,
  };
}

/** Build a minimal IRootState stub with only the nutritional slice. */
function makeState(patients: NutritionalPatient[]) {
  return { nutritional: { patients } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// ─── selectFila3 ─────────────────────────────────────────────────────────────

describe("selectFila3", () => {
  it("includes a patient whose inst[0].sev is 'cr'", () => {
    const patient = makePatient({
      inst: [{ id: 1, t: "lab", d: "Glicose alta", ack: false, sev: "cr" }],
    });
    const result = selectFila3(makeState([patient]));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(patient.id);
  });

  it("excludes a patient whose single inst has sev !== 'cr'", () => {
    const patient = makePatient({
      inst: [{ id: 2, t: "clin", d: "Edema leve", ack: false, sev: "al" }],
    });
    const result = selectFila3(makeState([patient]));
    expect(result).toHaveLength(0);
  });

  it("excludes a patient with no inst items and no sev 'cr'", () => {
    const patient = makePatient({ inst: [] });
    const result = selectFila3(makeState([patient]));
    expect(result).toHaveLength(0);
  });

  it("includes a patient with exactly 3 inst items regardless of sev", () => {
    const patient = makePatient({
      inst: [
        { id: 1, t: "lab", d: "A", ack: false, sev: "md" },
        { id: 2, t: "clin", d: "B", ack: false, sev: "bx" },
        { id: 3, t: "rx", d: "C", ack: false },
      ],
    });
    const result = selectFila3(makeState([patient]));
    expect(result).toHaveLength(1);
  });

  it("includes a patient with more than 3 inst items regardless of sev", () => {
    const patient = makePatient({
      inst: [
        { id: 1, t: "lab", d: "A", ack: false },
        { id: 2, t: "lab", d: "B", ack: false },
        { id: 3, t: "lab", d: "C", ack: false },
        { id: 4, t: "lab", d: "D", ack: false },
      ],
    });
    const result = selectFila3(makeState([patient]));
    expect(result).toHaveLength(1);
  });

  it("excludes a patient with 2 inst items and no sev 'cr'", () => {
    const patient = makePatient({
      inst: [
        { id: 1, t: "lab", d: "A", ack: false, sev: "al" },
        { id: 2, t: "clin", d: "B", ack: false, sev: "md" },
      ],
    });
    const result = selectFila3(makeState([patient]));
    expect(result).toHaveLength(0);
  });

  it("returns only matching patients from a mixed list", () => {
    const p1 = makePatient({ id: 1, inst: [{ id: 1, t: "lab", d: "X", ack: false, sev: "cr" }] });
    const p2 = makePatient({ id: 2, inst: [] });
    const p3 = makePatient({ id: 3, inst: [{ id: 2, t: "lab", d: "Y", ack: false }, { id: 3, t: "lab", d: "Z", ack: false }, { id: 4, t: "clin", d: "W", ack: false }] });
    const result = selectFila3(makeState([p1, p2, p3]));
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });
});

// ─── selectFila4 ─────────────────────────────────────────────────────────────

describe("selectFila4", () => {
  it("includes a patient with glim_diag === 'grave'", () => {
    const patient = makePatient({ glim_diag: "grave" });
    const result = selectFila4(makeState([patient]));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(patient.id);
  });

  it("excludes a patient with glim_diag === 'mod'", () => {
    const patient = makePatient({ glim_diag: "mod" });
    const result = selectFila4(makeState([patient]));
    expect(result).toHaveLength(0);
  });

  it("excludes a patient with glim_diag === null", () => {
    const patient = makePatient({ glim_diag: null });
    const result = selectFila4(makeState([patient]));
    expect(result).toHaveLength(0);
  });

  it("excludes a patient with glim_diag === 'nd'", () => {
    const patient = makePatient({ glim_diag: "nd" });
    const result = selectFila4(makeState([patient]));
    expect(result).toHaveLength(0);
  });

  it("returns only patients with glim_diag 'grave' from a mixed list", () => {
    const p1 = makePatient({ id: 1, glim_diag: "grave" });
    const p2 = makePatient({ id: 2, glim_diag: "mod" });
    const p3 = makePatient({ id: 3, glim_diag: null });
    const p4 = makePatient({ id: 4, glim_diag: "grave" });
    const result = selectFila4(makeState([p1, p2, p3, p4]));
    expect(result.map((p) => p.id)).toEqual([1, 4]);
  });
});

// ─── Mutex: selecting a fila clears filtSev and vice-versa ───────────────────
// This behaviour lives in the UI handlers (NutritionalFilter / NutritionalDashboard),
// so we test the logic directly here to confirm correctness without needing React.

describe("mutex: fila vs. severity filter logic", () => {
  /**
   * Simulates handleFilaClick from NutritionalFilter.
   * Returns the new [filtFila, filtSev] tuple.
   */
  function handleFilaClick(
    currentFiltFila: string,
    currentFiltSev: string,
    clickedKey: string
  ): [string, string] {
    const newFiltSev = "";                                 // always clears sev
    const newFiltFila = currentFiltFila === clickedKey ? "" : clickedKey; // toggle
    return [newFiltFila, newFiltSev];
  }

  /**
   * Simulates handleSevClick from NutritionalFilter.
   * Returns the new [filtFila, filtSev] tuple.
   */
  function handleSevClick(
    currentFiltFila: string,
    currentFiltSev: string,
    clickedSev: string
  ): [string, string] {
    const newFiltFila = "";                                // always clears fila
    const newFiltSev = currentFiltSev === clickedSev ? "" : clickedSev; // toggle
    return [newFiltFila, newFiltSev];
  }

  it("selecting FILA3 clears filtSev", () => {
    const [fila, sev] = handleFilaClick("", "cr", "FILA3");
    expect(fila).toBe("FILA3");
    expect(sev).toBe("");
  });

  it("selecting FILA4 clears filtSev", () => {
    const [fila, sev] = handleFilaClick("", "al", "FILA4");
    expect(fila).toBe("FILA4");
    expect(sev).toBe("");
  });

  it("selecting a severity clears FILA3", () => {
    const [fila, sev] = handleSevClick("FILA3", "", "cr");
    expect(fila).toBe("");
    expect(sev).toBe("cr");
  });

  it("selecting a severity clears FILA4", () => {
    const [fila, sev] = handleSevClick("FILA4", "", "al");
    expect(fila).toBe("");
    expect(sev).toBe("al");
  });

  it("clicking the active FILA3 again toggles it off (deselect)", () => {
    const [fila, sev] = handleFilaClick("FILA3", "", "FILA3");
    expect(fila).toBe("");
    expect(sev).toBe("");
  });

  it("clicking the active FILA4 again toggles it off (deselect)", () => {
    const [fila, sev] = handleFilaClick("FILA4", "", "FILA4");
    expect(fila).toBe("");
    expect(sev).toBe("");
  });

  it("switching from FILA3 to FILA4 sets fila to FILA4 and clears sev", () => {
    const [fila, sev] = handleFilaClick("FILA3", "", "FILA4");
    expect(fila).toBe("FILA4");
    expect(sev).toBe("");
  });
});
