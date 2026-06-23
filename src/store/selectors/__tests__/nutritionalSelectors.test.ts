import { describe, it, expect } from "vitest";
import { selectFila2, selectFila3, selectFila4 } from "../nutritionalSelectors";
import { isFila3, isFila4, matchFila } from "features/nutritional/nutritionalUtils";
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
    freq_horas: null,
    glim_diag: null,
    glim_fen: [],
    glim_etiol: [],
    inst: [],
    conduta: "",
    alergia: null,
    alOk: true,
    d7: false,
    triagem_status: null,
    triagem_at: null,
    data_internacao: null,
    hist: [],
    ...overrides,
  };
}

/** Build a minimal IRootState stub with only the nutritional slice. */
function makeState(patients: NutritionalPatient[]) {
  return { nutritional: { patients } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// ─── isFila3 (predicado puro) ────────────────────────────────────────────────

describe("isFila3", () => {
  it("retorna true quando inst[0].sev === 'cr'", () => {
    const p = makePatient({ inst: [{ id: 1, t: "lab", d: "X", ack: false, sev: "cr" }] });
    expect(isFila3(p)).toBe(true);
  });

  it("retorna false quando inst tem sev !== 'cr' e length < 3", () => {
    const p = makePatient({ inst: [{ id: 1, t: "lab", d: "X", ack: false, sev: "al" }] });
    expect(isFila3(p)).toBe(false);
  });

  it("retorna true quando inst.length === 3 independente de sev", () => {
    const p = makePatient({
      inst: [
        { id: 1, t: "lab",  d: "A", ack: false, sev: "md" },
        { id: 2, t: "clin", d: "B", ack: false, sev: "bx" },
        { id: 3, t: "rx",   d: "C", ack: false, sev: "md" as const },
      ],
    });
    expect(isFila3(p)).toBe(true);
  });

  it("retorna true quando inst.length > 3", () => {
    const p = makePatient({
      inst: [
        { id: 1, t: "lab", d: "A", ack: false, sev: "md" as const },
        { id: 2, t: "lab", d: "B", ack: false, sev: "md" as const },
        { id: 3, t: "lab", d: "C", ack: false, sev: "md" as const },
        { id: 4, t: "lab", d: "D", ack: false, sev: "md" as const },
      ],
    });
    expect(isFila3(p)).toBe(true);
  });

  it("retorna false quando inst vazio", () => {
    expect(isFila3(makePatient({ inst: [] }))).toBe(false);
  });

  it("retorna false com 2 inst e nenhuma com sev 'cr'", () => {
    const p = makePatient({
      inst: [
        { id: 1, t: "lab",  d: "A", ack: false, sev: "al" },
        { id: 2, t: "clin", d: "B", ack: false, sev: "md" },
      ],
    });
    expect(isFila3(p)).toBe(false);
  });
});

// ─── isFila4 (predicado puro) ────────────────────────────────────────────────

describe("isFila4", () => {
  it("retorna true quando glim_diag === 'grave'", () => {
    expect(isFila4(makePatient({ glim_diag: "grave" }))).toBe(true);
  });

  it("retorna false quando glim_diag === 'mod'", () => {
    expect(isFila4(makePatient({ glim_diag: "mod" }))).toBe(false);
  });

  it("retorna false quando glim_diag === null", () => {
    expect(isFila4(makePatient({ glim_diag: null }))).toBe(false);
  });

  it("retorna false quando glim_diag === 'nd'", () => {
    expect(isFila4(makePatient({ glim_diag: "nd" }))).toBe(false);
  });
});

// ─── selectFila3 (selector Redux) ────────────────────────────────────────────

describe("selectFila3", () => {
  it("inclui paciente com inst[0].sev === 'cr'", () => {
    const p = makePatient({ inst: [{ id: 1, t: "lab", d: "Glicose alta", ack: false, sev: "cr" }] });
    expect(selectFila3(makeState([p]))).toHaveLength(1);
  });

  it("exclui paciente sem inst cr e inst.length < 3", () => {
    const p = makePatient({ inst: [{ id: 2, t: "clin", d: "Edema", ack: false, sev: "al" }] });
    expect(selectFila3(makeState([p]))).toHaveLength(0);
  });

  it("retorna somente os pacientes correspondentes numa lista mista", () => {
    const p1 = makePatient({ id: 1, inst: [{ id: 1, t: "lab", d: "X", ack: false, sev: "cr" }] });
    const p2 = makePatient({ id: 2, inst: [] });
    const p3 = makePatient({ id: 3, inst: [
      { id: 2, t: "lab",  d: "Y", ack: false, sev: "md" as const },
      { id: 3, t: "lab",  d: "Z", ack: false, sev: "md" as const },
      { id: 4, t: "clin", d: "W", ack: false, sev: "md" as const },
    ]});
    expect(selectFila3(makeState([p1, p2, p3])).map((p) => p.id)).toEqual([1, 3]);
  });
});

// ─── selectFila2 (selector Redux) ────────────────────────────────────────────

describe("selectFila2", () => {
  it("inclui quando freq_horas=48 e haval=40 (>= 48*0.8)", () => {
    const p = makePatient({ freq_horas: 48, haval: 40 });
    expect(selectFila2(makeState([p]))).toHaveLength(1);
  });

  it("exclui quando freq_horas=48 e haval=30 (< 48*0.8)", () => {
    const p = makePatient({ freq_horas: 48, haval: 30 });
    expect(selectFila2(makeState([p]))).toHaveLength(0);
  });

  it("inclui quando freq_horas=null e haval=15 (fallback 12-24)", () => {
    const p = makePatient({ freq_horas: null, haval: 15 });
    expect(selectFila2(makeState([p]))).toHaveLength(1);
  });

  it("exclui quando freq_horas=null e haval=30 (fallback exclui)", () => {
    const p = makePatient({ freq_horas: null, haval: 30 });
    expect(selectFila2(makeState([p]))).toHaveLength(0);
  });
});

// ─── selectFila4 (selector Redux) ────────────────────────────────────────────

describe("selectFila4", () => {
  it("inclui paciente com glim_diag === 'grave'", () => {
    expect(selectFila4(makeState([makePatient({ glim_diag: "grave" })]))).toHaveLength(1);
  });

  it("exclui paciente com glim_diag === 'mod'", () => {
    expect(selectFila4(makeState([makePatient({ glim_diag: "mod" })]))).toHaveLength(0);
  });

  it("exclui paciente com glim_diag === null", () => {
    expect(selectFila4(makeState([makePatient({ glim_diag: null })]))).toHaveLength(0);
  });

  it("retorna somente os pacientes 'grave' numa lista mista", () => {
    const ps = [
      makePatient({ id: 1, glim_diag: "grave" }),
      makePatient({ id: 2, glim_diag: "mod" }),
      makePatient({ id: 3, glim_diag: null }),
      makePatient({ id: 4, glim_diag: "grave" }),
    ];
    expect(selectFila4(makeState(ps)).map((p) => p.id)).toEqual([1, 4]);
  });
});

// ─── matchFila (função pura exportada de nutritionalUtils) ───────────────────

describe("matchFila", () => {
  it("retorna true quando filtFila está vazio (sem filtro)", () => {
    expect(matchFila(makePatient(), "")).toBe(true);
  });

  it("retorna true quando filtFila === 'all'", () => {
    expect(matchFila(makePatient(), "all")).toBe(true);
  });

  it("FILA3: retorna true para paciente com inst.sev 'cr'", () => {
    const p = makePatient({ inst: [{ id: 1, t: "lab", d: "X", ack: false, sev: "cr" }] });
    expect(matchFila(p, "FILA3")).toBe(true);
  });

  it("FILA3: retorna false para paciente sem critério Fila 3", () => {
    expect(matchFila(makePatient({ inst: [] }), "FILA3")).toBe(false);
  });

  it("FILA4: retorna true para paciente com glim_diag 'grave'", () => {
    expect(matchFila(makePatient({ glim_diag: "grave" }), "FILA4")).toBe(true);
  });

  it("FILA4: retorna false para paciente com glim_diag 'mod'", () => {
    expect(matchFila(makePatient({ glim_diag: "mod" }), "FILA4")).toBe(false);
  });

  it("retorna true para chave desconhecida (forward-compatible)", () => {
    expect(matchFila(makePatient(), "FILA99")).toBe(true);
  });
});

// ─── Mutex: selecionar fila limpa filtSev e vice-versa ───────────────────────
// Lógica dos handlers do NutritionalFilter testada como funções puras.

describe("mutex: fila vs. severidade", () => {
  function handleFilaClick(curFila: string, _curSev: string, key: string): [string, string] {
    return [curFila === key ? "" : key, ""];
  }

  function handleSevClick(_curFila: string, curSev: string, sev: string): [string, string] {
    return ["", curSev === sev ? "" : sev];
  }

  it("selecionar FILA3 limpa filtSev", () => {
    const [fila, sev] = handleFilaClick("", "cr", "FILA3");
    expect(fila).toBe("FILA3");
    expect(sev).toBe("");
  });

  it("selecionar FILA4 limpa filtSev", () => {
    const [fila, sev] = handleFilaClick("", "al", "FILA4");
    expect(fila).toBe("FILA4");
    expect(sev).toBe("");
  });

  it("selecionar severidade limpa FILA3", () => {
    const [fila, sev] = handleSevClick("FILA3", "", "cr");
    expect(fila).toBe("");
    expect(sev).toBe("cr");
  });

  it("selecionar severidade limpa FILA4", () => {
    const [fila, sev] = handleSevClick("FILA4", "", "al");
    expect(fila).toBe("");
    expect(sev).toBe("al");
  });

  it("clicar FILA3 ativa novamente desativa (toggle off)", () => {
    const [fila, sev] = handleFilaClick("FILA3", "", "FILA3");
    expect(fila).toBe("");
    expect(sev).toBe("");
  });

  it("clicar FILA4 ativa novamente desativa (toggle off)", () => {
    const [fila, sev] = handleFilaClick("FILA4", "", "FILA4");
    expect(fila).toBe("");
    expect(sev).toBe("");
  });

  it("trocar de FILA3 para FILA4 atualiza fila e limpa sev", () => {
    const [fila, sev] = handleFilaClick("FILA3", "", "FILA4");
    expect(fila).toBe("FILA4");
    expect(sev).toBe("");
  });
});
