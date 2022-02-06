const { convertTime } = require('./convert')
const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require(`discord.js`)
const EMBED = require('@settings/embed')
const CONFIG = require('@settings/config')
/**
 * It returns an object with two keys: `embeds` and `components`. `embeds` is an array of embeds, and
 * `components` is an array of buttons
 * @param client - The client object.
 * @param guildId - The ID of the guild the message is in.
 * @param leave - boolean
 */
const titlePlayer = (client, guildId, leave) => {
    const guild = client.guilds.cache.get(guildId)
    if (!guild) return
    const es = client.settings.get(guild.id, 'embed')
    const lang = client.settings.get(guild.id, 'language')

    //embeds Empty
    var embeds = [
        new MessageEmbed()
            .setColor(EMBED.COLOR.BOT_EMBED)
            .setFooter({ text: 'TED WAKIE', iconURL: '' })
            .setImage(
                guild.banner
                    ? guild.bannerURL({
                          size: 4096
                      })
                    : CONFIG.LOGO
            )
            .setTitle(`WAKIE MUSIC BOT`)
            .setDescription(`เริ่มฟังเพลงโดยเชื่อมต่อกับห้องเสียงแล้วส่ง **ลิงก์เพลง** หรือ **ชื่อเพลง** ในห้องนี้!`)
            .setDescription(`> *สนับสนุน Youtube, Spotify, Soundcloud และลิงก์เพลง Mp3!*`)
    ]

    const player = client.manager.get(guild.id)

    if (!leave && player && player.queue && player.queue.current) {
        embeds[0] = new MessageEmbed()
            .setImage(player.queue.current.displayThumbnail('maxresdefault') || player.queue.current.displayThumbnail('hqdefault'))
            .setFooter({
                text: `ขอโดย: ${player.queue.current.requester.tag}`,
                iconURL: player.queue.current.requester.displayAvatarURL({
                    dynamic: true
                })
            })
            .setAuthor({
                name: `${player.queue.current.title} ${convertTime(player.queue.current.duration)}`,
                url: player.queue.current.uri
            })

        const tracks = player.queue
        var maxTracks = 10 //tracks / Queue Page
        //get an array of quelist where 10 tracks is one index in the array
        var songs = tracks.slice(0, maxTracks)

        const queuedSongs = songs.map((t, i) => `\`${++i}\` ${t.title} \`[${convertTime(t.duration)}]\` [${t.requester}]`).join('\n')

        if (songs.length > 0) {
            embeds[1] = new MessageEmbed()
                .setColor(EMBED.COLOR.BOT_EMBED)
                .setDescription(`**คิวเพลง**\n\n${songs.length > 0 ? queuedSongs : 'ไม่มีเพลง'}`)
                .setTimestamp()
        }

        if (player.queue.length > 10) embeds[1].addField(`***และอีก ${player.queue.length > maxTracks ? player.queue.length - maxTracks : player.queue.length} เพลง... ***`, `\u200b`)
    }

    const components = buttonPlayer(player, guild, leave)

    return {
        embeds,
        components
    }
}

/**
 * Creates a message action row with the following components:
 *
 * - skipbutton
 * - pausebutton
 * - autoplaybutton
 * - shufflebutton
 * - songbutton
 * - queuebutton
 * - forwardbutton
 * - rewindbutton
 * - stopbutton
 * @param player - The player object.
 * @param guild - The guild object
 * @param leave - If the user is leaving the guild, this will be true.
 * @returns A MessageActionRow is a container for MessageButtons.
 */
