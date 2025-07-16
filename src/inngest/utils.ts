import { AgentResult } from "@inngest/agent-kit";
import { Sandbox } from "e2b";

export async function getSandbox(sandboxId : string){
     try {
          const sandbox = await Sandbox.connect(sandboxId);
          await sandbox.setTimeout(60_000 * 10 * 3)

          return sandbox;
     } catch (error: any) {
          console.error('Failed to connect to sandbox:', error);
          throw new Error(`Failed to connect to sandbox: ${error.message}`);
     }
}

export function lastAssistantTextMessageContent(result: AgentResult){
     const lastAssistantTextMessageIndex = result.output.findLastIndex((m)=> m.role === "assistant")
     const message = result.output[lastAssistantTextMessageIndex]
     if (message.type === "text") {
          return message.content ? typeof message.content === "string" ? message.content : message.content.map((c)=> c.type === "text" ? c.text : c.text).join("") : null
     }
     return null
}