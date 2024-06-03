import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { db, tags } from '../lib/drizzle.js';
import { eq } from 'drizzle-orm/sql';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
	typing: true
})
export class TagCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const tagName = await args.pick('string').catch(() => {});
		const user = await args.pick('user').catch(() => {});
		const reference = await message.fetchReference().catch(() => {});
		if (!tagName) return message.reply('Specify a tag name! See all tags with `-tags` command.');
		const tag = (
			await db
				.select()
				.from(tags)
				.where(eq(tags.name, tagName))
				.catch(() => {})
		)?.[0];
		if (!tag) return message.reply('Tag not found! See all tags with `-tags` command.');
		if (reference) {
			await message.delete();
			return reference.reply(tag.response || 'Empty response received from tag');
		}
		return message.reply(tag.response ? `${user ? `${user}, ` : ''}${tag.response}` : 'Empty response received from tag');
	}
}
