/**
 * NutritionalDashboard – Painel principal de acompanhamento nutricional.
 * Integra filas de prioridade, badges de alerta e seletores Redux.
 * Issue #33 – US-BE-06
 */
import { useMemo, useState } from "react";
import {
  Tag,
  Space,
  Button,
  Segmented,
  Tooltip,
} from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

import { useAppDispatch, useAppSelector } from "src/store";
import { selectFila1, selectFila5 } from "src/store/selectors/nutritionalSelectors";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";
import { PageHeader } from "src/styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";
import {
  acknowledgePatient,
  setFiltFila as setFiltFilaAction,
  NutritionalPatient,
  AlaType,
  AcknowledgedEntry,
} from "./NutritionalSlice";
import { NutritionalFilter } from "./NutritionalFilter";
import { PatientCard } from "./components/PatientCard";
import { PatientModal } from "./components/PatientModal";
import {
  SEV_CONFIG,
  ALA_CONFIG,
  EMPTY_BEDS,
  getPatientScore,
  scoreColorMnutric,
  scoreColorNrs,
  GLIM_LABEL,
} from "./nutritionalUtils";

// ─── Layout helpers ───────────────────────────────────────────────────────────

const WardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  flex-wrap: wrap;
  gap: 8px;
`;

const WardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const WardDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: inline-block;
  flex-shrink: 0;
`;

const WardName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #2e3c5a;
`;

const WardSub = styled.span`
  font-size: 11px;
  color: #8c8c8c;
`;

const BedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 8px;
  padding: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 0 0 8px 8px;
`;

const EmptyBed = styled.div`
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fafafa;
  font-size: 10px;
  color: #bdbdbd;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const WardSection = styled.div`
  margin-bottom: 20px;
`;

const SummaryBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SummaryItem = styled.div<{ $color: string; $clickable?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 16px;
  border-right: 1px solid #f0f0f0;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  transition: background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${(p) => (p.$clickable ? "#fafafa" : "transparent")};
  }

  .sc-count {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    color: ${(p) => p.$color};
  }

  .sc-label {
    font-size: 10px;
    color: #8c8c8c;
    margin-top: 2px;
  }
`;

const SummaryRight = styled.div`
  margin-left: auto;
  padding: 8px 16px;
  text-align: right;
  flex-shrink: 0;

  .sr-main {
    font-size: 12px;
    font-weight: 600;
    color: #2e3c5a;
    white-space: nowrap;
  }

  .sr-sub {
    font-size: 10px;
    color: #8c8c8c;
    margin-top: 2px;
    white-space: nowrap;
  }
`;

// ─── List view styled components ─────────────────────────────────────────────

const ListCard = styled.div<{ $leftColor: string }>`
  border: 1px solid #f0f0f0;
  border-left: 4px solid ${(p) => p.$leftColor};
  border-radius: 0 6px 6px 0;
  background: #fff;
  margin-bottom: 6px;
  overflow: hidden;
`;

const ListCardBody = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr 160px 160px 1fr 130px;
  gap: 0;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 60px 1fr 120px 1fr 100px;
  }
`;

const ListCell = styled.div`
  padding: 10px 12px;
  border-right: 1px solid #f8f8f8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 12px;

  &:last-child {
    border-right: none;
  }
`;

const ListCellLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #bdbdbd;
  font-weight: 600;
  margin-bottom: 3px;
`;

const ListCardFooter = styled.div`
  border-top: 1px solid #f5f5f5;
  padding: 6px 12px;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  color: #8c8c8c;
  flex-wrap: wrap;
`;

