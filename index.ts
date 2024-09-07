
// import {Groq} from "groq-sdk";
//groq api thing
import yargs, { type Arguments } from "yargs";
import {appendFile } from 'fs';
import {OpenAI} from 'openai'; 
//yargs, argument package thingy

const {name, version} = require("./package.json");

// const groq: Groq = new Groq({ apiKey: process.env.APIKEY });
// if(process.env?.APIKEY){
// const apiKey:string = process.env.APIKEY;
// }
const groqAPIKEY:string = process.env?.APIKEY ? process.env.APIKEY : "";
const requireAPIKey:boolean = !!(groqAPIKEY);
const gorg:string = "https://api.groq.com/openai/v1";
const langModel:string = "llama3-8b-8192";
export async function main() {
    // const chatCompletion = await getGroqChatCompletion();
    // Print the completion returned by the LLM.
    // console.log(chatCompletion.choices[0]?.message?.content || "wrong");
  }
export async function getGroqChatCompletion(prompt:string, model:string = langModel, argapiKey:string =groqAPIKEY, urlThing:string =gorg): Promise<any> {
  //hypotehtically can translate to any language (next thing) but

  //new idea code obfuscation
  //want to do something else but this is what i thought of 
  // const 
  const client = new OpenAI({
    apiKey: argapiKey,
    baseURL: urlThing
  });
  const thing = await client.chat.completions.create(
{
  model,
  messages:[
    {
      role:"user", //could be change problably
      content:prompt
    }
  ]

  
}
  )
    // const thing = await groq.chat.completions.create({
    //   messages: [
    //     {
    //       role: "user",
    //       // content: `Can you convert this code to ${convert}: ${code}`,
    //       content:prompt,
    //     },
    //   ],
    //   model: model,
    // });
    return thing.choices[0]?.message?.content;
  }
//deal with argument stuff

const languageTranslation = async(things : string, lang : string,  model:string = langModel, apiKey:string =groqAPIKEY, urlThing:string =gorg) =>{
//read the file of thing
//shoot off error if not
//alternative is a rubbery ducky but idk
  try{
    const foo = Bun.file(things);
    const text = await foo.text();
    const prompt:string = `Can you convert this code to ${lang} and also in a pirate language: ${text}`;
    return await getGroqChatCompletion(prompt, model, apiKey, urlThing);
  // return await getGroqChatCompletion(await foo.text(), lang);
  }catch(err)
  {console.error(`Error: ${err}`);
  throw err;
}

  // return things;
}
// const doThingToEach = (x) => console.log('🎵 Oy oy oy');
const argv = await yargs(Bun.argv.slice(2)).
usage('Usage: $0 <command> [...flags] [...args]').
example(`${name} index.js`, 'uses the language model to improve it').
scriptName(name).
command('$0 <files...>', 'parses one to many files', (yargs) =>{
  yargs
    .positional('files', {
      describe: 'path to file that it will parse',
      type: 'string',
    
      array: true, 
      demandOption:true
    });
}, async (argv) => {
  // console.log(argv);
  if(Array.isArray(argv.files)){
    // console.log(argv?.files
    
    // if(argv?.o){
    //   console.log("WOWA");
    // }
    for(const file of argv.files){
      // if(typeof argv.m == 'string'){
      //   console.log("doing the thing");
      //   const modelThing: string = argv.m || "llama3-8b-8192";
      // }
      const m: string = typeof argv.m =='string' ? argv.m : langModel;
      const e: string = typeof argv.e =='string' ? argv.e : gorg;
      const k: string = typeof argv.k =='string' ? argv.k : groqAPIKEY;
      try{
        //idk why it needs all these guards when im telling it what the type of the things are
        //it thinks its unknown but
        if(typeof argv.l === 'string'){
          //a check to make sure it works

        
          if(typeof argv.o === 'string'){
         //a check but also it kind of checks if its exists or not cause otherwise it's unknown 
            if(typeof argv.a === 'boolean'){
              //checks if the a flag exists so then it appends to file instead of overriding
              //(things : string, lang : string,  model:string = langModel, apiKey:string =groqAPIKEY, urlThing:string =gorg) =>{
//read the file of thing
                appendFile(argv.o, await languageTranslation(file, argv.l, m, k,e), err =>{
                  if(err) throw err;
                })
            }
            else{
              await Bun.write(argv.o, await languageTranslation(file, argv.l, m, k,e));
            }
            //bun can't append to files even though they have this
         // console.log(await languageTranslation(file, argv.l));
          }
          else{
            //if they're not writing to file
            console.log(await languageTranslation(file, argv.l, m,k,e));
          }
        }
      }
      catch(err){
        console.error(`Failed to process file: ${file} \n`, err)
      }
      
    }
  }
})
.option('k',
  {
    alias: 'api-key',
    demandOption:requireAPIKey,
    default: groqAPIKEY,
    describe: "the apikey of the api endpoint your using",
    type: "string"
  }
)
.option('e',
  {
    alias: 'end-point',
    demandOption:false,
    default: gorg,
    describe: "api end point of the llm",
    type: "string"
  }
)

.option('m',
  {
    alias: 'model',
    demandOption:false,
    default: langModel,
    describe: "language model to use",
    type: "string"
  }
)
.option('l', {
  alias: 'language',
  demandOption:true,
  default: "bash",
  describe: "language to convert file to",
  type: "string"
}).
option('o', {
  alias: 'output',
  describe: "file to output to",
  type: "string"
}).
option('a', {
  alias: 'append',
  default: "false",
  describe: "whether it destructively writes to file or appends ot",
  type: "boolean"
}).
version('v', 'version showing', version).
help('h', "shows the commands").
alias('h', 'help').
alias('v', 'version').
parse();


//console.dir(argv);
  //console.log(x);

//Bun.argv
  //  main();