'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

// todo(brecert): document and commentate code
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
    this.types.set(opts.id, _objectSpread2({}, defaults, {}, opts));
  }

  defineArg(arg) {
    const defaults = {
      id: arg.id,
      name: arg.id,
      description: arg.id,
      type: "any",
      capture: true,
      required: true
    };
    return _objectSpread2({}, defaults, {}, arg);
  }

  defineCommand(cmd) {
    const defaults = _objectSpread2({}, cmd, {
      name: cmd.name || cmd.id,
      description: cmd.description || cmd.name || cmd.id,
      args: (cmd.args || []).map(this.defineArg)
    });

    this.commands.set(defaults.id, defaults);
  }

  validateArgs(args, cmd, handler) {
    let data = {};
    return {
      validated: cmd.args.every((cmdArg, i) => {
        let arg = args[i] || cmdArg.default_value;

        if (!this.types.has(cmdArg.type)) {
          throw `${cmdArg.type} on ${cmdArg.id} is not currently registered`;
        } // if not required and undefined then skip validation


        if (!cmdArg.required && arg === undefined) {
          return true;
        }

        let validated = this.types.get(cmdArg.type).validate(arg);
        data = {
          cmdArg,
          failedArg: arg
        };
        return validated;
      }),
      data
    };
  }

  async addHandler(params) {
    this.handlers.set(params.id, params);
    let handler = this.handlers.get(params.id);
    this.commands.forEach(cmd => {
      handler.event(async (args, ...passedData) => {
        try {
          let validated = this.validateArgs(args, cmd, handler);

          if (validated.validated) {
            let retArgs = cmd.args.filter(cmdArg => cmdArg.capture).map((cmdArg, i) => {
              let arg = args[i] || cmdArg.default_value;
              return arg;
            });
            const data = await cmd.run(retArgs);
            handler.send(data, ...passedData);
          } else {
            handler.send(this.failedMessage(validated.data.cmdArg, validated.data.failedArg), ...passedData);
          }
        } catch (err) {
          console.error(err);
        }
      }, cmd);
    });
  }

  failedMessage(cmdArg, failedArg) {
    return {
      name: "ERROR",
      title: `Expected type "${cmdArg.type}" at argument "${cmdArg.id}" not "${failedArg}"`,
      description: cmdArg.fail_message || `argument "${cmdArg.id}" does not accept \`${failedArg}\`.`,
      color: 0xdd3344
    };
  }

}

exports.default = CommandClient;
//# sourceMappingURL=index.js.map
