### Rat helper

This is a litle command line buddy who'll help you figure out how to improve your code, a rat.
You give it the file(s) you're working on and a question on how to improve it and it'll tell you what it thinks.


# Arguments

Positionals:
  files  path to file that it will parse                                [string]

Options:
  -k, --api-key       the apikey of the api endpoint your using
  [string] [required] [default: "gsk_yHqWYawg7rWAFkdsbtBkWGdyb3FYTGEwCTjVKYsdxAi
                                                                     asLQUkRZH"]
  -e, --end-point     api end point of the llm
                            [string] [default: "https://api.groq.com/openai/v1"]
  -m, --model         language model to use [string] [default: "llama3-8b-8192"]
  -r, --rubber-ratty  What you want the ducky to explain     [string] [required]
  -o, --output        file to output to                                 [string]
  -a, --append        whether it destructively writes to file or appends ot
                                                    [boolean] [default: "false"]
  -v, --version       version showing                                  [boolean]
  -h, --help          shows the commands                               [boolean]

# Example


To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.26. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
