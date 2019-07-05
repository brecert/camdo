function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

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
    this.types.set(opts.id, _objectSpread({}, defaults, opts));
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
    let data = {};
    return {
      validated: cmd.args.every((cmdArg, i) => {
        let arg = args[i] || cmdArg.default_value;

        if (!this.types.has(cmdArg.type)) {
          throw "".concat(cmdArg.type, " on ").concat(cmdArg.id, " is not currently registered");
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

  addHandler(params) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.handlers.set(params.id, params);

      let handler = _this.handlers.get(params.id);

      _this.commands.forEach(cmd => {
        handler.event(
        /*#__PURE__*/
        function () {
          var _ref = _asyncToGenerator(function* (args) {
            try {
              let validated = _this.validateArgs(args, cmd, handler);

              for (var _len = arguments.length, passedData = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                passedData[_key - 1] = arguments[_key];
              }

              if (validated.validated) {
                let retArgs = cmd.args.filter(cmdArg => cmdArg.capture).map((cmdArg, i) => {
                  let arg = args[i] || cmdArg.default_value;
                  return arg;
                });
                const data = yield cmd.run(retArgs);
                handler.send(data, ...passedData);
              } else {
                handler.send(_this.failedMessage(validated.data.cmdArg, validated.data.failedArg), ...passedData);
              }
            } catch (err) {
              console.error(err);
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }(), cmd);
      });
    })();
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
