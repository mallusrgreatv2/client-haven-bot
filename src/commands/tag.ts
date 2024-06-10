import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { db, tags } from '../lib/drizzle.js';
import { eq, or } from 'drizzle-orm/sql';
import { ApplyOptions } from '@sapphire/decorators';
import { deleteButtonRow } from '../lib/buttons.js';

@ApplyOptions<Command.Options>({
	typing: true
})
export class TagCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const tagName = await args.pick('string').catch(() => {});
		const user = await args.pick('user').catch(() => {});
		const reference = await message.fetchReference().catch(() => {});
		if (!tagName)
			return message.reply({
				content: 'Specify a tag name! See all tags with `-tags` command.',
				components: [deleteButtonRow([message.author.id], message.id)]
			});
		const tag = (
			await db
				.select()
				.from(tags)
				.where(or(eq(tags.name, tagName), eq(tags.id, Number(tagName))))
				.catch(() => {})
		)?.[0];
		if (!tag)
			return message.reply({
				content: 'Tag not found! See all tags with `-tags` command.',
				components: [deleteButtonRow([message.author.id], message.id)]
			});
		if (reference) {
			await message.delete();
			return reference.reply({
				content: tag.response ? `*Suggested by ${message.author}*\n\n${tag.response}` : 'Empty response received from tag',
				components: [deleteButtonRow([message.author.id, reference.author.id])]
			});
		}
		return message.reply({
			content: tag.response ? `${user ? `${user}, ` : ''}${tag.response}` : 'Empty response received from tag',
			components: [deleteButtonRow([message.author.id], message.id)]
		});
	}
}
