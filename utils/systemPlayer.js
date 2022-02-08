const { embedsActionBy, titlePlayer, distubePlayer } = require('@utils/generateEmbed')
const CONFIG = require('@settings/config')
const { MessageEmbed, Permissions } = require(`discord.js`)
const chalk = require('chalk')
const delay = require('delay')
const autoplay = require('@commands/music/autoplay')

/* This code is used to update the music channel.*/
module.exports.updateMusicChannel = async (client, player = null, leave = false, channel, guildId = null) => {
    let data

    if (CONFIG.PLAYER == 'DISTUBE') {
        data = distubePlayer(client, player, leave)
    } else {
        if (player) guildId = player.guild
        data = titlePlayer(client, guildId, leave)
    }

    /* If the guild has a channel and message set, it will edit the message. If not, it will send a new
    message. */
    if (client.musicsettings.get(guildId, 'channel') && client.musicsettings.get(guildId, 'channel').length > 5) {
        let messageId = client.musicsettings.get(guildId, 'message')
        //try to get the guild
        let guild = client.guilds.cache.get(guildId)
        if (!guild) return console.log(chalk.magentaBright('[SYSTEM MUSIC] Guild not found!'))
        let channel = guild.channels.cache.get(client.musicsettings.get(guildId, `channel`))
        if (!channel) channel = (await guild.channels.fetch(client.musicsettings.get(guildId, `channel`)).catch(() => {})) || false
        if (!channel) return console.log(chalk.magentaBright('[SYSTEM MUSIC] Channel not found!'))
        if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) return console.log(chalk.magentaBright('[SYSTEM MUSIC] Missing Permissions'))
        //try to get the channel
        let message = channel.messages.cache.get(messageId)
        if (!message) message = (await channel.messages.fetch(messageId).catch(() => {})) || false
        if (!message) return console.log(chalk.magentaBright('[SYSTEM MUSIC] Message not found!'))

        message.edit(data).catch((e) => {
            console.log(e)
        })
    } else {
        if (!player.get('currentMessage')) {
            console.log(` current message not found`)
            return channel.send(data).then((msg) => {
                player.set(`currentMessage`, msg.id)
                console.log(`save current message not found`)
                return msg
            })
        }

        await channel.messages
            .fetch(player.get('currentMessage'))
            .then((message) => {
                return message.edit(data)
            })
            .catch(console.error)
    }
    return
}

