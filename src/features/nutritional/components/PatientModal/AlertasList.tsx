import { InstItem } from "../../NutritionalSlice";
import { InstPanel, InstItemRow, InstDot, InstTypeLabel } from "./styles";

//Alertas Component

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

interface AlertasListProps {
  inst: InstItem[];
}

export function AlertasList({ inst }: AlertasListProps) {
  if (!inst || inst.length === 0) return null;

  return (
    <InstPanel>
      {inst.map((item, i) => (
        <InstItemRow key={i}>
          <InstDot $color={INST_DOT_COLOR[item.t] ?? "#8c8c8c"} />
          <span>{item.label}</span>
          <InstTypeLabel>{INST_TYPE_LABEL[item.t] ?? item.t}</InstTypeLabel>
        </InstItemRow>
      ))}
    </InstPanel>
  );
}