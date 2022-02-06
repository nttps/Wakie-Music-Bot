module.exports = {
    name: `autoplay`,
    category: `🎶 เพลง`,
    aliases: [`ap`, `toggleauto`, `toggleautoplay`, `toggleap`],
    description: `Toggles Autoplay on/off`,
    usage: `autoplay`,
    parameters: {
        type: 'music',
        activeplayer: true,
        check_dj: true,
        previoussong: false
    },
    type: 'music',
    joinchannel: true,
    run: async (client, message, args, query, player, es, lang) => {
        this.doIt(client, player)
    }
}

async function doIt(client, player, type) {
    let es = client.settings.get(player.guild, 'embed')
    let ls = client.settings.get(player.guild, 'language')
    try {
        if (player.queue.length > 0) return
        const previoustrack = player.get('previoustrack') || player.queue.current
        if (!previoustrack) return

        const mixURL = `https://www.youtube.com/watch?v=${previoustrack.identifier}&list=RD${previoustrack.identifier}`
        const response = await client.manager.search(mixURL, previoustrack.requester)

        //if nothing is found, send error message, plus if there  is a delay for the empty QUEUE send error message TOO
        if (!response || response.loadType === 'LOAD_FAILED' || response.loadType !== 'PLAYLIST_LOADED') {
            let embed = new MessageEmbed().setTitle(`ไม่พบเพลงล่าสุด`).setDescription(`ออกจากห้องเพราะไม่มีเพลงในคิวแล้ว`).setColor(es.wrongcolor).setFooter(client.getFooter(es))
            client.channels.cache
                .get(player.textChannel)
                .send({
                    embeds: [embed]
                })
                .then(async (msg) => {
                    await delay(3000)
                    await msg.delete()
                })
                .catch((e) => console.log('THIS IS TO PREVENT A CRASH'))
            if (type != 'skip') {
                return setTimeout(() => {
                    try {
                        player = client.manager.get(player.guild)
                        if (player.queue.size === 0) {
                            let embed = new MessageEmbed()
                            try {
                                embed.setTitle(`เพลงไม่มีในคิวแล้ว`)
                            } catch {}
                            try {
                                embed.setDescription(`ออกจากห้องเพราะไม่มีเพลงในคิวแล้ว`)
                            } catch {}
                            try {
                                embed.setColor(es.wrongcolor)
                            } catch {}
                            try {
                                embed.setFooter({ text: client.user.username, iconUrl: client.user.displayAvatarURL() })
                            } catch {}
                            client.channels.cache
                                .get(player.textChannel)
                                .send({
                                    embeds: [embed]
                                })
                                .then(async (msg) => {
                                    await delay(3000)
                                    await msg.delete()
                                })
                                .catch((e) => console.log('THIS IS TO PREVENT A CRASH'))
                            try {
                                client.channels.cache
                                    .get(player.textChannel)
                                    .messages.fetch(player.get('playermessage'))
                                    .then(async (msg) => {
                                        try {
                                            await delay(7500)
                                            msg.delete().catch(() => {})
                                        } catch {
                                            /* */
                                        }
                                    })
                                    .catch(() => {})
                            } catch (e) {
                                console.log(e.stack)
                            }
                            player.destroy()
                        }
                    } catch (e) {
                        console.log(e.stack)
                    }
                }, 6000)
            } else {
                player.destroy()
            }
        }
        return player.play(response.tracks[2])
    } catch (e) {
        console.log(e.stack)
    }
}

module.exports.doIt = doIt
