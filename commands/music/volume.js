const EMBED = require('@settings/embed')
const EMOJIS = require('@settings/emojis')
const { embedsActionBy } = require('@utils/generateEmbed')
const delay = require('delay')

module.exports = {
    name: 'volume',
    description: 'ปรับระดับเสียง',
    usage: '<Volume>',
    category: 'music',
    accessableby: 'Member',
    aliases: ['v', 'vol', 'เสียง'],
    parameters: {
        type: 'music',
        activeplayer: false,
        previoussong: false
    },
    joinchannel: true,
    run: async (client, message, args, query, player, es, lang) => {
        if (!args[0]) {
            return message
                .reply({
                    embeds: [embedsActionBy('RED', `${EMOJIS.MSG.ERROR} อย่าลืมใส่ระดับเสียง`)]
                })
                .then(async (m) => {
                    await delay(2000)
                    m.delete()
                })
        }

        let volume = args[0]
        if (isNaN(volume)) {
            return message
                .reply({
                    embeds: [embedsActionBy('RED', `${EMOJIS.MSG.ERROR} กรอกเป็นตัวเลข`)]
                })
                .then(async (m) => {
                    await delay(2000)
                    m.delete()
                })
        }
        if (Number(volume) > 100 || Number(volume) < 1) {
            return message
                .reply({
                    embeds: [embedsActionBy('RED', `${EMOJIS.MSG.ERROR} กรุณากรอกระหว่างตัวเลข 1 - 100`)]
                })
                .then(async (m) => {
                    await delay(2000)
                    m.delete()
                })
        }

        await player.setVolume(volume)
        client.settings.set(guild.id, Number(player.volume), 'defaultvolume')

        return message.reply({
            embeds: [embedsActionBy('GREEN', `${EMOJIS.MSG.SUCCESS} ระดับเสียงปัจจุบัน ${volume}`)]
        })
    }
}
