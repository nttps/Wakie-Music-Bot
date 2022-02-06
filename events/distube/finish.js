const { deleteUnRelevantMessage } = require('@utils/misc')

module.exports = async (client, queue) => {
    deleteUnRelevantMessage(client, queue.textChannel.guild.id)
}
