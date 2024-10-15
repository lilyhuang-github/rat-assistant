#!/usr/bin/env bun

import yargs from "yargs";
import { appendFile } from 'fs';
import { OpenAI } from 'openai';
import { stderr } from "bun";
import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml'; // Import the TOML parser
import { hideBin } from 'yargs/helpers'; // Import hideBin correctly

const { name, version } = require("./package.json");

const groqAPIKEY: string = process.env?.APIKEY ? process.env.APIKEY : "";
const requireAPIKey: boolean = !!(groqAPIKEY);
const gorg: string = "https://api.groq.com/openai/v1";
const langModel: string = "llama3-8b-8192";

// Function to read the TOML config file from the user's home directory
function readConfigFile(): any {
  const configPath = path.join(process.env.HOME || '', '.rat-assistant-config.toml');
  console.log(`Looking for config at: ${configPath}`);  // Debug log

  if (fs.existsSync(configPath)) {
    try {
      const configFileContent = fs.readFileSync(configPath, 'utf-8');
      const parsedConfig = toml.parse(configFileContent);
      return parsedConfig;
    } catch (error) {
      console.error('Error parsing TOML config file:', error.message);
      process.exit(1);
    }
  } else {
    console.log("No config file found");
  }
  return {}; // Return empty object if no config file is found
}

const config = readConfigFile();
// Pass the `rubberRatty` value from the TOML config to yargs if it's set
const argv = yargs(hideBin(process.argv))
  .option('rubber-ratty', {
    alias: 'r',
    type: 'string',
    description: 'What you want the rat to explain',
    default: config.rubber_ratty || '',  // Use config value if available
    demandOption: !config.rubber_ratty  // Only demand it if it is not in the TOML file
  })
class AIParameters {
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
    tokenUsage: boolean = false
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

class RatChat {
  parameters: AIParameters;

  constructor(parameters: AIParameters) {
    this.parameters = parameters;
  }

  public async ratCompletionty(
    usageFile: string,
    model: string
  ) {
    const client = new OpenAI({
      apiKey: this.parameters.apiKey,
      baseURL: this.parameters.url
    });
    try {
      const reader = Bun.file(usageFile);
      const text = await reader.text();
      const prompt: string = `Can you explain in a rat persona the general idea on how to ${this.parameters.helpString} but not directly give the answer: ${text}`;
      let streamContent: string = "";
      if (this.parameters.streaming) {
        const streaming = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "user", // could be changed if needed
              content: prompt
            }
          ],
          stream: true
        });

        for await (const chunk of streaming) {
          process.stdout.write(chunk.choices[0]?.delta?.content || '');
          streamContent += chunk.choices[0]?.delta?.content;
        }
      }

      if (!this.parameters.streaming) {
        const message = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "user", // could be changed if needed
              content: prompt
            }
          ],
        });
        return {
          content: message.choices[0]?.message?.content,
          tokenInfo: message.usage
        };
      } else {
        return {
          content: streamContent,
          tokenInfo: "" // token usage isn't provided in streamed responses
        };
      }

    } catch (err) {
      console.error(`Error: ${err}`);
      throw err;
    }

  }
}

// Updated `argv` with TOML defaults included
const args = await yargs(Bun.argv.slice(2))
  .usage('Usage: $0 <command> [...flags] [...args]')
  .example(`${name} index.js`, 'uses the language model to improve it')
  .scriptName(name)
  .command('$0 <files...>', 'parses one to many files', (yargs) => {
    yargs
      .positional('files', {
        describe: 'path to file that it will parse',
        type: 'string',
        array: true,
        demandOption: true
      });
  }, async (argv) => {

    let AIChatParam = new AIParameters(
      process.env?.APIKEY || config.api_key, // added TOML default for API key
      typeof argv.e == 'string' ? argv.e : config.end_point, // added TOML default for endpoint
      Array.isArray(argv.m) ? argv.m.join(" ") : config.model, // added TOML default for model
      typeof argv.r === 'string' ? argv.r : config.helpString, // added TOML default for helpString
      typeof argv.o === 'string' ? argv.o : config.output, // added TOML default for output
      typeof argv.a === 'boolean' ? argv.a : config.append, // added TOML default for append
      Array.isArray(argv.files) ? argv.files : [""],
      typeof argv.s === 'boolean' ? argv.s : config.streaming, // added TOML default for streaming
      typeof argv.t === 'boolean' ? argv.t : config.tokenUsage // added TOML default for token usage
    );

    let chatCompletion = new RatChat(AIChatParam);
    for (const file of AIChatParam.usageFiles) {
      for (const model of AIChatParam.languageModel.split(" ")) {
        try {
          const { content, tokenInfo } = await chatCompletion.ratCompletionty(file, model);
          if (typeof content == "string") {
            if (chatCompletion.parameters.outputFile) {
              if (typeof argv.a === 'boolean') { // appending
                appendFile(model + "_" + argv.o, content, err => {
                  if (err)
                    throw err;
                });
              } else {
                await Bun.write(model + "_" + argv.o, content); // overriding
              }
            } else {
              if (!chatCompletion.parameters.streaming) {
                console.log(model + ": ");
                console.log(content);
              }
            }
          }

          if (typeof tokenInfo !== "string" && tokenInfo?.prompt_tokens !== undefined) {
            if (chatCompletion.parameters.tokenUsage) {
              await Bun.write(Bun.stdout, "\nToken Usage Information:\n" +
                "\n- Tokens Used for Prompt: " + tokenInfo.prompt_tokens +
                "\n- Response Tokens: " + tokenInfo.completion_tokens +
                "\n- Total Tokens: " + tokenInfo.total_tokens);
            }
          }

        } catch (err) {
          console.error(`Failed to process file: ${file} \n`, err);
          process.exit(1);
        }
      }
    }

  })
  .option('api-key', {
    alias: 'k',
    type: 'string',
    description: 'API key for the LLM',
    default: config.api_key || '-----', // Use config value if present
  })
  .option('end-point', {
    alias: 'e',
    type: 'string',
    description: 'API end point of the LLM',
    default: config.end_point || 'https://api.groq.com/openai/v1'
  })
  .option('model', {
    alias: 'm',
    type: 'string',
    description: 'Language model to use',
    default: config.model || 'llama3-8b-8192'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'File to output to',
    default: config.output || ''
  })
  .option('append', {
    alias: 'a',
    type: 'boolean',
    description: 'Whether to append to the output file',
    default: config.append || false
  })
  .option('stream', {
    alias: 's',
    type: 'boolean',
    description: 'Whether to stream the output live',
    default: config.streaming || false
  })
  .option('token-usage', {
    alias: 't',
    type: 'boolean',
    description: 'Provides token usage information',
    default: config.token_usage || false
  })
  .argv;