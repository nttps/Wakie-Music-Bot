const chalk = require('chalk')
const { deleteUnRelevantMessage } = require('@utils/misc')

module.exports = async (client, queue) => {
    queue.autoplay = true
    queue.volume = client.settings.get(queue.textChannel.guild.id, `defaultvolume`)

    console.log(chalk.red(`[DISTUBE EVENT] Player Created from [GUILDID] ${queue.textChannel.guild.id}`))
    client.playercreated.set(queue.textChannel.guild.id, true)
    //for checking the relevant messages

    //deleteUnRelevantMessage(client, queue.textChannel.guild.id)

    //client.playerintervals.set(queue.textChannel.guild.id, interval)
}
