const { updateMusicChannel } = require('@utils/systemPlayer')
const { MessageEmbed } = require('discord.js')
const EMBED = require('@settings/embed')
const chalk = require('chalk')
const delay = require('delay')

module.exports = async (client, queue, song) => {
    let guild = client.guilds.cache.get(queue.textChannel.guild.id)
    const guild_settings = client.settings.get(queue.textChannel.guild.id)
    let lang = guild_settings.language

    const track = song

    const thing = new MessageEmbed().setColor(EMBED.COLOR.BOT_EMBED).setDescription(`${eval(client.langs[lang]['MUSIC']['ADD_QUEUE'])}`)

    await updateMusicChannel(client, queue, false, queue.textChannel, guild.id)

    queue.textChannel
        .send({
            embeds: [thing]
        })
        .then(async (msg) => {
            await delay(2000)
            msg.delete()
        })

    console.log(chalk.red(`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}.`))
}
