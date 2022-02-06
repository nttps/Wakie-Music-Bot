const { databasing, escapeRegex } = require(`@utils/misc`)
const config = require(`@settings/config`)
const delay = require('delay')
const { MessageEmbed } = require('discord.js')
const play = require('@commands/music/play')
const { embedsActionBy } = require('@utils/generateEmbed')

/* The code above is the main command handler for the bot. It will check if the message is a command,
if it is, it will run the command. */
module.exports = {
    run: async (client, message) => {
        databasing(client, message.guild.id, message.author.id)

        /* Creating a variable called channel and setting it equal to the voice channel that the user
        is currently in. */
        const { channel } = message.member.voice

        const guild_settings = client.settings.get(message.guildId)
        let es = guild_settings.embed
        let lang = guild_settings.language
        let { prefix, botchannel, unkowncmdmessage } = guild_settings

        if (prefix === null) prefix = config.PREFIX

        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`)

        //if its not that then connect to musicSystem
        if (!prefixRegex.test(message.content)) {
            const data = client.musicsettings.get(message.guild.id)
            if (message.author.bot) return
            const { channel } = message.member.voice
            const musicChannelId = data.channel
            //if not setupped yet, return
            if (!musicChannelId || musicChannelId.length < 5) return
            //if not the right channel return
            if (musicChannelId != message.channel.id) return

            /* The code checks if the user is in a voice channel. If they are, it checks if the bot is
            in the same voice channel. If they are, it plays the song.
            
            If the bot is not in the same voice channel, it joins the voice channel.
            
            If the bot is in the same voice channel, it plays the song.
            
            If the bot is not in the same voice channel, it leaves the voice channel.
            
            If the user is not in a voice channel, it sends a message to the user.
            
            The code is written in JavaScript */
            if (!channel)
                return message.reply('เข้าห้องพูดคุยก่อนใช้คำสั่ง.').then(async (msg) => {
                    await delay(5000)
                    msg.delete().catch(() => {})
                })

            let player = await client.manager.get(message.guild.id)
            if (player && channel.id !== player.voiceChannel)
                return message.reply(`<:no:833101993668771842> **เข้าห้องฟังเพลงก่อน <#${player.voiceChannel}>**`).then(async (msg) => {
                    await delay(3000)
                    msg.delete().catch(() => {})
                })

            if (!player) player = client.distube.getQueue(message)

            const args = message.content.trim().split(/ +/)

            play.run(client, message, args, args.join(' '), player, es, lang, prefix)

            return message.delete()
        }

        const [, matchedPrefix] = message.content.match(prefixRegex)
        const [name, ...args] = message.content.slice(matchedPrefix.length).trim().split(/ +/)

        if (name.length === 0) {
            if (matchedPrefix.includes(client.user.id))
                return message
                    .reply({
                        embeds: [new MessageEmbed().setColor('RANDM').setTitle('ไม่ใช่คำสั่ง')]
                    })
                    .catch(() => {})
            return
        }

        let command = client.commands.get(name)
        if (!command) command = client.commands.get(client.aliases.get(name))
        if (!command) return

        // var systemData = client.musicsettings.get(message.guild.id)
        // if (systemData.channel && systemData.channel == message.channel.id) {
        //     return message
        //         .reply({ embeds: [embedsActionBy('BLUE', `❌ **ใช้คำสั่งได้ที่ห้อง <#${systemData.commandChannel}>!** `)] })
        //         .then(async (msg) => {
        //             await delay(10000)
        //             msg.delete().catch(() => {})
        //         })
        //         .catch(() => {})
        // }

        if (command.joinchannel) {
            if (!channel)
                return message.reply({ embeds: [embedsActionBy('BLUE', `❌ เข้าห้องพูดคุยก่อนใช้คำสั่ง`)] }).then(async (msg) => {
                    await delay(10000)
                    msg.delete().catch(() => {})
                })
        }

        let player = client.manager.get(message.guild.id)

        if (player && player.node && !player.node.connected) await player.node.connect()

        if (message.guild.me.voice.channel && player) if (!player.queue) await player.destroy()

        if (!player) player = client.distube.getQueue(message)

        try {
            await command.run(client, message, args, args.join(' '), player, es, lang, prefix)
        } catch (err) {
            message.reply(`an error occurred while running the command: ${err.message}`)
        }
        await message.delete()
    }
}
