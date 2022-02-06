const { deleteUnRelevantMessage } = require('@utils/misc')
const { embedsActionBy } = require('@utils/generateEmbed')
const delay = require('delay')

module.exports = async (client, queue) => {
    await queue.textChannel
        .send({
            embeds: [embedsActionBy('BLUE', `✅ **ตัวเล่นเพลงถูกหยุดแล้ว**`)]
        })
        .then(async (msg) => {
            await delay(10000)
            await msg.delete()
            await deleteUnRelevantMessage(client, queue.textChannel.guild.id)
        })
}
