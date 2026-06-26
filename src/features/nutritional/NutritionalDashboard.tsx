import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Tag,
  Space,
  Button,
  Segmented,
  Spin,
  Tooltip,
  message,
} from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { selectFila1, selectFila2, selectFila3, selectFila4, selectFila5 } from "src/store/selectors/nutritionalSelectors";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";
import { PageHeader } from "src/styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";
import {
  acknowledgePatient,
  fetchPatients,
  setFiltFila as setFiltFilaAction,
  NutritionalPatient,
  AlaType,
} from "./NutritionalSlice";
import { NutritionalFilter } from "./components/NutritionalFIlter/NutritionalFilter";
import { PatientCard } from "./components/PatientCard/PatientCard";
import { PatientModal } from "./components/PatientModal/PatientModal";
import { ChumleaCalculator } from "./components/ChumleaCalculator/ChumleaCalculator";
import { TriagemIndicatorsBar } from "./components/TriagemIndicators/TriagemIndicatorsBar";
import {
  REFRESH_INTERVAL,
  SEV_CONFIG,
  ALA_CONFIG,
  EMPTY_BEDS,
  ALA_ORDER,
  GLIM_LABEL,
  getPatientScore,
  scoreColorMnutric,
  scoreColorNrs,
  matchFila,
} from "./nutritionalUtils";
import { SummaryBar, SummaryItem, SummaryRight, WardSection, WardHeader, WardLeft, WardDot, WardName, WardSub, BedGrid, EmptyBed, ListCard, ListCardBody, ListCell, ListCellLabel, InlineBadge, ListCardFooter } from "./styles";


