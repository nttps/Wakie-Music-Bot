const { readdirSync } = require('fs')

module.exports = async (client) => {
    var langs = readdirSync('@languages')
    for (const lang of langs.filter((file) => file.endsWith('.json'))) {
        client.langs[`${lang.split('.json').join('')}`] = require(`./languages/${lang}`)
    }
    Object.freeze(client.langs)
}
