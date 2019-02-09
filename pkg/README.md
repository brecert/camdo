# Camdo

> A knockoff to the Commando client and made for general use

To use Camdo you need to

1. Create a client
```
const client = new CommandClient();
```

2. define commands
```
client.defineCommand({
  id: "echo",
  description: "Echo what you say!",
  examples: ['echo hello world!'],
  args: [{
    id: "sentence",
    desc: "The sentence to echo",
    capture: true, // similar to ...args in js
    required: true
  }],
  run(args) { 
    return {
      title: 'echo',
      description: args.join(' '),
      color: 0x555555
    }
  }
});
```