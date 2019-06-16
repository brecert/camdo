# Camdo

> A knockoff to the Commando client and made for general use

Camdo can be used by

1. creating a client
    ```js
    const client = new CommandClient();
    ```
2. adding a handler 
    ```js
    client.definitionTemplate = (cmd, cb) => {
      runCommand = (command, args) => {
        if(command === cmd.id) {
          cb(args)
        }
      }
    }
    ```
3. setting how the data is sent
    ```js
    client.send = (data) => {
      console.log(data)
    }
    ```    
4. defining commands
    ```js
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
    ```
5. now when `runCommand` is run it will echo the args
    ```js
    runCommand('echo', ['hello', 'world'])
    ```