module.exports.interactionPlayer = async (client, interaction, action) => {
    const { guild, channel, member, guildId } = interaction
    if (!guild) return
    const es = client.settings.get(guildId, 'embed')
    const lang = client.settings.get(guildId, 'language')
    const player = client.manager.get(guildId)

    const distubeQueue = client.distube.getQueue(interaction)
    switch (action) {
        case 'stop':
            {
                await interaction.reply({
                    embeds: [embedsActionBy('BLUE', `⏹ **หยุดเพลงที่กำลังเล่นและกำลังออกจากห้อง**`)]
                })
                await delay(1000)
                await interaction.deleteReply()

                if (player) {
                    await player.destroy()
                    await this.updateMusicChannel(client, player, true, channel, guildId)
                    //await client.editLastMessage(player, '⛔️ ปิดตัวเล่น')
                } else if (distubeQueue && distubeQueue.songs.length > 0) {
                    distubeQueue.stop()
                    await this.updateMusicChannel(client, distubeQueue, true, channel, guildId)
                } else {
                    await this.updateMusicChannel(client, distubeQueue, true, channel, guildId)
                }
                return
            }
            break
        case 'skip':
            {
                //if ther is nothing more to skip then stop music and leave the Channel
                if (player && player.queue.size == 0) {
                    //if its on autoplay mode, then do autoplay before leaving...
                    if (player.get('autoplay')) {
                        await autoplay.doIt(client, player, 'skip')
                        await interaction.reply({
                            embeds: [embedsActionBy('BLUE', `⏭ **ข้ามเพลง!**`)]
                        })
                        await delay(2000)
                        await interaction.deleteReply()
                    } else {
                        await player.destroy()
                        await interaction.reply({
                            embeds: [embedsActionBy('BLUE', `⏭ **หยุดเพลงและออกจากห้อง!**`)]
                        })
                        await delay(2000)
                        await interaction.deleteReply()
                    }
                    return
                } else if (player) {
                    //skip the track
                    await player.stop()

                    await interaction.reply({
                        embeds: [embedsActionBy('BLUE', `⏭ **หยุดเพลง!**`)]
                    })
                    await delay(2000)
                    await interaction.deleteReply()
                } else if (distubeQueue && distubeQueue.songs.length === 0 && !distubeQueue.autoplay) {
                    //edit the current song message
                    return distubeQueue.stop()
                } else if (distubeQueue) {
                    await distubeQueue.skip()
                    await interaction.reply({
                        embeds: [embedsActionBy('BLUE', `⏭ **ข้ามเพลงแล้ว!**`)]
                    })
                }
            }
            break
        case 'shuffle':
            {
                if (player) {
                    //set into the player instance an old Queue, before the shuffle...
                    player.set(
                        `beforeshuffle`,
                        player.queue.map((track) => track)
                    )
                    //shuffle the Queue
                    await player.queue.shuffle()
                } else {
                    await distubeQueue.shuffle()
                }

                //Send Success Message
                await interaction.reply({
                    embeds: [embedsActionBy('BLUE', `🔀 **สลับเพลงเพื่อสุ่ม ${player ? player.queue.length : distubeQueue.length} เพลง!**`)]
                })
                await delay(2000)
                await interaction.deleteReply()
            }
            break
        case 'pause':
            {
                let title
                if (player && !player.playing) {
                    await player.pause(false)
                    title = `▶️ **เล่นต่อ!**`
                    this.updateMusicChannel(client, player, false, channel, guild.id)
                } else if (player) {
                    //pause the player
                    await player.pause(true)
                    title = `⏸ **หยุด!**`
                    this.updateMusicChannel(client, player, false, channel, guild.id)
                } else if (distubeQueue && distubeQueue.playing) {
                    title = `⏸ **หยุด!**`
                    distubeQueue.pause()
                    await this.updateMusicChannel(client, distubeQueue, false, channel, guildId)
                } else {
                    title = `▶️ **เล่นต่อ!**`
                    distubeQueue.resume()
                    await this.updateMusicChannel(client, distubeQueue, false, channel, guildId)
                }
                //edit the message so that it's right!

                await interaction.reply({
                    embeds: [embedsActionBy('BLUE', title)]
                })
                await delay(2000)
                await interaction.deleteReply()
                this.updateMusicChannel(client, player, false, channel, guild.id)
            }
            break
        case 'autoplay':
            {
                if (player) {
                    //pause the player
                    player.set(`autoplay`, !player.get(`autoplay`))
                    await interaction.reply({
                        embeds: [embedsActionBy('BLUE', `${player.get(`autoplay`) ? `**เปิดเล่นเพลงอัตโนมัติ**` : `<:no:833101993668771842> **ปิดเล่นเพลงอัตโนมัติ**`}`)]
                    })
                    await delay(2000)
                    await i.deleteReply()

                    this.updateMusicChannel(client, player, false, channel, guild.id)
                } else {
                    await distubeQueue.toggleAutoplay()
                    await interaction.reply({
                        embeds: [embedsActionBy('BLUE', `${distubeQueue.autoplay ? `**เปิดเล่นเพลงอัตโนมัติ**` : `<:no:833101993668771842> **ปิดเล่นเพลงอัตโนมัติ**`}`)]
                    })
                    await delay(2000)
                    await i.deleteReply()
                    await this.updateMusicChannel(client, distubeQueue, false, channel, guildId)
                }
            }
            break
        case 'songloop':
            {
                let title, queue

                //if there is active queue loop, disable it + add embed information
                if (player && player.queueRepeat) {
                    queue = player
                    title = `${player.trackRepeat ? `**เปิดการเล่นเพลงซ้ำ**` : `**ปิดการเล่นเพลงซ้ำ**`}`
                    player.setQueueRepeat(false)
                } else if (player) {
                    queue = player
                    title = `${player.trackRepeat ? `**เปิดการเล่นเพลงซ้ำ**` : `**ปิดการเล่นเพลงซ้ำ**`}`
                    //set track repeat to revers of old track repeat
                    player.setTrackRepeat(!player.trackRepeat)
                } else if (distubeQueue && distubeQueue.repeatMode == 1) {
                    queue = distubeQueue
                    title = `**ปิด**`
                    await queue.setRepeatMode(0)
                } else {
                    queue = distubeQueue
                    title = `**เปิดเล่นซ้ำเพลงนี้**`

                    await queue.setRepeatMode(1)
                }

                await interaction.reply({
                    embeds: [embedsActionBy('BLUE', title)]
                })
                await delay(2000)
                await interaction.deleteReply()
                this.updateMusicChannel(client, player, false, channel, guild.id)
            } /* Creating a variable called title and queue. */

            break
        case 'queueloop':
            {
                let title, queue
                //if there is active queue loop, disable it + add embed information
                if (player && player.trackRepeat) {
                    queue = player
                    title = `${player.queueRepeat ? `**เปิดเล่นซ้ำคิว**` : `**ปิดเล่นซ้ำคิว**`}`
                    player.setTrackRepeat(false)

                    //edit the message so that it's right!
                } else if (player) {
                    queue = player
                    title = `${player.queueRepeat ? `**เปิดเล่นซ้ำคิว**` : `**ปิดเล่นซ้ำคิว**`}`
                    //set track repeat to revers of old track repeat
                    player.setQueueRepeat(!player.queueRepeat)
                    //edit the message so that it's right!
                } else if (distubeQueue && distubeQueue.repeatMode == 2) {
                    queue = distubeQueue
                    title = `**ปิด**`
                    await queue.setRepeatMode(0)
                } else {
                    queue = distubeQueue
                    title = `**เปิดเล่นซ้ำคิว**`
                    await queue.setRepeatMode(2)
                }

                await interaction.reply({
                    embeds: [embedsActionBy('BLUE', title)]
                })
                await delay(2000)
                await interaction.deleteReply()
                this.updateMusicChannel(client, player, false, channel, guild.id)
            }
            break
        case 'forward':
            {
                //get the seektime variable of the user input
                var seektime = Number(player.position) + 10 * 1000
                //if the userinput is smaller then 0, then set the seektime to just the player.position
                if (10 <= 0) seektime = Number(player.position)
                //if the seektime is too big, then set it 1 sec earlier
                if (Number(seektime) >= player.queue.current.duration) seektime = player.queue.current.duration - 1000
                //seek to the new Seek position
                await player.seek(Number(seektime))
                interaction.reply({
                    embeds: [embedsActionBy('BLUE', `⏩ **เลื่อนไปข้างหน้า\`10 วินาที\`!**`)]
                })
                //edit the message so that it's right!
                this.updateMusicChannel(client, player, false, channel, guild.id)
            }
            break
        case 'rewind':
            {
                var seektime = player.position - 10 * 1000
                if (seektime >= player.queue.current.duration - player.position || seektime < 0) {
                    seektime = 0
                }
                //seek to the new Seek position
                await player.seek(Number(seektime))
                interaction.reply({
                    embeds: [embedsActionBy('BLUE', `⏪ **ย้อนหลังไป \`10 วินาที\`!**`)]
                })
                await delay(2000)
                await interaction.deleteReply()

                this.updateMusicChannel(client, player, false, channel, guild.id)
            }
            break
        case 'volUp':
            {
                await distubeQueue.setVolume(distubeQueue.volume + 10)
                this.updateMusicChannel(client, distubeQueue, false, channel, guild.id)
                await interaction.reply({
                    embeds: [embedsActionBy('BLUE', `**ระดับเสียงปัจจุบัน ${distubeQueue.volume}!**`)]
                })
                await delay(2000)
                await interaction.deleteReply()

                client.settings.set(guild.id, Number(distubeQueue.volume), 'defaultvolume')
            }
            break
        case 'volDown':
            {
                await distubeQueue.setVolume(distubeQueue.volume - 10)
                this.updateMusicChannel(client, distubeQueue, false, channel, guild.id)

                await interaction.reply({
                    embeds: [embedsActionBy('BLUE', `**ระดับเสียงปัจจุบัน ${distubeQueue.volume}!**`)]
                })
                await delay(2000)
                await interaction.deleteReply()

                client.settings.set(guild.id, Number(distubeQueue.volume), 'defaultvolume')
            }
            break
    }
}
