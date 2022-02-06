const { updateMusicChannel } = require('@utils/systemPlayer')

module.exports = {
    name: 'playerDestroy',
    run: async (client, player) => {
        //clear the interval for the music system
        clearInterval(client.playerintervals.get(player.guild))
        client.playerintervals.delete(player.guild)
        //clear the interval for the autoresume system
        clearInterval(client.playerintervals_autoresume.get(player.guild))
        if (client.autoresume.has(player.guild)) client.autoresume.delete(player.guild)
        client.playerintervals_autoresume.delete(player.guild)
        //if the song ends, edit message(s)
        if (player.textChannel && player.guild) {
            //Update the Music System Message - Embed
            updateMusicChannel(client, player, true)
        }
    }
}
