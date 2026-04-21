import styled from "styled-components";
import { SeverityType } from "../../NutritionalSlice";
import { SEV_CONFIG } from "../../nutritionalUtils";

export const Card = styled.div<{ $sev: SeverityType | null; $atend: boolean }>`
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

export const CardBody = styled.div`
  padding: 10px 12px;
  cursor: pointer;
`;

export const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
`;

export const BedLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #8c8c8c;
  letter-spacing: 0.04em;
`;

export const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Badge = styled.span<{ $bg: string; $color: string; $border: string }>`
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

export const PatientName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #2e3c5a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 1px;
`;

export const PatientMeta = styled.div`
  font-size: 10px;
  color: #8c8c8c;
  margin-bottom: 8px;
`;

export const SectionLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #bdbdbd;
  font-weight: 600;
  margin-bottom: 3px;
  margin-top: 6px;
`;

export const ScoreDual = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 2px;
`;

export const ScoreChip = styled.div<{ $color: string }>`
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

export const ScoreSingle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
`;

export const GlimText = styled.div<{ $color: string }>`
  font-size: 11px;
  color: ${(p) => p.$color};
  font-weight: 500;
`;

export const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
`;

export const CardFooter = styled.div`
  border-top: 1px solid #f0f0f0;
  padding: 6px 10px;
  background: #fafafa;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

export const ActionBtn = styled.button<{ $bg: string }>`
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