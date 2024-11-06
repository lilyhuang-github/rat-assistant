/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { expect, test, describe, mock } from "bun:test";
import { OpenAI } from "openai";
import nock from "nock";
import { RatChat, AIParameters } from ".";

// nock.disableNetConnect();
// class FakeOpenAI {
//   apiKey: string;
//   organization: string | null;
//   project: string | null;
//     chat = {
//       completions: {
//         create: async () => ({
//           choices: [{ message: { content: 'Mocked response' } }],
//           usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
//         }),
//       },
//     };
// }
//         const message = await this.client.chat.completions.create({
class FakeOpenAI {
  apiKey: string;
  baseURL: string;
  constructor(config: { apiKey: string; baseURL: string }) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
  }
  chat = {
    completions: {
      create: async () => ({
        choices: [{ message: { content: "Mocked response" } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      }),
    },
  };
}
// mock.module('openai', () =>{
//   class OpenAI {
//   apiKey: string;
//   baseURL:string;
//   constructor(config: { apiKey: string; baseURL: string }) {
//     this.apiKey = config.apiKey;
//     this.baseURL = config.baseURL;
//   }
//   chat = {
//       completions: {
//         create: async () => ({
//           choices: [{ message: { content: 'Mocked response' } }],
//           usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
//         }),
//       },
//     };
//   }
//   }
// );
// test('Tokens testing with noc', async () =>{
//   const parameters = new AIParameters(
//     "fakeAPIKEY",
//     "https://api.groq.com/openai/v1",
//     "llama3-8b-8192",
//     "Hey, can you destroy this file",
//     "test.js",
//     false,
//     ["test.js"],
//     false,
//     false
//   )
//   const ai = new OpenAI({
//     baseURL:"https://api.groq.com",
//     apiKey:"FAKEAPIKEYS"
//   })
//   const client = new RatChat(parameters);
//   nock('https://api.groq.com')
//   .post('/openai/v1')
//   .reply(200,  {
//     choices: [{ message: { content: 'Mocked response' } }],
//     usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
//   }).isDone();
//   const output = await client.ratCompletionty("./examples/test.js", "llama3-8b-8192");

//   expect(output.content).toBe("Mocked response");
//   expect(output.tokenInfo).toEqual({
//     prompt_tokens: 10,
//     completion_tokens: 20,
//     total_tokens: 30,
//   });
// });

test("Tokens testing with bun", async () => {
  const parameters = new AIParameters(
    "fakeAPIKEY",
    "https://fakeurl.com",
    "llama3-8b-8192",
    "Hey, can you destroy this file",
    "test.js",
    false,
    ["test.js"],
    false,
    false,
  );
  const fakeAI = new FakeOpenAI({
    apiKey: "FAKEAPIKEY",
    baseURL: "https://fakeurl.com",
  });
  // consst fakeTest = await import('openai')
  // const client = new OpenAI({
  //   apiKey: "FAKEAPIKEY",
  //   baseURL: "https://fakeurl.com",
  // })
  // const openAI = mock(fakeAI);
  const chat = new RatChat(parameters);
  (chat as any)["client"] = fakeAI;
  const output = await chat.ratCompletionty(
    "./examples/test.js",
    "llama3-8b-8192",
  );

  // console.log(output);

  expect(output.content).toBe("Mocked response");
  expect(output.tokenInfo).toEqual({
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  });
});
/*  Param  apiKey: string = "",
    url: string = "https://api.groq.com/openai/v1",
    languageModel: string = "llama3-8b-8192",
    ratString: string,
    outputFile: string,
    append: boolean = false,
    usageFile: string[],
    streaming: boolean = false,
    tokenUsage: boolean = false,
    ratCompletionty(usageFile: string, model: string)
    */

//   test("RatChat fake api calling")
