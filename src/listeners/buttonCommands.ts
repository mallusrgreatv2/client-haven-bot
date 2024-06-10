import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { Interaction } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.InteractionCreate
})
export class ButtonCommandsListener extends Listener<typeof Events.InteractionCreate> {
	public override async run(interaction: Interaction) {
		if (!interaction.isButton()) return;
		const args = interaction.customId.split(';');
		const cmd = args.shift();
		switch (cmd) {
			case 'delete': {
				const authorizedUserIds = args[0].split('-');
				if (!authorizedUserIds.includes(interaction.user.id))
					return interaction.reply({ ephemeral: true, content: 'You cannot use this button.' });
				await interaction.deferReply({
					ephemeral: true
				});
				const messageIds = args[1].split('-');
				messageIds.push(interaction.message.id);
				await Promise.all(messageIds.map((id) => interaction.channel?.messages.delete(id).catch(() => null)));
				return interaction.editReply('Deleted all messages related to this tag usage!');
			}
		}
		return;
	}
}
