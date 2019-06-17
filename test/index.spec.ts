import CommandClient, { ICamdoFormat } from '../src/index'

import { expect } from 'chai'

import Sylvent from 'sylvent'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


describe('CommandClient', function() {
	let client = new CommandClient()

	it('should be created', function() {
		expect(client).to.exist
	})

	describe('#defineType', function() {
		client.defineType({
			id: 'small_size',
			validate: (arg) => arg.length < 5
		})

		it('should be defined', function() {
			expect(client.types.has('small_size')).to.be.true
		})
		
		it('should validate correctly', function() {
			expect(client.types.get('small_size')!.validate('hi')).to.be.true
			expect(client.types.get('small_size')!.validate('too_long')).to.be.false
		})
	})

	describe('#defineCommand', function() {
		it('should define a command', function() {
			client.defineCommand({
			  id: "echo",
			  description: "Echo what you say!",
			  args: [{
			    id: "sentence",
			    type: 'small_size',
			    description: "The sentence to echo",
			    capture: true,
			    required: true
			  }],
			  run([sentence]: [string]) {
			    return {
			      title: 'echo',
			      description: sentence,
			      color: 0x555555
			    }
			  }
			})

			expect(client.commands.has('echo')).to.be.true
		})

		it('should define a async command', function() {
			client.defineCommand({
			  id: "async-echo",
			  description: "Echo what you say... Asynchronously!",
			  args: [{
			    id: "sentence",
			    type: 'small_size',
			    description: "The sentence to echo",
			    capture: true,
			    required: true
			  }],
			  async run([sentence]: [string]) {

			  	await sleep(10)

			    return {
			      title: 'echo',
			      description: sentence,
			      color: 0x555555
			    }
			  }
			})

			expect(client.commands.has('async-echo')).to.be.true
		})
	})

	var events = new Sylvent

	describe('#addHandler', function() {
		it('should add a handler', function() {
			client.addHandler({
				id: 'test',
				event: (resolve, cmd) => {
					events.on('message', (msg: any) => {
						let [cmdName, ...args]: string[] = msg.split(' ')
						if(cmdName === cmd.name) {
							resolve(args)
						}
					})
				},
				send: (data) => {
					events.emit('response', data)
				}
			})
		})
	})

	describe('complete', function() {
		it('should respond correctly', function(done) {
			events.on('response', (res: any) => {
				expect(res.description).to.eq('hi!')
				done()
				events.removeListener('response')
			})

			events.emit('message', 'echo hi!')
		})

		it('should validate correctly', function(done) {
			events.on('response', (res: any) => {
				expect(res.description).to.eq('argument "sentence" does not accept `too_long!`.')
				done()
				events.removeListener('response')
			})

			events.emit('message', 'echo too_long!')
		})

		it('should respond correctly asyncronously', function(done) {
			events.on('response', (res: any) => {
				expect(res.description).to.eq('tiny')	
				done()
				events.removeListener('response')
			})

			events.emit('message', 'async-echo tiny')
		})
	})
})