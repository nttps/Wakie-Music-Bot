const delay = require('delay')
const chalk = require('chalk')
const { Permissions, MessageEmbed } = require('discord.js')
const { databasing } = require('@utils/misc')
const { updateMusicChannel } = require('@utils/systemPlayer')

module.exports = {
    run: async (client, player, track, playload) => {
        try {
            try {
                client.stats.inc(`global`, `songs`)
            } catch (e) {}
            let edited = false
            let guild = client.guilds.cache.get(player.guild)
            if (!guild) return

            const channel = client.channels.cache.get(player.textChannel)
            if (!channel) channel = await guild.channels.fetch(player.textChannel)

            if (client.playercreated.has(player.guild)) {
                player.set(`eq`, player.get('eq') || `💣 None`)
                player.set(`filter`, player.get('eq') || `🧨 None`)
                player.set(`autoplay`, player.get('autoplay') || client.settings.get(player.guild, `defaultap`))
                player.set(`afk`, false)
                if (player.get('autoresume')) {
                    player.set('autoresume', false)
                } else {
                    await player.setVolume(client.settings.get(player.guild, `defaultvolume`))
                    if (client.settings.get(player.guild, `defaulteq`)) {
                        await player.setEQ(client.eqs.music)
                    }
                }
                databasing(client, player.guild, player.get(`playerauthor`))
                client.playercreated.delete(player.guild) // delete the playercreated state from the thing
                console.log(chalk.green(`Player Created in ${guild ? guild.name : player.guild} | Set the - Guild Default Data`))

                if (!player.get('autoresume') && channel && channel.permissionsFor(guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
                    channel
                        .send({
                            embeds: [new MessageEmbed().setDescription(`> 👍 **เข้าห้อง** <#${player.voiceChannel}>\n\n> 📃 **และผูกกับห้อง** <#${player.textChannel}>`).setTimestamp()]
                        })
                        .then((msg) => {
                            delay(2000)
                            msg.delete()
                        })
                }
            }

            player.set(`previoustrack`, track)

            await updateMusicChannel(client, player, false, channel)
        } catch (e) {
            console.log(e.stack) /* */
        }
    }
}
