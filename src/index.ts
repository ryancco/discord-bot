import {
    Client,
    GatewayIntentBits,
    Events,
    GuildMember,
    Invite,
    Guild, Collection,
} from "discord.js";

// https://discordjs.guide/popular-topics/intents
const intents: Array<number> = [
    GatewayIntentBits.Guilds,
];

const client = new Client({ intents: intents });

client.on(Events.ClientReady, (client: Client<true>) => {
    client.guilds.cache.forEach(async (guild: Guild) => {
        const invites = await guild.invites.fetch({ cache: false });
        const formatted = invites.map((invite: Invite) => `Code: ${invite.code} / Uses: ${invite.uses} / User: ${invite.inviter?.username} (${invite.inviter?.globalName} / ${invite.inviter?.id}) / Created: ${invite.createdAt?.toISOString()}`);

        console.log(
            'INVITE LIST FOR SERVER: '
            + guild.name
            + '\n'
            + Array.from(formatted).join('\n')
        );
    });
});


client.on(Events.GuildMemberAdd, async (guildMember: GuildMember) => {
    const invites = await guildMember.guild.invites.fetch({ cache: false });
    const formatted = invites.map((invite: Invite) => `Code: ${invite.code} / Uses: ${invite.uses} / User: ${invite.inviter?.username} (${invite.inviter?.globalName} / ${invite.inviter?.id}) / Created: ${invite.createdAt?.toISOString()}`);

    console.log(
        'NEW JOIN FOR SERVER: '
        + guildMember.guild.name
        + ` (${guildMember.user.username})`
        + '\n',
        Array.from(formatted).join('\n\n')
    );
});

client.login(process.env.BOT_TOKEN);