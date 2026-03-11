<script lang="ts">
  import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputAttachment,
    PromptInputAttachments,
    PromptInputBody,
    PromptInputButton,
    type PromptInputMessage,
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
  } from "$lib/components/ai-elements/prompt-input/index.js";

  interface ChatInputProps {
    placeholder?: string;
    input: string;
    status: "idle" | "submitted" | "streaming" | "error";
    onSubmit: (message: PromptInputMessage, event?: SubmitEvent) => void;
  }

  let {
    placeholder = "Send a message...",
    input = $bindable(),
    status,
    onSubmit,
  }: ChatInputProps = $props();

  let models = [
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    { id: "claude-2", name: "Claude 2" },
    { id: "claude-instant", name: "Claude Instant" },
    { id: "palm-2", name: "PaLM 2" },
    { id: "llama-2-70b", name: "Llama 2 70B" },
    { id: "llama-2-13b", name: "Llama 2 13B" },
    { id: "cohere-command", name: "Command" },
    { id: "mistral-7b", name: "Mistral 7B" },
  ];

  let model = $state<string>(models[0].id);
  let model_name = $state<string>(models[0].name);
</script>

<div class="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 shrink-0">
  <PromptInput globalDrop multiple {onSubmit}>
    <PromptInputBody>
      <PromptInputAttachments>
        {#snippet children(attachment)}
          <PromptInputAttachment data={attachment} />
        {/snippet}
      </PromptInputAttachments>
      <PromptInputTextarea
        {placeholder}
        bind:value={input}
        onchange={(e) => (input = (e.target as HTMLTextAreaElement).value)}
      />
    </PromptInputBody>
    <PromptInputToolbar>
      <PromptInputTools>
        <PromptInputActionMenu>
          <PromptInputActionMenuTrigger />
          <PromptInputActionMenuContent>
            <PromptInputActionAddAttachments />
          </PromptInputActionMenuContent>
        </PromptInputActionMenu>
        <PromptInputModelSelect
          bind:value={model}
          onValueChange={(value) => {
            if (value) {
              model = value;
              const selectedModel = models.find((m) => m.id === model);
              model_name = selectedModel ? selectedModel.name : "";
            }
          }}
        >
          <PromptInputModelSelectTrigger>
            <PromptInputModelSelectValue
              value={model_name}
              placeholder="Select Model"
            />
          </PromptInputModelSelectTrigger>
          <PromptInputModelSelectContent>
            {#each models as modelOption (modelOption.id)}
              <PromptInputModelSelectItem value={modelOption.id}>
                {modelOption.name}
              </PromptInputModelSelectItem>
            {/each}
          </PromptInputModelSelectContent>
        </PromptInputModelSelect>
      </PromptInputTools>
      <PromptInputSubmit {status} />
    </PromptInputToolbar>
  </PromptInput>
  <p class="mt-2 text-center text-[10px] text-muted-foreground">
    AI responses may be inaccurate. Verify important information.
  </p>
</div>
