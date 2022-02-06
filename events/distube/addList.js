const { embedsActionBy } = require('@utils/generateEmbed')
const delay = require('delay')
const { updateMusicChannel } = require('@utils/systemPlayer')

module.exports = async (client, queue, playlist) => {
    //Send Success Message
    await queue.textChannel
        .send({
            embeds: [embedsActionBy('BLUE', `เพิ่ม Playlist ชื่อ \`${playlist.name}\` ทั้งหมด (${playlist.songs.length} เพลง) ลงในคิวแล้ว!`)]
        })
        .then(async (msg) => {
            await delay(2000)
            await updateMusicChannel(client, queue, false, queue.textChannel, queue.textChannel.guild.id)
            msg.delete()
        })
}
