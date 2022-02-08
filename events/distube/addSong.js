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

    let requested = client.histories.get(queue.textChannel.guild.id, 'requested')
    if (!Array.isArray(requested)) requested = []

    requested.push({
        id: track.id,
        user: {
            id: track.user.id,
            username: track.user.username,
            discriminator: track.user.discriminator
        },
        name: track.name,
        url: track.url,
        member: track.member.guild.id,
        created_at: moment().format('DD-MM-YYYY HH:mm:ss'),
        type: 'song'
    })

    //save it in the db
    client.histories.set(queue.textChannel.guild.id, requested, 'requested')

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
