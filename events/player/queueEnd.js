const delay = require('delay')
const autoplay = require('@commands/music/autoplay')
const { databasing } = require('@utils/misc')
const { updateMusicChannel } = require('@utils/systemPlayer')

const { MessageEmbed } = require(`discord.js`)

module.exports = {
    run: async (client, player) => {
        const channel = client.channels.cache.get(player.textChannel)

        databasing(client, player.guild, player.get(`playerauthor`))
        if (player.get('autoplay')) {
            autoplay.doIt(client, player)
            updateMusicChannel(client, player, false, channel)

            return
        }

        player.destroy()
        const thing = new MessageEmbed().setColor('GREEN').setDescription('เพลงในคิวหมดแล้ว')

        if (!player.get('currentMessage')) {
            console.log(` current message not found`)
            return channel.send({ embeds: [thing] }).then((msg) => {
                player.set(`currentMessage`, msg.id)
                console.log(`save current message not found`)
                return msg
            })
        }

        channel.send({ embeds: [thing] }).then((msg) => {
            delay(5000)
            msg.delete()
        })
    }
}
