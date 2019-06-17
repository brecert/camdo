export interface ICamdoFormat {
  name?: string
  title?: string
  description?: string
  image?: string
  color?: number
  format?: "default" | "large_image" | string
}

export interface ICamdoCommandParams {
  id: string
  name?: string
  description?: string
  args: ICamdoArgumentParams[]

  run(args: any): ICamdoFormat | Promise<ICamdoFormat>
}

export interface ICamdoCommand {
  id: string
  name: string
  description: string
  args: ICamdoArgument[]

  run(args: any): ICamdoFormat | Promise<ICamdoFormat>
}

export interface ICamdoArgumentParams {
  id: string
  name?: string
  description?: string
  type?: string
  default_value?: any
  capture?: boolean
  fail_message?: string
  required?: boolean
}

export interface ICamdoArgument {
  id: string
  name: string
  description: string
  type: string
  default_value?: any
  capture: boolean
  fail_message?: string
  required: boolean
}


export interface ICamdoHandler{
  id: string
  event: (resolve: (args: string[], ...passedData: any[]) => void | any, cmd: ICamdoCommand) => void | any
  send: (data: ICamdoFormat, ...passedData: any[]) => void | any
}

export interface ICamdoType {
  id: string
  display: string
  validate: (arg: string) => boolean 
}

export interface ICamdoTypeParams {
  id: string
  display?: string
  validate?: (arg: string) => boolean 
}

export interface IValidateResult {
  validated: boolean
  data: {
    cmdArg: ICamdoArgument,
    failedArg: string
  }
}

export default class CommandClient {
  commands: Map<string, ICamdoCommand> = new Map
  types: Map<string, ICamdoType> = new Map
  handlers: Map<string, ICamdoHandler> = new Map

  constructor() {
    this.types.set('any', {
      id: 'any',
      display: 'anything',
      validate: val => true
    })
  }

  defineType(opts: ICamdoTypeParams) {
    const defaults: ICamdoType = {
      id: opts.id,
      display: opts.id,
      validate: (val: any) => true
    }

    this.types.set(opts.id, {...defaults, ...opts})
  }

  defineArg(arg: ICamdoArgumentParams): ICamdoArgument {
    const defaults: ICamdoArgument = {
      id: arg.id,
      name: arg.id,
      description: arg.id,
      type: "any",
      capture: false,
      required: true
    }

    return {...defaults, ...arg}
  }
  
  defineCommand(cmd: ICamdoCommandParams) {
    const defaults: ICamdoCommand = {
      ...cmd,
      name: cmd.name || cmd.id,
      description: cmd.description || cmd.name || cmd.id,
      args: (cmd.args || []).map(this.defineArg)
    }
    this.commands.set(defaults.id, defaults)
  }

  validateArgs(args: string[], cmd: ICamdoCommand, handler: ICamdoHandler): IValidateResult {
    let data: any = {}
    return {
      validated: cmd.args.every((cmdArg, i) => {
        let arg = args[i] || cmdArg.default_value

        if(!this.types.has(cmdArg.type)) {
          throw `${cmdArg.type} on ${cmdArg.id} is not currently registered`
        }

        let validated = this.types.get(cmdArg.type)!.validate(arg)

        // if(!validated && cmdArg.required) {
        //   handler.send(this.failedMessage(cmdArg, arg))
        // }

        data = { cmdArg, failedArg: arg }

        return validated
      }),
      data
    }
  }


  async addHandler(params: ICamdoHandler) {
    this.handlers.set(params.id, params)
    let handler = this.handlers.get(params.id)!

    this.commands.forEach((cmd) => {
      handler.event(async (args, ...passedData) => {
        
        try {
          let validated = this.validateArgs(args, cmd, handler)

          if (validated.validated) {
            let retArgs = cmd.args.map((cmdArg, i) => { 
              let arg = args[i] || cmdArg.default_value
              if (cmdArg.capture) return arg
            })

            const data = await cmd.run(retArgs)
            handler.send(data, ...passedData)
          } else {
            handler.send(this.failedMessage(validated.data.cmdArg, validated.data.failedArg), ...passedData)
          }
        } catch(err) {
          console.error(err)
        }
      }, cmd)
    })
  }
  
  failedMessage(cmdArg: ICamdoArgument, failedArg: string) {
    return {
      name: "ERROR",
      title: `Expected type "${cmdArg.type}" at argument "${cmdArg.id}" not "${failedArg}"`,
      description: cmdArg.fail_message || `argument "${cmdArg.id}" does not accept \`${failedArg}\`.`,
      color: 0xdd3344
    }
  }
}