import { useEffect, useState } from "react";
import { Spin, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import styled from "styled-components";
import api, { TriagemIndicatorsData, TriagemIndicatorsParams } from "services/nutritional/api";

const Bar = styled.div`
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
  &::-webkit-scrollbar { display: none; }
`;

const Label = styled.div`
  padding: 10px 16px;
  border-right: 1px solid #f0f0f0;
  font-size: 11px;
  font-weight: 700;
  color: #2e3c5a;
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Stat = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  border-right: 1px solid #f0f0f0;
  white-space: nowrap;
  flex-shrink: 0;

  .val {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    color: ${(p) => p.$color};
  }
  .lbl {
    font-size: 10px;
    color: #8c8c8c;
    margin-top: 2px;
  }
`;

const BigPct = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 24px;
  border-right: 1px solid #f0f0f0;
  flex-shrink: 0;

  .pct {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    color: #3a9c6e;
  }
  .lbl {
    font-size: 10px;
    color: #8c8c8c;
    margin-top: 2px;
  }
`;

interface Props {
  ala?: string;
}

export function TriagemIndicatorsBar({ ala }: Props) {
  const [data, setData] = useState<TriagemIndicatorsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params: TriagemIndicatorsParams = {};
    if (ala && ala !== "all") params.ala = ala;

    api.nutritional.getTriagemIndicators(params)
      .then((res: any) => setData(res.data?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ala]);

  return (
    <Bar>
      <Label>
        Triagem
        <Tooltip title="% pacientes triados em ≤24h da internação no período atual">
          <InfoCircleOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
        </Tooltip>
      </Label>

      {loading && (
        <div style={{ padding: "10px 20px" }}>
          <Spin size="small" />
        </div>
      )}

      {!loading && data && (
        <>
          <BigPct>
            <span className="pct">{data.percentual.toFixed(1)}%</span>
            <span className="lbl">triados ≤24h</span>
          </BigPct>
          <Stat $color="#3a9c6e">
            <span className="val">{data.verde}</span>
            <span className="lbl">≤24h</span>
          </Stat>
          <Stat $color="#c41e3a">
            <span className="val">{data.vermelho}</span>
            <span className="lbl">&gt;24h</span>
          </Stat>
          <Stat $color="#8c8c8c">
            <span className="val">{data.cinza}</span>
            <span className="lbl">sem triagem</span>
          </Stat>
          <Stat $color="#2e3c5a">
            <span className="val">{data.total}</span>
            <span className="lbl">total admitidos</span>
          </Stat>
        </>
      )}

      {!loading && !data && (
        <div style={{ padding: "10px 16px", fontSize: 12, color: "#8c8c8c" }}>
          Sem dados de triagem
        </div>
      )}
    </Bar>
  );
}
