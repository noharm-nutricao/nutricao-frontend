import styled from "styled-components";

export const InfoBlock = styled.div`
  .info-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8c8c8c;
    margin-bottom: 2px;
    font-weight: 600;
  }

  .info-value {
    font-size: 13px;
    font-weight: 500;
    color: #2e3c5a;
  }

  .info-sub {
    font-size: 11px;
    color: #8c8c8c;
    margin-top: 1px;
  }
`;

export const ScorePanel = styled.div<{ $borderColor: string; $bg: string }>`
  border: 1px solid ${(p) => p.$borderColor};
  border-radius: 8px;
  padding: 12px 14px;
  background: ${(p) => p.$bg};
`;

export const ScorePanelTitle = styled.div<{ $color: string }>`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.$color};
  margin-bottom: 6px;
  letter-spacing: 0.03em;
`;

export const ScorePanelValue = styled.div<{ $color: string }>`
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: ${(p) => p.$color};
  margin-bottom: 4px;
`;

export const DimsGrid = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

export const DimChip = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
  padding: 4px 8px;
  text-align: center;
  flex: 1;
  min-width: 52px;

  .dim-val {
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
  }

  .dim-lbl {
    font-size: 9px;
    color: #8c8c8c;
    margin-top: 2px;
    line-height: 1.3;
  }
`;

export const GlimPanel = styled.div`
  border: 1px solid #e8e0f5;
  border-radius: 8px;
  padding: 12px 14px;
  background: #faf8ff;
`;

export const GlimSectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

export const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
`;

export const Chip = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  background: ${(p) => (p.$active ? "#7e57c2" : "#f5f5f5")};
  color: ${(p) => (p.$active ? "#fff" : "#bdbdbd")};
  border: 1px solid ${(p) => (p.$active ? "#7e57c2" : "#e0e0e0")};
`;

export const GlimDiagBadge = styled.span<{ $diag: string | null }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  background: ${(p) =>
    p.$diag === "grave"
      ? "#f8e4e8"
      : p.$diag === "mod"
      ? "#fcebeb"
      : p.$diag === "nd"
      ? "#f0fff4"
      : "#fdf3dc"};
  color: ${(p) =>
    p.$diag === "grave"
      ? "#7f0d1f"
      : p.$diag === "mod"
      ? "#a32d2d"
      : p.$diag === "nd"
      ? "#3a9c6e"
      : "#d4931a"};
  border: 1px solid
    ${(p) =>
      p.$diag === "grave"
        ? "#e06080"
        : p.$diag === "mod"
        ? "#f09595"
        : p.$diag === "nd"
        ? "#b7eb8f"
        : "#fac775"};
  margin-top: 8px;
`;

export const GovernanceNote = styled.div`
  font-size: 10px;
  color: #8c8c8c;
  font-style: italic;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e8e0f5;
  line-height: 1.5;
`;

export const InstPanel = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px 14px;
  background: #fafafa;
`;

export const InstItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 12px;
  color: #2e3c5a;

  &:last-child {
    border-bottom: none;
  }
`;

export const InstDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  flex-shrink: 0;
  display: inline-block;
`;

export const InstTypeLabel = styled.span`
  margin-left: auto;
  font-size: 10px;
  color: #8c8c8c;
  white-space: nowrap;
`;

export const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #595959;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

export const HistEntry = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fafafa;

  .hist-header {
    display: flex;
    gap: 10px;
    font-size: 11px;
    color: #8c8c8c;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }

  .hist-conduta {
    font-size: 12px;
    color: #2e3c5a;
    margin-bottom: 4px;
  }

  .hist-meta {
    display: flex;
    gap: 10px;
    font-size: 10px;
    color: #8c8c8c;
  }
`;

export const GlimResultBox = styled.div<{ $diag: string }>`
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 12px;
  background: ${(p) =>
    p.$diag === "grave"
      ? "#f8e4e8"
      : p.$diag === "mod"
      ? "#fcebeb"
      : "#f5f5f5"};
  border: 1px solid
    ${(p) =>
      p.$diag === "grave"
        ? "#e06080"
        : p.$diag === "mod"
        ? "#f09595"
        : "#e0e0e0"};
  color: ${(p) =>
    p.$diag === "grave"
      ? "#7f0d1f"
      : p.$diag === "mod"
      ? "#a32d2d"
      : "#595959"};
  font-size: 13px;
  font-weight: 700;
`;
