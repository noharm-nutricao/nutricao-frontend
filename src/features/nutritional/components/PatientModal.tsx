import { useEffect, useState } from "react";
import {
  Modal,
  Row,
  Col,
  Divider,
  Alert,
  Tabs,
  Select,
  Slider,
  Input,
  InputNumber,
  Checkbox,
  Radio,
  Button,
} from "antd";
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

import { useAppDispatch } from "src/store";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";
import {
  NutritionalPatient,
  AcknowledgedEntry,
  GlimDiag,
  saveGlim,
  saveNrsNut,
  saveAval,
  confirmAllergy,
  acknowledgePatient,
} from "../NutritionalSlice";
import {
  SEV_CONFIG,
  ALA_CONFIG,
  calcMbcd,
  sevMNUTRIC,
  sevNRS,
  GLIM_LABEL,
  GLIM_FEN_LABEL,
  GLIM_ETIOL_LABEL,
} from "../nutritionalUtils";

// ─── Styled components ────────────────────────────────────────────────────────

const InfoBlock = styled.div`
  .info-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8c8c8c;
    margin-bottom: 2px;
    font-weight: 600;
  }

  .info-value {
    font-size: 13px;
    font-weight: 500;
    color: #2e3c5a;
  }

  .info-sub {
    font-size: 11px;
    color: #8c8c8c;
    margin-top: 1px;
  }
`;

const ScorePanel = styled.div<{ $borderColor: string; $bg: string }>`
  border: 1px solid ${(p) => p.$borderColor};
  border-radius: 8px;
  padding: 12px 14px;
  background: ${(p) => p.$bg};
`;

const ScorePanelTitle = styled.div<{ $color: string }>`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.$color};
  margin-bottom: 6px;
  letter-spacing: 0.03em;
`;

const ScorePanelValue = styled.div<{ $color: string }>`
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: ${(p) => p.$color};
  margin-bottom: 4px;
`;

const DimsGrid = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const DimChip = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
  padding: 4px 8px;
  text-align: center;
  flex: 1;
  min-width: 52px;

  .dim-val {
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
  }

  .dim-lbl {
    font-size: 9px;
    color: #8c8c8c;
    margin-top: 2px;
    line-height: 1.3;
  }
`;

const GlimPanel = styled.div`
  border: 1px solid #e8e0f5;
  border-radius: 8px;
  padding: 12px 14px;
  background: #faf8ff;
`;

const GlimSectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
`;

const Chip = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  background: ${(p) => (p.$active ? "#7e57c2" : "#f5f5f5")};
  color: ${(p) => (p.$active ? "#fff" : "#bdbdbd")};
  border: 1px solid ${(p) => (p.$active ? "#7e57c2" : "#e0e0e0")};
`;

const GlimDiagBadge = styled.span<{ $diag: string | null }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  background: ${(p) =>
    p.$diag === "grave"
      ? "#f8e4e8"
      : p.$diag === "mod"
      ? "#fcebeb"
      : p.$diag === "nd"
      ? "#f0fff4"
      : "#fdf3dc"};
  color: ${(p) =>
    p.$diag === "grave"
      ? "#7f0d1f"
      : p.$diag === "mod"
      ? "#a32d2d"
      : p.$diag === "nd"
      ? "#3a9c6e"
      : "#d4931a"};
  border: 1px solid
    ${(p) =>
      p.$diag === "grave"
        ? "#e06080"
        : p.$diag === "mod"
        ? "#f09595"
        : p.$diag === "nd"
        ? "#b7eb8f"
        : "#fac775"};
  margin-top: 8px;
`;

const GovernanceNote = styled.div`
  font-size: 10px;
  color: #8c8c8c;
  font-style: italic;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e8e0f5;
  line-height: 1.5;
`;

const InstPanel = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px 14px;
  background: #fafafa;
`;

const InstItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 12px;
  color: #2e3c5a;

  &:last-child {
    border-bottom: none;
  }
`;

const InstDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  flex-shrink: 0;
  display: inline-block;
`;

const InstTypeLabel = styled.span`
  margin-left: auto;
  font-size: 10px;
  color: #8c8c8c;
  white-space: nowrap;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #595959;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

