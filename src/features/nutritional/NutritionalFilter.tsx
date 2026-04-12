/**
 * NutritionalFilter – Barra de filtros do Painel Nutricional.
 * Contém os seletores de Ala, Fila de prioridade (1, 2 e 5) e Risco.
 * Issue #33 – US-BE-06
 */
import { Affix } from "antd";
import { useState } from "react";
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

import { ALA_CONFIG } from "./nutritionalUtils";
import { AlaType } from "./NutritionalSlice";

const FilterBar = styled.div`
  background: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  transition: box-shadow 0.2s;

  &.affixed {
    border-radius: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8c8c8c;
  font-weight: 600;
  white-space: nowrap;
`;

const FilterDivider = styled.div`
  width: 1px;
  height: 20px;
  background: #f0f0f0;
`;

const FilterBtn = styled.button<{ $active?: boolean; $color?: string }>`
  font-size: 11px;
  height: 26px;
  padding: 0 10px;
  border-radius: 13px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #595959;
  cursor: pointer;
  font-weight: 400;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: ${(p) => p.$color ?? "#1677ff"};
    color: ${(p) => p.$color ?? "#1677ff"};
  }

  ${(p) =>
    p.$active && p.$color
      ? `
    border-color: ${p.$color} !important;
    color: ${p.$color} !important;
    background: ${p.$color}18 !important;
    font-weight: 600;
  `
      : ""}
`;

const SortBtn = styled.button`
  font-size: 11px;
  height: 26px;
  padding: 0 10px;
  border-radius: 13px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #595959;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;

  &:hover {
    border-color: #1677ff;
    color: #1677ff;
  }
`;

const ALA_ORDER: AlaType[] = ["UTI", "B", "C"];
const ALA_COLORS: Record<AlaType, string> = {
  UTI: "#7e57c2",
  B: "#4dd0e1",
  C: "#80cbc4",
};

const FILA_BTNS = [
  { key: "FILA1", label: "Alta Prioridade" },
  { key: "FILA2", label: "Avaliar 24h" },
  { key: "FILA5", label: "D7 pendente" },
];

const RISCO_BTNS = [
  { key: "cr", label: "Crítico", color: "#c41e3a" },
  { key: "al", label: "Alto", color: "#e24b4a" },
  { key: "md", label: "Médio", color: "#d4931a" },
  { key: "bx", label: "Baixo", color: "#c0641a" },
];

interface NutritionalFilterProps {
  filtAla: string;
  filtSev: string;
  filtFila: string;
  countsFila: Record<string, number>;
  sortAsc: boolean;
  onAlaChange: (ala: string) => void;
  onSevChange: (sev: string) => void;
  onFilaChange: (fila: string) => void;
  onSortToggle: () => void;
}

export function NutritionalFilter({
  filtAla,
  filtSev,
  filtFila,
  countsFila,
  sortAsc,
  onAlaChange,
  onSevChange,
  onFilaChange,
  onSortToggle,
}: NutritionalFilterProps) {
  const [affixed, setAffixed] = useState(false);

  const handleSevClick = (key: string) => {
    onFilaChange("");
    onSevChange(filtSev === key ? "" : key);
  };

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
