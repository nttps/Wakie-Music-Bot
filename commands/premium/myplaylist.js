const { embedsActionBy, pageQueue } = require('@utils/generateEmbed')
const delay = require('delay')
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js')
const { TrackUtils } = require('erela.js')

module.exports = {
    name: `myplaylist`,
    category: `💰 Premium`,
    aliases: [`myplaylists`, `myplaylist`, `อัลบั้ม`],
    description: `Saves the Current Queue onto a Name`,
    extracustomdesc:
        '`myplaylist create`, `myplaylist addcurrenttrack`, `myplaylist addcurrentqueue`, `myplaylist removetrack`, `myplaylist removedupes`, `myplaylistshowall`, `myplaylist showdetails`, `myplaylist createsave`, `myplaylist delete`, `myplaylist play`, `myplaylist shuffle`',
    usage: `\`myplaylist <Type> <Name> [Options]\`\n
  **Types**:
  > \`create\`, \`addcurrenttrack\`, \`addcurrentqueue\`, \`removetrack\`, \`removedupes\`, \`showall\`, \`showdetails\`, \`createsave\`, \`delete\`, \`play\`, \`shuffle\`
  **Name**:
  > \`Can be anything with maximum of 10 Letters\`
  **Options**:
  > \`pick the track which you want to remove\``,
    joinchannel: true,
    run: async (client, message, args, query, player, es, lang, prefix) => {
        const { member } = message
        let Type = args[0]
        let Name = args[1]
        let Options = args.slice(2).join(` `)
        if (!Type)
            return message.reply({
                embeds: [embedsActionBy('กรอกสิ่งที่จะจัดการในเพลย์ลิส')]
            })

        switch (Type.toLowerCase()) {
            case `addcurrenttrack`:
                {
                    checkNameIsEmpty(message, Name)
                    checkNameLength(message, Name, 10)
                    const playlist = client.playlists.get(message.author.id, `${Name}`)
                    if (!playlist)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่มีเพลย์ลิสนี้`).setDescription(`สร้างเพลย์ลิสด้วยการ พิมพ์ \`${prefix}saveplaylist create ${Name}\``)]
                        })
                    //get the player instance
                    var player = client.manager.get(message.guild.id)
                    //if no player available return error | aka not playing anything
                    if (!player)
                        return message.reply({
                            embeds: [embedsActionBy('ไม่มีการเล่นเพลงอยู่ในตอนนี้')]
                        })
                    //get the current track
                    const track = player.queue.current
                    //if there are no other tracks, information
                    if (!track)
                        return message.reply({
                            embeds: [embedsActionBy('ไม่มีการเล่นเพลงอยู่ในตอนนี้')]
                        })
                    let oldtracks = client.playlists.get(message.author.id, `${Name}`)
                    if (!Array.isArray(oldtracks)) oldtracks = []
                    //add the track
                    oldtracks.push({
                        title: track.title,
                        url: track.uri
                    })
                    //save it in the db
                    client.playlists.set(message.author.id, oldtracks, `${Name}`)
                    //return susccess message
                    return message.reply({
                        embeds: [embedsActionBy(`เพิ่มเพลง ${track.title} ในเพลย์ลิส \`${Name}\` แล้ว `)]
                    })
                }
                break
            case `addcurrentqueue`:
                {
                    checkNameIsEmpty(message, Name)
                    checkNameLength(message, Name, 10)
                    const playlist = client.playlists.get(message.author.id, `${Name}`)
                    if (!playlist)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่มีเพลย์ลิสนี้`).setDescription(`สร้างเพลย์ลิสด้วยการ พิมพ์ \`${prefix}saveplaylist create ${Name}\``)]
                        })
                    //get the player instance
                    var player = client.manager.get(message.guild.id)
                    //if no player available return error | aka not playing anything
                    if (!player)
                        return message.reply({
                            embeds: [embedsActionBy('ไม่มีการเล่นเพลงอยู่ในตอนนี้')]
                        })
                    const tracks = player.queue
                    //if there are no other tracks, information
                    if (!tracks.length)
                        return message.reply({
                            embeds: [embedsActionBy('ไม่มีคิวเพลงที่ฟังอยู่ในขณะนี้')]
                        })
                    //get the old tracks from the Name
                    let oldtracks = client.playlists.get(message.author.id, `${Name}`)
                    if (!Array.isArray(oldtracks)) oldtracks = []
                    const newtracks = []

                    for (const track of tracks)
                        newtracks.push({
                            title: track.title,
                            url: track.uri
                        })

                    if (player.queue.current)
                        newtracks.push({
                            title: player.queue.current.title,
                            url: player.queue.current.uri
                        })
                    //define the new customqueue by adding the newtracks to the old tracks
                    let newqueue = oldtracks.concat(newtracks)
                    //save the newcustomqueue into the db
                    client.playlists.set(message.author.id, newqueue, `${Name}`)
                    //return susccess message
                    return message.reply({
                        embeds: [
                            embedsActionBy(
                                `${emoji.msg.SUCCESS} เพิ่มเพลง ${tracks.length} เพลงในเพลย์ลิส \`${Name}\` แล้ว \n ตอนนี้มีทั้งหมด \`${newqueue.length} เพลง\`\n\nเล่นเพลย์ลิสนี้โดย พิมพ์: \`${prefix}playlists play ${Name}\``
                            )
                        ]
                    })
                }
                break
            case `removetrack`:
            case `removesong`:
                {
                    checkNameIsEmpty(message, Name)
                    checkNameLength(message, Name, 10)
                    checkOption(Options)
                    const playlist = client.playlists.get(message.author.id, `${Name}`)
                    if (!playlist)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่มีเพลย์ลิสนี้`).setDescription(`สร้างเพลย์ลิสด้วยการ พิมพ์ \`${prefix}playlists create ${Name}\``)]
                        })

                    if (Number(Options) >= playlist.length || Number(Options) < 0)
                        return message.reply({
                            embeds: [embedsActionBy(`ค่าที่ควรใส่อยู่ที่ (\`0\` - \`${tracks.length - 1}\`)`)]
                        })
                    let deletetrack = tracks[Number(Options)]
                    //delete it
                    delete tracks[Number(Options)]
                    //remove empty spaces
                    tracks = tracks.filter(function (entry) {
                        return /\S/.test(entry)
                    })
                    //save it on the db again
                    client.playlists.set(message.author.id, tracks, `${Name}`)
                    //return susccess message
                    return message.reply({
                        embeds: [embedsActionBy(`<a:yes:833101995723194437> ลบเพลง ${deletetrack.title} ในเพลย์ลิส \`${Name}\``)]
                    })
                }
                break
            case `shuffle`:
            case `mix`:
                {
                }
                break
            case `showall`:
            case `listall`:
            case `show`:
            case `queue`:
            case `list`:
                {
                    let queues = client.playlists.get(message.author.id)
                    var Emoji_Pages = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
                    if (Object.size(queues) <= 1)
                        return message.reply({
                            embeds: [embedsActionBy(`สร้างเพลย์ลิสโดย \`${prefix}saveplaylist create <ชื่อเพลย์ลิสที่ต้องการบันทึก>\``)]
                        })
                    let newData = []
                    let i = 0
                    for (const item in queues) {
                        if (item === `TEMPLATEQUEUEINFORMATION`) continue
                        newData.push({
                            label: item,
                            value: item,
                            description: `${item} | ${queues[item].length} เพลง`,
                            emoji: Emoji_Pages[i]
                        })
                        i++
                    }

                    const musicmixMenu = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId('myplaylist_list').addOptions(newData))

                    message.reply({
                        content: 'เลือก Playlist ของคุณ',
                        components: [musicmixMenu]
                    })
                }
                break
            case `add`:
            case `เพิ่ม`:
            case `เพลง`:
                {
                    if (!Name) {
                        let playlists = client.playlists.get(message.author.id)
                        let description = ``
                        for (const item in playlists) {
                            if (item === `TEMPLATEQUEUEINFORMATION`) continue
                            description += `**❯ ${item}** | \`${playlists[item].length} Tracks\`\n`
                        }
                        //return susccess mess
                        return message.reply({
                            embeds: [
                                embedsActionBy(
                                    `${emoji.msg.ERROR} ผิดพลาด | ไม่ได้ใส่ชื่อเพลย์ลิส \nการใช้งาน: ${prefix}saveplaylist add \`<ชื่อเพลย์ลิสที่เพิ่มเพลง>\` <ชื่อเพลง/ลิงก์>\n\n\n ${description}`
                                )
                            ]
                        })
                    }
                    const playlist = client.playlists.get(message.author.id, `${Name}`)
                    if (!playlist)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่มีเพลย์ลิสนี้`).setDescription(`สร้างเพลย์ลิสด้วยการ พิมพ์ \`${prefix}saveplaylist create ${Name}\``)]
                        })

                    if (!Options)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่ได้ใส่ชื่อเพลง`).setDescription(`การใช้งาน: ${prefix}saveplaylist add ${Name} \`<ชื่อเพลง/ลิงก์>\`\n`)]
                        })

                    try {
                        // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
                        res = await client.manager.search(Options, message.author)

                        let oldtracks = client.playlists.get(message.author.id, `${Name}`)

                        if (!Array.isArray(oldtracks)) oldtracks = []

                        // Check the load type as this command is not that advanced for basics
                        if (res.loadType === 'LOAD_FAILED') throw res.exception
                        else if (res.loadType === 'NO_MATCHES') return message.reply('there was no tracks found with that query.')
                        else if (res.loadType === 'PLAYLIST_LOADED') {
                            const newtracks = []

                            for (const track of res.tracks) {
                                const found = oldtracks.some((el) => el.id === track.identifier)
                                if (!found)
                                    newtracks.push({
                                        id: track.identifier,
                                        title: track.title,
                                        url: track.uri
                                    })
                            }
                            //define the new customqueue by adding the newtracks to the old tracks
                            let newqueue = oldtracks.concat(newtracks)
                            //save the newcustomqueue into the db
                            client.playlists.set(message.author.id, newqueue, `${Name}`)

                            return message.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setAuthor({
                                            name: `เพิ่มเพลง ${newtracks.length} เพลงในเพลย์ลิส ${Name} แล้ว`,
                                            url: null
                                        })
                                        .setDescription(`ตอนนี้มี \`${newqueue.length} เพลง\` \n\nเล่นเพลย์ลิสโดย พิมพ์: \`${prefix}saveplaylist play ${Name}\``)
                                        .setColor('RANDOM')
                                ]
                            })
                        } else {
                            const found = oldtracks.some((el) => el.id === res.tracks[0].identifier)

                            console.log(res.tracks[0])
                            if (!found) {
                                oldtracks.push({
                                    id: res.tracks[0].identifier,
                                    title: res.tracks[0].title,
                                    url: res.tracks[0].uri
                                })
                                //save it in the db
                                client.playlists.set(message.author.id, oldtracks, `${Name}`)

                                //return susccess message
                                return message.reply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setAuthor({
                                                name: `เพิ่มเพลง ${res.tracks[0].title} ลงใน Playlist ${Name} แล้ว`,
                                                url: null
                                            })

                                            .setDescription(
                                                `ตอนนี้มี \`${client.playlists.get(message.author.id, `${Name}`).length} เพลง\`\n\nเล่นเพลย์ลิสโดย พิมพ์: \`${prefix}playlists play ${Name}\``
                                            )
                                    ]
                                })
                            }
                            return message.reply({
                                embeds: [new MessageEmbed().setTitle(`ผิดพลาด | มีเพลงนี้ในเพลย์ลิสแล้ว`).setDescription(`เพลงนี้มีอยู่ในเพลย์ลิส ${Name} แล้ว`)]
                            })
                        }
                    } catch (err) {
                        return message.reply(`there was an error while searching: ${err.message}`)
                    }
                }
                break
            case `create`:
            case `createsave`:
            case `cs`:
            case `save`:
            case `สร้าง`:
            case `save`:
                {
                    checkNameIsEmpty(message, Name)
                    checkNameLength(message, Name, 10)
                    const playlist = client.playlists.get(message.author.id, `${Name}`)
                    if (playlist)
                        return message.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('RED')
                                    .setTitle(`ผิดพลาด | คุณมีเพลย์ลิส ${Name} อยู่แล้ว`)
                                    .setDescription(
                                        `เพิ่มเพลงลงเพลย์ลิสโดย \n\`${prefix}saveplaylist add ${Name} <ชื่อเพลง/ลิงก์>\`\nเพิ่มคิวเพลงปัจจุบันลงในเพลย์ลิส : \`${prefix}saveplaylist addcurrentqueue ${Name}\`\nเพิ่มเพลงปัจจุบันลงในเพลย์ลิส: \`${prefix}saveplaylist addcurrenttrack ${Name}\``
                                    )
                            ]
                        })

                    //save the newcustomqueue into the db
                    client.playlists.set(
                        message.author.id,
                        {
                            TEMPLATEQUEUEINFORMATION: [`queue`, `sadasd`]
                        },
                        `${Name}`
                    )

                    //return susccess message
                    return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`สำเร็จ | สร้างเพลยลิส ${Name} แล้ว`)
                                .setDescription(
                                    `เพิ่มเพลงลงในเพลย์ลิส : \`${prefix}saveplaylist add ${Name} <ชื่อเพลง/ลิงก์>\`\nเพิ่มคิวเพลงปัจจุบันลงในเพลย์ลิส : \`${prefix}saveplaylist addcurrentqueue ${Name}\`\nเพิ่มเพลงปัจจุบันลงในเพลย์ลิส: \`${prefix}saveplaylist addcurrenttrack ${Name}\``
                                )
                                .setColor('GREEN')
                                .setFooter({
                                    text: `💢 จัดการโดย: ${member.user.tag}`,
                                    iconURL: member.user.displayAvatarURL({
                                        dynamic: true
                                    })
                                })
                        ]
                    })
                }
                break
            case `delete`:
            case `remove`:
            case `del`:
            case `ลบ`:
                {
                    checkNameIsEmpty(message, Name)
                    checkNameLength(message, Name, 10)

                    const playlist = client.playlists.get(message.author.id, `${Name}`)
                    if (!playlist)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่มีเพลย์ลิสนี้`).setDescription(`ไม่สามารลบได้เพราะไม่มีอัลบั้มนี้`)]
                        })

                    client.playlists.delete(message.author.id, `${Name}`)

                    //return susccess message
                    return message
                        .reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle(`สำเร็จ | ลบเพลยลิส`)
                                    .setDescription(`เพลย์ลิส ${Name} ได้ถูกลบแล้ว`)
                                    .setColor('GREEN')
                                    .setFooter({
                                        text: `💢 จัดการโดย: ${member.user.tag}`,
                                        iconURL: member.user.displayAvatarURL({
                                            dynamic: true
                                        })
                                    })
                            ]
                        })
                        .then(async (msg) => {
                            await delay(4000)
                            return msg.delete()
                        })
                }
                break
            case `play`:
            case `load`:
            case `p`:
            case `paly`:
                {
                    checkNameIsEmpty(message, Name)
                    checkNameLength(message, Name, 10)
                    //get the channel instance from the Member
                    const { channel } = message.member.voice
                    //if the member is not in a channel, return
                    if (!channel)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('REND').setTitle('เข้าห้อง')]
                        })
                    const mechannel = message.guild.me.voice.channel
                    //get the player instance
                    var player = client.manager.players.get(message.guild.id)
                    let playercreate = false
                    if (!player) {
                        player = client.manager.create({
                            guild: message.guild.id,
                            voiceChannel: message.member.voice.channel.id,
                            textChannel: message.channel.id,
                            selfDeafen: true
                        })
                        player.connect()
                        player.set('message', message)
                        player.set('playerauthor', message.author.id)
                        playercreate = true
                    }
                    //if not in the same channel as the player, return Error
                    if (player && channel.id !== player.voiceChannel)
                        return message.reply({
                            embeds: [new MessageEmbed().setTitle('if not in the same channel as the player, return Error')]
                        })
                    //If there is no player, then kick the bot out of the channel, if connected to
                    if (!player && mechannel) {
                        message.guild.me.voice.disconnect().catch((e) => console.log('This prevents a Bug'))
                    }
                    //if not in the same channel --> return
                    if (mechannel && channel.id !== mechannel.id)
                        return message.reply({
                            embeds: [new MessageEmbed().setDescription(` //if not in the same channel --> return`)]
                        })
                    //if the queue does not exist yet, error
                    if (!client.playlists.get(message.author.id, `${Name}`))
                        return message.reply({
                            embeds: [new MessageEmbed().setDescription(` //if the queue does not exist yet, error`)]
                        })
                    //now add every track of the tracks
                    let tempmsg = await message.reply({
                        embeds: [new MessageEmbed().setDescription(` //now add every track of the tracks`)]
                    })

                    for (const track of client.playlists.get(message.author.id, `${Name}`)) {
                        try {
                            // Advanced way using the title, author, and duration for a precise search.
                            const unresolvedTrack = TrackUtils.buildUnresolved(
                                {
                                    title: track.title,
                                    url: track.url
                                },
                                message.author
                            )
                            player.queue.add(unresolvedTrack)
                        } catch (e) {
                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                            continue
                        }
                    }
                    //return susccess message - by editing the old temp msg
                    tempmsg.edit({
                        embeds: [new MessageEmbed().setDescription(`กำลังเล่น Playlist ${Name}`).setColor('BLURPLE')]
                    })
                    if (playercreate) player.play()
                }
                break
            case `showdetails`:
            case `showdetail`:
            case `details`:
                {
                    checkNameIsEmpty(message, Name)
                    checkNameLength(message, Name, 10)

                    const playlist = client.playlists.get(message.author.id, `${Name}`)
                    if (!playlist)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่มีเพลย์ลิสนี้`).setDescription(`ไม่สามารลบได้เพราะไม่มีอัลบั้มนี้`)]
                        })

                    const tracks = client.playlists.get(message.author.id, `${Name}`)
                    //if the queue does not exist yet, error
                    if (!tracks.length)
                        return message.reply({
                            embeds: [new MessageEmbed().setColor('RED').setDescription(` empty playlists`)]
                        })

                    return pageQueue(message, tracks)
                }
                break
            default:
                break
        }
    }
}

/**
 * It checks if the name is empty. If it is empty, it will return the message.reply() function with the
 * embeds.
 * @param message - The message object that was sent by the user.
 * @param name - The name of the command.
 * @returns The `checkNameIsEmpty` function returns a `Promise` object.
 */
function checkNameIsEmpty(message, name) {
    if (!name)
        return message.reply({
            embeds: [new MessageEmbed().setColor('RED').setTitle('ข้อมูลผิดพลาด').setDescription('กรอกชื่อเพลย์ลิส')]
        })
}

/**
 * It checks if the user has entered a song name. If not, it will return an error message.
 * @param option - The name of the song you want to play.
 * @returns The bot will return the song name and the artist name.
 */
function checkOption(option) {
    if (!option)
        return message.reply({
            embeds: [new MessageEmbed().setColor('RED').setTitle('ข้อมูลผิดพลาด').setDescription('กรอกชื่อเพลง')]
        })
}

/**
 * It checks if the length of the name is greater than the length specified.
 * @param message - The message object that was sent by the user.
 * @param name - The name of the command.
 * @param length - The maximum length of the name.
 * @returns a message object.
 */
function checkNameLength(message, name, length) {
    if (name.length > length)
        return message.reply({
            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | กรอกตัวอักษรมากกว่า ${length}`).setDescription(`กรอกตัวอักษรห้ามมากกว่า ${length}`)]
        })
}

/* The function returns the number of properties in an object. */
Object.size = function (obj) {
    var size = 0,
        key
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++
    }
    return size
}