const HistEntry = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fafafa;

  .hist-header {
    display: flex;
    gap: 10px;
    font-size: 11px;
    color: #8c8c8c;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }

  .hist-conduta {
    font-size: 12px;
    color: #2e3c5a;
    margin-bottom: 4px;
  }

  .hist-meta {
    display: flex;
    gap: 10px;
    font-size: 10px;
    color: #8c8c8c;
  }
`;

const GlimResultBox = styled.div<{ $diag: string }>`
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 12px;
  background: ${(p) =>
    p.$diag === "grave"
      ? "#f8e4e8"
      : p.$diag === "mod"
      ? "#fcebeb"
      : "#f5f5f5"};
  border: 1px solid
    ${(p) =>
      p.$diag === "grave"
        ? "#e06080"
        : p.$diag === "mod"
        ? "#f09595"
        : "#e0e0e0"};
  color: ${(p) =>
    p.$diag === "grave"
      ? "#7f0d1f"
      : p.$diag === "mod"
      ? "#a32d2d"
      : "#595959"};
  font-size: 13px;
  font-weight: 700;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const INST_DOT_COLOR: Record<string, string> = {
  lab: "#e24b4a",
  clin: "#d4931a",
  rx: "#7e57c2",
};

const INST_TYPE_LABEL: Record<string, string> = {
  lab: "Laboratório",
  clin: "Clínico",
  rx: "Prescrição",
};

const NRS_A_OPTIONS = [
  { value: 0, label: "0 pts – Estado nutricional normal" },
  { value: 1, label: "1 pt – Perda > 5% em 3m OU ingestão 50–75%" },
  { value: 2, label: "2 pts – Perda > 5% em 2m OU IMC 18,5–20,5 OU ingestão 25–50%" },
  { value: 3, label: "3 pts – Perda > 5% em 1m OU IMC < 18,5 OU ingestão < 25%" },
];

const FREQ_OPTIONS = [
  { value: "24h", label: "24 horas" },
  { value: "48h", label: "48 horas" },
  { value: "semanal", label: "Semanal" },
  { value: "d7", label: "D7 programado" },
  { value: "rotina", label: "Rotina" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface PatientModalProps {
  patient: NutritionalPatient | null;
  acknowledged: Record<number, AcknowledgedEntry>;
  activeTab: string;
  onClose: () => void;
  onTabChange: (tab: string) => void;
}

export function PatientModal({
  patient: p,
  acknowledged,
  activeTab,
  onClose,
  onTabChange,
}: PatientModalProps) {
  const dispatch = useAppDispatch();

  // ── NRS tab local state ───────────────────────────────────────────────
  const [nrsA, setNrsA] = useState(0);

  // ── GLIM tab local state ──────────────────────────────────────────────
  const [fenSelected, setFenSelected] = useState<string[]>([]);
  const [etiolSelected, setEtiolSelected] = useState<string[]>([]);
  const [grad, setGrad] = useState<string>("");
  const [glimObs, setGlimObs] = useState("");

  // ── Aval tab local state ──────────────────────────────────────────────
  const [conduta, setConduta] = useState("");
  const [freq, setFreq] = useState("24h");
  const [ingestion, setIngestion] = useState(50);
  const [kcal, setKcal] = useState<number | null>(null);
  const [prot, setProt] = useState<number | null>(null);

  // ── Inst tab local state ──────────────────────────────────────────────
  const [instObs, setInstObs] = useState("");
  const [antecipar, setAntecipar] = useState<string>("");

  // ── Initialize from patient ───────────────────────────────────────────
  useEffect(() => {
    if (!p) return;
    setNrsA(p.nrs_dims.nut);
    setFenSelected(p.glim_fen ?? []);
    setEtiolSelected(p.glim_etiol ?? []);
    setGrad(p.glim_diag ?? "");
    setGlimObs("");
    setConduta(p.conduta ?? "");
    setFreq("24h");
    setIngestion(50);
    setKcal(null);
    setProt(null);
    setInstObs("");
    setAntecipar("");
  }, [p?.id]);

  if (!p) return null;

  const isUTI = p.ala === "UTI";
  const isAtend = !!acknowledged[p.id];
  const sevCfg = SEV_CONFIG[p.sev];
  const alaCfg = ALA_CONFIG[p.ala];

  const mbcd = calcMbcd(p);

  const mnSev = p.mnutric !== null ? sevMNUTRIC(p.mnutric) : null;
  const nrsSev = sevNRS(p.nrs);

  const havalColor =
    p.haval > 48 ? "#c41e3a" : p.haval > 24 ? "#d4931a" : "#3a9c6e";

  // NRS real-time score
  const nrsPreview = nrsA + p.nrs_dims.doenca + (p.idade >= 70 ? 1 : 0);
  const nrsPreviewColor =
    nrsPreview >= 5
      ? "#c41e3a"
      : nrsPreview >= 3
      ? "#e24b4a"
      : nrsPreview >= 1
      ? "#d4931a"
      : "#3a9c6e";
  const nrsPreviewLabel =
    nrsPreview >= 5
      ? "Crítico"
      : nrsPreview >= 3
      ? "Alto risco"
      : nrsPreview >= 1
      ? "Médio risco"
      : "Baixo risco";

  const glimCanSave =
    fenSelected.length >= 1 && etiolSelected.length >= 1 && !!grad;

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleFenChange = (key: string, checked: boolean) => {
    setFenSelected((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  const handleEtiolChange = (key: string, checked: boolean) => {
    setEtiolSelected((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  const handleSaveGlim = () => {
    if (!glimCanSave) return;
    dispatch(
      saveGlim({
        id: p.id,
        glim_fen: fenSelected,
        glim_etiol: etiolSelected,
        glim_diag: grad as GlimDiag,
      })
    );
  };

  const handleSaveNrs = () => {
    dispatch(saveNrsNut({ id: p.id, nut: nrsA }));
  };

  const handleSaveAval = () => {
    dispatch(saveAval({ id: p.id, conduta, freq, ing: ingestion }));
  };

  const handleConfirmAllergy = () => {
    dispatch(confirmAllergy({ id: p.id }));
  };

  const handleAcknowledge = () => {
    dispatch(
      acknowledgePatient({
        id: p.id,
        hora: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        prof: "Nutr. Silva",
      })
    );
  };

  // ── Tab: Resumo ───────────────────────────────────────────────────────

  const tabResumo = (
    <div>
      {/* Header row */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <InfoBlock>
            <div className="info-label">Leito · Ala</div>
            <div className="info-value">{p.leito}</div>
            <div className="info-sub">{alaCfg.nome}</div>
          </InfoBlock>
        </Col>
        <Col span={6}>
          <InfoBlock>
            <div className="info-label">Idade · Internação</div>
            <div className="info-value">
              {FeatureService.has(Feature.HIDE_NAMES) ? "**a" : `${p.idade}a`} · {p.dias}d
            </div>
            <div className="info-sub">Fila: #{p.pri}</div>
          </InfoBlock>
        </Col>
        <Col span={6}>
          <InfoBlock>
            <div className="info-label">Peso · IMC</div>
            <div className="info-value">{p.peso}</div>
            <div className="info-sub">IMC: {p.imc ?? "N/D"}</div>
          </InfoBlock>
        </Col>
        <Col span={6}>
          <InfoBlock>
            <div className="info-label">Estado</div>
            {isAtend ? (
              <>
                <div className="info-value" style={{ color: "#3a9c6e" }}>
                  <CheckCircleOutlined /> {acknowledged[p.id].hora}
                </div>
                <div className="info-sub">{acknowledged[p.id].prof}</div>
              </>
            ) : (
              <>
                <div className="info-value" style={{ color: "#d4931a" }}>
                  ⏳ Aguardando
                </div>
                <Button
                  size="small"
                  type="primary"
                  style={{ marginTop: 4, fontSize: 11 }}
                  onClick={handleAcknowledge}
                >
                  Reconhecer
                </Button>
              </>
            )}
          </InfoBlock>
        </Col>
      </Row>

      <Divider style={{ margin: "8px 0" }} />

      {/* Campo 1 */}
      <SectionTitle>Campo 1 – Risco nutricional (rastreio)</SectionTitle>

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {isUTI && p.mnutric !== null && (
          <Col span={12}>
            <ScorePanel
              $borderColor="rgba(126,87,194,0.3)"
              $bg="rgba(126,87,194,0.04)"
            >
              <ScorePanelTitle $color="#7e57c2">
                mNUTRIC · Alto risco ≥ 5
              </ScorePanelTitle>
              <ScorePanelValue $color={SEV_CONFIG[mnSev!].leftBorder}>
                {p.mnutric} / 10
              </ScorePanelValue>
              <div style={{ fontSize: 10, color: "#8c8c8c" }}>
                {p.mnutric >= 5 ? "ALTO RISCO" : "Abaixo do limiar"} · M{mbcd} MBCD
              </div>
              <DimsGrid>
                {[
                  { lbl: "Idade", val: p.mn_dims?.idade, max: 2 },
                  { lbl: "APACHE II", val: p.mn_dims?.apache, max: 3 },
                  { lbl: "SOFA", val: p.mn_dims?.sofa, max: 3 },
                  { lbl: "Comorbid.", val: p.mn_dims?.comor, max: 1 },
                  { lbl: "Dias UTI", val: p.mn_dims?.dias, max: 1 },
                ].map(({ lbl, val, max }) => (
                  <DimChip key={lbl}>
                    <div className="dim-val" style={{ color: "#7e57c2" }}>
                      {val ?? 0}
                    </div>
                    <div className="dim-lbl">
                      {lbl}
                      <br />
                      máx {max}
                    </div>
                  </DimChip>
                ))}
              </DimsGrid>
            </ScorePanel>
          </Col>
        )}

        <Col span={isUTI && p.mnutric !== null ? 12 : 24}>
          <ScorePanel
            $borderColor="rgba(19,194,194,0.3)"
            $bg="rgba(19,194,194,0.04)"
          >
            <ScorePanelTitle $color="#08979c">
              NRS-2002 · Alto risco ≥ 3
            </ScorePanelTitle>
            <ScorePanelValue $color={SEV_CONFIG[nrsSev].leftBorder}>
              {p.nrs} / 7
            </ScorePanelValue>
            {!isUTI && (
              <div style={{ fontSize: 10, color: "#8c8c8c", marginBottom: 4 }}>
                M{mbcd} MBCD
              </div>
            )}
            <DimsGrid>
              {[
                { lbl: "Est. Nutr.", val: p.nrs_dims.nut, max: 3 },
                { lbl: "Doença", val: p.nrs_dims.doenca, max: 3 },
                { lbl: "Idade≥70", val: p.nrs_dims.idade, max: 1 },
              ].map(({ lbl, val, max }) => (
                <DimChip key={lbl}>
                  <div className="dim-val" style={{ color: "#08979c" }}>
                    {val}
                  </div>
                  <div className="dim-lbl">
                    {lbl}
                    <br />
                    máx {max}
                  </div>
                </DimChip>
              ))}
            </DimsGrid>
          </ScorePanel>
        </Col>
      </Row>

      <Divider style={{ margin: "8px 0" }} />

      {/* Campo 2 */}
      <SectionTitle>Campo 2 – Diagnóstico nutricional (GLIM)</SectionTitle>

      <GlimPanel style={{ marginBottom: 12 }}>
        <GlimSectionLabel>Critérios fenotípicos presentes:</GlimSectionLabel>
        <ChipsRow>
          {(["perda_peso", "baixo_imc", "massa_muscular"] as const).map((key) => (
            <Chip key={key} $active={p.glim_fen.includes(key)}>
              {GLIM_FEN_LABEL[key]}
            </Chip>
          ))}
        </ChipsRow>

        <GlimSectionLabel>Critérios etiológicos presentes:</GlimSectionLabel>
        <ChipsRow>
          {(["reducao_ingestao", "doenca_inflamacao"] as const).map((key) => (
            <Chip key={key} $active={p.glim_etiol.includes(key)}>
              {GLIM_ETIOL_LABEL[key]}
            </Chip>
          ))}
        </ChipsRow>

        <GlimDiagBadge $diag={p.glim_diag}>
          {p.glim_diag !== null ? GLIM_LABEL[p.glim_diag] : "Pendente avaliação GLIM"}
        </GlimDiagBadge>

        {!p.glim_diag && (
          <div style={{ marginTop: 10 }}>
            <Button
              type="primary"
              style={{ background: "#7e57c2", borderColor: "#7e57c2", fontSize: 12 }}
              onClick={() => onTabChange("glim")}
            >
              Preencher GLIM
            </Button>
          </div>
        )}

        <GovernanceNote>
          Albumina, hemoglobina e outros exames bioquímicos não devem, isoladamente, definir
          diagnóstico de desnutrição. São gatilhos de revisão (Campo 3).
        </GovernanceNote>
      </GlimPanel>

      {/* Campo 3 */}
      {p.inst.length > 0 && (
        <>
          <Divider style={{ margin: "8px 0" }} />
          <SectionTitle>Campo 3 – Instabilidade nutricional / gatilhos de revisão</SectionTitle>
          <InstPanel style={{ marginBottom: 12 }}>
            {p.inst.map((item, i) => (
              <InstItemRow key={i}>
                <InstDot $color={INST_DOT_COLOR[item.t] ?? "#8c8c8c"} />
                <span>{item.d}</span>
                <InstTypeLabel>{INST_TYPE_LABEL[item.t] ?? item.t}</InstTypeLabel>
              </InstItemRow>
            ))}
          </InstPanel>
        </>
      )}

      <Divider style={{ margin: "8px 0" }} />

      {/* Clinical info */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <InfoBlock>
            <div className="info-label">Dieta atual</div>
            <div className="info-value">{p.dieta}</div>
            <div
              className="info-sub"
              style={{ color: p.npo > 0 ? "#c41e3a" : "#3a9c6e" }}
            >
              {p.npo > 0 ? `⚠ NPO ${p.npo}h` : "Via ativa"}
            </div>
          </InfoBlock>
        </Col>
        <Col span={12}>
          <InfoBlock>
            <div className="info-label">Última avaliação</div>
            <div className="info-value" style={{ color: havalColor }}>
              <ClockCircleOutlined /> {p.haval}h atrás
            </div>
          </InfoBlock>
        </Col>
      </Row>

      {p.alergia && (
        <Alert
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          message={`Alergia: ${p.alergia}`}
          style={{ marginBottom: 12 }}
        />
      )}

      <InfoBlock>
        <div className="info-label">Conduta</div>
        <div className="info-value">{p.conduta}</div>
      </InfoBlock>

      <div style={{ marginTop: 12 }}>
        <Button
          type="default"
          style={{ background: "#3a9c6e", borderColor: "#3a9c6e", color: "#fff", fontSize: 12 }}
          onClick={() => onTabChange("aval")}
        >
          Registrar avaliação
        </Button>
      </div>
    </div>
  );

  // ── Tab: NRS-2002 ─────────────────────────────────────────────────────

  const tabNrs = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 8 }}>
          Componente A – Estado nutricional
        </div>
        <Select
          value={nrsA}
          onChange={(v) => setNrsA(v)}
          style={{ width: "100%" }}
          options={NRS_A_OPTIONS}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 8 }}>
          Componente B – Gravidade da doença (automático)
        </div>
        <ScorePanel $borderColor="#e0e0e0" $bg="#fafafa">
          <DimsGrid>
            <DimChip>
              <div className="dim-val" style={{ color: "#08979c" }}>
                {p.nrs_dims.doenca}
              </div>
              <div className="dim-lbl">Doença<br />máx 3</div>
            </DimChip>
          </DimsGrid>
        </ScorePanel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 8 }}>
          Componente C – Idade ≥ 70 anos (automático)
        </div>
        <ScorePanel $borderColor="#e0e0e0" $bg="#fafafa">
          <DimsGrid>
            <DimChip>
              <div className="dim-val" style={{ color: "#08979c" }}>
                {p.idade >= 70 ? 1 : 0}
              </div>
              <div className="dim-lbl">
                {p.idade >= 70 ? "Sim" : "Não"}
                <br />
                máx 1
              </div>
            </DimChip>
          </DimsGrid>
        </ScorePanel>
      </div>

      <div
        style={{
          border: `2px solid ${nrsPreviewColor}`,
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
          background: `${nrsPreviewColor}10`,
        }}
      >
        <div style={{ fontSize: 11, color: "#595959", marginBottom: 4 }}>
          Score NRS-2002 calculado
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: nrsPreviewColor, lineHeight: 1 }}>
          {nrsPreview} / 7
        </div>
        <div style={{ fontSize: 12, color: nrsPreviewColor, marginTop: 4 }}>
          {nrsPreviewLabel}
        </div>
      </div>

      <Button type="primary" onClick={handleSaveNrs} style={{ background: "#08979c", borderColor: "#08979c" }}>
        Salvar NRS-2002
      </Button>
    </div>
  );

  // ── Tab: GLIM ─────────────────────────────────────────────────────────

  const tabGlim = (
    <div>
      <Alert
        type="info"
        message="Albumina, hemoglobina e outros exames bioquímicos não devem, isoladamente, definir diagnóstico de desnutrição. São gatilhos de revisão (Campo 3)."
        showIcon={false}
        style={{ marginBottom: 16, fontSize: 11 }}
      />

      <div style={{ marginBottom: 16 }}>
        <GlimSectionLabel>Critérios fenotípicos (selecione ao menos 1)</GlimSectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(["perda_peso", "baixo_imc", "massa_muscular"] as const).map((key) => (
            <Checkbox
              key={key}
              checked={fenSelected.includes(key)}
              onChange={(e) => handleFenChange(key, e.target.checked)}
            >
              {GLIM_FEN_LABEL[key]}
            </Checkbox>
          ))}
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ marginBottom: 16 }}>
        <GlimSectionLabel>Critérios etiológicos (selecione ao menos 1)</GlimSectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(["reducao_ingestao", "doenca_inflamacao"] as const).map((key) => (
            <Checkbox
              key={key}
              checked={etiolSelected.includes(key)}
              onChange={(e) => handleEtiolChange(key, e.target.checked)}
            >
              {GLIM_ETIOL_LABEL[key]}
            </Checkbox>
          ))}
        </div>
      </div>

      {fenSelected.length >= 1 && etiolSelected.length >= 1 && (
        <>
          <Divider style={{ margin: "12px 0" }} />
          <div style={{ marginBottom: 16 }}>
            <GlimSectionLabel>Graduação da desnutrição</GlimSectionLabel>
            <Radio.Group
              value={grad}
              onChange={(e) => setGrad(e.target.value)}
            >
              <Radio value="mod">Desnutrição moderada</Radio>
              <Radio value="grave">Desnutrição grave</Radio>
            </Radio.Group>
          </div>
        </>
      )}

      {grad && (
        <GlimResultBox $diag={grad}>
          {GLIM_LABEL[grad] ?? grad}
        </GlimResultBox>
      )}

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#595959", marginBottom: 4 }}>Observações</div>
        <Input.TextArea
          value={glimObs}
          onChange={(e) => setGlimObs(e.target.value)}
          rows={2}
          placeholder="Observações adicionais..."
        />
      </div>

      <Button
        type="primary"
        disabled={!glimCanSave}
        onClick={handleSaveGlim}
        style={{ background: "#7e57c2", borderColor: "#7e57c2" }}
      >
        Salvar Diagnóstico GLIM
      </Button>
    </div>
  );

  // ── Tab: Registrar Avaliação ──────────────────────────────────────────

  const tabAval = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 6 }}>
          Conduta
        </div>
        <Input.TextArea
          value={conduta}
          onChange={(e) => setConduta(e.target.value)}
          rows={3}
          placeholder="Descreva a conduta nutricional..."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 6 }}>
          Próxima visita
        </div>
        <Select
          value={freq}
          onChange={setFreq}
          style={{ width: 200 }}
          options={FREQ_OPTIONS}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 6 }}>
          % Ingestão: {ingestion}%
        </div>
        <Slider
          value={ingestion}
          onChange={setIngestion}
          min={0}
          max={100}
          step={5}
          marks={{ 0: "0%", 25: "25%", 50: "50%", 75: "75%", 100: "100%" }}
          style={{ marginBottom: 8 }}
        />
      </div>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 6 }}>
            Meta calórica (kcal)
          </div>
          <InputNumber
            value={kcal}
            onChange={setKcal}
            min={0}
            max={5000}
            style={{ width: "100%" }}
            placeholder="Ex: 1800"
          />
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 6 }}>
            Meta proteica (g)
          </div>
          <InputNumber
            value={prot}
            onChange={setProt}
            min={0}
            max={300}
            style={{ width: "100%" }}
            placeholder="Ex: 100"
          />
        </Col>
      </Row>

      <Button
        type="primary"
        onClick={handleSaveAval}
        disabled={!conduta.trim()}
        style={{ background: "#3a9c6e", borderColor: "#3a9c6e", marginBottom: 24 }}
      >
        Registrar Avaliação
      </Button>

      {p.hist.length > 0 && (
        <>
          <Divider style={{ margin: "8px 0" }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 8 }}>
            Histórico de avaliações
          </div>
          {p.hist.map((h, i) => (
            <HistEntry key={i}>
              <div className="hist-header">
                <span>{h.h}</span>
                <span>{h.p}</span>
              </div>
              <div className="hist-conduta">{h.c}</div>
              <div className="hist-meta">
                <span>Freq: {h.freq}</span>
                {h.ing !== null && <span>Ingestão: {h.ing}%</span>}
              </div>
            </HistEntry>
          ))}
        </>
      )}
    </div>
  );

  // ── Tab: Instabilidade ────────────────────────────────────────────────

  const tabInst = (
    <div>
      {p.alergia && !p.alOk && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={`Alergia registrada: ${p.alergia}`}
          description="É necessário confirmar ciência da alergia antes de prosseguir."
          action={
            <Button
              size="small"
              type="primary"
              danger
              onClick={handleConfirmAllergy}
            >
              Confirmar ciência
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {p.alergia && p.alOk && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message={`Alergia confirmada: ${p.alergia}`}
          style={{ marginBottom: 16 }}
        />
      )}

      {p.inst.filter((i) => i.t === "lab").length > 0 && (
        <>
          <SectionTitle>Exames laboratoriais</SectionTitle>
          <InstPanel style={{ marginBottom: 16 }}>
            {p.inst
              .filter((i) => i.t === "lab")
              .map((item, i) => (
                <InstItemRow key={i}>
                  <InstDot $color={INST_DOT_COLOR.lab} />
                  <span>{item.d}</span>
                  <InstTypeLabel>Laboratório</InstTypeLabel>
                </InstItemRow>
              ))}
          </InstPanel>
        </>
      )}

      {p.inst.filter((i) => i.t !== "lab").length > 0 && (
        <>
          <SectionTitle>Achados clínicos / prescrição</SectionTitle>
          <InstPanel style={{ marginBottom: 16 }}>
            {p.inst
              .filter((i) => i.t !== "lab")
              .map((item, i) => (
                <InstItemRow key={i}>
                  <InstDot $color={INST_DOT_COLOR[item.t] ?? "#8c8c8c"} />
                  <span>{item.d}</span>
                  <InstTypeLabel>{INST_TYPE_LABEL[item.t] ?? item.t}</InstTypeLabel>
                </InstItemRow>
              ))}
          </InstPanel>
        </>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 6 }}>
          Observações
        </div>
        <Input.TextArea
          value={instObs}
          onChange={(e) => setInstObs(e.target.value)}
          rows={3}
          placeholder="Observações sobre instabilidade nutricional..."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", marginBottom: 6 }}>
          Antecipar reavaliação?
        </div>
        <Radio.Group
          value={antecipar}
          onChange={(e) => setAntecipar(e.target.value)}
        >
          <Radio value="sim">Sim – antecipar</Radio>
          <Radio value="nao">Não – manter programação</Radio>
        </Radio.Group>
      </div>
    </div>
  );

  // ── Build tab items ───────────────────────────────────────────────────

  const tabItems = [
    { key: "vis", label: "Resumo", children: tabResumo },
    ...(!isUTI ? [{ key: "nrs", label: "NRS-2002", children: tabNrs }] : []),
    { key: "glim", label: "Diagn. GLIM", children: tabGlim },
    { key: "aval", label: "Registrar Aval.", children: tabAval },
    { key: "inst", label: "Instabilidade", children: tabInst },
  ];

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={660}
      title={
        <span style={{ color: sevCfg.color, fontWeight: 700 }}>
          {p.leito} · {FeatureService.has(Feature.HIDE_NAMES) ? "****** ******" : p.nome}
        </span>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabItems}
        size="small"
        style={{ marginTop: -4 }}
      />
    </Modal>
  );
}
