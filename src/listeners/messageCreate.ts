import { Listener } from '@sapphire/framework';
import { Events, Message } from 'discord.js';
import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { Time } from '@sapphire/time-utilities';
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const chatHistory: {
	[name: string]: {
		lastUpdated: number;
		session: ChatSession;
	};
} = {};
const model = ai.getGenerativeModel({
	model: 'gemini-1.5-flash',
	systemInstruction: fs.readFileSync('assets/knowledge.txt').toString(),
	generationConfig: {
		maxOutputTokens: 200
	}
});

export class ChatbotEvent extends Listener<Events.MessageCreate> {
	public override async run(message: Message) {
		if (message.author.bot) return;
		if (message.channelId !== process.env.CHATBOT_CHANNEL_ID) return;
		const history = chatHistory[message.author.id];
		let chat;
		if (!history)
			chat = model.startChat({
				history: [],
				generationConfig: {
					maxOutputTokens: 200
				}
			});
		else chat = history.session;
		const result = await chat.sendMessage(message.content).catch(() => {});
		if (!result) return;
		message.reply(result.response.text());
		if (history) history.session = chat;
		else
			chatHistory[message.author.id] = {
				lastUpdated: Date.now(),
				session: chat
			};
		setTimeout(() => {
			const h = chatHistory[message.author.id];
			if (history.lastUpdated !== h.lastUpdated) return;
			delete chatHistory[message.author.id];
		}, Time.Hour);
	}
}
