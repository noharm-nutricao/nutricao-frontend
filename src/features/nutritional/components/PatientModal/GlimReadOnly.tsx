import { Button } from "antd";
import { GLIM_LABEL, GLIM_FEN_LABEL, GLIM_ETIOL_LABEL } from "../../nutritionalUtils";
import { GlimPanel, GlimSectionLabel, ChipsRow, Chip, GlimDiagBadge, GovernanceNote } from "./styles";
import { GlimDiag } from "../../NutritionalSlice";


//Glim Component

interface GlimReadOnlyProps {
  glim_fen: string[];
  glim_etiol: string[];
  glim_diag: GlimDiag;
  onPreencher: () => void;
}

export function GlimReadOnly({ glim_fen, glim_etiol, glim_diag, onPreencher }: GlimReadOnlyProps) {
  return (
    <GlimPanel style={{ marginBottom: 12 }}>
      <GlimSectionLabel>Critérios fenotípicos presentes:</GlimSectionLabel>
      <ChipsRow>
        {(["perda_peso", "baixo_imc", "massa_muscular"] as const).map((key) => (
          <Chip key={key} $active={glim_fen.includes(key)}>
            {GLIM_FEN_LABEL[key]}
          </Chip>
        ))}
      </ChipsRow>

      <GlimSectionLabel>Critérios etiológicos presentes:</GlimSectionLabel>
      <ChipsRow>
        {(["reducao_ingestao", "doenca_inflamacao"] as const).map((key) => (
          <Chip key={key} $active={glim_etiol.includes(key)}>
            {GLIM_ETIOL_LABEL[key]}
          </Chip>
        ))}
      </ChipsRow>

      <GlimDiagBadge $diag={glim_diag}>
        {glim_diag !== null ? GLIM_LABEL[glim_diag] : "Pendente avaliação GLIM"}
      </GlimDiagBadge>

      {!glim_diag && (
        <div style={{ marginTop: 10 }}>
          <Button
            type="primary"
            style={{ background: "#7e57c2", borderColor: "#7e57c2", fontSize: 12 }}
            onClick={onPreencher}
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
  );
}