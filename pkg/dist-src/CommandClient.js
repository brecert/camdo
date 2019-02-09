export class CommandClient {
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

  defineType(opts) {
    const defaults = {
      display: undefined,
      validate: val => true
    };
    this.types[opts.id] = { ...defaults,
      ...opts
    };
  }

  defineArg(arg) {
    const defaults = {
      name: arg.id,
      desc: arg.id,
      type: "any",
      capture: false,
      required: true
    };
    return { ...defaults,
      ...arg
    };
  }

  async defineCommand(cmd) {
    const defaults = {
      examples: ['none'],
      name: cmd.id,
      desc: cmd.id
    };
    cmd = { ...defaults,
      ...cmd
    };
    this.commands[cmd.id] = cmd; // define_template
    // setSendTemplate(args)

    this.definitionTemplate(cmd, async params => {
      let input_args = params;
      let validated = cmd.args.every((arg, i, arr) => {
        arg = this.defineArg(arg);
        let input_arg = input_args[arg.id] || arg.default_value;

        if (arg.capture) {
          input_arg = arr.slice(i);
        }

        input_args[arg.id] = input_arg;
        let v = this.types[arg.type].validate(input_arg);

        if (!v) {
          this.failedMessage(arg, input_arg);
        }

        return v;
      });

      if (validated) {
        const data = await cmd.run(input_args);
        this.responseTemplate(data);
      }
    });
  }

  failedMessage(arg, failed_arg) {
    this.send({
      name: "ERROR",
      title: `Expected type "${arg.type}" at argument "${arg.id}" not "${failed_arg}"`,
      description: arg.fail_message || `Please use the help command to see what "${arg.id}" accepts.`,
      color: 0xdd3344
    });
  }

  send(data) {
    console.log(data);
  }

  definitionTemplate(cmd, cb = args => args) {}

  responseTemplate(data) {
    this.send(data);
  }

}