const chalk = require('chalk')
const delay = require('delay')
const { readdirSync } = require('fs')
const CONFIG = require('@settings/config')

module.exports = async (client) => {
    try {
        initManager(client)
    } catch (e) {
        console.log(e)
    }
    await delay(4000)

    console.log(chalk.greenBright(`[INFORMATION] Player Events Loaded`))
}

function initManager(client) {
    readdirSync('./events/player/').forEach((file) => {
        delete require.cache[file]

        const event = require(`${process.cwd()}/events/player/${file}`)
        let eventName = file.split('.')[0]
        client.manager.on(eventName, (...args) => event.run(client, ...args))
    })
}
