import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Time } from '@sapphire/time-utilities';
import { EmbedBuilder, Message, PermissionFlagsBits } from 'discord.js';
import { db, tags } from '../lib/drizzle.js';
import { eq } from 'drizzle-orm/sql';
import { deleteButtonRow } from '../lib/buttons.js';

@ApplyOptions<Subcommand.Options>({
	subcommands: [
		{
			name: 'create',
			messageRun: 'messageTagsCreate',
			requiredUserPermissions: [PermissionFlagsBits.ManageGuild]
		},
		{
			name: 'list',
			messageRun: 'messageTagsList',
			default: true,
			requiredUserPermissions: []
		},
		{
			name: 'delete',
			messageRun: 'messageTagsDelete',
			requiredUserPermissions: [PermissionFlagsBits.ManageGuild]
		}
	],
	typing: true,
	options: ['name', 'n', 'trigger']
})
export class TagCommand extends Subcommand {
	public async messageTagsCreate(message: Message, args: Args) {
		const name = args.getOption('name', 'n');
		const trigger = args.getOption('trigger');
		if (!name) return message.reply('Specify the name option.');
		await message.reply('Send the response in the next message.');
		const response = await message.channel
			.awaitMessages({ max: 1, time: Time.Minute * 5, filter: (m) => m.author.id === message.author.id })
			.then((v) => v.first())
			.catch(() => {});
		if (!response) return;
		if (response?.content.toLowerCase() === 'cancel')
			return response.reply({
				content: 'Cancelled tag creation.',
				components: [deleteButtonRow([message.author.id], message.id)]
			});
		if (!response?.content) return;
		await db.insert(tags).values({
			name,
			response: response.content,
			trigger
		});
		return await message.reply({
			content: 'Created tag!',
			components: [deleteButtonRow([message.author.id], message.id, response.id)]
		});
	}
	public async messageTagsList(message: Message) {
		const tagsList = await db.select().from(tags);
		const length = tagsList.length.toString().length;
		return await message.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Tags')
					.setDescription(
						`**How to use tags?** \`-tag <id or name>\`\n\n${tagsList.map((v, i) => `\`#${(i + 1).toString().padStart(length, '0')}\` | \`${v.name}\` / \`${v.id}\``).join('\n') || 'No tags found'}`
					)
			],
			components: [deleteButtonRow([message.author.id], message.id)]
		});
	}
	public async messageTagsDelete(message: Message, args: Args) {
		const name = args.getOption('name', 'n');
		if (!name)
			return message.reply({
				content: 'Specify the name option.',
				components: [deleteButtonRow([message.author.id], message.id)]
			});
		await db.delete(tags).where(eq(tags.name, name));
		return message.reply({
			content: `Deleted tag **${name}**`,
			components: [deleteButtonRow([message.author.id], message.id)]
		});
	}
}
