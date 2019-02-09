import { CommandClient } from '../src/index'

var runCommand

const client = new CommandClient()

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

client.send = (data) => {
  console.log('echo!', data)
}

runCommand('echo', ['hello', 'world'])
