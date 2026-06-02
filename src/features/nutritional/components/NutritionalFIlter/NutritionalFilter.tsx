import { Affix } from "antd";
import { useState } from "react";
import { SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons";
import { ALA_COLORS, ALA_CONFIG, ALA_ORDER, FILA_BTNS, RISCO_BTNS, ALERGIA_BTNS } from "../../nutritionalUtils";
import { FilterBar, FilterGroup, FilterLabel, FilterBtn, FilterDivider, SortBtn } from "./styles";

interface NutritionalFilterProps {
  filtAla: string;
  filtSev: string;
  filtAlergia: "" | "com" | "pendente";
  countsAlergia: Record<string, number>;
  filtFila: string;
  countsFila: Record<string, number>;
  sortAsc: boolean;
  onAlaChange: (ala: string) => void;
  onSevChange: (sev: string) => void;
  onFilaChange: (fila: string) => void;
  onSortToggle: () => void;
  onAlergiaChange: (val: "" | "com" | "pendente") => void;
}

export function NutritionalFilter({
  filtAla,
  filtSev,
  filtFila,
  filtAlergia,
  countsFila,
  countsAlergia,
  sortAsc,
  onAlaChange,
  onSevChange,
  onFilaChange,
  onAlergiaChange,
  onSortToggle,
}: NutritionalFilterProps) {
  
  const [affixed, setAffixed] = useState(false);

  const handleSevClick = (key: string) => {
    onFilaChange("");
    onSevChange(filtSev === key ? "" : key);
  };

  const handleAlergiaClick = (key: "com" | "pendente") => {
    onAlergiaChange(filtAlergia === key ? "" : key);
  }

  const handleFilaClick = (key: string) => {
    onSevChange("");
    onFilaChange(filtFila === key ? "" : key);
  };

  return (
    <Affix offsetTop={0} onChange={(v) => setAffixed(!!v)}>
      <FilterBar className={affixed ? "affixed" : ""}>
        {/* Ala */}
        <FilterGroup>
          <FilterLabel>Ala</FilterLabel>
          <FilterBtn
            $active={filtAla === "all" || filtAla === ""}
            $color="#2e3c5a"
            onClick={() => onAlaChange("all")}
          >
            Todas
          </FilterBtn>
          {ALA_ORDER.map((ala) => (
            <FilterBtn
              key={ala}
              $active={filtAla === ala}
              $color={ALA_COLORS[ala]}
              onClick={() => onAlaChange(ala)}
            >
              {ALA_CONFIG[ala].nome}
            </FilterBtn>
          ))}
        </FilterGroup>

        <FilterDivider />

        {/* Alergia */}
        <FilterGroup>
          <FilterLabel>Alergia</FilterLabel>
          {ALERGIA_BTNS.map(({ key, label, color }) => (
            <FilterBtn
              key={key}
              $active={filtAlergia === key}
              $color={color}
              onClick={() => handleAlergiaClick(key as "com" | "pendente")}
            >
              {label}
              <span style={{
                background: filtAlergia === key ? color : '#e0e0e0',
                color: filtAlergia === key ? '#fff' : '#696766',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '10px',
                marginLeft: '6px',
                fontWeight: 'bold'
              }}>
                {countsAlergia[key] || 0}
              </span>
            </FilterBtn>
          ))}
        </FilterGroup>

        {/* Fila */}
        <FilterGroup>
          <FilterLabel>Fila</FilterLabel>
          {FILA_BTNS.map(({ key, label }) => (
            <FilterBtn
              key={key}
              $active={filtFila === key}
              $color="#7e57c2"
              onClick={() => handleFilaClick(key)}
            >
              {label}
              <span style={{
                background: filtFila === key ? '#7e57c2' : '#e0e0e0',
                color: filtFila === key ? '#fff' : '#696766',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '10px',
                marginLeft: '6px',
                fontWeight: 'bold'
              }}>
                {countsFila[key] || 0}
              </span>
            </FilterBtn>
          ))}
        </FilterGroup>

        <FilterDivider />

        {/* Risco */}
        <FilterGroup>
          <FilterLabel>Risco</FilterLabel>
          {RISCO_BTNS.map(({ key, label, color }) => (
            <FilterBtn
              key={key}
              $active={filtSev === key}
              $color={color}
              onClick={() => handleSevClick(key)}
            >
              {label}
            </FilterBtn>
          ))}
        </FilterGroup>

        <FilterDivider />

        {/* Sort */}
        <SortBtn onClick={onSortToggle}>
          {sortAsc ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
          Score {sortAsc ? "↑" : "↓"}
        </SortBtn>
      </FilterBar>
    </Affix>
  );
}
