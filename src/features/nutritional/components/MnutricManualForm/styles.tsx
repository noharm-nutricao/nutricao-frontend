import styled from "styled-components";

export const FormBox = styled.div`
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 14px 16px;
  background: #fffbe6;
  margin-bottom: 16px;
`;

export const FormTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #d48806;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const FormDesc = styled.div`
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 12px;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

export const FieldGroup = styled.div`
  flex: 1;

  label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #595959;
    margin-bottom: 4px;
  }
`;