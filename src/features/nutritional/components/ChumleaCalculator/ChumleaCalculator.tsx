import { useState } from "react";
import { Modal, Button, Radio, InputNumber, Alert } from "antd";
import {
  SectionTitle,
  FieldGrid,
  FieldLabel,
  ResultBox,
  ResultLabel,
  ResultValue,
  FooterNote,
} from "./styles";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Sexo  = "M" | "F";
type Etnia = "B" | "N";
type Faixa = "19-59" | "60-80";

// ── Coeficientes (Quadro 1 — Saueressig et al. BRASPEN 2022) ──────────────────

const COEFF: Record<Faixa, Record<Sexo, Record<Etnia, { aj: number; cb: number; k: number }>>> = {
  "19-59": {
    F: { B: { aj: 1.01, cb: 2.81, k: -66.04 }, N: { aj: 1.24, cb: 2.97, k: -82.48 } },
    M: { B: { aj: 1.19, cb: 3.21, k: -86.82 }, N: { aj: 1.09, cb: 3.14, k: -83.72 } },
  },
  "60-80": {
    F: { B: { aj: 1.09, cb: 2.68, k: -65.51 }, N: { aj: 1.50, cb: 2.58, k: -84.22 } },
    M: { B: { aj: 1.10, cb: 3.07, k: -75.81 }, N: { aj: 0.44, cb: 2.86, k: -39.21 } },
  },
};

function calcChumlea(sexo: Sexo, etnia: Etnia, faixa: Faixa, aj: number, cb: number): number {
  const c = COEFF[faixa][sexo][etnia];
  return c.aj * aj + c.cb * cb + c.k;
}

// ── Limites ───────────────────────────────────────────────────────────────────

const AJ_MIN = 20, AJ_MAX = 65;
const CB_MIN = 10, CB_MAX = 55;

function inRange(v: number | null, min: number, max: number): boolean {
  return v != null && v >= min && v <= max;
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChumleaCalculator({ open, onClose }: Props) {
  const [sexo, setSexo]   = useState<Sexo>("M");
  const [etnia, setEtnia] = useState<Etnia>("B");
  const [faixa, setFaixa] = useState<Faixa>("19-59");
  const [aj, setAj]       = useState<number | null>(null);
  const [cb, setCb]       = useState<number | null>(null);

  const ajOk = inRange(aj, AJ_MIN, AJ_MAX);
  const cbOk = inRange(cb, CB_MIN, CB_MAX);

  const raw = ajOk && cbOk ? calcChumlea(sexo, etnia, faixa, aj!, cb!) : null;
  const resultOk       = raw != null && raw >= 20 && raw <= 200;
  const resultOutRange = raw != null && !resultOk;

  function handleClear() {
    setAj(null);
    setCb(null);
  }

  return (
    <Modal
      title="Calculadora Chumlea — Estimativa de Peso"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={handleClear}>Limpar</Button>}
      width={480}
    >
      {/* Seleções */}
      <SectionTitle>Perfil do paciente</SectionTitle>

      <div style={{ marginBottom: 12 }}>
        <FieldLabel>Sexo</FieldLabel>
        <Radio.Group value={sexo} onChange={(e) => setSexo(e.target.value)}>
          <Radio value="M">Masculino</Radio>
          <Radio value="F">Feminino</Radio>
        </Radio.Group>
      </div>

      <div style={{ marginBottom: 12 }}>
        <FieldLabel>Etnia</FieldLabel>
        <Radio.Group value={etnia} onChange={(e) => setEtnia(e.target.value)}>
          <Radio value="B">Branca/Branco</Radio>
          <Radio value="N">Negra/Negro</Radio>
        </Radio.Group>
      </div>

      <div style={{ marginBottom: 20 }}>
        <FieldLabel>Faixa etária</FieldLabel>
        <Radio.Group value={faixa} onChange={(e) => setFaixa(e.target.value)}>
          <Radio value="19-59">19–59 anos</Radio>
          <Radio value="60-80">60–80 anos</Radio>
        </Radio.Group>
      </div>

      {/* Medidas */}
      <SectionTitle>Medidas antropométricas</SectionTitle>

      <FieldGrid>
        <div>
          <FieldLabel>Altura do joelho — AJ (cm)</FieldLabel>
          <InputNumber
            value={aj}
            onChange={(v) => setAj(v)}
            min={AJ_MIN}
            max={AJ_MAX}
            step={0.1}
            style={{ width: "100%" }}
            placeholder={`${AJ_MIN}–${AJ_MAX}`}
            status={aj != null && !ajOk ? "error" : undefined}
          />
          <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>
            Supino, perna a 90°; calcanhar → cabeça da patela
          </div>
        </div>
        <div>
          <FieldLabel>Circ. do braço — CB (cm)</FieldLabel>
          <InputNumber
            value={cb}
            onChange={(v) => setCb(v)}
            min={CB_MIN}
            max={CB_MAX}
            step={0.1}
            style={{ width: "100%" }}
            placeholder={`${CB_MIN}–${CB_MAX}`}
            status={cb != null && !cbOk ? "error" : undefined}
          />
          <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>
            Ponto médio acrômio–olécrano, braço a 90°
          </div>
        </div>
      </FieldGrid>

      {/* Resultado */}
      {resultOk ? (
        <>
          <ResultBox>
            <ResultLabel>Peso estimado:</ResultLabel>
            <ResultValue>{raw!.toFixed(1).replace(".", ",")} kg</ResultValue>
          </ResultBox>
          <Alert
            type="warning"
            showIcon
            message="Paciente com edema ou ascite?"
            description="Em pacientes com sobrecarga hídrica a fórmula pode subestimar o peso real em até 7 kg. Considerar avaliação clínica complementar."
            style={{ marginTop: 10 }}
          />
        </>
      ) : resultOutRange ? (
        <Alert
          type="error"
          showIcon
          message="Verifique os valores inseridos"
          description={`Resultado calculado (${raw!.toFixed(1)} kg) fora da faixa fisiológica esperada (20–200 kg).`}
          style={{ marginTop: 16 }}
        />
      ) : (
        <ResultBox style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
          <ResultLabel style={{ color: "#bdbdbd" }}>
            Preencha AJ e CB dentro dos limites válidos para calcular.
          </ResultLabel>
        </ResultBox>
      )}

      {/* Rodapé */}
      <FooterNote style={{ marginTop: 14 }}>
        Chumlea WC et al. J Am Diet Assoc. 1994;94(12):1385-8 · Chumlea WC. Ross knee height caliper manual. 2002
      </FooterNote>
      <FooterNote>
        Saueressig C et al. BRASPEN J. 2022;37(4):340-5 · r = 0,882 · Faixa validada: 19–80 anos
      </FooterNote>
    </Modal>
  );
}
