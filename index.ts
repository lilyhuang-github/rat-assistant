#!/usr/bin/env bun

//test
//test
import yargs from "yargs";
import { appendFile } from "fs";
import { OpenAI } from "openai";

const { name, version } = await import("./package.json");

const groqAPIKEY: string = process.env?.APIKEY ? process.env.APIKEY : "";
const requireAPIKey: boolean = !!groqAPIKEY;
const gorg: string = "https://api.groq.com/openai/v1";
const langModel: string = "llama3-8b-8192";
export function sum(a: number, b: number) {
  return a + b;
}
export class AIParameters {
  apiKey: string;
  requireAPIKey: boolean;
  url: string;
  languageModel: string;
  helpString: string;
  outputFile: string;
  append: boolean;
  usageFiles: string[];
  streaming: boolean;
  tokenUsage: boolean;

  constructor(
    apiKey: string = "",
    url: string = "https://api.groq.com/openai/v1",
    languageModel: string = "llama3-8b-8192",
    ratString: string,
    outputFile: string,
    append: boolean = false,
    usageFile: string[],
    streaming: boolean = false,
    tokenUsage: boolean = false,
  ) {
    this.apiKey = apiKey;
    this.requireAPIKey = !!apiKey;
    this.url = url;
    this.languageModel = languageModel;
    this.helpString = ratString;
    this.outputFile = outputFile;
    this.append = append;
    this.usageFiles = usageFile;
    this.streaming = streaming;
    this.tokenUsage = tokenUsage;
  }
}

export class RatChat {
  parameters: AIParameters;
  client: OpenAI;
  constructor(parameters: AIParameters, client?: OpenAI) {
    this.parameters = parameters;
    this.client =
      client ||
      new OpenAI({
        apiKey: this.parameters.apiKey,
        baseURL: this.parameters.url,
      });
  }

  public async ratCompletionty(usageFile: string, model: string) {
    try {
      return {
        choices: [{ message: { content: "DESTROED" } }],
        usage: { prompt_tokens: 130, completion_tokens: 210, total_tokens: 320 }
      }
      // console.log(this.client);
      const reader = Bun.file(usageFile);
      const text = await reader.text();
      const prompt: string = `Can you explain in a rat persona the general idea on how to ${this.parameters.helpString} but not directly give the answer: ${text}`;
      let streamContent: string = "";
      if (this.parameters.streaming) {
        const streaming = await this.client.chat.completions.create({
          model,
          messages: [
            {
              role: "user", //could be change problably
              content: prompt,
            },
          ],
          stream: true,
        });

        for await (const chunk of streaming) {
          process.stdout.write(chunk.choices[0]?.delta?.content || "");
          streamContent += chunk.choices[0]?.delta?.content;
        }
      }
      if (!this.parameters.streaming) {
        const message = await this.client.chat.completions.create({
          model,
          messages: [
            {
              role: "user", //could be change problably
              content: prompt,
            },
          ],
        });
        return {
          content: message.choices[0]?.message?.content,
          tokenInfo: message.usage,
        };
      } else {
        return {
          content: streamContent,
          tokenInfo: "",

          // token usage isnt given if its streamed so we have to calculate it on our own
        };
      }
    } catch (err) {
      console.error(`Error: ${err}`);
      throw err;
    }
  }
}

if (require.main === module) {
  await yargs(Bun.argv.slice(2))
    .usage("Usage: $0 <command> [...flags] [...ar  gs]")
    .example(`${name} index.js`, "uses the language model to improve it")
    .scriptName(name)
    .command(
      "$0 <files...>",
      "parses one to many files",
      (yargs) => {
        yargs.positional("files", {
          describe: "path to file that it will parse",
          type: "string",

          array: true,
          demandOption: true,
        });
      },
      async (argv) => {
        const AIChatParam = new AIParameters(
          process.env?.APIKEY,
          typeof argv.e == "string" ? argv.e : undefined,
          Array.isArray(argv.m) ? argv.m.join(" ") : undefined,
          typeof argv.r === "string" ? argv.r : "",
          typeof argv.o === "string" ? argv.o : "",
          typeof argv.a === "boolean" ? argv.a : undefined,
          Array.isArray(argv.files) ? argv.files : [""],
          typeof argv.s === "boolean" ? argv.s : undefined,
          typeof argv.t === "boolean" ? argv.t : false,
        );

        const chatCompletion = new RatChat(AIChatParam);
        //  console.log("THIGNS: " + AIChatParam.languageModel.split(" ") + "THINGS");
        for (const file of AIChatParam.usageFiles) {
          for (const model of AIChatParam.languageModel.split(" ")) {
            try {
              const { content, tokenInfo } =
                await chatCompletion.ratCompletionty(file, model);
              if (typeof content == "string") {
                if (chatCompletion.parameters.outputFile) {
                  //if it includes an output file then write to file

                  if (typeof argv.a === "boolean") {
                    //appending
                    appendFile(model + "_" + argv.o, content, (err) => {
                      if (err) throw err;
                    });
                  } else {
                    await Bun.write(model + "_" + argv.o, content); //overriding
                  }
                  //bun can't append to files even though they have this
                } else {
                  //if they're not writing to file
                  if (!chatCompletion.parameters.streaming) {
                    console.log(model + ": ");
                    console.log(content);
                  }
                }
              }

              if (
                typeof tokenInfo !== "string" &&
                tokenInfo?.prompt_tokens !== undefined
              ) {
                if (chatCompletion.parameters.tokenUsage) {
                  await Bun.write(
                    Bun.stdout,
                    "\nToken Usage Information:\n" +
                      "\n- Tokens Used for Prompt: " +
                      tokenInfo.prompt_tokens +
                      "\n- Response Tokens: " +
                      tokenInfo.completion_tokens +
                      "\n- Total Tokens: " +
                      tokenInfo.total_tokens,
                  );
                }
              }
            } catch (err) {
              console.error(`Failed to process file: ${file} \n`, err);
              process.exit(1);
            }
          }
        }
      },
    )
    .option("k", {
      alias: "api-key",
      demandOption: requireAPIKey,
      default: groqAPIKEY,
      describe: "the apikey of the api endpoint your using",
      type: "string",
    })
    .option("e", {
      alias: "end-point",
      demandOption: false,
      default: gorg,
      describe: "api end point of the llm",
      type: "string",
    })
    .option("m", {
      alias: "model",
      demandOption: false,
      default: langModel,
      describe: "language model to use",
      type: "array",
    })
    .option("r", {
      alias: "rubber-ratty",
      demandOption: true,
      describe: "What you want the ducky to explain",
      type: "string",
    })
    .option("s", {
      alias: "stream",
      demandOption: false,
      describe: "Will stream the response live rather than all at once",
      type: "boolean",
      default: "false",
    })
    // won't work with writing to file cause it doesn't make sense
    // cause writing to file will override the file so streaming it doesn't make sense cause it'll just override itself
    .option("o", {
      alias: "output",
      describe: "file to output to",
      type: "string",
    })
    .option("a", {
      alias: "append",
      default: "false",
      describe: "whether it destructively writes to file or appends to",
      type: "boolean",
    })
    .option("t", {
      alias: "token-usage",
      default: "false",
      describe: "provides the token usage information",
      type: "boolean",
    })
    .version("v", "version showing", version)
    .help("h", "shows the commands")
    .alias("h", "help")
    .alias("v", "version")
    .parse();
}
