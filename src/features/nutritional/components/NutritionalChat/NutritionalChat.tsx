import { useEffect, useRef, useState } from "react";
import { Button, Input, Tooltip } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";
import { useAppDispatch, useAppSelector } from "src/store";
import {
  openChat,
  closeChat,
  addChatMessage,
  clearChat,
  sendChatMessage,
  ChatMessage,
} from "../../NutritionalSlice";
import { NutritionalPatient } from "../../NutritionalSlice";
import {
  ChatFab,
  ChatWindow,
  ChatHeader,
  ChatHeaderActions,
  ChatMessages,
  MessageBubble,
  MessageTime,
  TypingIndicator,
  ChatInputArea,
  ChatInputRow,
  ChatDisclaimer,
  ContextBadge,
  ImagePreviewBar,
  ImagePreviewThumb,
} from "./styles";

interface NutritionalChatProps {
  contextPatient?: NutritionalPatient | null;
}

function renderMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^#### (.+)$/gm, '<h5 style="margin:6px 0 2px;font-size:13px">$1</h5>')
    .replace(/^### (.+)$/gm, '<h4 style="margin:8px 0 4px;font-size:13px">$1</h4>')
    .replace(/^## (.+)$/gm, '<h4 style="margin:8px 0 4px">$1</h4>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>)+/g, (m) => `<ul style="margin:4px 0;padding-left:16px">${m}</ul>`)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");

  return DOMPurify.sanitize(html);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const ACCEPTED_FORMATS: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/gif": "GIF",
  "image/webp": "WEBP",
};

export function NutritionalChat({ contextPatient }: NutritionalChatProps) {
  const dispatch = useAppDispatch();
  const chatOpen   = useAppSelector((s: any) => s.nutritional.chatOpen); // eslint-disable-line @typescript-eslint/no-explicit-any
  const messages   = useAppSelector((s: any) => s.nutritional.chatMessages as ChatMessage[]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const chatLoading = useAppSelector((s: any) => s.nutritional.chatLoading); // eslint-disable-line @typescript-eslint/no-explicit-any

  const [text, setText] = useState("");
  const [image, setImage] = useState<{ base64: string; format: string; preview: string } | null>(null);
  const [useContext, setUseContext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !image) return;

    // Build patient context prefix if enabled
    let fullMessage = trimmed;
    if (useContext && contextPatient && messages.length === 0) {
      const p = contextPatient;
      const glimLabel: Record<string, string> = {
        nd: "sem desnutrição", mod: "desnutrição moderada", grave: "desnutrição grave",
      };
      fullMessage =
        `[Contexto clínico — paciente ${p.leito || "s/leito"}, ${p.idade}a, ala ${p.ala}, ${p.dias}d internação]\n` +
        `Campo 1: mNUTRIC ${p.mnutric ?? "—"}, NRS ${p.nrs} (sev=${p.sev ?? "—"})\n` +
        `Campo 2: ${p.glim_diag ? glimLabel[p.glim_diag] : "GLIM pendente"}\n` +
        `Campo 3: ${p.inst.length} alertas\n\n` +
        trimmed;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      imagePreview: image?.preview,
      timestamp: new Date().toISOString(),
    };

    dispatch(addChatMessage(userMsg));
    setText("");
    const pendingImage = image;
    setImage(null);

    dispatch(sendChatMessage({
      message: fullMessage,
      imageBase64: pendingImage?.base64,
      imageFormat: pendingImage?.format,
      history: messages,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const format = ACCEPTED_FORMATS[file.type];
    if (!format) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // base64 puro (sem prefixo data:...)
      const base64 = dataUrl.split(",")[1];
      setImage({ base64, format, preview: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chatOpen) {
    return (
      <Tooltip title="Assistente IA" placement="left">
        <ChatFab onClick={() => dispatch(openChat())}>
          <MessageOutlined />
        </ChatFab>
      </Tooltip>
    );
  }

  return (
    <>
      <ChatWindow>
        <ChatHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RobotOutlined style={{ fontSize: 16 }} />
            NITRA IA
          </div>
          <ChatHeaderActions>
            {contextPatient && (
              <Tooltip title={useContext ? "Contexto do paciente ativo" : "Contexto desativado"}>
                <ContextBadge
                  style={{ cursor: "pointer", opacity: useContext ? 1 : 0.5 }}
                  onClick={() => setUseContext((v) => !v)}
                >
                  {contextPatient.leito || "Paciente"}
                </ContextBadge>
              </Tooltip>
            )}
            <Tooltip title="Limpar conversa">
              <Button
                type="text" size="small" icon={<DeleteOutlined />}
                style={{ color: "#fff" }}
                onClick={() => dispatch(clearChat())}
              />
            </Tooltip>
            <Button
              type="text" size="small" icon={<CloseOutlined />}
              style={{ color: "#fff" }}
              onClick={() => dispatch(closeChat())}
            />
          </ChatHeaderActions>
        </ChatHeader>

        <ChatMessages>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#bfbfbf", fontSize: 12, marginTop: 24 }}>
              <RobotOutlined style={{ fontSize: 28, marginBottom: 8 }} />
              <div>Olá! Como posso ajudar?</div>
              {contextPatient && useContext && (
                <div style={{ marginTop: 6, color: "#7e57c2", marginBottom: 16 }}>
                  Contexto: {contextPatient.leito || "paciente aberto"} ativo
                </div>
              )}
              {contextPatient && useContext && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginTop: 8 }}>
                  {[
                    { label: "📋 Resumo clínico", prompt: "Gere um resumo clínico detalhado deste paciente incluindo estado nutricional, riscos identificados e próximos passos recomendados." },
                    { label: "🍽️ Sugestão de conduta", prompt: "Com base nos dados clínicos deste paciente, quais condutas nutricionais você recomenda? Considere o diagnóstico GLIM, os scores de risco e os alertas ativos." },
                    { label: "⚠️ Análise de riscos", prompt: "Quais são os principais riscos nutricionais identificados para este paciente? Existe risco de síndrome de realimentação ou outras complicações?" },
                  ].map(({ label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => { setText(prompt); }}
                      style={{
                        background: "#f0eeff", color: "#7e57c2", border: "1px solid #d3adf7",
                        borderRadius: 16, padding: "4px 14px", fontSize: 12, cursor: "pointer",
                        fontWeight: 500, transition: "background 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 2,
                fontSize: 11,
                color: "#bfbfbf",
              }}>
                {msg.role === "assistant" && <RobotOutlined />}
                {msg.role === "user" && <UserOutlined />}
              </div>
              <MessageBubble $role={msg.role} $error={msg.error}>
                {msg.imagePreview && (
                  <ImagePreviewThumb src={msg.imagePreview} alt="imagem" />
                )}
                {msg.role === "assistant"
                  ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  : msg.content
                }
              </MessageBubble>
              <MessageTime $role={msg.role}>{formatTime(msg.timestamp)}</MessageTime>
            </div>
          ))}

          {chatLoading && (
            <TypingIndicator>
              <RobotOutlined />
              <span>digitando</span>
              <span style={{ letterSpacing: 2 }}>...</span>
            </TypingIndicator>
          )}

          <div ref={messagesEndRef} />
        </ChatMessages>

        <ChatInputArea>
          {image && (
            <ImagePreviewBar>
              <img src={image.preview} alt="preview" style={{ height: 32, borderRadius: 4 }} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {image.format}
              </span>
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setImage(null)} />
            </ImagePreviewBar>
          )}

          <ChatInputRow>
            <Tooltip title="Anexar imagem (PNG, JPEG, GIF, WEBP)">
              <Button
                type="text" size="small" icon={<PaperClipOutlined />}
                onClick={() => fileInputRef.current?.click()}
              />
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Input.TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem (Enter para enviar, Shift+Enter nova linha)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ flex: 1, fontSize: 13 }}
              disabled={chatLoading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              style={{ background: "#7e57c2", borderColor: "#7e57c2" }}
              onClick={handleSend}
              loading={chatLoading}
              disabled={!text.trim() && !image}
            />
          </ChatInputRow>

          <ChatDisclaimer>
            IA de suporte — não substitui avaliação clínica profissional
          </ChatDisclaimer>
        </ChatInputArea>
      </ChatWindow>

      <ChatFab onClick={() => dispatch(closeChat())} style={{ background: "#6d46b8" }}>
        <CloseOutlined />
      </ChatFab>
    </>
  );
}
