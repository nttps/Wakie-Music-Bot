const { embedsActionBy } = require('@utils/generateEmbed')
const delay = require('delay')
const CONFIG = require('@settings/config')
const { interactionPlayer } = require('@utils/systemPlayer')
module.exports = {
    run: async (client, interaction) => {
        if (interaction.isButton()) {
            let action = interaction.customId.split(':')[2]

            if (interaction.customId.startsWith('controller')) {
                interactionPlayer(client, interaction, action)
            }
        }

        if (interaction.isSelectMenu()) {
            if (interaction.customId === 'myplaylist_list') {
                const { channel } = interaction.member.voice

                const playlists = await client.playlists.get(interaction.user.id, `${interaction.values[0]}`)

                //Send Success Message
                await interaction.update({
                    embeds: [embedsActionBy('BLUE', `กำลังเพิ่ม Playlist ${interaction.values[0]} ลงในคิว ... `)],
                    components: []
                })

                if (CONFIG.PLAYER == 'DISTUBE') {
                    const songs = playlists.map((i, v) => {
                        return i.url
                    })
                    const playlist = await client.distube.createCustomPlaylist(songs, {
                        member: interaction.member,
                        properties: { name: interaction.values[0] },
                        parallel: true
                    })

                    let options = {
                        member: interaction.member,
                        textChannel: interaction.channel,
                        interaction
                    }

                    await client.distube.play(channel, playlist, options)

                    await interaction.deleteReply()
                } else {
                    for (const track of playlists) {
                        try {
                            // Advanced way using the title, author, and duration for a precise search.
                            const unresolvedTrack = TrackUtils.buildUnresolved(
                                {
                                    title: track.title,
                                    url: track.url
                                },
                                message.author
                            )
                            player.queue.add(unresolvedTrack)
                        } catch (e) {
                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                            continue
                        }
                    }
                }
            }
        }
    }
}
