const { deleteUnRelevantMessage } = require('@utils/misc')

module.exports = async (client, queue, song) => {
    deleteUnRelevantMessage(client, queue.textChannel.guild.id)
}