const InlineBadge = styled.span<{ $bg: string; $color: string; $border: string }>`
  display: inline-block;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  border: 1px solid ${(p) => p.$border};
  white-space: nowrap;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const ALA_ORDER: AlaType[] = ["UTI", "B", "C"];

// ─── matchFila helper ─────────────────────────────────────────────────────────

function matchFila(
  p: NutritionalPatient,
  filtFila: string,
  _acknowledged: Record<number, AcknowledgedEntry>
): boolean {
  if (!filtFila || filtFila === "all") return true;
  if (filtFila === "FILA1") return (p.sev === "cr" || p.sev === "al") && p.haval > 18;
  if (filtFila === "FILA2") return p.haval > 18;
  if (filtFila === "FILA5") return p.d7 === true;
  return true;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NutritionalDashboard() {
  const dispatch = useAppDispatch();
  const { patients, acknowledged, filtFila } = useAppSelector(
    (state: any) => state.nutritional
  );

  const [viewMode, setViewMode] = useState<"grid" | "lista">("grid");
  const [filtAla, setFiltAla] = useState("all");
  const [filtSev, setFiltSev] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [modalPatient, setModalPatient] = useState<NutritionalPatient | null>(null);

  const fila1Patients = useAppSelector(selectFila1);
  const fila5Patients = useAppSelector(selectFila5);
  const [modalTab, setModalTab] = useState("vis");

  // ── Filtered + sorted list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list: NutritionalPatient[] = [...patients];
    if (filtAla !== "all" && filtAla !== "") {
      list = list.filter((p) => p.ala === filtAla);
    }
    if (filtSev && filtSev !== "all") {
      list = list.filter((p) => p.sev === filtSev);
    }
    if (filtFila) {
      list = list.filter((p) => matchFila(p, filtFila, acknowledged));
    }
    return list.sort((a, b) =>
      sortAsc
        ? getPatientScore(a) - getPatientScore(b)
        : getPatientScore(b) - getPatientScore(a)
    );
  }, [patients, filtAla, filtSev, filtFila, sortAsc, acknowledged]);

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

  // ── Acknowledge action ──────────────────────────────────────────────────
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
    setModalPatient(patient);
    setModalTab(tab);
  };

  const alaKeys: AlaType[] =
    filtAla === "all" || filtAla === "" ? ALA_ORDER : ([filtAla] as AlaType[]);

  const showEmptyBeds = !filtSev && !filtFila;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Painel Nutricional</h1>
          <span className="page-header-legend">
            UTI: mNUTRIC + NRS-2002 · Alas B e C: NRS-2002 · Mechanick et al. 2026
          </span>
        </div>
        <div className="page-header-actions">
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
        filtFila={filtFila}
        countsFila={{
          FILA1: fila1Patients.length,
          FILA2: patients.filter((p: NutritionalPatient) => p.haval > 18).length,
          FILA5: fila5Patients.length,
        }}
        sortAsc={sortAsc}
        onAlaChange={setFiltAla}
        onSevChange={setFiltSev}
        onFilaChange={(val) => dispatch(setFiltFilaAction(val))}
        onSortToggle={() => setSortAsc((v) => !v)}
      />

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
                    const sevCfg = SEV_CONFIG[p.sev];
                    const isUTI = p.ala === "UTI";
                    const havalColor =
                      p.haval > 48
                        ? "#c41e3a"
                        : p.haval > 24
                          ? "#d4931a"
                          : "#3a9c6e";

                    const instTags = p.inst.slice(0, 3);
                    const instMore = p.inst.length > 3 ? p.inst.length - 3 : 0;

                    return (
                      <ListCard key={p.id} $leftColor={sevCfg.leftBorder}>
                        <ListCardBody>
                          {/* Score */}
                          <ListCell>
                            <ListCellLabel>Score</ListCellLabel>
                            {isUTI && p.mnutric !== null ? (
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
                                    ❌ Pontuação incompleta
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
                            <span style={{ color: havalColor }}>{p.haval}h s/ avaliação</span>
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

      {/* Patient detail modal */}
      <PatientModal
        patient={modalPatient}
        acknowledged={acknowledged}
        activeTab={modalTab}
        onTabChange={setModalTab}
        onClose={() => setModalPatient(null)}
      />
    </>
  );
}
