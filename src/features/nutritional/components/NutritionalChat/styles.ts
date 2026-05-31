import styled from "styled-components";

export const ChatFab = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #7e57c2;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(126, 87, 194, 0.4);
  z-index: 1100;
  transition: background 0.2s;
  &:hover { background: #6d46b8; }
`;

export const ChatWindow = styled.div<{ $w: number; $h: number }>`
  position: fixed;
  bottom: 88px;
  right: 24px;
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  z-index: 1100;
  overflow: hidden;
  user-select: none;
`;

export const ResizeHandle = styled.div<{ $corner?: boolean }>`
  position: absolute;
  z-index: 10;
  ${({ $corner }) => $corner ? `
    left: 0; top: 0;
    width: 18px; height: 18px;
    cursor: nw-resize;
    border-radius: 12px 0 0 0;
  ` : `
    left: 0; top: 18px;
    width: 6px; bottom: 0;
    cursor: ew-resize;
  `}
  background: transparent;
  &:hover {
    background: rgba(126, 87, 194, 0.15);
  }
`;

export const ChatHeader = styled.div`
  background: #7e57c2;
  color: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

export const ChatHeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const MessageBubble = styled.div<{ $role: "user" | "assistant"; $error?: boolean }>`
  max-width: 85%;
  padding: 8px 12px;
  border-radius: ${({ $role }) => $role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px"};
  background: ${({ $role, $error }) =>
    $error ? "#fff1f0" :
    $role === "user" ? "#7e57c2" : "#f5f5f5"};
  color: ${({ $role, $error }) =>
    $error ? "#cf1322" :
    $role === "user" ? "#fff" : "#262626"};
  align-self: ${({ $role }) => $role === "user" ? "flex-end" : "flex-start"};
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  border: ${({ $error }) => $error ? "1px solid #ffa39e" : "none"};
`;

export const MessageTime = styled.div<{ $role: "user" | "assistant" }>`
  font-size: 10px;
  color: #bfbfbf;
  align-self: ${({ $role }) => $role === "user" ? "flex-end" : "flex-start"};
  margin-top: -6px;
`;

export const TypingIndicator = styled.div`
  align-self: flex-start;
  background: #f5f5f5;
  border-radius: 12px 12px 12px 4px;
  padding: 8px 14px;
  font-size: 13px;
  color: #8c8c8c;
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const ImagePreviewThumb = styled.img`
  max-width: 160px;
  max-height: 120px;
  border-radius: 6px;
  display: block;
  margin-bottom: 4px;
`;

export const ChatInputArea = styled.div`
  border-top: 1px solid #f0f0f0;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
`;

export const ChatInputRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: flex-end;
`;

export const ChatDisclaimer = styled.div`
  font-size: 10px;
  color: #bfbfbf;
  text-align: center;
  padding-bottom: 2px;
`;

export const ContextBadge = styled.div`
  background: #f0eeff;
  color: #7e57c2;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
`;

export const ImagePreviewBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #595959;
`;
