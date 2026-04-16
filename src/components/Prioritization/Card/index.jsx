import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  UserOutlined,
  NumberOutlined,
  MessageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";
import { Badge } from "antd";

import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { getAlerts } from "components/Screening/AlertCard";
import PatientName from "containers/PatientName";
import {
  trackPrescriptionPrioritizationAction,
  TrackedPrescriptionPrioritizationAction,
} from "src/utils/tracker";
import { Card, AlertContainer } from "./index.style";

const getScoreBreakdown = (campo1, t) => {
  if (!campo1) return null;

  if (campo1.protocolo === "NRS2002") {
    const { nut, doenca, idade } = campo1.nrs_dims || {};
    return `NRS Breakdown: Nutricional(${nut ?? "-"}) + Doença(${doenca ?? 0}) + Idade(${idade ?? 0})`;
  }

  if (campo1.protocolo === "MNUTRIC") {
    const { idade, apache, sofa, comor, dias } = campo1.mn_dims || {};
    return `mNUTRIC Breakdown: Idade(${idade}) + Apache(${apache}) + Sofa(${sofa}) + Comorb(${comor}) + Dias(${dias})`;
  }

  return null;
};

const TabContent = ({ tab, prescription, featureService }) => {
  const { t } = useTranslation();
  const { campo1 } = prescription;

  if (tab === "patient") {
    const alerts = getAlerts(prescription.alertStats || {}, t).filter(
      (a) => a.value > 0
    );

    return (
      <div className="attribute-container">
        <div className="attributes">
          <div className="attributes-item col-4">
            <div className="attributes-item-label">{t("patientCard.age")}</div>
            <div className="attributes-item-value">{prescription.age || "-"}</div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">{t("labels.birthdate")}</div>
            <div className="attributes-item-value">{prescription.birthdateFormat || "-"}</div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">{t("patientCard.gender")}</div>
            <div className="attributes-item-value">
              {prescription.gender
                ? prescription.gender === "M"
                  ? t("patientCard.male")
                  : t("patientCard.female")
                : "-"}
            </div>
          </div>
        </div>
        <div className="attributes">
          <div className="attributes-item col-4">
            <div className="attributes-item-label">{t("patientCard.admission")}</div>
            <div className="attributes-item-value">{prescription.admissionNumber}</div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Setor</div>
            <div className="attributes-item-value">
              <Tooltip title={`${prescription.department}`}>{prescription.department}</Tooltip>
            </div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Leito</div>
            <div className="attributes-item-value">
              <Tooltip title={`${prescription.bed || " - "}`}>{prescription.bed || " - "}</Tooltip>
            </div>
          </div>
        </div>
        {/* Restaurado: Bloco de Convênio e Situação */}
        <div className="attributes">
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Convênio</div>
            <div className="attributes-item-value">
              <Tooltip title={`${prescription.insurance}`}>{prescription.insurance}</Tooltip>
            </div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">{t("patientCard.prescriptionDate")}</div>
            <div className="attributes-item-value">{prescription.dateOnlyFormated}</div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Situação</div>
            <div className="attributes-item-value">
               {prescription.status === "s" ? (
                <Tag variant="outlined" color="green">Checada</Tag>
              ) : prescription.isBeingEvaluated ? (
                <Tag variant="outlined" color="purple">Em análise</Tag>
              ) : (
                <Tag variant="outlined" color="orange">Pendente</Tag>
              )}
            </div>
          </div>
        </div>
        <div className="attributes">
          <div className="attributes-item col-12">
            <div className="attributes-item-label">Alertas</div>
            <div className="attributes-item-value">
              <AlertContainer>
                {alerts.length ? alerts.map((a) => (
                  <Tooltip title={a.label} key={a.label}>
                    <div className="alert">{a.icon()} {a.value}</div>
                  </Tooltip>
                )) : "-"}
              </AlertContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "numbers") {
    return (
      <div className="attribute-container border-bottom">
        {campo1?.calculado_at && (
           <div style={{ fontSize: '10px', color: '#8c8c8c', marginBottom: '8px' }}>
             Atualizado em: {new Date(campo1.calculado_at).toLocaleString()}
           </div>
        )}
        <div className="attributes">
           <div className="attributes-item col-4">
              <div className="attributes-item-label">Estadia</div>
              <div className="attributes-item-value">{prescription.lengthStay}</div>
           </div>
           <div className="attributes-item col-4">
              <div className="attributes-item-label">Exames</div>
              <div className="attributes-item-value">{prescription.alertExams}</div>
           </div>
           <div className="attributes-item col-4">
              <div className="attributes-item-label">Alertas</div>
              <div className="attributes-item-value">{prescription.alerts}</div>
           </div>
        </div>
        <div className="attributes">
           <div className="attributes-item col-4">
              <div className="attributes-item-label">AM</div>
              <div className="attributes-item-value">{prescription.am}</div>
           </div>
           <div className="attributes-item col-4">
              <div className="attributes-item-label">AV</div>
              <div className="attributes-item-value">{prescription.av}</div>
           </div>
           <div className="attributes-item col-4">
              <div className="attributes-item-label">Global</div>
              <div className="attributes-item-value">{prescription.globalScore}</div>
           </div>
        </div>
      </div>
    );
  }

  if (tab === "observation") {
    return (
      <div className="attribute-container">
        <div className="attributes">
          <div className="attributes-item col-12">
            <div className="attributes-item-label">Anotações</div>
            <div
              className="attributes-item-value text"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(prescription.observation || "Sem anotações") }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "tags") {
    return (
      <div className="attribute-container">
        <div className="attributes">
          <div className="attributes-item col-12">
            <div className="attributes-item-label">Marcadores</div>
            <div className="attributes-item-value tags">
              {prescription?.patientTags?.length
                ? prescription.patientTags.map((tag) => (
                    <Tag style={{ marginRight: 0, fontSize: "13px" }} key={tag}>{tag}</Tag>
                  ))
                : "--"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default function PrioritizationCard({
  prescription: originalPrescription,
  prioritization,
  prioritizationType,
  highlight,
  featureService,
  activeTab,
  setActiveTab,
}) {
  const { t } = useTranslation();

  /*const mockCampo1 = {
    protocolo: 'NRS2002',
    nrs_total: 2,
    classificacao: 'bx', 
    nrs_completo: true, 
    nrs_dims: { nut: 1, doenca: 0, idade: 1 },
    calculado_at: '2026-04-15T11:30:00Z'
  };*/

  /*const mockCampo1 = {
  protocolo: 'NRS2002',
  nrs_total: 5,
  classificacao: 'cr', // Deve aplicar borda vermelha
  nrs_completo: false, // Deve exibir badge "Incompleto"
  nrs_dims: { nut: 3, doenca: 2, idade: 0 },
  calculado_at: '2026-04-16T10:00:00Z'
};*/

const mockCampo1 = {
  protocolo: 'MNUTRIC',
  mnutric_total: 6,
  classificacao: 'al', // Deve aplicar borda laranja
  dados_incompletos: true, // Deve exibir badge "APACHE/SOFA Necessários"
  mn_dims: { idade: 2, apache: 0, sofa: 0, comor: 3, dias: 1 },
  calculado_at: '2026-04-16T11:20:00Z'
};


  const prescription = {
    ...originalPrescription,
    campo1: originalPrescription.campo1 || mockCampo1 
  };

  const { campo1 } = prescription;
  const isNRS = campo1?.protocolo === "NRS2002";
  const scoreValue = isNRS ? campo1?.nrs_total : campo1?.mnutric_total;
  const breakdownText = getScoreBreakdown(campo1, t);

  const href = prioritizationType === "conciliation"
      ? `/conciliacao/${prescription.slug}`
      : `/prescricao/${prescription.slug}`;

  const tabClick = (tab, event) => {
    setActiveTab(tab);
    event.stopPropagation();
    event.preventDefault();
    trackPrescriptionPrioritizationAction(
      TrackedPrescriptionPrioritizationAction.CLICK_CARD_TAB,
      { title: tab }
    );
  };

  return (
    <Card
      $alert={campo1 ? campo1.classificacao : (prescription.dischargeReason ? "" : prescription.class)}
      href={href}
      target="_blank"
    >
      <div className="card-header">
        <div className={`name ${prescription.dischargeFormated ? "discharged" : ""}`}>
          <Tooltip title={prescription.namePatient}>
            <PatientName idPatient={prescription.idPatient} name={prescription.namePatient} />
          </Tooltip>
          {prescription.dischargeFormated && (
             <div className="discharge">{`Alta em ${prescription.dischargeFormated}`}</div>
          )}
        </div>

        <div className={`stamp ${highlight ? "highlight" : ""}`}>
          <div className="stamp-label">
            {campo1?.protocolo || prioritization.label}
          </div>

          <Tooltip title={breakdownText || "Escore de Priorização"}>
            <div className="stamp-value">
              {campo1
                ? scoreValue
                : prioritization.formattedKey === "filled"
                ? prescription[prioritization.key] ? "Preenchido" : "-"
                : prescription[prioritization.formattedKey]}

              {campo1?.nrs_completo === false && (
                <Tag color="default" style={{ marginLeft: "5px", fontSize: "10px" }}>
                  Incompleto
                </Tag>
              )}

              {campo1?.dados_incompletos && (
                <Tag color="warning" style={{ marginLeft: "5px", fontSize: "10px" }}>
                  APACHE/SOFA Necessários
                </Tag>
              )}

              {!campo1 && prioritization.key === "globalScore" && prescription.scoreVariation !== null && (
                <>
                  {prescription.scoreVariation > 0 && <ArrowUpOutlined />}
                  {prescription.scoreVariation < 0 && <ArrowDownOutlined />}
                </>
              )}
            </div>
          </Tooltip>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, transform: "translate3d(5px, 0, 0)" }}
        animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
        transition={{ duration: 0.3, ease: "linear" }}
        key={activeTab}
      >
        <TabContent
          tab={activeTab}
          prescription={prescription}
          featureService={featureService}
        />
      </motion.div>

      <div className="tabs">
        <div className={`tab ${activeTab === "patient" ? "active" : ""}`} onClick={(e) => tabClick("patient", e)}>
          <UserOutlined />
        </div>
        <div className={`tab ${activeTab === "numbers" ? "active" : ""}`} onClick={(e) => tabClick("numbers", e)}>
          <NumberOutlined />
        </div>
        <div className={`tab ${activeTab === "observation" ? "active" : ""}`} onClick={(e) => tabClick("observation", e)}>
          <Badge dot count={prescription.observation ? 1 : 0}>
            <MessageOutlined />
          </Badge>
        </div>
        <div className={`tab ${activeTab === "tags" ? "active" : ""}`} onClick={(e) => tabClick("tags", e)}>
          <Badge dot count={prescription.patientTags?.length > 0 ? 1 : 0}>
            <TagsOutlined />
          </Badge>
        </div>
      </div>
    </Card>
  );
}