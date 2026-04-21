import styled from "styled-components";

// ─── Layout helpers ───────────────────────────────────────────────────────────

export const WardHeader = styled.div`
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

export const WardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const WardDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: inline-block;
  flex-shrink: 0;
`;

export const WardName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #2e3c5a;
`;

export const WardSub = styled.span`
  font-size: 11px;
  color: #8c8c8c;
`;

export const BedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 8px;
  padding: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 0 0 8px 8px;
`;

export const EmptyBed = styled.div`
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

export const WardSection = styled.div`
  margin-bottom: 20px;
`;

export const SummaryBar = styled.div`
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

export const SummaryItem = styled.div<{ $color: string, $clickable: boolean }>`
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

export const SummaryRight = styled.div`
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

export const ListCard = styled.div<{ $leftColor: string }>`
  border: 1px solid #f0f0f0;
  border-left: 4px solid ${(p) => p.$leftColor};
  border-radius: 0 6px 6px 0;
  background: #fff;
  margin-bottom: 6px;
  overflow: hidden;
`;

export const ListCardBody = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr 160px 160px 1fr 130px;
  gap: 0;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 60px 1fr 120px 1fr 100px;
  }
`;

export const ListCell = styled.div`
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

export const ListCellLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #bdbdbd;
  font-weight: 600;
  margin-bottom: 3px;
`;

export const ListCardFooter = styled.div`
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

export const InlineBadge = styled.span<{ $bg: string, $color: string, $border: string }>`
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
