<script lang="ts">
  import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
  } from "$lib/components/ai-elements/conversation";
  import { Message, MessageContent } from "$lib/components/ai-elements/message";
  import { Loader } from "$lib/components/ai-elements/loader";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import ChatSidebar from "./ChatSidebar.svelte";
  import { SidebarTrigger } from "$lib/components/ui/sidebar/index.js";
  import { Sparkles } from "@lucide/svelte";
  import type { ChatMessage } from "./types";
  import { demoMessages, suggestions } from "./mockData";
  import ChatMessageItem from "./ChatMessageItem.svelte";
  import ChatInput from "./ChatInput.svelte";
  import type { PromptInputMessage } from "$lib/components/ai-elements/prompt-input";

  /**
   * ChatWidget — Reusable AI chat interface for SaaS embedding.
   *
   * Props:
   *   apiBaseUrl  — Backend AI API base URL
   *   tenantId    — Multi-tenant routing identifier
   *   authToken   — Bearer token (optional if using cookie sessions)
   *   conversationId — Resume an existing conversation
   *   mode        — 'dark' | 'light' (follows system via mode-watcher if omitted)
   *   title       — Header title
   *   placeholder — Input placeholder text
   */
  interface ChatWidgetProps {
    apiBaseUrl?: string;
    tenantId?: string;
    authToken?: string;
    conversationId?: string;
    mode?: "dark" | "light";
    title?: string;
    placeholder?: string;
  }

  let {
    apiBaseUrl = "/api/chat",
    tenantId = "",
    authToken = "",
    conversationId = "",
    mode,
    title = "AI Assistant",
    placeholder = "Send a message...",
  }: ChatWidgetProps = $props();

  // Detect dark mode from <html class="dark"> set by mode-watcher
  let isDark = $state(false);

  $effect(() => {
    const check = () => {
      isDark = document.documentElement.classList.contains("dark");
    };
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  });

  // Override with explicit prop when provided
  let effectiveDark = $derived(mode ? mode === "dark" : isDark);
  let shikiTheme = $derived(
    effectiveDark ? "github-dark-default" : "github-light-default",
  );

  let messages = $state<ChatMessage[]>([...demoMessages]);
  let input = $state("");
  let status = $state<"idle" | "submitted" | "streaming" | "error">("idle");

  function onSubmit(message: PromptInputMessage, event?: SubmitEvent) {
    event?.preventDefault();
    const text = typeof message === "string" ? message : message.text;
    if (!text?.trim() || status !== "idle") return;

    messages = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content: text },
    ];
    input = "";
    status = "submitted";

    setTimeout(() => {
      status = "streaming";

      const assistantId = crypto.randomUUID();
      messages = [
        ...messages,
        { id: assistantId, role: "assistant", content: "" },
      ];

      const dummyText = `Thanks for your message! I'm currently in **demo mode**. Here is an example of a generated code block:\n\n\`\`\`javascript\nfunction helloWorld() {\n  console.log("Hello, world!");\n  return true;\n}\n\`\`\`\n\nIn production, this response would come from your AI backend at \`${apiBaseUrl}\`${tenantId ? ` for tenant \`${tenantId}\`` : ""}.`;

      let i = 0;
      const interval = setInterval(() => {
        if (i < dummyText.length) {
          const last = messages[messages.length - 1];
          messages = [
            ...messages.slice(0, -1),
            { ...last, content: last.content + dummyText[i] },
          ];
          i++;
        } else {
          clearInterval(interval);
          status = "idle";
        }
      }, 12);
    }, 600);
  }
</script>

<div class="chat-widget-root h-full w-full bg-background text-foreground">
  <Sidebar.Provider>
    <ChatSidebar currentChatTitle="AI Elements Demo" />
    <Sidebar.Inset>
      <div class="flex h-full flex-col">
        <!-- Header -->
        <header
          class="flex h-12 items-center gap-2 border-b border-border px-4 shrink-0 bg-card"
        >
          <SidebarTrigger />
          <div class="text-sm font-semibold">{title}</div>
        </header>

        <!-- Conversation -->
        <Conversation class="flex-1 min-h-0">
          <ConversationContent class="mx-auto w-full max-w-3xl px-4 py-6">
            {#if messages.length === 0}
              <ConversationEmptyState
                class="flex h-full flex-col items-center justify-center text-center pt-[15vh]"
              >
                <div class="mb-4">
                  <Sparkles class="size-8 text-primary" />
                </div>
                <p class="text-sm text-muted-foreground max-w-sm mb-8">
                  A reusable AI chat interface. It connects to your backend API
                  and supports multi-tenant workspaces, streaming responses, and
                  rich message elements.
                </p>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md"
                >
                  {#each suggestions as suggestion}
                    <button
                      onclick={() => onSubmit({ text: suggestion.text } as any)}
                      class="text-left p-3 rounded-lg text-xs border border-border bg-card hover:border-primary/50 hover:bg-secondary transition-colors"
                    >
                      {suggestion.title}
                    </button>
                  {/each}
                </div>
              </ConversationEmptyState>
            {/if}

            {#each messages as msg (msg.id)}
              <ChatMessageItem {msg} {shikiTheme} />
            {/each}

            {#if status === "submitted"}
              <Message from="assistant" class="mb-2">
                <MessageContent variant="flat">
                  <Loader />
                </MessageContent>
              </Message>
            {/if}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <!-- Input -->
        <ChatInput bind:input {status} {placeholder} {onSubmit} />
      </div>
    </Sidebar.Inset>
  </Sidebar.Provider>
</div>