export function NutritionalDashboard() {

  const dispatch = useAppDispatch();

  const filtFila = useAppSelector((state) => state.nutritional.filtFila);
  const fila1Patients = useAppSelector(selectFila1);
  const fila2Patients = useAppSelector(selectFila2);
  const fila3Patients = useAppSelector(selectFila3);
  const fila4Patients = useAppSelector(selectFila4);
  const fila5Patients = useAppSelector(selectFila5);
  const { patients, acknowledged, loading, error } = useAppSelector(
    (state) => state.nutritional
  );

  const [viewMode, setViewMode] = useState<"grid" | "lista">("grid");
  const [filtAla, setFiltAla] = useState("all");
  const [filtSev, setFiltSev] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [modalTab, setModalTab] = useState("vis");
  const [filtAlergia, setFiltAlergia] = useState<"" | "com" | "pendente">("");
  const [modalPatientId, setModalPatientId] = useState<number | null>(null);
  const modalPatient = modalPatientId !== null
    ? (patients.find((p: NutritionalPatient) => p.id === modalPatientId) ?? null)
    : null;
  const [showChumlea, setShowChumlea] = useState(false);


  // ── Auto-fetch + 15-min refresh ─────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPatients({}));
    const interval = setInterval(() => dispatch(fetchPatients({})), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [dispatch]);

  // ── Close modal gracefully if patient removed from polling ──────────────
  useEffect(() => {
    if (modalPatientId !== null && modalPatient === null) {
      message.warning("Paciente não encontrado — pode ter recebido alta ou sido transferido.");
      setModalPatientId(null);
    }
  }, [modalPatient, modalPatientId]);

  // ── Filtered + sorted list ──────────────────────────────────────────────
  // matchFila is a pure module-level function — no closure, not a dep.
  const filtered = useMemo(() => {
    let list: NutritionalPatient[] = [...patients];
    if (filtAla !== "all" && filtAla !== "") {
      list = list.filter((p) => p.ala === filtAla);
    }
    if (filtSev && filtSev !== "all") {
      list = list.filter((p) => p.sev === filtSev);
    }
    if (filtAlergia === "com") {
      list = list.filter((p) => p.alergia !== null);
    }
    if (filtAlergia === "pendente") {
      list = list.filter((p) => p.alergia !== null && !p.alOk);
    }
    if (filtFila) {
      list = list.filter((p) => matchFila(p, filtFila));
    }
    return list.sort((a, b) =>
      sortAsc
        ? getPatientScore(a) - getPatientScore(b)
        : getPatientScore(b) - getPatientScore(a)
    );
  }, [patients, filtAla, filtSev, filtFila, filtAlergia, sortAsc, acknowledged]);

  // ── Summary counts ──────────────────────────────────────────────────────
  const summary = useMemo(
    () => ({
      cr: patients.filter((p: NutritionalPatient) => p.sev === "cr").length,
      al: patients.filter((p: NutritionalPatient) => p.sev === "al").length,
      md: patients.filter((p: NutritionalPatient) => p.sev === "md").length,
      atend: Object.keys(acknowledged).length,
      glimPendente: patients.filter((p: NutritionalPatient) => !p.glim_diag).length,
      d7: patients.filter((p: NutritionalPatient) => p.d7).length,
      desg: patients.filter((p: NutritionalPatient) => p.glim_diag === "grave").length,
      total: patients.length,
    }),
    [patients, acknowledged]
  );

  const countsAlergia = useMemo(() => ({
    com: patients.filter((p: NutritionalPatient) => p.alergia !== null).length,
    pendente: patients.filter((p: NutritionalPatient) => p.alergia !== null && !p.alOk).length,
  }), [patients]);

  const handleAcknowledge = (id: number) => {
    dispatch(
      acknowledgePatient({
        id,
        hora: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        prof: "Nutr. Silva",
      })
    );
  };

  const handleOpenTab = (patient: NutritionalPatient, tab: string) => {
    setModalPatientId(patient.id);
    setModalTab(tab);
  };

  const alaKeys: AlaType[] =
    filtAla === "all" || filtAla === "" ? ALA_ORDER : ([filtAla] as AlaType[]);

  const showEmptyBeds = !filtSev && !filtFila;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {error && (
        <Alert
          type="warning"
          message={`Não foi possível buscar dados da API: ${error}`}
          closable
          style={{ marginBottom: 12 }}
        />
      )}
      <PageHeader>
        <div>
          <h1 className="page-header-title">Painel Nutricional</h1>
          <span className="page-header-legend">
            UTI: mNUTRIC + NRS-2002 · Alas B e C: NRS-2002 · Mechanick et al. 2026
          </span>
        </div>
        <div className="page-header-actions">
          <Button
            icon={<CalculatorOutlined />}
            onClick={() => setShowChumlea(true)}
          >
            Chumlea
          </Button>
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as "grid" | "lista")}
            options={[
              {
                label: "Leitos",
                value: "grid",
                icon: <AppstoreOutlined />,
              },
              {
                label: "Lista",
                value: "lista",
                icon: <UnorderedListOutlined />,
              },
            ]}
          />
        </div>
      </PageHeader>

      {/* Filter bar */}
      <NutritionalFilter
        filtAla={filtAla}
        filtSev={filtSev}
        filtAlergia={filtAlergia}
        countsAlergia={countsAlergia}
        filtFila={filtFila}
        countsFila={{
          FILA1: fila1Patients.length,
          FILA2: fila2Patients.length,
          FILA3: fila3Patients.length,
          FILA4: fila4Patients.length,
          FILA5: fila5Patients.length,
        }}
        sortAsc={sortAsc}
        onAlaChange={setFiltAla}
        onSevChange={setFiltSev}
        onAlergiaChange={setFiltAlergia}
        onFilaChange={(val) => dispatch(setFiltFilaAction(val))}
        onSortToggle={() => setSortAsc((v) => !v)}
      />

      <TriagemIndicatorsBar ala={filtAla} />

      {/* Summary bar */}
      <SummaryBar>
        {[
          { key: "cr", label: "Crítico", value: summary.cr, color: "#c41e3a", sev: "cr" },
          { key: "al", label: "Alto risco", value: summary.al, color: "#e24b4a", sev: "al" },
          { key: "md", label: "Médio risco", value: summary.md, color: "#d4931a", sev: "md" },
          { key: "atend", label: "Atendidos", value: summary.atend, color: "#3a9c6e", sev: null },
          { key: "glimPendente", label: "GLIM pendente", value: summary.glimPendente, color: "#7e57c2", sev: null },
          { key: "d7", label: "D7 pendente", value: summary.d7, color: "#7e57c2", sev: null },
          { key: "desg", label: "Desnut. grave", value: summary.desg, color: "#7f0d1f", sev: null },
        ].map(({ key, label, value, color, sev }) => (
          <SummaryItem
            key={key}
            $color={color}
            $clickable={!!sev}
            onClick={() => {
              if (sev) {
                dispatch(setFiltFilaAction(""));
                setFiltSev(filtSev === sev ? "" : sev);
              }
            }}
          >
            <span className="sc-count">{value}</span>
            <span className="sc-label">{label}</span>
          </SummaryItem>
        ))}
        <SummaryRight>
          <div className="sr-main">
            {filtered.length}/{summary.total} · mNUTRIC + NRS-2002 + GLIM
          </div>
          <div className="sr-sub">Mechanick 2026 · Jensen 2019</div>
        </SummaryRight>
      </SummaryBar>

      {/* Content */}
      {loading && !patients.length && (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
      )}
      {viewMode === "grid" ? (
        <div>
          {alaKeys.map((ak) => {
            const alaPatients = filtered.filter((p) => p.ala === ak);
            const alaCfg = ALA_CONFIG[ak];
            if (!alaPatients.length && !showEmptyBeds) return null;

            return (
              <WardSection key={ak}>
                <WardHeader>
                  <WardLeft>
                    <WardDot $color={alaCfg.color} />
                    <div>
                      <WardName>{alaCfg.nome}</WardName>
                      <WardSub> · {alaPatients.length} pacientes</WardSub>
                    </div>
                  </WardLeft>
                  <Space>
                    <Tag
                      color={ak === "UTI" ? "purple" : "cyan"}
                      style={{ fontSize: 10 }}
                    >
                      {alaCfg.protocol}
                    </Tag>
                  </Space>
                </WardHeader>
                <BedGrid>
                  {alaPatients.map((p) => (
                    <PatientCard
                      key={p.id}
                      patient={p}
                      acknowledged={acknowledged[p.id]}
                      onClick={() => handleOpenTab(p, "vis")}
                      onOpenTab={(tab) => handleOpenTab(p, tab)}
                    />
                  ))}
                  {showEmptyBeds &&
                    EMPTY_BEDS[ak].map((bed) => (
                      <EmptyBed key={bed}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#e0e0e0",
                            flexShrink: 0,
                            display: "inline-block",
                          }}
                        />
                        {bed}
                      </EmptyBed>
                    ))}
                </BedGrid>
              </WardSection>
            );
          })}
          {filtered.length === 0 && (
            <PageCard>
              <div style={{ textAlign: "center", color: "#8c8c8c", padding: 40 }}>
                Nenhum resultado com os filtros selecionados.
              </div>
            </PageCard>
          )}
        </div>
      ) : (
        <div>
          {alaKeys.map((ak) => {
            const alaPatients = filtered.filter((p) => p.ala === ak);
            if (!alaPatients.length) return null;
            const alaCfg = ALA_CONFIG[ak];

            return (
              <WardSection key={ak}>
                <WardHeader>
                  <WardLeft>
                    <WardDot $color={alaCfg.color} />
                    <WardName>{alaCfg.nome}</WardName>
                    <WardSub>· {alaPatients.length} pacientes</WardSub>
                  </WardLeft>
                  <Tag color={ak === "UTI" ? "purple" : "cyan"}>
                    {alaCfg.protocol}
                  </Tag>
                </WardHeader>
                <div
                  style={{
                    border: "1px solid #f0f0f0",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    overflow: "hidden",
                    background: "#fff",
                    padding: "8px",
                  }}
                >
                  {alaPatients.map((p) => {
                    const isAtend = !!acknowledged[p.id];
                    const sevCfg = p.sev ? SEV_CONFIG[p.sev] : SEV_CONFIG["bx"];
                    const isUTI = p.ala === "UTI";
                    const havalNever = p.haval >= 999;
                    const havalColor = havalNever ? "#c41e3a"
                      : p.haval > 48 ? "#c41e3a"
                      : p.haval > 24 ? "#d4931a"
                      : "#3a9c6e";

                    const instTags = p.inst.slice(0, 3);
                    const instMore = p.inst.length > 3 ? p.inst.length - 3 : 0;

                    return (
                      <ListCard key={p.id} $leftColor={sevCfg.leftBorder}>
                        <ListCardBody>
                          {/* Score */}
                          <ListCell>
                            <ListCellLabel>Score</ListCellLabel>
                            {isUTI && p.mnutric != null ? (
                              <div style={{ display: "flex", gap: 4 }}>
                                <div style={{ textAlign: "center" }}>
                                  <div
                                    style={{
                                      fontSize: 15,
                                      fontWeight: 700,
                                      lineHeight: 1,
                                      color: scoreColorMnutric(p.mnutric),
                                    }}
                                  >
                                    {p.mnutric}
                                  </div>
                                  <div style={{ fontSize: 8, color: "#8c8c8c" }}>
                                    mNUTRIC
                                  </div>
                                </div>
                                <div
                                  style={{ width: 1, background: "#f0f0f0" }}
                                />
                                <div style={{ textAlign: "center" }}>
                                  <div
                                    style={{
                                      fontSize: 15,
                                      fontWeight: 700,
                                      lineHeight: 1,
                                      color: scoreColorNrs(p.nrs),
                                    }}
                                  >
                                    {p.nrs}
                                  </div>
                                  <div style={{ fontSize: 8, color: "#8c8c8c" }}>
                                    NRS
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ textAlign: "center" }}>
                                <div
                                  style={{
                                    fontSize: 17,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    color: scoreColorNrs(p.nrs),
                                  }}
                                >
                                  {p.nrs}
                                </div>
                                <div style={{ fontSize: 8, color: "#08979c" }}>
                                  NRS-2002
                                </div>
                              </div>
                            )}
                          </ListCell>

                          {/* Leito + Paciente */}
                          <ListCell>
                            <div style={{ fontWeight: 600, color: "#2e3c5a", fontSize: 13 }}>
                              {p.leito} — {FeatureService.has(Feature.HIDE_NAMES) ? "****** ******" : p.nome}
                            </div>
                            <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                              {FeatureService.has(Feature.HIDE_NAMES) ? "**a" : `${p.idade}a`} · {p.dias}d · #{p.pri} fila
                            </div>
                            {(p.dados_incompletos || p.nrs_completo === false) && (
                              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                                {p.dados_incompletos && (
                                  <span style={{ display: "inline-block", padding: "1px 5px", borderRadius: "9px", fontSize: "9px", fontWeight: 600, background: "#fffbe6", color: "#d48806", border: "1px solid #ffe58f" }}>
                                    ⚠️ APACHE/SOFA necessários
                                  </span>
                                )}
                                {p.nrs_completo === false && (
                                  <span style={{ display: "inline-block", padding: "1px 5px", borderRadius: "9px", fontSize: "9px", fontWeight: 600, background: "#fff1f0", color: "#cf1322", border: "1px solid #ffa39e" }}>
                                    Score incompleto
                                  </span>
                                )}
                              </div>
                            )}
                          </ListCell>

                          {/* Campo 1 · Risco */}
                          <ListCell>
                            <ListCellLabel>Campo 1 · Risco</ListCellLabel>
                            <InlineBadge
                              $bg={sevCfg.bg}
                              $color={sevCfg.color}
                              $border={sevCfg.border}
                            >
                              {sevCfg.label}
                            </InlineBadge>
                          </ListCell>

                          {/* Campo 2 · GLIM */}
                          <ListCell>
                            <ListCellLabel>Campo 2 · GLIM</ListCellLabel>
                            {p.glim_diag !== null ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  color:
                                    p.glim_diag === "grave"
                                      ? "#7f0d1f"
                                      : p.glim_diag === "mod"
                                        ? "#a32d2d"
                                        : "#3a9c6e",
                                  fontWeight: 500,
                                }}
                              >
                                {GLIM_LABEL[p.glim_diag]}
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, color: "#d4931a" }}>
                                Pendente avaliação
                              </span>
                            )}
                          </ListCell>

                          {/* Campo 3 · Instabilidade */}
                          <ListCell>
                            <ListCellLabel>Campo 3 · Instabilidade</ListCellLabel>
                            {p.inst.length === 0 ? (
                              <span style={{ fontSize: 11, color: "#bdbdbd" }}>—</span>
                            ) : (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                {instTags.map((item, i) => {
                                  const tagStyle =
                                    item.t === "lab"
                                      ? { bg: "#fcebeb", color: "#a32d2d", border: "#f09595" }
                                      : item.t === "clin"
                                        ? { bg: "#fdf3dc", color: "#b7770d", border: "#fac775" }
                                        : { bg: "#f0eeff", color: "#3c3489", border: "#b39ddb" };
                                  return (
                                    <Tooltip key={i} title={item.d}>
                                      <InlineBadge
                                        $bg={tagStyle.bg}
                                        $color={tagStyle.color}
                                        $border={tagStyle.border}
                                      >
                                        {item.d.split(" ")[0]}
                                      </InlineBadge>
                                    </Tooltip>
                                  );
                                })}
                                {instMore > 0 && (
                                  <InlineBadge
                                    $bg="#f5f5f5"
                                    $color="#8c8c8c"
                                    $border="#e0e0e0"
                                  >
                                    +{instMore}
                                  </InlineBadge>
                                )}
                              </div>
                            )}
                          </ListCell>

                          {/* Actions */}
                          <ListCell>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {isAtend ? (
                                <>
                                  <Tag
                                    color="success"
                                    style={{ fontSize: 10, margin: 0, width: "fit-content" }}
                                  >
                                    <CheckCircleOutlined /> Atendido
                                  </Tag>
                                  <div style={{ fontSize: 10, color: "#8c8c8c" }}>
                                    {acknowledged[p.id].hora}
                                  </div>
                                </>
                              ) : (
                                <Button
                                  size="small"
                                  type="primary"
                                  danger={p.sev === "cr" || p.sev === "al"}
                                  onClick={() => handleAcknowledge(p.id)}
                                  style={{ fontSize: 11 }}
                                >
                                  ✓ Reconhecer
                                </Button>
                              )}
                              <Button
                                size="small"
                                onClick={() => handleOpenTab(p, "vis")}
                                style={{ fontSize: 11 }}
                              >
                                Detalhes →
                              </Button>
                            </div>
                          </ListCell>
                        </ListCardBody>

                        {/* Footer */}
                        <ListCardFooter>
                          <span>
                            <strong style={{ color: "#2e3c5a" }}>Conduta:</strong>{" "}
                            {p.conduta}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <ClockCircleOutlined style={{ color: havalColor }} />
                            <span style={{ color: havalColor }}>{havalNever ? "Sem avaliação" : `${p.haval}h s/ aval.`}</span>
                          </span>
                          {p.alergia && (
                            <InlineBadge
                              $bg="#fff7e6"
                              $color="#b05a10"
                              $border="#f5c39a"
                            >
                              ⚠ Alergia: {p.alergia}
                            </InlineBadge>
                          )}
                        </ListCardFooter>
                      </ListCard>
                    );
                  })}
                </div>
              </WardSection>
            );
          })}
          {filtered.length === 0 && (
            <PageCard>
              <div style={{ textAlign: "center", color: "#8c8c8c", padding: 40 }}>
                Nenhum resultado com os filtros selecionados.
              </div>
            </PageCard>
          )}
        </div>
      )}

      {/* Chumlea calculator modal */}
      <ChumleaCalculator
        open={showChumlea}
        onClose={() => setShowChumlea(false)}
      />

      {/* Patient detail modal */}
      <PatientModal
        patient={modalPatient}
        acknowledged={acknowledged}
        activeTab={modalTab}
        onTabChange={setModalTab}
        onClose={() => setModalPatientId(null)}
      />
    </>
  );
}