const buttonPlayer = (player, guild, leave) => {
    //wait selector for playlists

    let stopbutton = new MessageButton().setStyle('DANGER').setCustomId(`controller:${guild.id}:stop`).setEmoji(`🏠`).setLabel(`หยุด`).setDisabled()
    let skipbutton = new MessageButton().setStyle('PRIMARY').setCustomId(`controller:${guild.id}:skip`).setEmoji(`⏭`).setLabel(`ข้ามเพลง`).setDisabled()
    let shufflebutton = new MessageButton().setStyle('PRIMARY').setCustomId(`controller:${guild.id}:shuffle`).setEmoji('🔀').setLabel(`สุ่มเพลง`).setDisabled()
    let pausebutton = new MessageButton().setStyle('SECONDARY').setCustomId(`controller:${guild.id}:pause`).setEmoji('⏸').setLabel(`หยุดชั่วคราว`).setDisabled()
    let autoplaybutton = new MessageButton().setStyle('SUCCESS').setCustomId(`controller:${guild.id}:autoplay`).setEmoji('🔁').setLabel(`เล่นอัตโนมัติ`).setDisabled()
    let songbutton = new MessageButton().setStyle('SUCCESS').setCustomId(`controller:${guild.id}:songloop`).setEmoji(`🔁`).setLabel(`เพลง`).setDisabled()
    let queuebutton = new MessageButton().setStyle('SUCCESS').setCustomId(`controller:${guild.id}:queueloop`).setEmoji(`🔂`).setLabel(`คิว`).setDisabled()
    if (!leave && player && player.queue && player.queue.current) {
        skipbutton = skipbutton.setDisabled(false)
        shufflebutton = shufflebutton.setDisabled(false)
        stopbutton = stopbutton.setDisabled(false)
        songbutton = songbutton.setDisabled(false)
        queuebutton = queuebutton.setDisabled(false)
        autoplaybutton = autoplaybutton.setDisabled(false)
        pausebutton = pausebutton.setDisabled(false)
        if (player.get('autoplay')) {
            autoplaybutton = autoplaybutton.setStyle('SECONDARY')
        }
        if (!player.playing) {
            pausebutton = pausebutton.setStyle('SUCCESS').setEmoji('▶️').setLabel(`เล่นใหม่`)
        }
        if (!player.queueRepeat && !player.trackRepeat) {
            songbutton = songbutton.setStyle('SUCCESS')
            queuebutton = queuebutton.setStyle('SUCCESS')
        }
        if (player.trackRepeat) {
            songbutton = songbutton.setStyle('SECONDARY')
            queuebutton = queuebutton.setStyle('SUCCESS')
        }
        if (player.queueRepeat) {
            songbutton = songbutton.setStyle('SUCCESS')
            queuebutton = queuebutton.setStyle('SECONDARY')
        }
    }
    //now we add the components!
    return [
        //wait selector for playlists
        new MessageActionRow().addComponents([skipbutton, pausebutton, autoplaybutton, shufflebutton]),
        new MessageActionRow().addComponents([songbutton, queuebutton, stopbutton])
    ]
}

/**
 * It creates a new message embed object and sets the color and description.
 * @param [embedColor] - The color of the embed.
 * @param text - The text that will be displayed in the embed.
 * @returns A MessageEmbed object.
 */
const embedsActionBy = (embedColor = EMBED.COLOR.BOT_EMBED, text) => {
    return new MessageEmbed().setColor(embedColor).setDescription(text)
}

/**
 * It creates the embeds and components for the bot.
 * @param guild - The guild object.
 * @param queue - The queue object
 * @param leave - boolean
 */
