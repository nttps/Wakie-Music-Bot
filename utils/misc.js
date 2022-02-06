const { PREFIX } = require(`@settings/config`)
const chalk = require('chalk')
const { Permissions } = require(`discord.js`)

module.exports = {
    databasing: (client, guildid, userid) => {
        if (!client || client == undefined || !client.user || client.user == undefined) return
        try {
            if (userid) {
                client.playlists.ensure(userid, {
                    TEMPLATEQUEUEINFORMATION: ['queue', 'sadasd']
                })
            }
            if (guildid) {
                client.musicsettings.ensure(guildid, {
                    channel: '',
                    message: '',
                    commandChannel: ''
                })
                client.stats.ensure(guildid, {
                    commands: 0,
                    songs: 0
                })
                client.settings.ensure(guildid, {
                    prefix: PREFIX,
                    language: 'th',
                    pruning: true,
                    unkowncmdmessage: false,
                    autoresume: true,

                    defaultvolume: 30,
                    defaulteq: false,
                    defaultap: true,
                    djroles: [],
                    botchannel: []
                })
            }
            return
        } catch (e) {
            console.log(String(e.stack))
        }
    },

    escapeRegex: (str) => {
        try {
            return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
        } catch (e) {
            console.log(String(e.stack).grey.bgRed)
        }
    },

    deleteUnRelevantMessage: async (client, guildId) => {
        if (client.musicsettings.get(guildId, `channel`) && client.musicsettings.get(guildId, `channel`).length > 5) {
            console.log(chalk.blue.bgWhite(`[Message Checker] Checkingfor unrelevant Messages`))
            let messageId = client.musicsettings.get(guildId, `message`)
            //try to get the guild
            let guild = client.guilds.cache.get(guildId)
            if (!guild) return console.log(chalk.blue.bgWhite(`[Message Checker] Guild not found!`))
            //try to get the channel
            let channel = guild.channels.cache.get(client.musicsettings.get(guildId, `channel`))
            if (!channel) channel = (await guild.channels.fetch(client.musicsettings.get(guildId, `channel`)).catch(() => {})) || false
            if (!channel) return console.log(chalk.blue.bgWhite(`[Message Checker] Channel not found!`))
            if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.MANAGE_MESSAGES)) return console.log(chalk.bgWhite(`[Message Checker] Missing Permissions`))
            //try to get the channel
            let messages = await channel.messages.fetch()
            if (messages.filter((m) => m.id != messageId).size > 0) {
                channel
                    .bulkDelete(messages.filter((m) => m.id != messageId))
                    .catch(() => {})
                    .then((messages) => console.log(chalk.blue.bgWhite(`[Message Checker] Bulk deleted ${messages.size} messages`)))
            } else {
                console.log(chalk.blue.bgWhite(`[Message Checker] No Relevant Messages`))
            }
        }
    }
}
