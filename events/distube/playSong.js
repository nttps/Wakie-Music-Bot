const { updateMusicChannel } = require('@utils/systemPlayer')
const chalk = require('chalk')
const delay = require('delay')
const moment = require('moment')

moment.locale('th')

module.exports = async (client, queue, song) => {
    let guild = client.guilds.cache.get(queue.textChannel.guild.id)
    if (!guild) return

    const channel = queue.textChannel
    if (!channel) channel = await guild.channels.fetch(queue.textChannel.id)

    if (client.playercreated.has(guild.id)) {
        console.log(chalk.red(`[DISTUBE EVENT] Player Created in ${guild ? guild.name : queue.textChannel.guild.id} | Set the - Guild Default Data`))

        if (!queue.autoplay && channel && channel.permissionsFor(guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
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

    let histories = client.histories.get(queue.textChannel.guild.id)
    if (!Array.isArray(histories)) histories = []

    histories.push({
        id: song.id,
        user: song.user,
        name: song.name,
        url: song.url,
        member: song.member,
        created_at: moment().format('DD-MM-YYYY HH:mm:ss')
    })

    console.log(histories)
    //save it in the db
    client.histories.set(queue.textChannel.guild.id, histories)

    updateMusicChannel(client, queue, false, channel, guild.id)

    let lastEdited = false
    /**
     * @INFORMATION - EDIT THE SONG MESSAGE EVERY 10 SECONDS!
     */
    try {
        clearInterval(songEditInterval)
    } catch (e) {}
    songEditInterval = setInterval(async () => {
        if (!lastEdited) {
            try {
                updateMusicChannel(client, queue, false, channel, guild.id)
            } catch (e) {
                clearInterval(songEditInterval)
            }
        }
    }, 60000)
}
