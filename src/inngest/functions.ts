import { inngest } from "./client";
import { Agent, openai, createAgent, createTool, createNetwork, Message, createState } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import  {FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import prisma from "@/lib/prisma";

type BuildAgentEvent = {
  name: "build-agent/run";
  data: {
    value: string;
    projectId: string;
  };
  files: string;
};

export const buildAgent = inngest.createFunction(
  { id: "build-agent" },
  { event: "build-agent/run" },
  async ({ event, step }: { event: BuildAgentEvent, step: any }) => {
    try {
     const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = []

      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      })
      for(const [index, message] of messages.entries()){
        formattedMessages.push({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: ` ${index + 1} . ${message.content} - always keep previous design and only modify user required change`
        })
      }
      return formattedMessages.reverse()
     })
     const state = createState(
      {
        summary: "",
        files: {},

      },{
        messages: previousMessages
      }
    )
      let sandboxId: string;

      try {
        sandboxId = await step.run("get-sandbox-id", async () => {
          const sandbox = await Sandbox.create("vibe-ai");
          await sandbox.setTimeout(60_000 * 10 * 3)
          return sandbox.sandboxId;
        });
      } catch (error: any) {
        console.error("Failed to create sandbox:", error);
        throw new Error(`Failed to create sandbox: ${error.message}`);
      }

      const builder = createAgent({
        name: "builder",
        system: PROMPT,
        model: openai({
          model: "gpt-4.1",
          defaultParameters: {
            temperature: 0.1,
          }
        }),
        tools: [
          createTool({
            name: "terminal",
            description: "Use the terminal to run commands",
            parameters: z.object({
              command: z.string(),
            }),
            handler: async ({command}, {step}) => {
              return await step?.run("terminal", async () => {
                const buffers = {stdout: "", stderr: ""};
                console.log(command, sandboxId, "aaaaaaaaaa");
                try {
                  const sandbox = await getSandbox(sandboxId);
                  const result = await sandbox.commands.run(command, {
                    onStdout: (data) => {
                      buffers.stdout += data;
                    },
                    onStderr: (data) => {
                      buffers.stderr += data;
                    },
                  });
                  return result.stdout;
                } catch (error: any) {
                  console.error("Command execution failed:", error);
                  return `Command failed: ${error.message} ${buffers.stderr} ${buffers.stdout}`;
                }
              });
            },
          }),
          createTool({
            name: "createOrUpdateFiles",
            description: "Create or update files in the sandbox",
            parameters: z.object({
              files: z.array(
                z.object({
                  path: z.string(),
                  content: z.string(),
                })
              ),
            }),
            handler: async ({files}, {step, network}) => {
              const newFiles = await step?.run("createOrUpdateFiles", async () => {
               try {
                const updatedFiles = await network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
               } catch (error: any) {
                console.error(error);
                return `Error creating or updating files: ${error.message}`;
              }
            })
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles
            }

          }}),
          createTool({
            name: "readFiles",
            description: "Read files from the sandbox",
            parameters: z.object({
              files: z.array(z.string() ),
            }),
            handler: async ({files}, {step, network}) => {
              return await step?.run("readFiles", async () => {
                try {
                  const sandbox = await getSandbox(sandboxId);
                  const contents = [];
                  for (const file of files) {
                    const content = await sandbox.files.read(file);
                    contents.push({path: file, content});
                  }
                  return JSON.stringify(contents);
                } catch (error: any) {
                  console.error(error);
                  return `Error reading files: ${error.message}`;
                }
              })
            }
          }),
        ],
        lifecycle: {
          onResponse: async ({result, network}) => {
            const summary = lastAssistantTextMessageContent(result);
            if (summary && network) {
              if(summary.includes("<task_summary>")) {
                network.state.data.summary = summary;
              }
            }
            return result;
          }
        }
      });

      const network = createNetwork({
        name: "coding-agent-network",
        agents: [builder],
        maxIter: 15,
        defaultState: state,
        router: async ({network}) => {
          const summary = network.state.data.summary;
          if (summary) {
            return;
          }
          return builder;
        }
      });

      const result = await network.run(event.data.value, {state});
      const fragmentTitleGenerator = createAgent({
        name: "fragment-title-generator",
        system: FRAGMENT_TITLE_PROMPT ,
        model: openai({
          model: "gpt-4o",
        }),
      })
      const responseGenerator = createAgent({
        name: "response-generator",
        system: RESPONSE_PROMPT ,
        model: openai({
          model: "gpt-4o",
        }),
      })

      const {output: fragmentTitleOutput} = await fragmentTitleGenerator.run(result.state.data.summary)
      const {output: responseOutput} = await responseGenerator.run(result.state.data.summary)

      const generateFragmentTitle = ()=>{
        if(fragmentTitleOutput[0].type !== "text"){
          return "Fragment"
        }
        if(Array.isArray(fragmentTitleOutput[0].content)){
          return fragmentTitleOutput[0].content.map((txt: any)=>txt.text).join(" ")
        }
        return fragmentTitleOutput[0].content
      }
      const generateResponse = ()=>{
        if(responseOutput[0].type !== "text"){
          return "Hero you go"
        }
        if(Array.isArray(responseOutput[0].content)){
          return responseOutput[0].content.map((txt: any)=>txt.text).join(" ")
        }
        return responseOutput[0].content
      }
      const isError = !result.state.data.summary || result.state.data.summary.includes("Error");
      let sandboxUrl: string;
      try {
        sandboxUrl = await step.run("get-sandbox-url", async () => {
          const sandbox = await getSandbox(sandboxId);
          const host = sandbox.getHost(3000);
          return `http://${host}`;
        });
        await step.run("save-result", async () => {
          if(isError) {
            await prisma.message.create({
              data: {
                content:"Please try again, something went wrong",
                role: "ASSISTANT",
                type: "ERROR",
                projectId: event.data.projectId
              },
            });
          }
          await prisma.message.create({
            data: {
              content: generateResponse(),
              role: "ASSISTANT",
              type: "RESULT",
              projectId: event.data.projectId,
              fragment: {
                create: {
                  title: generateFragmentTitle(),
                  sandboxUrl,
                  files: result.state.data.files || {},
                },
              },
            },
          });
        });
      } catch (error: any) {
        console.error("Failed to get sandbox URL:", error);
        throw new Error(`Failed to get sandbox URL: ${error.message}`);
      }

      return {
        url: sandboxUrl,
        title: "Fragment",
        files: result.state.data.files,
        summary: result.state.data.summary
      };
    } catch (error: any) {
      console.error("Error in helloWorld function:", error);
      throw error;
    }
  },
);
