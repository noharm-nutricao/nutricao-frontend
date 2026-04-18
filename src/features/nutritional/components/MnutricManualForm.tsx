import { useState } from "react";
import { InputNumber, Button, Alert } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import styled from "styled-components";

import { useAppDispatch } from "src/store";
import { saveMnutricManual } from "../NutritionalSlice";

const FormBox = styled.div`
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 14px 16px;
  background: #fffbe6;
  margin-bottom: 16px;
`;

const FormTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #d48806;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FormDesc = styled.div`
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 12px;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const FieldGroup = styled.div`
  flex: 1;

  label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #595959;
    margin-bottom: 4px;
  }
`;

interface MnutricManualFormProps {
  nratendimento: number;
  apacheAtual?: number;
  sofaAtual?: number;
  onSaved: (campo1: Record<string, unknown>) => void;
}

export function MnutricManualForm({
  nratendimento,
  apacheAtual,
  sofaAtual,
  onSaved,
}: MnutricManualFormProps) {
  const dispatch = useAppDispatch();
  const [apache, setApache] = useState<number | null>(apacheAtual ?? null);
  const [sofa, setSofa] = useState<number | null>(sofaAtual ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = apache !== null && sofa !== null;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const result = await dispatch(
      saveMnutricManual({
        id: nratendimento,
        apache_ii: apache,
        sofa,
      })
    );
    setSaving(false);
    if (saveMnutricManual.fulfilled.match(result)) {
      onSaved(result.payload.campo1);
    } else {
      setError((result.payload as string) ?? "Erro ao salvar. Tente novamente.");
    }
  };

  return (
    <FormBox>
      <FormTitle>
        <WarningOutlined />
        APACHE II e SOFA não encontrados no sistema
      </FormTitle>
      <FormDesc>
        Insira os valores manualmente para calcular o score mNUTRIC e habilitar o reconhecimento.
      </FormDesc>

      <FieldRow>
        <FieldGroup>
          <label>APACHE II (0–71)</label>
          <InputNumber
            value={apache}
            onChange={(v) => setApache(v)}
            min={0}
            max={71}
            precision={0}
            style={{ width: "100%" }}
            placeholder="0–71"
          />
        </FieldGroup>
        <FieldGroup>
          <label>SOFA (0–24)</label>
          <InputNumber
            value={sofa}
            onChange={(v) => setSofa(v)}
            min={0}
            max={24}
            precision={0}
            style={{ width: "100%" }}
            placeholder="0–24"
          />
        </FieldGroup>
      </FieldRow>

      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 10, fontSize: 11 }} />
      )}

      <Button
        type="primary"
        onClick={handleSave}
        disabled={!canSave}
        loading={saving}
        style={{ background: "#d48806", borderColor: "#d48806" }}
      >
        Calcular mNUTRIC
      </Button>
    </FormBox>
  );
}
