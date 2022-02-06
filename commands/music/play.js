const EMBED = require('@settings/embed')
const EMOJIS = require('@settings/emojis')
const CONFIG = require('@settings/config')
const chalk = require('chalk')
const delay = require('delay')
const { MessageEmbed, Permissions } = require('discord.js')
const { updateMusicChannel } = require('@utils/systemPlayer')
const { convertTime } = require('@utils/convert')

module.exports = {
    name: 'play',
    description: 'Play a song/playlist or search for a song from youtube',
    usage: '<results>',
    category: 'music',
    accessableby: 'Member',
    aliases: ['p', 'pplay', 'ฟังเพลง', 'เล่นเพลง'],
    parameters: {
        type: 'music',
        activeplayer: false,
        previoussong: false
    },
    joinchannel: true,
    type: 'queuesong',
    run: async (client, message, args, query, player, es, lang) => {
        console.log(chalk.magenta(`[COMMAND] Play used by ${message.author.tag} from ${message.guild.name}`))

        if (!args.length)
            return message.reply('ใส่ชื่อเพลงหรือ URL').then(async (msg) => {
                await delay(3000)
                msg.delete().catch(() => {})
            })

        let msgSearch

        if (query.includes('soundcloud')) {
            msgSearch = await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(EMBED.COLOR.TRANSPARENT)
                        .setTitle(`${EMOJIS.MSG.SEARCH} กำลังค้นหาเพลงจาก Soundclound`)
                        .setDescription(`\`\`\`${String(query)}\`\`\``)
                ]
            })
        } else if (query.includes('spotify')) {
            msgSearch = await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(EMBED.COLOR.TRANSPARENT)
                        .setTitle(`${EMOJIS.MSG.SEARCH}  กำลังค้นหาเพลงจาก Spotify`)
                        .setDescription(`\`\`\`${String(query)}\`\`\``)
                ]
            })
        } else if (query.includes('apple')) {
            msgSearch = await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(EMBED.COLOR.TRANSPARENT)
                        .setTitle(`${EMOJIS.MSG.SEARCH} กำลังค้นหาเพลงจาก Apple-Music`)
                        .setDescription(`\`\`\`${String(query)}\`\`\``)
                ]
            })
        } else {
            msgSearch = await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(EMBED.COLOR.TRANSPARENT)
                        .setTitle(`${EMOJIS.MSG.SEARCH} กำลังค้นหาเพลงจาก Youtube`)
                        .setDescription(`\`\`\`${String(query)}\`\`\``)
                ]
            })
        }

        if (CONFIG.PLAYER == 'DISTUBE') {
            await initDistbe(client, message, query)
            await msgSearch.delete()
            return
        }

        initManager(client, player, message, query)
    }
}

/**
 * It plays a song in the voice channel.
 * @param client - The client object.
 * @param message - The message object that triggered the command.
 * @param query - The query to search for.
 */
async function initDistbe(client, message, query) {
    const { member, guildId, channelId, guild } = message

    const { channel } = member.voice

    try {
        let options = {
            member: member,
            textChannel: message.channel,
            message
        }
        await client.distube.play(channel, query, options)
    } catch (e) {
        console.log(e)
        //await interaction.reply(` Error: \`${e}\``)
    }
}

/**
 * It searches for a song and adds it to the queue.
 * @param client - The client object.
 * @param player - The player object.
 * @param message - The message that invoked the command.
 * @param query - The query to search for.
 * @returns Nothing.
 */
async function initManager(client, player, message, query) {
    try {
        if (!player) {
            if (!message.member.voice.channel) throw 'NOT IN A VC'
            player = await client.manager.create({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                selfDeafen: true,
                autoPlay: true
            })
            player.set('messageid', message.id)
        }
    } catch (err) {
        console.log(chalk.redBright(`Command: '${this.name}' has error: ${err.message}.`))
    }

    if (player.state !== 'CONNECTED') player.connect()

    try {
        res = await player.search(query, message.author)
        console.log(res.loadType)
        if (res.loadType === 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy()
            throw res.exception
        }
    } catch (err) {
        return message.reply(`there was an error while searching: ${err.message}`).then((msg) => msg.delete())
    }

    if (res.loadType == 'NO_MATCHES') {
        // An error occured or couldn't find the track
        if (!player.queue.current) player.destroy()
        const thing = new MessageEmbed().setColor(client.embedColor).setDescription(`${eval(client.langs[lang]['ERROR']['NO_MATCHES'])}`)

        message.channel
            .send({
                embeds: [thing]
            })
            .then(async (msg) => {
                await delay(10000)
                await msg.delete()
            })
    } else if (res.loadType == 'PLAYLIST_LOADED') {
        // Connect to voice channel if not already
        if (player.state !== 'CONNECTED') player.connect()

        // Add songs to queue and then pLay the song(s) if not already

        // Show how many songs have been added
        const thing = new MessageEmbed().setColor(EMBED.COLOR.TRANSPARENT).setDescription(`${eval(client.langs[lang]['MUSIC']['ADD_PLAYLISTS'])}`)
        message.channel
            .send({
                embeds: [thing]
            })
            .then(async (msg) => {
                await delay(7000)
                await msg.delete()
            })

        console.log(res.tracks)
        player.queue.add(res.tracks)
        if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play()
    } else {
        // add track to queue and play
        if (player.state !== 'CONNECTED') player.connect()

        player.queue.add(res.tracks[0])

        if (!player.playing && !player.paused && !player.queue.size) {
            player.play()
            return
        } else {
            track = res.tracks[0]
            const thing = new MessageEmbed().setColor(EMBED.COLOR.TRANSPARENT).setDescription(`${eval(client.langs[lang]['MUSIC']['ADD_QUEUE'])}`)
            message.channel
                .send({
                    embeds: [thing]
                })
                .then(async (msg) => {
                    await delay(7000)
                    await msg.delete()
                })
        }
    }
    const textChannel = client.channels.cache.get(player.textChannel)
    await updateMusicChannel(client, player, false, textChannel)
}
