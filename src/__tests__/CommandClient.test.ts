import { CommandClient } from '../index'

 declare const test
 declare const expect

var runCommand

test('Command Client', () => {
  expect(CommandClient).toBeDefined()

  const client = new CommandClient()

  client.send = (data) => {
    return data
  }

  client.definitionTemplate = (cmd, cb) => {
    runCommand = (command, args) => {
      if(cmd.id === command) {
        cb(args)
      }
    }
  }

  client.defineCommand({
    id: "echo",
    description: "Echo what you say!",
    examples: ['echo hello world!'],
    args: [{
      id: "sentence",
      description: "The sentence to echo",
      capture: true,
      required: true
    }],
    run({ sentence }) { 
      return {
        title: 'echo',
        description: sentence.join(' '),
        color: 0x555555
      }
    }
  })

  expect(runCommand('echo', ['hello', 'world'])).toEq('hello world')
})

