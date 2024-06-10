import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const deleteButton = (deletable: string[], ...originalMessageIds: string[]) =>
	new ButtonBuilder()
		.setCustomId(`delete;${deletable.join('-')};${originalMessageIds.join('-')}`)
		.setLabel(`Delete`)
		.setEmoji('🗑️')
		.setStyle(ButtonStyle.Danger);
export const deleteButtonRow = (deletable: string[], ...originalMessageIds: string[]) =>
	new ActionRowBuilder<ButtonBuilder>().setComponents(deleteButton(deletable, ...originalMessageIds));
