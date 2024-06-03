import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Submit new tags to be reviewed and accepted.'
})
export class SubmitTagCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((command) =>
			command
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((string) =>
					string //
						.setName('name')
						.setDescription('The name of the tag')
						.setRequired(true)
				)
		);
	}
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const name = interaction.options.getString('name', true);
		const modal = new ModalBuilder()
			.setCustomId('submit-tag')
			.setTitle('Submit Tag')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().setComponents(
					new TextInputBuilder()
						.setLabel('Content')
						.setPlaceholder('Content of the tag goes here')
						.setRequired(true)
						.setStyle(TextInputStyle.Paragraph)
						.setCustomId('content')
				)
			);
		await interaction.showModal(modal);
		const i = await interaction.awaitModalSubmit({ time: Time.Minute * 10 }).catch(() => {});
		if (!i) return;
		await i.deferReply({ ephemeral: true });
		const content = i.fields.getTextInputValue('content');
		const channel = this.container.client.channels.cache.get(process.env.TAG_SUBMISSIONS_CHANNEL_ID!);
		if (!channel || !content) return;
		if (!channel.isTextBased()) return;
		await channel.send({
			embeds: [
				new EmbedBuilder().setTitle(`New Tag Request`).addFields({
					name,
					value: content
				})
			]
		});
		await i.editReply('Submitted tag request!');
	}
}
