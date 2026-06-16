import { CheckCircleFilled } from "@ant-design/icons";
import {
  NutritionalPatient,
  AcknowledgedEntry,
  SeverityType,
} from "../../NutritionalSlice";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";
import {
  SEV_CONFIG,
  INST_STYLE,
  calcMbcd,
  sevMNUTRIC,
  sevNRS,
  GLIM_LABEL,
  TRIAGEM_BADGE,
  formatTriagemTooltip,
} from "../../nutritionalUtils";
import { CardBody, CardTop, BedLabel, BadgeRow, PatientName, PatientMeta, SectionLabel, ScoreDual, ScoreChip, ScoreSingle, GlimText, TagsRow, CardFooter, ActionBtn, Badge, Card, TriagemBadge, TriagemDot } from "./styles";
import { Tooltip } from "antd";


interface PatientCardProps {
  patient: NutritionalPatient;
  acknowledged: AcknowledgedEntry | undefined;
  onClick: () => void;
  onOpenTab: (tab: string) => void;
}

const SEV_ORDER: Record<SeverityType, number> = { cr: 3, al: 2, md: 1, bx: 0 };

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

  const activeInst = p.inst.filter((i) => !i.ack);
  const instSlice = activeInst.slice(0, 3);
  const instMore = activeInst.length > 3 ? activeInst.length - 3 : 0;
  const maxInstSev: SeverityType | null = activeInst.length > 0
    ? activeInst.reduce<SeverityType>(
        (max, i) => SEV_ORDER[i.sev ?? "bx"] > SEV_ORDER[max] ? (i.sev ?? "bx") : max,
        "bx"
      )
    : null;

  return (
    <Card $sev={maxInstSev ?? p.sev} $atend={isAtend}>
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

        {/* Badge Triagem 24h — após scores, antes do GLIM */}
        {p.triagem_status && TRIAGEM_BADGE[p.triagem_status] && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 2 }}>
            <Tooltip
              title={formatTriagemTooltip(p.data_internacao, p.triagem_at, p.triagem_status)}
              overlayStyle={{ whiteSpace: "pre-line" }}
            >
              <TriagemBadge
                $bg={TRIAGEM_BADGE[p.triagem_status].bg}
                $color={TRIAGEM_BADGE[p.triagem_status].color}
                $border={TRIAGEM_BADGE[p.triagem_status].border}
              >
                <TriagemDot
                  $color={TRIAGEM_BADGE[p.triagem_status].color}
                  $pulse={p.triagem_status === "atrasada"}
                />
                {TRIAGEM_BADGE[p.triagem_status].label}
              </TriagemBadge>
            </Tooltip>
          </div>
        )}

        {/* Campo 2 – Diagnóstico GLIM */}
        <SectionLabel>Campo 2 – GLIM</SectionLabel>
        <GlimText $color={glimColor}>
          {p.glim_diag !== null ? GLIM_LABEL[p.glim_diag] : "Pendente avaliação"}
        </GlimText>

        {/* Campo 3 – Instabilidade */}
        {activeInst.length > 0 && (
          <>
            <SectionLabel style={{ color: maxInstSev ? INST_STYLE[maxInstSev].color : undefined }}>
              Campo 3 – Instabilidade
            </SectionLabel>
            <TagsRow>
              {instSlice.map((item, i) => {
                const st = INST_STYLE[item.sev] ?? INST_STYLE.md;
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
