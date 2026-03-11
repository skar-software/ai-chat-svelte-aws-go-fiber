export type DemoPartType = "text" | "code" | "artifact" | "confirmation" | "plan" | "queue";

export interface DemoPart {
    type: DemoPartType;
    content?: string;
    meta?: Record<string, any>;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    parts?: DemoPart[];
}
