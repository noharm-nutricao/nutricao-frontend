import styled from "styled-components";
import { Tooltip } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

import {
  NutritionalPatient,
  AcknowledgedEntry,
  SeverityType,
} from "../NutritionalSlice";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";
import {
  SEV_CONFIG,
  calcMbcd,
  sevMNUTRIC,
  sevNRS,
  GLIM_LABEL,
} from "../nutritionalUtils";

const Card = styled.div<{ $sev: SeverityType | null; $atend: boolean }>`
  border: 1px solid
    ${(p) => p.$atend ? "#b7eb8f" : p.$sev ? SEV_CONFIG[p.$sev].border : "#d9d9d9"};
  border-left: 4px solid
    ${(p) => p.$atend ? "#52c41a" : p.$sev ? SEV_CONFIG[p.$sev].leftBorder : "#bdbdbd"};
  border-radius: 8px;
  background: ${(p) => p.$atend ? "#f6ffed" : p.$sev ? "#fff" : "#fafafa"};
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.15s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const CardBody = styled.div`
  padding: 10px 12px;
  cursor: pointer;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
`;

const BedLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #8c8c8c;
  letter-spacing: 0.04em;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Badge = styled.span<{ $bg: string; $color: string; $border: string }>`
  display: inline-block;
  padding: 1px 5px;
  border-radius: 9px;
  font-size: 9px;
  font-weight: 600;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  border: 1px solid ${(p) => p.$border};
  white-space: nowrap;
`;

const PatientName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #2e3c5a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 1px;
`;

const PatientMeta = styled.div`
  font-size: 10px;
  color: #8c8c8c;
  margin-bottom: 8px;
`;

const SectionLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #bdbdbd;
  font-weight: 600;
  margin-bottom: 3px;
  margin-top: 6px;
`;

const ScoreDual = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 2px;
`;

const ScoreChip = styled.div<{ $color: string }>`
  flex: 1;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 4px 6px;
  text-align: center;

  .score-num {
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    color: ${(p) => p.$color};
  }

  .score-lbl {
    font-size: 8px;
    font-weight: 700;
    color: #8c8c8c;
    margin-top: 1px;
    letter-spacing: 0.04em;
  }
`;

