import { SEV_CONFIG } from "../../nutritionalUtils";
import { ScorePanel, ScorePanelTitle, ScorePanelValue, DimsGrid, DimChip } from "./styles";

//ScoreBox Component

type Protocolo = "MNUTRIC" | "NRS2002";
type Classificacao = "cr" | "al" | "md" | "bx" | null;

interface ScoreBoxProps {
  protocolo: Protocolo;
  dims: (number | null | undefined)[];
  labels: string[];
  total: number | null;
  classificacao: Classificacao;
  completo: boolean;
}

const PROTOCOLO_CONFIG = {
  MNUTRIC: { title: "mNUTRIC · Alto risco ≥ 5", color: "#7e57c2", max: 10 },
  NRS2002: { title: "NRS-2002 · Alto risco ≥ 3", color: "#08979c", max: 7 },
};

const SEV_PANEL = {
  cr: { borderColor: "rgba(196,30,58,0.3)", bg: "rgba(196,30,58,0.04)" },
  al: { borderColor: "rgba(226,75,74,0.3)", bg: "rgba(226,75,74,0.04)" },
  md: { borderColor: "rgba(212,147,26,0.3)", bg: "rgba(212,147,26,0.04)" },
  bx: { borderColor: "rgba(58,156,110,0.3)", bg: "rgba(58,156,110,0.04)" },
};

export function ScoreBox({ protocolo, dims, labels, total, classificacao, completo }: ScoreBoxProps) {
  const cfg = PROTOCOLO_CONFIG[protocolo];
  const panel = classificacao ? SEV_PANEL[classificacao] : SEV_PANEL.bx;
  const sevColor = classificacao ? SEV_CONFIG[classificacao].leftBorder : cfg.color;

  if (total == null) {
    return (
      <ScorePanel $borderColor={panel.borderColor} $bg={panel.bg}>
        <ScorePanelTitle $color={cfg.color}>{cfg.title}</ScorePanelTitle>
        <div style={{ fontSize: 11, color: "#8c8c8c", padding: "8px 0" }}>
          Aguardando triagem
        </div>
      </ScorePanel>
    );
  }

  return (
    <ScorePanel $borderColor={panel.borderColor} $bg={panel.bg}>
      <ScorePanelTitle $color={cfg.color}>{cfg.title}</ScorePanelTitle>
      <ScorePanelValue $color={sevColor}>
        {total} / {cfg.max}
      </ScorePanelValue>

      {!completo && (
        <span style={{
          display: "inline-block",
          padding: "1px 6px",
          borderRadius: 9,
          fontSize: 9,
          fontWeight: 600,
          background: "#fff1f0",
          color: "#cf1322",
          border: "1px solid #ffa39e",
          marginBottom: 4,
        }}>
          Score incompleto
        </span>
      )}

      <DimsGrid>
        {dims.map((val, i) => (
          <DimChip key={labels[i]}>
            <div className="dim-val" style={{ color: cfg.color }}>
              {val ?? 0}
            </div>
            <div className="dim-lbl" style={{ whiteSpace: "pre-line" }}>
              {labels[i]}
            </div>
          </DimChip>
        ))}
      </DimsGrid>
    </ScorePanel>
  );
}