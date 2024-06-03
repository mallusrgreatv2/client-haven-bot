import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'ping pong'
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		return await message.reply(`Pong! ${this.container.client.ws.ping}`);
	}
}
