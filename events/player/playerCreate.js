const { Permissions } = require('discord.js')
const chalk = require('chalk')
module.exports = {
    run: async (client, player) => {
        console.log(chalk.green(`[INFORMATION] Player Created from [GUILDID] ${player.guild}`))
        client.playercreated.set(player.guild, true)
        //for checking the relevant messages
        var interval = setInterval(async () => {
            if (client.musicsettings.get(player.guild, `channel`) && client.musicsettings.get(player.guild, `channel`).length > 5) {
                console.log(chalk.blue.bgWhite(`[Message Checker] Checkingfor unrelevant Messages`))
                let messageId = client.musicsettings.get(player.guild, `message`)
                //try to get the guild
                let guild = client.guilds.cache.get(player.guild)
                if (!guild) return console.log(chalk.blue.bgWhite(`[Message Checker] Guild not found!`))
                //try to get the channel
                let channel = guild.channels.cache.get(client.musicsettings.get(player.guild, `channel`))
                if (!channel) channel = (await guild.channels.fetch(client.musicsettings.get(player.guild, `channel`)).catch(() => {})) || false
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
        }, 60000)
        client.playerintervals.set(player.guild, interval)

        /**
         * AUTO-RESUME-DATABASING
         */
        var autoresumeinterval = setInterval(async () => {
            var pl = client.manager.get(player.guild)
            if (client.settings.get(pl.guild, `autoresume`)) {
                let filter = pl.get(`filter`)
                let filtervalue = pl.get(`filtervalue`)
                let autoplay = pl.get(`autoplay`)
                let eq = pl.get(`eq`)
                /**
                 * It takes a track object and returns a track object.
                 * @param track - The track object.
                 * @returns The return value is an array of objects. Each object represents a track.
                 */
                const makeTrack = (track) => {
                    return {
                        track: track.track,
                        title: track.title || null,
                        identifier: track.identifier,
                        author: track.author || null,
                        length: track.duration || null,
                        isSeekable: !!track.isStream,
                        isStream: !!track.isStream,
                        uri: track.uri || null,
                        thumbnail: track.thumbnail || null,
                        requester: track.requester.id
                    }
                }
                client.autoresume.ensure(pl.guild, {
                    guild: null,
                    voiceChannel: null,
                    textChannel: null,
                    queue: null,
                    current: null,
                    volume: null,
                    queueRepeat: null,
                    trackRepeat: null,
                    playing: null,
                    position: null,
                    eq: null,
                    filter: null,
                    filtervalue: null,
                    autoplay: null
                })
                var data = client.autoresume.get(pl.guild)
                if (data.guild != pl.guild) client.autoresume.set(pl.guild, pl.guild, `guild`)
                if (data.voiceChannel != pl.voiceChannel) client.autoresume.set(pl.guild, pl.voiceChannel, `voiceChannel`)
                if (data.textChannel != pl.textChannel) client.autoresume.set(pl.guild, pl.textChannel, `textChannel`)

                if (pl.queue && pl.queue.current && (!data.current || data.current.identifier != pl.queue.current.identifier)) client.autoresume.set(pl.guild, makeTrack(pl.queue.current), `current`)
                if (data.volume != pl.volume) client.autoresume.set(pl.guild, pl.volume, `volume`)
                if (data.queueRepeat != pl.queueRepeat) client.autoresume.set(pl.guild, pl.queueRepeat, `queueRepeat`)
                if (data.trackRepeat != pl.trackRepeat) client.autoresume.set(pl.guild, pl.trackRepeat, `trackRepeat`)
                if (data.playing != pl.playing) client.autoresume.set(pl.guild, pl.playing, `playing`)
                if (data.position != pl.position) client.autoresume.set(pl.guild, pl.position, `position`)
                if (data.eq != eq) client.autoresume.set(pl.guild, eq, `eq`)
                if (data.filter != filter) client.autoresume.set(pl.guild, filter, `filter`)
                if (data.filtervalue != filtervalue) client.autoresume.set(pl.guild, filtervalue, `filtervalue`)
                if (data.autoplay != autoplay) client.autoresume.set(pl.guild, autoplay, `autoplay`)
                if (pl.queue && !arraysEqual(data.queue, [...pl.queue]))
                    client.autoresume.set(
                        pl.guild,
                        [...pl.queue].map((track) => makeTrack(track)),
                        `queue`
                    )

                function arraysEqual(a, b) {
                    if (a === b) return true
                    if (a == null || b == null) return false
                    if (a.length !== b.length) return false

                    for (var i = 0; i < a.length; ++i) {
                        if (a[i] !== b[i]) return false
                    }
                    return true
                }
            }
        }, 5000)
        client.playerintervals_autoresume.set(player.guild, autoresumeinterval)
    }
}
