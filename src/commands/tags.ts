import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Time } from '@sapphire/time-utilities';
import { EmbedBuilder, Message, PermissionFlagsBits } from 'discord.js';
import { db, tags } from '../lib/drizzle.js';
import { eq } from 'drizzle-orm/sql';

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
		const response = await message.channel.awaitMessages({ max: 1, time: Time.Minute * 5 }).catch(() => {});
		if (!response) return;
		const content = response.first()?.content;
		if (!content) return;
		await db.insert(tags).values({
			name,
			response: content,
			trigger
		});
		return await message.reply('Created tag!');
	}
	public async messageTagsList(message: Message) {
		const tagsList = await db.select().from(tags);
		const length = tagsList.length.toString().length;
		return await message.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Tags')
					.setDescription(
						tagsList.map((v, i) => `\`#${i.toString().padStart(length, '0')}\` | \`${v.name}\``).join('\n') || 'No tags found'
					)
			]
		});
	}
	public async messageTagsDelete(message: Message, args: Args) {
		const name = args.getOption('name', 'n');
		if (!name) return message.reply('Specify the name option.');
		await db.delete(tags).where(eq(tags.name, name));
		return message.reply(`Deleted tag **${name}**`);
	}
}
