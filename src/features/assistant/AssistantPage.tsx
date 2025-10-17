import React from "react";
import { AssistantLayout } from "./layout/AssistantLayout";
import { ConversationSidebar } from "./sidebar/ConversationSidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./chat/MessageList";
import { Composer } from "./chat/Composer";
import { InspectorPanel } from "./inspector/InspectorPanel";
import { useAssistantStore, AssistantStoreProvider } from "./state/assistant.store";
import { getAdapter } from "./adapters/resolveAdapter";
import "./styles/assistant.tokens.css";

export default function AssistantPage() {
  // Provide store context locally to avoid wiring at app root
  return (
    <AssistantStoreProviderWrapper />
  );
}

function AssistantStoreProviderWrapper(){
  return (
    <AssistantStoreProvider>
      <AssistantContent />
    </AssistantStoreProvider>
  );
}

function AssistantContent(){
  const {
    conversations,
    selectedId,
    ui,
    newConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    pinConversation,
    addMessage,
    updateMessage,
    toggleInspector,
  } = useAssistantStore();

  const conv = conversations.find(c => c.id === selectedId) || null;
  const adapter = getAdapter();

  return (
    <AssistantLayout
      sidebar={
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedId}
          onNew={() => selectConversation(newConversation({}))}
          onSelect={selectConversation}
          onRename={renameConversation}
          onDelete={deleteConversation}
          onPin={pinConversation}
        />
      }
      header={
        <ChatHeader
          title={conv?.title || "New chat"}
          model={conv?.model}
          onRename={(t)=> conv && renameConversation(conv.id, t)}
          inspectorOpen={ui.inspectorOpen}
          onToggleInspector={toggleInspector}
        />
      }
      messages={<MessageList conversation={conv} />}
      composer={<Composer conversation={conv} adapter={adapter} onAddMessage={addMessage} onUpdateMessage={updateMessage} />}
      inspector={<InspectorPanel open={ui.inspectorOpen} conversation={conv} onModelChange={(m)=> conv && renameConversation(conv.id, conv.title)} />}
    />
  );
}
