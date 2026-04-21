import styled from "styled-components";

export const FilterBar = styled.div`
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

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const FilterLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8c8c8c;
  font-weight: 600;
  white-space: nowrap;
`;

export const FilterDivider = styled.div`
  width: 1px;
  height: 20px;
  background: #f0f0f0;
`;

export const FilterBtn = styled.button<{ $active?: boolean; $color?: string }>`
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

export const SortBtn = styled.button`
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