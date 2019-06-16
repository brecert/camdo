import CommandClient, { ICamdoFormat } from '../src/index'

import { expect } from 'chai'

import Sylvent from 'sylvent'

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
		  run(sentence) {
		    return {
		      title: 'echo',
		      description: sentence.join(' '),
		      color: 0x555555
		    }
		  }
		})

		it('should be defined', function() {
			expect(client.commands.has('echo')).to.be.true
		})
	})

	var events = new Sylvent
	var responses: ICamdoFormat[] = []

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
					responses.push(data)
				}
			})
		})
	})

	describe('complete', function() {
		it('should respond correctly', function() {
			events.emit('message', 'echo hi!')
			expect(responses.shift()!.description).to.eq('hi!')
		})

		it('should validate correctly', function() {
			events.emit('message', 'echo too_long!')
			expect(responses.shift()!.description).to.eq('argument "sentence" does not accept `too_long!`.')
		})
	})
})