const distubePlayer = (guild, queue, leave) => {
    //embeds Empty
    var embeds = [
        new MessageEmbed()
            .setColor(EMBED.COLOR.BOT_EMBED)
            .setFooter({ text: 'TED WAKIE', iconURL: 'https://cdn.discordapp.com/avatars/904846642509910116/916f31e456a1b55292c2f63af50ee13c.png?size=256' })
            .setImage(
                guild.banner
                    ? guild.bannerURL({
                          size: 4096
                      })
                    : CONFIG.LOGO
            )
            .setTitle(`WAKIE MUSIC BOT`)
            .setDescription(`เริ่มฟังเพลงโดยเชื่อมต่อกับห้องเสียงแล้วส่ง **ลิงก์เพลง** หรือ **ชื่อเพลง** ในห้องนี้!`)
            .setDescription(`> *สนับสนุน Youtube, Spotify, Soundcloud และลิงก์เพลง Mp3!*`)
    ]

    if (!leave && queue.songs.length > 0 && queue.songs[0]) {
        const CurrentDuration = queue.formattedCurrentTime
        const TotalDuration = queue.songs[0].formattedDuration
        const Emoji = queue.playing ? '🔴 |' : '⏸ |'
        const Part = Math.floor((queue.currentTime / queue.songs[0].duration) * 38)

        embeds[0] = new MessageEmbed()
            .setImage(queue.songs[0].thumbnail)
            .setFooter({
                text: `ขอโดย: ${queue.songs[0].user.tag} \nกำลังเปิดเพลงอัตโนมัติ`,
                iconURL: queue.songs[0].user.displayAvatarURL({
                    dynamic: true
                })
            })
            .addField(`⏱ เวลา:`, `>>> \`${queue.formattedDuration}\``, true)
            .addField(`🔊 ระดับเสียง:`, `>>> \`${queue.volume} %\``, true)
            .addField(`❔ ฟิลเตอร์เพลง:`, `>>> ${queue.filters.join(', ') || '❌'}`, queue.filters.length > 1 ? false : true)
            .addField(`เวลาเล่นปัจจุบัน: \`[${CurrentDuration} / ${TotalDuration}]\``, `\`\`\`${Emoji} ${'─'.repeat(Part) + '🎶' + '─'.repeat(38 - Part)}\`\`\``)
            .setAuthor({
                name: `${queue.songs[0].name} ${queue.songs[0].formattedDuration}`,
                url: queue.songs[0].url
            })
        const tracks = queue.songs
        var maxTracks = 10 //tracks / Queue Page
        //get an array of quelist where 10 tracks is one index in the array
        var songs = tracks.slice(1, maxTracks)

        const queuedSongs = songs.map((t, i) => `\`${++i}.\` ${t.name} \`[${t.formattedDuration}]\` [${t.user}]`).join('\n')

        if (songs.length > 0) {
            embeds[1] = new MessageEmbed()
                .setColor(EMBED.COLOR.BOT_EMBED)
                .setDescription(`**คิวเพลง**\n\n${songs.length > 0 ? queuedSongs : 'ไม่มีเพลง'}`)
                .setTimestamp()
        }

        if (queue.songs.length > 10) embeds[1].addField(`***และอีก ${queue.songs.length > maxTracks ? queue.songs.length - maxTracks : queue.songs.length} เพลง... ***`, `\u200b`)
    }

    const components = distubeButton(queue, guild, leave)

    return {
        embeds,
        components
    }
}

/**
 * It creates a message action row with the buttons that control the music
 * @param queue - The queue object for the guild.
 * @param guild - The guild object.
 * @param leave - If the user is leaving the guild, this will be true.
 * @returns A list of MessageActionRow components.
 */
const distubeButton = (queue, guild, leave) => {
    //wait selector for playlists

    let stopButton = new MessageButton().setStyle('DANGER').setCustomId(`controller:${guild.id}:stop`).setEmoji(`🏠`).setLabel(`หยุด`).setDisabled()
    let skipButton = new MessageButton().setStyle('PRIMARY').setCustomId(`controller:${guild.id}:skip`).setEmoji(`⏭`).setLabel(`ข้ามเพลง`).setDisabled()
    let shuffleButton = new MessageButton().setStyle('PRIMARY').setCustomId(`controller:${guild.id}:shuffle`).setEmoji('🔀').setLabel(`สุ่มเพลง`).setDisabled()
    let pauseButton = new MessageButton().setStyle('SECONDARY').setCustomId(`controller:${guild.id}:pause`).setEmoji('⏸').setLabel(`หยุดชั่วคราว`).setDisabled()
    let autoplayButton = new MessageButton().setStyle('SECONDARY').setCustomId(`controller:${guild.id}:autoplay`).setEmoji('🔁').setLabel(`เล่นอัตโนมัติ`).setDisabled()
    let songButton = new MessageButton().setStyle('SUCCESS').setCustomId(`controller:${guild.id}:songloop`).setEmoji(`🔁`).setLabel(`เพลง`).setDisabled()
    let queueButton = new MessageButton().setStyle('SUCCESS').setCustomId(`controller:${guild.id}:queueloop`).setEmoji(`🔂`).setLabel(`คิว`).setDisabled()
    let volUpButton = new MessageButton().setStyle('PRIMARY').setCustomId(`controller:${guild.id}:volUp`).setEmoji(`🔊`).setLabel(`เสียง +10`).setDisabled()
    let volDownButton = new MessageButton().setStyle('PRIMARY').setCustomId(`controller:${guild.id}:volDown`).setEmoji(`🔉`).setLabel(`เสียง -10`).setDisabled()
    if (!leave && queue && queue.songs.length > 0 && queue.songs[0]) {
        skipButton = skipButton.setDisabled(false)
        shuffleButton = shuffleButton.setDisabled(false)
        stopButton = stopButton.setDisabled(false)
        songButton = songButton.setDisabled(false)
        queueButton = queueButton.setDisabled(false)
        autoplayButton = autoplayButton.setDisabled(false)
        pauseButton = pauseButton.setDisabled(false)
        volUpButton = volUpButton.setDisabled(false)
        volDownButton = volDownButton.setDisabled(false)

        if (queue.autoplay) {
            autoplayButton = autoplayButton.setStyle('SECONDARY').setLabel(`ปิดเล่นอัตโนมัติ`)
        }

        if (!queue.playing) {
            pauseButton = pauseButton.setStyle('SUCCESS').setEmoji('▶️').setLabel(`เล่นต่อ`)
        }

        if (queue.repeatMode === 0) {
            songButton = songButton.setStyle('SUCCESS')
            queueButton = queueButton.setStyle('SUCCESS')
        }

        if (queue.repeatMode === 1) {
            songButton = songButton.setStyle('SECONDARY')
            queueButton = queueButton.setStyle('SUCCESS')
        }
        if (queue.repeatMode === 2) {
            songButton = songButton.setStyle('SUCCESS')
            queueButton = queueButton.setStyle('SECONDARY')
        }
    }
    //now we add the components!
    return [
        //wait selector for playlists
        new MessageActionRow().addComponents([skipButton, pauseButton, autoplayButton, volUpButton, volDownButton]),
        new MessageActionRow().addComponents([shuffleButton, songButton, queueButton, stopButton])
    ]
}

