interface ICamdoFormat {
  name?: string
  title?: string
  description?: string
  image?: string
  color?: number
  format?: "default" | "large_image"
}

interface ICamdoCommand {
  id: string
  name?: string
  description?: string
  examples?: string[]
  args: ICamdoArgument[]

  run(args): ICamdoFormat
}

interface ICamdoArgument {
  id: string
  name?: string
  description?: string
  type?: string
  default_value?
  capture?: boolean
  fail_message?: string
  required?: boolean
}

interface ICamdoType {
  id: string
  display?: string
  validate?: <T>(arg: T) => boolean 
}

interface ICommandList {
  [key: string]: ICamdoCommand
}

interface ITypeList {
  [key: string]: ICamdoType
}

export class CommandClient {
  commands: ICommandList
  types: ITypeList

  constructor() {
    this.commands = {};
    this.types = {
      any: {
        id: "any",
        display: "anything",
        validate: val => true
      }
    };
  }

  defineType(opts: ICamdoType) {
    const defaults = {
      display: undefined,
      validate: val => true
    }
    this.types[opts.id] = {...defaults, ...opts};
  }

  defineArg(arg: ICamdoArgument): ICamdoArgument {
    const defaults = {
      name: arg.id,
      desc: arg.id,
      type: "any",
      capture: false,
      required: true
    }
    
    return {...defaults, ...arg}
  }
  
  async defineCommand(cmd: ICamdoCommand) {
    const defaults = {
      examples: ['none'],
      name: cmd.id,
      desc: cmd.id,
    }
    cmd = {...defaults, ...cmd}
    this.commands[cmd.id] = cmd

    // define_template
    // setSendTemplate(args)
    this.definitionTemplate(cmd, async (params) => {
      
      let input_args = params
      let validated = cmd.args.every((arg, i) => {
        arg = this.defineArg(arg)
        
        let input_arg = input_args[arg.id] || arg.default_value
        if(arg.capture) {
          input_arg = input_args.slice(i)
        }

        input_args[arg.id] = input_arg
        
        let v = this.types[arg.type].validate(input_arg)
        
        if (!v) {
          this.failedMessage(arg, input_arg)
        }

        return v;
      });

      if (validated) {
        const data = await cmd.run(input_args)
        return this.responseTemplate(data)
      }
    })
  }
  
  failedMessage(arg, failed_arg) {
    this.send({
      name: "ERROR",
      title: `Expected type "${arg.type}" at argument "${arg.id}" not "${failed_arg}"`,
      description: arg.fail_message || `Please use the help command to see what "${arg.id}" accepts.`,
      color: 0xdd3344
    })
  }
  
  send(data){
    console.log(data)
  }

  definitionTemplate(cmd, cb = (args) => args) {}
  responseTemplate(data) {
    return this.send(data)
  }
}