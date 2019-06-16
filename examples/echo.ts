// please check the spec for better "examples"

import CommandClient from '../src/index'
import EventEmitter from 'events'

const client = new CommandClient
const events = new EventEmitter;

client.defineCommand({
  id: "echo",
  description: "Echo what you say!",
  args: [{
    id: "sentence",
    description: "The sentence to echo",
    capture: true,
    required: true
  }],
  run([ sentence ]) {
    console.log(sentence)
    return {
      title: 'echo',
      description: sentence,
      color: 0x555555
    }
  }
})

client.addHandler({
  id: 'logger',
  event(resolve, cmd) {
    events.on('command', (command, args) => {
      if(command === cmd.id) {
        resolve(args)
      }
    })
  },
  send(data) {
    console.log('echo!', data)
  }
}) 

events.emit('command', 'echo', ['hello world!'])
