const { updateMusicChannel } = require('@utils/generateEmbed')

module.exports = {
    run: async (client, player, track, payload) => {
        await player.stop()
        if (player.textChannel) {
            //Update the Music System Message - Embed
            updateMusicChannel(client, player)
        }
    }
}
