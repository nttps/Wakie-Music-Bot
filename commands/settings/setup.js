const { Permissions, MessageEmbed } = require('discord.js')
const { titlePlayer } = require('@utils/generateEmbed')

module.exports = {
    name: 'setup',
    category: '⚙️ ตั้งค่า',
    aliases: ['setupmusic', 'setup'],
    cooldown: 10,
    usage: 'setup-music #Channel',
    description: 'Setup a Music Request Channel',
    memberpermissions: ['ADMINISTRATOR'],
    type: 'music',
    joinchannel: false,
    run: async (client, message, args, query, player, es, lang) => {
        message.guild.channels
            .fetch()
            .then(async (channels) => {
                let commandChannel, musicChannel
                let categoryChannel = await channels.filter((c) => c.type == 'GUILD_CATEGORY').find((x) => x.name == 'NTTPS MUSIC BOT')

                const data = titlePlayer(client, message.guild.id)
                if (!categoryChannel) {
                    return message.guild.channels
                        .create('NTTPS MUSIC BOT', {
                            type: 'GUILD_CATEGORY',
                            position: 1,
                            permissionOverwrites: [
                                {
                                    id: message.guild.id,
                                    allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                                }
                            ]
                        })
                        .then(async (cat) => {
                            commandChannel = await message.guild.channels.create('คำสั่งบอท', {
                                type: 'GUILD_TEXT',
                                parent: cat,
                                permissionOverwrites: [
                                    {
                                        id: message.guild.id,
                                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                                    }
                                ]
                            })

                            musicChannel = await message.guild.channels.create('ขอเพลง', {
                                type: 'GUILD_TEXT',
                                parent: cat,
                                permissionOverwrites: [
                                    {
                                        id: message.guild.id,
                                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                                    }
                                ]
                            })
                            musicChannel.send(data).then((msg) => {
                                client.musicsettings.set(message.guild.id, musicChannel.id, 'channel')
                                client.musicsettings.set(message.guild.id, msg.id, 'message')
                                client.musicsettings.set(message.guild.id, commandChannel.id, 'commandChannel')
                                //send a success message
                                message.reply({
                                    embeds: [new MessageEmbed().setDescription(`คุณมีห้องขอเพลงแล้ว สามารถขอได้ที่ <#${musicChannel.id}> \nพิมพ์คำสั่งต่างๆ ได้ที่ <#${commandChannel.id}>`)]
                                })
                            })
                        })
                }

                musicChannel = await channels.filter((c) => c.type == 'GUILD_TEXT').find((x) => x.name == 'ขอเพลง' && x.parentId == categoryChannel.id)

                if (!musicChannel) {
                    musicChannel = await message.guild.channels.create('ขอเพลง', {
                        type: 'GUILD_TEXT',
                        parent: categoryChannel,
                        permissionOverwrites: [
                            {
                                id: message.guild.id,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                            }
                        ]
                    })
                }

                commandChannel = await channels.filter((c) => c.type == 'GUILD_TEXT').find((x) => x.name == 'คำสั่งบอท' && x.parentId == categoryChannel.id)

                if (!commandChannel) {
                    commandChannel = await message.guild.channels.create('คำสั่งบอท', {
                        type: 'GUILD_TEXT',
                        parent: categoryChannel,
                        permissionOverwrites: [
                            {
                                id: message.guild.id,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                            }
                        ]
                    })
                }

                musicChannel.send(data).then((msg) => {
                    client.musicsettings.set(message.guild.id, musicChannel.id, 'channel')
                    client.musicsettings.set(message.guild.id, msg.id, 'message')
                    client.musicsettings.set(message.guild.id, commandChannel.id, 'commandChannel')
                    //send a success message
                    return message.reply({ embeds: [new MessageEmbed().setDescription(`คุณมีห้องขอเพลงแล้ว สามารถขอได้ที่ <#${musicChannel.id}> \nพิมพ์คำสั่งต่างๆ ได้ที่ <#${commandChannel.id}>`)] })
                })
            })
            .catch(console.error)
    }
}