const pageQueue = async (message, songs, maxTracks = 10) => {
    let Songs = songs.map((t, index) => {
        t.index = index
        return t
    })

    let ChunkedSongs = _.chunk(Songs, maxTracks) //How many songs to show per-page

    let Pages = ChunkedSongs.map((Tracks) => {
        let SongsDescription = Tracks.map((t) => `\`${++i}.\` ${t.name} \`[${t.formattedDuration}]\` [${t.user}]`).join('\n')

        let Embed = new MessageEmbed().setColor(EMBED.COLOR.BOT_EMBED).setDescription(`**คิวเพลง**\n\n${SongsDescription}`)

        return Embed
    })

    let currentPage = 0

    if (!Pages.length || Pages.length === 1) return Pages[0]

    let button_back = new MessageButton().setStyle('SUCCESS').setCustomId('1').setEmoji('833802907509719130').setLabel('ก่อน')
    let button_home = new MessageButton().setStyle('DANGER').setCustomId('2').setEmoji('🏠').setLabel('หน้าหลัก')
    let button_forward = new MessageButton().setStyle('SUCCESS').setCustomId('3').setEmoji('832598861813776394').setLabel('หลัง')
    const allbuttons = [new MessageActionRow().addComponents([button_back, button_home, button_forward])]
    //Send message with buttons
    let swapmsg = await message.channel.send({
        content: `***คลิกที่ __ปุ่ม__ เพื่อเปลี่ยนหน้า***`,
        embeds: [Pages[0]],
        components: allbuttons
    })
    //create a collector for the thinggy
    const collector = swapmsg.createMessageComponentCollector({ filter: (i) => i.isButton() && i.user, time: 180e3 }) //collector for 5 seconds
    //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
    collector.on('collect', async (b) => {
        //page forward
        if (b.customId == '1') {
            if (currentPage !== 0) {
                currentPage -= 1
                await swapmsg.edit({ embeds: [Pages[currentPage]], components: allbuttons })
                await b.deferUpdate()
            } else {
                currentPage = Pages.length - 1
                await swapmsg.edit({ embeds: [Pages[currentPage]], components: allbuttons })
                await b.deferUpdate()
            }
        }
        //go home
        else if (b.customId == '2') {
            //b.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
            currentPage = 0
            await swapmsg.edit({ embeds: [Pages[currentPage]], components: allbuttons })
            await b.deferUpdate()
        }
        //go forward
        else if (b.customId == '3') {
            //b.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
            if (currentPage < Pages.length - 1) {
                currentPage++
                await swapmsg.edit({ embeds: [Pages[currentPage]], components: allbuttons })
                await b.deferUpdate()
            } else {
                currentPage = 0
                await swapmsg.edit({ embeds: [Pages[currentPage]], components: allbuttons })
                await b.deferUpdate()
            }
        }
    })
}

module.exports = { titlePlayer, buttonPlayer, embedsActionBy, distubePlayer, distubeButton, pageQueue }
