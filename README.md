# Rat helper

This is a litle command line buddy who'll help you figure out how to improve your code, a rat.
You give it the file(s) you're working on and a question on how to improve it and it'll tell you what it thinks.

rat-assistant <command> [...flags] 


[](output.gif)
### Arguments

Positionals:
  files  path to file that it will parse                                [string]

Options:
  -k, --api-key       the apikey of the api endpoint your using
  [string] [required] [default: "-----"]
                                                                     
  -e, --end-point     api end point of the llm
                            [string] [default: "https://api.groq.com/openai/v1"]
                            
  -m, --model         language model to use [string] [default: "llama3-8b-8192"]
  
  -r, --rubber-ratty  What you want the ducky to explain     [string] [required]
  
  -o, --output        file to output to                                 [string]
  
  -a, --append        whether it destructively writes to file or appends ot
                                                    [boolean] [default: "false"]
                                                    
  -v, --version       version showing                                  [boolean]
  
  -h, --help          shows the commands                               [boolean]

# Installation
## Installing Bun
You can refer to their website [Bun](https://bun.sh/docs/installation) for specifics and more up to date on how to install Bun.

Npm: npm install -g bun

Curl: curl -fsSL https://bun.sh/install | bash 

Powershell/CMD: powershell -c "irm bun.sh/install.ps1|iex"

## Installing the rat-assistant

Once you've installed Bun and have cloned this repository. 

You can run: **bun run setup** 

This will install the packages and create a link so that you may run it specifying the exact folder.


This project was created using `bun init` in bun v1.1.26. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
