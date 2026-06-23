import styled from "styled-components";

export const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #595959;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

export const FieldLabel = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 4px;
`;

export const ResultBox = styled.div`
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ResultLabel = styled.span`
  font-size: 13px;
  color: #595959;
`;

export const ResultValue = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: #237804;
`;

export const FooterNote = styled.div`
  font-size: 10px;
  color: #8c8c8c;
  margin-top: 8px;
  line-height: 1.4;
`;
