const { updateMusicChannel } = require('@utils/systemPlayer')

module.exports = {
    run: async (client, player, track, playload) => {
        const channel = client.channels.cache.get(player.textChannel)
        //updateMusicChannel( client,player, false, channel)
    }
}
