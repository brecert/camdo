client.addHandler({
    name: 'discord',
    event: ({ resolve, reject }, cmdName) => {
        client.on('message', msg => {
            if(cmdName === msg.content) {
                // resolve args that are taken from splitting msg, also resolve anything else you need as extra args
                // resolve(args, msg)
            }
        }
    },
    send: (data, msg) => {
        msg.reply(data.join("\n"))
    }
})
