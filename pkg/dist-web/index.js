function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

class CommandClient {
  constructor() {
    this.commands = new Map();
    this.types = new Map();
    this.handlers = new Map();
    this.types.set('any', {
      id: 'any',
      display: 'anything',
      validate: val => true
    });
  }

  defineType(opts) {
    const defaults = {
      id: opts.id,
      display: opts.id,
      validate: val => true
    };
    this.types.set(opts.id, _objectSpread({}, defaults, opts));
  }

  defineArg(arg) {
    const defaults = {
      id: arg.id,
      name: arg.id,
      description: arg.id,
      type: "any",
      capture: false,
      required: true
    };
    return _objectSpread({}, defaults, arg);
  }

  defineCommand(cmd) {
    const defaults = _objectSpread({}, cmd, {
      name: cmd.name || cmd.id,
      description: cmd.description || cmd.name || cmd.id,
      args: (cmd.args || []).map(this.defineArg)
    });

    this.commands.set(defaults.id, defaults);
  }

  validateArgs(args, cmd, handler) {
    return cmd.args.every((cmdArg, i) => {
      let arg = args[i] || cmdArg.default_value;

      if (!this.types.has(cmdArg.type)) {
        throw "".concat(cmdArg.type, " on ").concat(cmdArg.id, " is not currently registered");
      }

      let validated = this.types.get(cmdArg.type).validate(arg);

      if (!validated && cmdArg.required) {
        handler.send(this.failedMessage(cmdArg, arg));
      }

      return validated;
    });
  }

  addHandler(params) {
    var _this = this;

    this.handlers.set(params.id, params);
    let handler = this.handlers.get(params.id);
    this.commands.forEach(cmd => {
      handler.event(function (args) {
        if (_this.validateArgs(args, cmd, handler)) {
          let retArgs = cmd.args.map((cmdArg, i) => {
            let arg = args[i] || cmdArg.default_value;
            if (cmdArg.capture) return arg;
          });
          const data = cmd.run(retArgs);
          handler.send(data);
        }
      }, cmd);
    });
  }

  failedMessage(cmdArg, failedArg) {
    return {
      name: "ERROR",
      title: "Expected type \"".concat(cmdArg.type, "\" at argument \"").concat(cmdArg.id, "\" not \"").concat(failedArg, "\""),
      description: cmdArg.fail_message || "argument \"".concat(cmdArg.id, "\" does not accept `").concat(failedArg, "`."),
      color: 0xdd3344
    };
  }

}

export default CommandClient;
