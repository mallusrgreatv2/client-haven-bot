import "./lib/setup.js";

import { LogLevel, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { env } from "process";
import fs from "node:fs";
const intents = [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent];
if (env.TLAUNCHER_CHECK_ENABLED === "true") intents.push(GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences);
const client = new SapphireClient({
	defaultPrefix: "-",
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	intents,
	loadMessageCommandListeners: true,
	allowedMentions: {
		roles: [],
		users: [],
		repliedUser: true
	}
});

const main = async () => {
	try {
		client.logger.info("Logging in");
		await client.login();
		client.logger.info("logged in");
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
export const isDev = env.NODE_ENV === "development";

const errorCode = (err: any) => {
	try {
		const files = fs
			.readdirSync("/")
			.filter((v) => /error.[0-9]+\.txt/.test(v))
			.sort((a, b) => a.localeCompare(b))
			.at(-1);
		const lastNum = files ? +!files.match(/error.([0-9]+)\.txt/)?.[1] : 0;
		fs.writeFileSync(`error.${lastNum + 1}.txt`, `${err}${err instanceof Error ? `\n\n${err.stack}` : ""}`);
	} catch (fsError) {
		console.error("Failed to write error log:", fsError);
	}
	process.exit(1);
};
process.on("uncaughtException", errorCode);
process.on("unhandledRejection", errorCode);
