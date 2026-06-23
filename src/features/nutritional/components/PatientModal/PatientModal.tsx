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
  Tooltip,
  message,
} from "antd";
import { WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "src/store";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";
import {
  NutritionalPatient,
  AcknowledgedEntry,
  GlimDiag,
  saveNrsNut,
  confirmAllergy,
  acknowledgePatient,
  markAlertAcknowledged,
  revertAlert,
  fetchAlerts,
  acknowledgeAlert,
  saveGlimToServer,
  saveAvalToServer,
  fetchLlmSummary,
  clearLlmSummary,
} from "../../NutritionalSlice";
import { MnutricManualForm } from "../MnutricManualForm/MnutricManualForm";
import {
  SEV_CONFIG,
  ALA_CONFIG,
  calcMbcd,
  sevMNUTRIC,
  sevNRS,
  GLIM_LABEL,
  GLIM_FEN_LABEL,
  GLIM_ETIOL_LABEL,
} from "../../nutritionalUtils";
import { InfoBlock, SectionTitle, ScorePanel, ScorePanelTitle, ScorePanelValue, DimsGrid, DimChip, GlimPanel, GlimSectionLabel, ChipsRow, Chip, GlimDiagBadge, GovernanceNote, InstPanel, InstItemRow, InstDot, InstTypeLabel, GlimResultBox, HistEntry } from "./styles";


const INST_DOT_COLOR: Record<string, string> = {
  cr: "#a32d2d",
  al: "#b7770d",
  md: "#3c3489",
  bx: "#8c8c8c",
};

const INST_TYPE_LABEL: Record<string, string> = {
  lab: "Laboratório",
  clin: "Clínico",
  rx: "Prescrição",
};

const NRS_A_OPTIONS = [
  { value: 0, label: "0 pts - Estado nutricional normal" },
  { value: 1, label: "1 pt - Perda > 5% em 3m OU ingestão 50-75%" },
  { value: 2, label: "2 pts - Perda > 5% em 2m OU IMC 18,5-20,5 OU ingestão 25-50%" },
  { value: 3, label: "3 pts - Perda > 5% em 1m OU IMC < 18,5 OU ingestão < 25%" },
];

const FREQ_OPTIONS = [
  { value: "24h", label: "24 horas" },
  { value: "48h", label: "48 horas" },
  { value: "semanal", label: "Semanal" },
  { value: "d7", label: "D7 programado" },
  { value: "rotina", label: "Rotina" },
];

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
  const alertsLoading = useAppSelector(
    (state: any) => (state.nutritional.alertsLoading as Record<number, boolean>)[p?.id ?? -1] ?? false // eslint-disable-line @typescript-eslint/no-explicit-any
  );

  const llmSummary = useAppSelector((state: any) =>
    p ? state.nutritional.llmSummaries[p.id] : undefined
  );

  const formatLlmGeneratedAt = (raw: string) => {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month} ${hours}:${minutes}`;
  };

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
  const [antecipar, setAntecipar] = useState<string>("");
  const [instObs, setInstObs] = useState("");

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
    setAntecipar("");
  }, [p?.id]);

  useEffect(() => {
    if (p && activeTab === "inst") {
      dispatch(fetchAlerts(p.id));
    }
  }, [activeTab, p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return null;

  const isUTI = p.ala === "UTI";
  const isAtend = !!acknowledged[p.id];
  const sevCfg = p.sev ? SEV_CONFIG[p.sev] : { color: "#8c8c8c" };
  const alaCfg = ALA_CONFIG[p.ala];

  const mbcd = calcMbcd(p);

  const mnSev = p.mnutric != null ? sevMNUTRIC(p.mnutric) : null;
  const nrsSev = sevNRS(p.nrs);

  const havalNever = p.haval >= 999;
  const havalColor = havalNever ? "#c41e3a"
    : p.haval > 48 ? "#c41e3a" : p.haval > 24 ? "#d4931a" : "#3a9c6e";

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

  const glimCanSaveNd = grad === "nd";
  const glimCanSaveDiag =
    fenSelected.length >= 1 && etiolSelected.length >= 1 && (grad === "mod" || grad === "grave");
  const glimCanSave = glimCanSaveNd || glimCanSaveDiag;

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

  const handleSaveGlim = async () => {
    if (!glimCanSave) return;
    const fen = grad === "nd" ? [] : fenSelected;
    const etiol = grad === "nd" ? [] : etiolSelected;
    const result = await dispatch(
      saveGlimToServer({ id: p.id, glim_fen: fen, glim_etiol: etiol, glim_diag: grad as GlimDiag })
    );
    if (saveGlimToServer.fulfilled.match(result)) {
      message.success("Diagnóstico GLIM salvo com sucesso.");
    } else {
      message.error(`Erro ao salvar GLIM: ${(result as any).payload ?? "erro desconhecido"}`);
    }
  };

  const handleSaveNrs = () => {
    dispatch(saveNrsNut({ id: p.id, nut: nrsA }));
  };

  const handleSaveAval = async () => {
  const result = await dispatch(saveAvalToServer({ id: p.id, conduta, freq, ing: ingestion }));
  if (saveAvalToServer.fulfilled.match(result)) {
    message.success("Avaliação registrada com sucesso.");
  } else {
    message.error(`Erro ao registrar avaliação: ${(result as any).payload ?? "erro desconhecido"}`);
  }
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

  const handleAcknowledgeAlert = async (alertId: number) => {
    dispatch(markAlertAcknowledged({ patientId: p.id, alertId }));
    const result = await dispatch(acknowledgeAlert({ patientId: p.id, alertId }));
    if (acknowledgeAlert.rejected.match(result)) {
      console.error("acknowledgeAlert rejected:", result.payload ?? result.error);
      dispatch(revertAlert({ patientId: p.id, alertId }));
      message.error("Erro ao reconhecer alerta.");
    } else {
      dispatch(fetchAlerts(p.id));
    }
  };

  const handleAcknowledgeAll = async () => {
    const activeAlerts = p.inst.filter((i) => !i.ack);
    let failed = false;
    for (const alert of activeAlerts) {
      dispatch(markAlertAcknowledged({ patientId: p.id, alertId: alert.id }));
      // eslint-disable-next-line no-await-in-loop
      const result = await dispatch(acknowledgeAlert({ patientId: p.id, alertId: alert.id }));
      if (acknowledgeAlert.rejected.match(result)) {
        console.error("acknowledgeAlert rejected:", result.payload ?? result.error);
        dispatch(revertAlert({ patientId: p.id, alertId: alert.id }));
        message.error("Erro ao reconhecer alertas.");
        failed = true;
        break;
      }
    }
    if (!failed) dispatch(fetchAlerts(p.id));
  };

  const handleGenerateLlmSummary = () => {
    if (!p) return;
    dispatch(fetchLlmSummary(p.id));
  };

  const handleRegenerateLlmSummary = () => {
    if (!p) return;
    dispatch(clearLlmSummary(p.id));
    dispatch(fetchLlmSummary(p.id));
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
                <Tooltip
                  title={p.dados_incompletos ? "Insira APACHE II e SOFA para reconhecer" : undefined}
                >
                  <Button
                    size="small"
                    type="primary"
                    style={{ marginTop: 4, fontSize: 11 }}
                    disabled={!!p.dados_incompletos}
                    onClick={handleAcknowledge}
                  >
                    Reconhecer
                  </Button>
                </Tooltip>
              </>
            )}
          </InfoBlock>
        </Col>
      </Row>

      <Divider style={{ margin: "8px 0" }} />

      {/* Campo 1 */}
      <SectionTitle>Campo 1 – Risco nutricional (rastreio)</SectionTitle>

      {isUTI && p.dados_incompletos && (
        <MnutricManualForm
          nratendimento={p.id}
          apacheAtual={p.apache}
          sofaAtual={p.sofa}
          onSaved={() => {}}
        />
      )}

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {isUTI && p.mnutric != null && (
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

        <Col span={isUTI && p.mnutric != null ? 12 : 24}>
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
      <SectionTitle>Campo 2 - Diagnóstico nutricional (GLIM)</SectionTitle>

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
          {p.glim_diag !== null ? GLIM_LABEL[p.glim_diag] : "Não avaliado"}
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
                <InstDot $color={INST_DOT_COLOR[item.sev] ?? "#8c8c8c"} />
                <span>{item.d}</span>
                <InstTypeLabel>{INST_TYPE_LABEL[item.t] ?? item.t}</InstTypeLabel>
              </InstItemRow>
            ))}
          </InstPanel>
        </>
      )}

      <Divider style={{ margin: "8px 0" }} />

      <SectionTitle>Resumo Clínico IA</SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Button
          type="primary"
          onClick={llmSummary?.summary ? handleRegenerateLlmSummary : handleGenerateLlmSummary}
          loading={llmSummary?.loading}
          style={{ background: "#7e57c2", borderColor: "#7e57c2" }}
        >
          {llmSummary?.loading
            ? "Gerando resumo..."
            : llmSummary?.summary
            ? "Regenerar"
            : "Gerar resumo"}
        </Button>
        {llmSummary?.loading && (
          <span style={{ color: "#595959", fontSize: 12 }}>Gerando resumo...</span>
        )}
      </div>
      {llmSummary?.error && (
        <Alert type="error" message={llmSummary.error} showIcon style={{ marginBottom: 12 }} />
      )}
      {llmSummary?.summary && (
        <>
          <div
            style={{
              border: "1px solid #e8e8e8",
              borderRadius: 8,
              padding: 14,
              background: "#fafafa",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              color: "#2e3c5a",
            }}
          >
            {llmSummary.summary}
          </div>
          <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 8 }}>
            Gerado em {formatLlmGeneratedAt(llmSummary.generated_at)} · suporte à decisão
          </div>
        </>
      )}
      <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 12 }}>
        Gerado por IA — suporte à decisão clínica, não substitui avaliação profissional
      </div>

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
              <ClockCircleOutlined /> {havalNever ? "Sem avaliação registrada" : `${p.haval}h atrás`}
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
        <GlimSectionLabel>Resultado da avaliação GLIM</GlimSectionLabel>
        <Radio.Group
          value={grad || null}
          onChange={(e) => {
            setGrad(e.target.value);
            if (e.target.value === "nd") {
              setFenSelected([]);
              setEtiolSelected([]);
            }
          }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <Radio value="nd">Sem desnutrição pelos critérios GLIM</Radio>
          <Radio value="mod">Desnutrição moderada</Radio>
          <Radio value="grave">Desnutrição grave</Radio>
        </Radio.Group>
      </div>

      {(grad === "mod" || grad === "grave") && (
        <>
          <Divider style={{ margin: "12px 0" }} />

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

          {/* Frequency from last assessment (most recent) */}
          <div style={{ marginTop: 8, fontSize: 12, color: "#595959" }}>
            <strong>Frequência última avaliação:</strong> {p.hist[0]?.freq ?? "—"}
          </div>
        </>
      )}
    </div>
  );

  // ── Tab: Instabilidade ────────────────────────────────────────────────

  const activeAlerts = p.inst.filter((i) => !i.ack);
  const activeLab = activeAlerts.filter((i) => i.t === "lab");
  const activeClinRx = activeAlerts.filter((i) => i.t !== "lab");

  const tabInst = (
    <div>
      {/* Banner amarelo - alergia não confirmada */}
      {p.alergia && !p.alOk && (
        <div
          style={{
            background: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <WarningOutlined style={{ color: "#d48806", fontSize: 16 }} />
          <span style={{ flex: 1, fontSize: 12, color: "#614700" }}>
            Alergia não confirmada: <strong>{p.alergia}</strong>
          </span>
          <Button size="small" type="primary" danger onClick={handleConfirmAllergy}>
            Confirmar ciência
          </Button>
        </div>
      )}

      {activeLab.length > 0 && (
        <>
          <SectionTitle>Exames laboratoriais</SectionTitle>
          <InstPanel style={{ marginBottom: 16 }}>
            {activeLab.map((item) => (
              <InstItemRow key={item.id}>
                <InstDot $color={INST_DOT_COLOR[item.sev] ?? "#8c8c8c"} />
                <span style={{ flex: 1 }}>{item.d}</span>
                <InstTypeLabel>Laboratório</InstTypeLabel>
                <Button
                  size="small"
                  type="text"
                  style={{ marginLeft: 8, fontSize: 11, color: "#3a9c6e" }}
                  loading={alertsLoading}
                  onClick={() => handleAcknowledgeAlert(item.id)}
                >
                  Reconhecer
                </Button>
              </InstItemRow>
            ))}
          </InstPanel>
        </>
      )}

      {activeClinRx.length > 0 && (
        <>
          <SectionTitle>Achados clínicos / prescrição</SectionTitle>
          <InstPanel style={{ marginBottom: 16 }}>
            {activeClinRx.map((item) => (
              <InstItemRow key={item.id}>
                <InstDot $color={INST_DOT_COLOR[item.sev] ?? "#8c8c8c"} />
                <span style={{ flex: 1 }}>{item.d}</span>
                <InstTypeLabel>{INST_TYPE_LABEL[item.t] ?? item.t}</InstTypeLabel>
                <Button
                  size="small"
                  type="text"
                  style={{ marginLeft: 8, fontSize: 11, color: "#3a9c6e" }}
                  loading={alertsLoading}
                  onClick={() => handleAcknowledgeAlert(item.id)}
                >
                  Reconhecer
                </Button>
              </InstItemRow>
            ))}
          </InstPanel>
        </>
      )}

      {activeAlerts.length === 0 && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="Todos os alertas reconhecidos"
          style={{ marginBottom: 16 }}
        />
      )}

      {activeAlerts.length > 0 && (
        <Button
          block
          type="primary"
          loading={alertsLoading}
          style={{ marginBottom: 16 }}
          onClick={handleAcknowledgeAll}
        >
          ✓ Reconhecer todos os alertas ativos
        </Button>
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
