import process from "node:process";
import {
    Client,
    GatewayIntentBits,
    Events,
    GuildMember,
    Invite,
    Guild,
    Collection,
} from "discord.js";

const intents: Array<number> = [
    GatewayIntentBits.Guilds,
];

const client = new Client({ intents: intents });

// a map of guild ids and collections (maps) of invites
const invites: Map<string, Collection<string, Invite>> = new Map();

client.on(Events.ClientReady, (client: Client<true>) => {
    client.guilds.cache.forEach(async (guild: Guild) => {
        invites.set(guild.id, await guild.invites.fetch({cache: false}));
    });
});

client.on(Events.GuildMemberAdd, async (guildMember: GuildMember) => {
    const newInvites = await guildMember.guild.invites.fetch({ cache: false });
    const oldInvites = invites.get(guildMember.guild.id) || new Collection();

    // it looks like invites are only removed from the invite list if they're deleted.
    // we have a listener for deletions so this shouldn't ever show false positives
    const changes = oldInvites.filter(
        (invite, code) => invite.uses !== newInvites.get(code)?.uses
    );

    invites.set(guildMember.guild.id, newInvites);

    if (changes && changes.size) {
        // if for some reason there's more than one change
        const formatted = changes.map(invite => `Code: ${invite.code} / Created By: ${invite.inviter?.username} (${invite.inviter?.globalName} / ${invite.inviter?.id}) / Created At: ${invite.createdAt?.toISOString()} / Uses: ${invite.uses}`);

        console.log(
            `${guildMember.user.username} JOINED SERVER ${guildMember.guild.name} VIA INVITE: \n`,
            Array.from(formatted).join('\n')
            + '\n\n'
        );
    }
});

client.on(Events.InviteCreate, (invite: Invite) => {
    // guild won't be null for server invites, which is what we're dealing with,
    // but the ts definition allows it to be nullable
    if (! invite.guild) {
        return;
    }

    invites.get(invite.guild.id)?.set(invite.code, invite);
});

client.on(Events.InviteDelete, (invite: Invite) => {
    if (! invite.guild) {
        return;
    }

    invites.get(invite.guild.id)?.delete(invite.code);
});

client.login(process.env.BOT_TOKEN);
