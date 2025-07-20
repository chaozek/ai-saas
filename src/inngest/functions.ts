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
          content: ` ${index + 1} . ${message.content}`
        })
      }
      return formattedMessages.reverse()
     })


     const { existingFiles, existingSandboxId } = await step.run("get-existing-files-and-sandbox", async () => {
       const lastFragment = await prisma.fragment.findFirst({
         where: {
           message: {
             projectId: event.data.projectId
           }
         },
         orderBy: {
           createdAt: "desc"
         },
         include: {
           message: true
         }
       });

       if (lastFragment) {
         return {
           existingFiles: lastFragment.files as Record<string, string> || {},
           existingSandboxId: lastFragment.sandboxId || null
         };
       }
       return {
         existingFiles: {},
         existingSandboxId: null
       };
     });

     const state = createState(
      {
        summary: "",
        files: existingFiles,
        hasExistingProject: Object.keys(existingFiles).length > 0,
      },{
        messages: previousMessages
      }
    )
      let sandboxId: string;

      try {

        if (existingSandboxId) {
          sandboxId = existingSandboxId;
          console.log(`Using existing sandbox: ${sandboxId}`);
        } else {
          sandboxId = await step.run("create-new-sandbox", async () => {
            const sandbox = await Sandbox.create("vibe-ai");
            await sandbox.setTimeout(60_000 * 5)
            console.log(`Created new sandbox: ${sandbox.sandboxId}`);
            return sandbox.sandboxId;
          });
        }


        if (!existingSandboxId && Object.keys(existingFiles).length > 0) {
          await step.run("load-existing-files-to-sandbox", async () => {
            const sandbox = await getSandbox(sandboxId);
            for (const [path, content] of Object.entries(existingFiles)) {
              await sandbox.files.write(path, content as string);
            }
          });
        }
      } catch (error: any) {
        console.error("Failed to create/use sandbox:", error);
        throw new Error(`Failed to create/use sandbox: ${error.message}`);
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
              return await step?.run("createOrUpdateFiles", async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  network.state.data.files = updatedFiles;
                  console.log("Updated files in state:", Object.keys(updatedFiles));
                  return `Successfully updated ${files.length} files`;
                } catch (error: any) {
                  console.error(error);
                  return `Error creating or updating files: ${error.message}`;
                }
              });
            },
          }),
          createTool({
            name: "readFiles",
            description: "Read files from the sandbox",
            parameters: z.object({
              files: z.array(z.string()),
            }),
            handler: async ({files}, {step}) => {
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
              });
            },
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
        maxIter: 25, // Zvýšeno z 15 na 25
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

      console.log("Network run completed, sandboxId:", sandboxId);
      console.log("Current state files:", Object.keys(result.state.data.files || {}));

      // Načti všechny soubory ze sandboxu na konci
      const allFiles = await step.run("get-all-files-from-sandbox", async () => {
        console.log("Starting to get all files from sandbox...");
        try {
          const sandbox = await getSandbox(sandboxId);
          console.log("Got sandbox, listing files...");
          const files = await sandbox.files.list("/");
          console.log("Files list result:", files);
          const fileContents: Record<string, string> = {};

          for (const fileInfo of files) {
            try {
              console.log("Reading file:", fileInfo.name);
              const content = await sandbox.files.read(fileInfo.name);
              fileContents[fileInfo.name] = content;
              console.log("Successfully read file:", fileInfo.name);
            } catch (error) {
              console.warn(`Could not read file ${fileInfo.name}:`, error);
            }
          }

          console.log("All files from sandbox:", Object.keys(fileContents));
          return fileContents;
        } catch (error) {
          console.error("Error getting files from sandbox:", error);
          return {};
        }
      });

      console.log("All files loaded:", Object.keys(allFiles));
      console.log("All files content:", allFiles);

      // Aktualizuj stav s načtenými soubory
      result.state.data.files = allFiles;

      // Fallback: pokud nejsou žádné soubory, zkus načíst alespoň základní soubory
      if (Object.keys(allFiles).length === 0) {
        console.log("No files found, trying fallback...");
        try {
          const sandbox = await getSandbox(sandboxId);
          const fallbackFiles = ["app/page.tsx", "app/layout.tsx", "package.json"];
          const fallbackContents: Record<string, string> = {};

          for (const filePath of fallbackFiles) {
            try {
              const content = await sandbox.files.read(filePath);
              fallbackContents[filePath] = content;
              console.log("Fallback: read file", filePath);
            } catch (error) {
              console.log("Fallback: could not read", filePath);
            }
          }

          if (Object.keys(fallbackContents).length > 0) {
            result.state.data.files = fallbackContents;
            console.log("Using fallback files:", Object.keys(fallbackContents));
          }
        } catch (error) {
          console.error("Fallback failed:", error);
        }
      }

      if (!result.state.data.summary) {
        console.warn("Agent did not complete task with <task_summary>, forcing completion");
        result.state.data.summary = "<task_summary>Task completed but agent did not provide proper summary</task_summary>";
      }
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
          return `https://${host}`;
        });
        await step.run("save-result", async () => {
          console.log("=== SAVING TO DATABASE ===");
          console.log("Result state data:", result.state.data);
          console.log("Files object:", result.state.data.files);
          console.log("Files type:", typeof result.state.data.files);
          console.log("Files keys:", Object.keys(result.state.data.files || {}));
          console.log("Files stringified:", JSON.stringify(result.state.data.files));

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
                  sandboxId,
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
