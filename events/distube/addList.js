const { embedsActionBy } = require('@utils/generateEmbed')
const delay = require('delay')
const { updateMusicChannel } = require('@utils/systemPlayer')

module.exports = async (client, queue, playlist) => {
    let requested = client.histories.get(queue.textChannel.guild.id, 'requested')
    if (!Array.isArray(requested)) requested = []

    for (song in playlist.songs) {
        requested.push({
            id: song.id,
            user: {
                id: song.user.id,
                username: song.user.username,
                discriminator: song.user.discriminator
            },
            name: song.name,
            url: song.url,
            member: song.member.guild.id,
            created_at: moment().format('DD-MM-YYYY HH:mm:ss'),
            type: 'playlist'
        })
    }

    //save it in the db
    client.histories.set(queue.textChannel.guild.id, requested, 'requested')
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
