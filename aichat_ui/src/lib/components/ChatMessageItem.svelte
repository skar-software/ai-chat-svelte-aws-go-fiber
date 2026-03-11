<script lang="ts">
    import {
        Message,
        MessageContent,
    } from "$lib/components/ai-elements/message";
    import { Response } from "$lib/components/ai-elements/response";
    import * as Artifact from "$lib/components/ai-elements/artifact";
    import * as Code from "$lib/components/ai-elements/code";
    import {
        Confirmation,
        ConfirmationTitle,
        ConfirmationRequest,
        ConfirmationActions,
        ConfirmationAction,
    } from "$lib/components/ai-elements/confirmation";
    import {
        Plan,
        PlanHeader,
        PlanTitle,
        PlanTrigger,
        PlanContent,
        PlanDescription,
    } from "$lib/components/ai-elements/plan";
    import {
        Queue,
        QueueList,
        QueueItem,
        QueueItemIndicator,
        QueueItemContent,
        QueueItemDescription,
        QueueSection,
        QueueSectionTrigger,
        QueueSectionLabel,
        QueueSectionContent,
    } from "$lib/components/ai-elements/queue";
    import { Actions, Action } from "$lib/components/ai-elements/action";
    import { 
        Code2, 
        CircleAlert, 
        Copy, 
        RefreshCcw
    } from "@lucide/svelte";
    import type { ChatMessage } from "./types";

    interface ChatMessageItemProps {
        msg: ChatMessage;
        shikiTheme?: string;
    }

    let { msg, shikiTheme = "github-dark-default" }: ChatMessageItemProps =
        $props();

    const handleCopy = async (text?: string) => {
        const contentToCopy = text || msg.content;
        if (!contentToCopy) return;
        try {
            await navigator.clipboard.writeText(contentToCopy);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const handleRetry = () => {
        console.log("Retry message:", msg.id);
    };
</script>

<Message from={msg.role} class="mb-2">
    <MessageContent variant="flat">
        {#if msg.role === "user"}
            {msg.content}
        {:else}
            {#if msg.content}
                <div class="mb-3">
                    <Response content={msg.content} theme={shikiTheme} />
                </div>
            {/if}

            {#if msg.parts && msg.parts.length > 0}
                {#each msg.parts as part}
                {#if part.type === "code" && part.content}
                    <div class="my-3">
                        <Code.Root
                            code={part.content}
                            lang={part.meta?.lang ?? "typescript"}
                        >
                            <Code.CopyButton />
                            <Code.Overflow>
                            </Code.Overflow>
                        </Code.Root>
                    </div>
                {:else if part.type === "artifact" && part.content}
                    <div class="my-3">
                        <Artifact.Root>
                            <Artifact.Header
                                class="flex items-center justify-between p-3"
                            >
                                <div class="flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-md bg-secondary text-foreground"
                                    >
                                        <Code2 class="size-4" />
                                    </div>
                                    <div>
                                        <Artifact.Title class="text-xs font-semibold">
                                            {part.meta?.title ?? "Artifact"}
                                        </Artifact.Title>
                                        <Artifact.Description class="text-[10px] text-muted-foreground">
                                            {part.meta?.description ?? ""}
                                        </Artifact.Description>
                                    </div>
                                </div>
                                <Artifact.Actions>
                                    <Artifact.Action
                                        tooltip="Copy"
                                        label="Copy"
                                        onclick={() => handleCopy(part.content)}
                                    >
                                        <Copy class="size-4" />
                                    </Artifact.Action>
                                </Artifact.Actions>
                            </Artifact.Header>
                            <Artifact.Content class="px-3 pb-3">
                                <Response
                                    content={part.content}
                                    theme={shikiTheme}
                                />
                            </Artifact.Content>
                        </Artifact.Root>
                    </div>
                {:else if part.type === "confirmation"}
                    <div class="my-3">
                        <Confirmation
                            state={part.meta?.state ?? "approval-requested"}
                            approval={part.meta?.approval}
                        >
                            <ConfirmationTitle>
                                <div class="flex items-center gap-2">
                                    <CircleAlert class="size-4" />
                                    <span class="font-semibold text-sm"
                                        >{part.meta?.title ??
                                            "Action Required"}</span
                                    >
                                </div>
                            </ConfirmationTitle>
                            <ConfirmationRequest>
                                <p class="text-sm text-muted-foreground">
                                    {part.meta?.description ?? ""}
                                </p>
                            </ConfirmationRequest>
                            <ConfirmationActions>
                                <ConfirmationAction variant="outline"
                                    >Deny</ConfirmationAction
                                >
                                <ConfirmationAction>Approve</ConfirmationAction>
                            </ConfirmationActions>
                        </Confirmation>
                    </div>
                {:else if part.type === "plan"}
                    <div class="my-3 w-full">
                        <Plan class="w-full">
                            <PlanHeader>
                                <div class="flex flex-col gap-1">
                                    <PlanTitle
                                        >{part.meta?.title ?? "Plan"}</PlanTitle
                                    >
                                    <PlanDescription
                                        >{part.meta?.description ??
                                            ""}</PlanDescription
                                    >
                                </div>
                                <PlanTrigger />
                            </PlanHeader>
                            <PlanContent>
                                {#if part.meta?.steps}
                                    <ul
                                        class="ml-3 pb-4 list-decimal space-y-2 text-sm text-foreground"
                                    >
                                        {#each part.meta.steps as step}
                                            <li>
                                                <Response
                                                    content={step}
                                                    theme={shikiTheme}
                                                />
                                            </li>
                                        {/each}
                                    </ul>
                                {/if}
                            </PlanContent>
                        </Plan>
                    </div>
                {:else if part.type === "queue" && part.meta}
                    <div class="my-3 w-full">
                        <Queue>
                            <!-- Messages Section -->
                            {#if part.meta.messages && part.meta.messages.length > 0}
                                <QueueList>
                                    {#each part.meta.messages as message (message.id)}
                                        <QueueItem>
                                            <div class="flex items-center gap-2">
                                                <QueueItemIndicator />
                                                <QueueItemContent>{message.text}</QueueItemContent>
                                            </div>
                                        </QueueItem>
                                    {/each}
                                </QueueList>
                            {/if}

                            <!-- Pending Todos Section -->
                            {#if part.meta.todos && part.meta.todos.filter((t) => t.status === "pending").length > 0}
                                <QueueSection>
                                    <QueueSectionTrigger>
                                        <QueueSectionLabel
                                            label="Pending"
                                            count={part.meta.todos.filter((t) => t.status === "pending").length}
                                        />
                                    </QueueSectionTrigger>
                                    <QueueSectionContent>
                                        <QueueList>
                                            {#each part.meta.todos.filter((t) => t.status === "pending") as todo (todo.id)}
                                                <QueueItem>
                                                    <div class="flex items-center gap-2">
                                                        <QueueItemIndicator completed={false} />
                                                        <QueueItemContent completed={false}>{todo.title}</QueueItemContent>
                                                    </div>
                                                    {#if todo.description}
                                                        <QueueItemDescription completed={false}>{todo.description}</QueueItemDescription>
                                                    {/if}
                                                </QueueItem>
                                            {/each}
                                        </QueueList>
                                    </QueueSectionContent>
                                </QueueSection>
                            {/if}

                            <!-- Completed Todos Section -->
                            {#if part.meta.todos && part.meta.todos.filter((t) => t.status === "completed").length > 0}
                                <QueueSection>
                                    <QueueSectionTrigger>
                                        <QueueSectionLabel
                                            label="Completed"
                                            count={part.meta.todos.filter((t) => t.status === "completed").length}
                                        />
                                    </QueueSectionTrigger>
                                    <QueueSectionContent>
                                        <QueueList>
                                            {#each part.meta.todos.filter((t) => t.status === "completed") as todo (todo.id)}
                                                <QueueItem>
                                                    <div class="flex items-center gap-2">
                                                        <QueueItemIndicator completed={true} />
                                                        <QueueItemContent completed={true}>{todo.title}</QueueItemContent>
                                                    </div>
                                                    {#if todo.description}
                                                        <QueueItemDescription completed={true}>{todo.description}</QueueItemDescription>
                                                    {/if}
                                                </QueueItem>
                                            {/each}
                                        </QueueList>
                                    </QueueSectionContent>
                                </QueueSection>
                            {/if}
                        </Queue>
                    </div>
                {/if}
            {/each}
            {/if}

            {#if msg.role === "assistant"}
                <div class="mt-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Actions>
                        <Action
                            tooltip="Retry"
                            label="Retry"
                            onclick={handleRetry}
                        >
                            <RefreshCcw class="size-3.5" />
                        </Action>
                        <Action
                            tooltip="Copy"
                            label="Copy"
                            onclick={() => handleCopy()}
                        >
                            <Copy class="size-3.5" />
                        </Action>
                    </Actions>
                </div>
            {/if}
        {/if}
    </MessageContent>
</Message>
