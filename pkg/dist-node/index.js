'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

class CommandClient {
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
    this.types[opts.id] = _objectSpread({}, defaults, opts);
  }

  defineArg(arg) {
    const defaults = {
      name: arg.id,
      desc: arg.id,
      type: "any",
      capture: false,
      required: true
    };
    return _objectSpread({}, defaults, arg);
  }

  defineCommand(cmd) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const defaults = {
        examples: ['none'],
        name: cmd.id,
        desc: cmd.id
      };
      cmd = _objectSpread({}, defaults, cmd);
      _this.commands[cmd.id] = cmd; // define_template
      // setSendTemplate(args)

      _this.definitionTemplate(cmd,
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (params) {
          let input_args = params;
          let validated = cmd.args.every((arg, i, arr) => {
            arg = _this.defineArg(arg);
            let input_arg = input_args[arg.id] || arg.default_value;

            if (arg.capture) {
              input_arg = arr.slice(i);
            }

            input_args[arg.id] = input_arg;

            let v = _this.types[arg.type].validate(input_arg);

            if (!v) {
              _this.failedMessage(arg, input_arg);
            }

            return v;
          });

          if (validated) {
            const data = yield cmd.run(input_args);

            _this.responseTemplate(data);
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    })();
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

exports.CommandClient = CommandClient;
