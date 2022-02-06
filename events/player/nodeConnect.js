const delay = require('delay')
const chalk = require('chalk')
const { TrackUtils } = require(`erela.js`)
let started = false

module.exports = {
    run: async (client, node) => {
        console.log(chalk.green(`[INFORMATION] (${String(new Date()).split(' ', 5).join(' ')}) Node ${node.options.identifier} Connected`))
        if (!started) {
            started = true
            setTimeout(() => autoconnect(client), 2 * client.ws.ping)
        }
        setTimeout(() => {
            started = false
        }, 5000)
    }
}

const autoconnect = async (client) => {
    await delay(500)
    let guilds = client.autoresume.keyArray()
    if (!guilds || guilds.length == 0) return
    for (const gId of guilds) {
        try {
            let guild = client.guilds.cache.get(gId)
            if (!guild) {
                client.autoresume.delete(gId)
                console.log(`[AUTORESUME] Bot got Kicked out of the Guild`)
                continue
            }
            var data = client.autoresume.get(gId)
            if (!data) continue

            let voiceChannel = guild.channels.cache.get(data.voiceChannel)
            if (!voiceChannel) voiceChannel = (await guild.channels.fetch(data.voiceChannel).catch(() => {})) || false
            if (!voiceChannel || !voiceChannel.members || voiceChannel.members.filter((m) => !m.user.bot && !m.voice.deaf && !m.voice.selfDeaf).size < 1) {
                client.autoresume.delete(gId)
                console.log(`[AUTORESUME] Voice Channel is either Empty / no Listeners / got deleted`)
                continue
            }

            let textChannel = guild.channels.cache.get(data.textChannel)
            if (!textChannel) textChannel = (await guild.channels.fetch(data.textChannel).catch(() => {})) || false
            if (!textChannel) {
                client.autoresume.delete(gId)
                console.log(`[AUTORESUME] Text Channel got deleted`)
                continue
            }

            let player = await client.manager.create({
                guild: data.guild,
                voiceChannel: data.voiceChannel,
                textChannel: data.textChannel,
                selfDeafen: true
            })
            player.set('autoresume', true)
            if (player && player.node && !player.node.connected) await player.node.connect()
            await player.connect()
            if (data.current && data.current.identifier) {
                const buildTrack = async (data) => {
                    return data.track && data.identifier
                        ? TrackUtils.build(
                              {
                                  track: data.track,
                                  info: {
                                      title: data.title || null,
                                      identifier: data.identifier,
                                      author: data.author || null,
                                      length: data.length || data.duration || null,
                                      isSeekable: !!data.isStream,
                                      isStream: !!data.isStream,
                                      uri: data.uri || null,
                                      thumbnail: data.thumbnail || null
                                  }
                              },
                              data.requester ? client.users.cache.get(data.requester) || (await client.users.fetch(data.requester).catch(() => {})) || null : null
                          )
                        : TrackUtils.buildUnresolved(
                              {
                                  title: data.title || '',
                                  author: data.author || '',
                                  duration: data.duration || 0
                              },
                              data.requester ? client.users.cache.get(data.requester) || (await client.users.fetch(data.requester).catch(() => {})) || null : null
                          )
                }
                player.queue.add(await buildTrack(data.current))
                player.set('playerauthor', data.current.requester)
                player.play()
                if (data.queue.length) for (let track of data.queue) player.queue.add(await buildTrack(track))
            } else if (data.queue && data.queue.length) {
                const track = await buildTrack(data.queue.shift())
                player.queue.add(track)
                player.play()
                if (data.queue.length) for (let track of data.queue) player.queue.add(await buildTrack(track))
            } else {
                player.destroy()
                console.log(`[AUTORESUME] Destroyed the player, because there are no tracks available`)
                continue
            }
            console.log(`[AUTORESUME] Added ${player.queue.length} Tracks on the QUEUE and started playing ${player.queue.current.title} in ${guild.name}`)

            //ADJUST THE QUEUE SETTINGS
            player.set('pitchvalue', data.pitchvalue)
            await player.setVolume(data.volume)
            if (data.queueRepeat) {
                player.setQueueRepeat(data.queueRepeat)
            }
            if (data.trackRepeat) {
                player.setTrackRepeat(data.trackRepeat)
            }
            if (!data.playing) {
                player.pause(true)
            }
            await player.seek(data.position)

            client.autoresume.delete(player.guild)
            console.log('changed autoresume track to queue adjustments + deleted the database entry')
            if (data.playing) {
                setTimeout(() => {
                    player.pause(true)
                    setTimeout(() => player.pause(false), client.ws.ping * 2)
                }, client.ws.ping * 2)
            }
            await delay(1000)
        } catch (e) {
            console.log(e)
        }
    }
}
