const { embedsActionBy } = require('@utils/generateEmbed')
const { MessageEmbed } = require('discord.js')
const EMOJIS = require('@settings/emojis')

module.exports = {
    name: 'create',
    description: 'Play a song/playlist or search for a song from youtube',
    usage: '<results>',
    category: 'music',
    accessableby: 'Member',
    aliases: ['สร้าง', 'เพิ่มเพลง', 'ลบ'],
    parameters: {
        type: 'music',
        activeplayer: false,
        previoussong: false
    },
    joinchannel: true,
    type: 'playlist',
    run: async (client, message, args, query, player, command, lang, prefix) => {
        const { member } = message
        let Type = args[0]
        let Name = args[1]
        let Options = args.slice(2).join(` `)

        if (command === 'สร้าง' || command === 'create') return createInit(client, message, Type, Name, member, prefix)
        if (command === 'เพิ่มเพลง') return addMusicInit(client, message, Type, Name, member, prefix)
        if (command === 'ลบ') return removeInit(client, message, Type, Name, member, prefix)
    }
}

function createInit(client, message, Type, Name, member, prefix) {
    switch (Type.toLowerCase()) {
        case `เพลย์ลิส`:
        case `อัลบั้ม`:
        case `playlist`:
        case `myplaylist`:
        case `myalbum`:
            {
                if (!Type)
                    return message.reply({
                        embeds: [embedsActionBy(`RED`, 'ต้องการสร้างอะไร ? ใส่ประเภทที่จะสร้าง')]
                    })

                if (!Name)
                    return message.reply({
                        embeds: [embedsActionBy(`RED`, `ใส่ชื่ออัลบั้ม โดย \`${prefix}สร้าง อัลบั้ม <ชื่อเพลย์ลิสที่ต้องการบันทึก>\``)]
                    })

                const playlist = client.playlists.get(message.author.id, `${Name}`)
                if (playlist)
                    return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor('RED')
                                .setTitle(`ผิดพลาด | คุณมีเพลย์ลิส ${Name} อยู่แล้ว`)
                                .setDescription(`เพิ่มเพลงลงเพลย์ลิสโดย \n\`${prefix}เพิ่มเพลง <ชื่อเพลง/ลิงก์> <อัลบั้ม>\``)
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
                                `เพิ่มเพลงลงในเพลย์ลิส : \`${prefix}เพิ่มเพลง <ชื่อเพลง/ลิงก์> <ชื่อเพลย์ลิส/อัลบั้ม>\`\nเพิ่มคิวเพลงปัจจุบันลงในเพลย์ลิส : \`${prefix}saveplaylist addcurrentqueue ${Name}\`\nเพิ่มเพลงปัจจุบันลงในเพลย์ลิส: \`${prefix}saveplaylist addcurrenttrack ${Name}\``
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
    }
}

async function addMusicInit(client, message, music, playlist, member, prefix) {
    if (!music)
        return message.reply({
            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่ได้ใส่ชื่อเพลง`).setDescription(`การใช้งาน: ${prefix}เพิ่มเพลง \`<ชื่อเพลง/ลิงก์>\` \`<ชื่อเพลย์ลิส/อัลบั้ม>\``)]
        })

    if (!playlist) {
        let playlists = client.playlists.get(message.author.id)
        let description = ``
        for (const item in playlists) {
            if (item === `TEMPLATEQUEUEINFORMATION`) continue
            description += `**❯ อัลบั้ม ${item}** | \`${playlists[item].length || 0} เพลง\`\n`
        }
        //return susccess mess
        return message.reply({
            embeds: [embedsActionBy(`RED`, `${EMOJIS.MSG.ERROR} ผิดพลาด | ไม่ได้ใส่ชื่อเพลย์ลิส \nการใช้งาน: ${prefix}เพิ่มเพลง \`${music}\` \`<ชื่อเพลย์ลิส/อัลบั้ม>\`\n\n\n ${description}`)]
        })
    }

    const playlistIsAlready = client.playlists.get(message.author.id, `${playlist}`)
    if (!playlistIsAlready)
        return message.reply({
            embeds: [new MessageEmbed().setColor('RED').setTitle(`ผิดพลาด | ไม่มีเพลย์ลิสนี้`).setDescription(`สร้างอัลบั้ม โดย \`${prefix}สร้าง อัลบั้ม <ชื่อเพลย์ลิสที่ต้องการบันทึก>\``)]
        })

    try {
        // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
        res = await client.manager.search(music, message.author)

        let oldtracks = client.playlists.get(message.author.id, `${playlist}`)

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
            client.playlists.set(message.author.id, newqueue, `${playlist}`)

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor({
                            name: `เพิ่มเพลง ${newtracks.length} เพลงในเพลย์ลิส ${playlist} แล้ว`,
                            url: null
                        })
                        .setDescription(`ตอนนี้มี \`${newqueue.length} เพลง\` \n\nเล่นเพลย์ลิสโดย พิมพ์: \`${prefix}เล่น เพลย์ลิส ${playlist}\``)
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
                client.playlists.set(message.author.id, oldtracks, `${playlist}`)

                //return susccess message
                return message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor({
                                name: `เพิ่มเพลง ${res.tracks[0].title} ลงใน Playlist ${playlist} แล้ว`,
                                url: null
                            })

                            .setDescription(`ตอนนี้มี \`${client.playlists.get(message.author.id, `${playlist}`).length} เพลง\`\n\nเล่นเพลย์ลิสโดย พิมพ์: \`${prefix}เล่น เพลย์ลิส ${playlist}\``)
                    ]
                })
            }
            return message.reply({
                embeds: [new MessageEmbed().setTitle(`ผิดพลาด | มีเพลงนี้ในเพลย์ลิสแล้ว`).setDescription(`เพลงนี้มีอยู่ในเพลย์ลิส/อัลบั้ม ${playlist} แล้ว`)]
            })
        }
    } catch (err) {
        return message.reply(`there was an error while searching: ${err.message}`)
    }
}