const ScoreSingle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
`;

const GlimText = styled.div<{ $color: string }>`
  font-size: 11px;
  color: ${(p) => p.$color};
  font-weight: 500;
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
`;

const CardFooter = styled.div`
  border-top: 1px solid #f0f0f0;
  padding: 6px 10px;
  background: #fafafa;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button<{ $bg: string }>`
  font-size: 10px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  border: none;
  background: ${(p) => p.$bg};
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.15s;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
`;

interface PatientCardProps {
  patient: NutritionalPatient;
  acknowledged: AcknowledgedEntry | undefined;
  onClick: () => void;
  onOpenTab: (tab: string) => void;
}

const INST_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  lab: { bg: "#fcebeb", color: "#a32d2d", border: "#f09595" },
  clin: { bg: "#fdf3dc", color: "#b7770d", border: "#fac775" },
  rx: { bg: "#f0eeff", color: "#3c3489", border: "#b39ddb" },
};

export function PatientCard({
  patient: p,
  acknowledged,
  onClick,
  onOpenTab,
}: PatientCardProps) {
  const isUTI = p.ala === "UTI";
  const isAtend = !!acknowledged;

  const mbcd = calcMbcd(p);
  const mbcdColor =
    mbcd === 4 ? "#c41e3a" : mbcd === 3 ? "#e24b4a" : mbcd === 2 ? "#d4931a" : "#8c8c8c";

  const mnSev = p.mnutric != null ? sevMNUTRIC(p.mnutric) : null;
  const nrsSev = sevNRS(p.nrs);

  const glimColor =
    p.glim_diag === "grave"
      ? "#7f0d1f"
      : p.glim_diag === "mod"
        ? "#a32d2d"
        : p.glim_diag === "nd"
          ? "#3a9c6e"
          : "#d4931a";

  const instSlice = p.inst.slice(0, 3);
  const instMore = p.inst.length > 3 ? p.inst.length - 3 : 0;

  return (
    <Card $sev={p.sev} $atend={isAtend}>
      <CardBody onClick={onClick}>
        <CardTop>
          <BedLabel>{p.leito}</BedLabel>
          <BadgeRow>
            <Badge $bg="#f5f5f5" $color={mbcdColor} $border="#e0e0e0">
              M{mbcd}
            </Badge>
            {!p.glim_diag && (
              <Badge $bg="#fff8e1" $color="#f59e0b" $border="#fcd34d">
                GLIM?
              </Badge>
            )}
            {p.alergia && !p.alOk && (
              <Badge $bg="#fff1f0" $color="#cf1322" $border="#ffa39e">
                Alg!
              </Badge>
            )}
            {p.d7 && (
              <Badge $bg="#f0eeff" $color="#7e57c2" $border="#b39ddb">
                D7
              </Badge>
            )}
            {isAtend && (
              <Tooltip title={`${acknowledged!.prof} · ${acknowledged!.hora}`}>
                <CheckCircleFilled style={{ color: "#52c41a", fontSize: 12 }} />
              </Tooltip>
            )}
          </BadgeRow>
        </CardTop>

        <PatientName title={FeatureService.has(Feature.HIDE_NAMES) ? "****** ******" : p.nome}>
          {FeatureService.has(Feature.HIDE_NAMES) ? "****** ******" : p.nome}
        </PatientName>
        <PatientMeta>
          {FeatureService.has(Feature.HIDE_NAMES) ? "**a" : `${p.idade}a`} · {p.dias}d · #{p.pri}
          {(p.dados_incompletos || p.nrs_completo === false) && (
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
              {p.dados_incompletos && (
                <Badge $bg="#fffbe6" $color="#d48806" $border="#ffe58f">
                  ⚠️ APACHE/SOFA necessários
                </Badge>
              )}
              {p.nrs_completo === false && (
                <Badge $bg="#fff1f0" $color="#cf1322" $border="#ffa39e">
                  Score incompleto
                </Badge>
              )}
            </div>
          )}
        </PatientMeta>

        {/* Campo 1 – Risco nutricional */}
        <SectionLabel>Campo 1 – Risco</SectionLabel>
        {isUTI && p.mnutric != null ? (
          <ScoreDual>
            <Tooltip
              title={p.mn_dims ? `Idade ${p.mn_dims.idade} · APACHE ${p.mn_dims.apache} · SOFA ${p.mn_dims.sofa} · Comor ${p.mn_dims.comor} · Dias ${p.mn_dims.dias}` : undefined}
            >
              <ScoreChip $color={mnSev ? SEV_CONFIG[mnSev].leftBorder : "#bdbdbd"}>
                <div className="score-num">{p.mnutric}</div>
                <div className="score-lbl">mNUTRIC</div>
              </ScoreChip>
            </Tooltip>
            <Tooltip
              title={p.nrs_dims ? `Nut ${p.nrs_dims.nut ?? "-"} · Doença ${p.nrs_dims.doenca} · Idade ${p.nrs_dims.idade}` : undefined}
            >
              <ScoreChip $color={SEV_CONFIG[nrsSev].leftBorder}>
                <div className="score-num">{p.nrs}</div>
                <div className="score-lbl">NRS</div>
              </ScoreChip>
            </Tooltip>
          </ScoreDual>
        ) : (
          <ScoreSingle>
            <Tooltip
              title={p.nrs_dims ? `Nut ${p.nrs_dims.nut ?? "-"} · Doença ${p.nrs_dims.doenca} · Idade ${p.nrs_dims.idade}` : undefined}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: SEV_CONFIG[nrsSev].leftBorder }}>
                NRS {p.nrs}
              </span>
            </Tooltip>
            <Badge $bg="#e6fffb" $color="#08979c" $border="#87e8de">
              NRS-2002
            </Badge>
          </ScoreSingle>
        )}
        {isUTI && (
          <div style={{ textAlign: "right", marginTop: 2 }}>
            <Badge $bg="#f0eeff" $color="#7e57c2" $border="#b39ddb">
              mNUTRIC
            </Badge>
          </div>
        )}

        {/* Campo 2 – Diagnóstico GLIM */}
        <SectionLabel>Campo 2 – GLIM</SectionLabel>
        <GlimText $color={glimColor}>
          {p.glim_diag !== null ? GLIM_LABEL[p.glim_diag] : "Pendente avaliação"}
        </GlimText>

        {/* Campo 3 – Instabilidade */}
        {p.inst.length > 0 && (
          <>
            <SectionLabel>Campo 3 – Instabilidade</SectionLabel>
            <TagsRow>
              {instSlice.map((item, i) => {
                const st = INST_STYLE[item.t] ?? INST_STYLE.lab;
                return (
                  <Tooltip key={i} title={item.d}>
                    <Badge $bg={st.bg} $color={st.color} $border={st.border}>
                      {item.d.split(" ")[0]}
                    </Badge>
                  </Tooltip>
                );
              })}
              {instMore > 0 && (
                <Badge $bg="#f5f5f5" $color="#8c8c8c" $border="#e0e0e0">
                  +{instMore}
                </Badge>
              )}
            </TagsRow>
          </>
        )}

        {/* Extra row */}
        {isAtend && (
          <TagsRow>
            <Badge $bg="#f6ffed" $color="#389e0d" $border="#b7eb8f">
              Atendido
            </Badge>
          </TagsRow>
        )}
      </CardBody>

      {/* Action footer */}
      <CardFooter>
        {!p.glim_diag && (
          <ActionBtn
            $bg="#7e57c2"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTab("glim");
            }}
          >
            GLIM
          </ActionBtn>
        )}
        {!isUTI && (
          <ActionBtn
            $bg="#1db89a"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTab("nrs");
            }}
          >
            NRS
          </ActionBtn>
        )}
        <ActionBtn
          $bg="#3a9c6e"
          onClick={(e) => {
            e.stopPropagation();
            onOpenTab("aval");
          }}
        >
          Avaliar
        </ActionBtn>
      </CardFooter>
    </Card>
  );
}
