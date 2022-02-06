const chalk = require('chalk')
const delay = require('delay')
const { readdirSync } = require('fs')

module.exports = async (client) => {
    try {
        readdirSync('./events/distube/').forEach((file) => {
            delete require.cache[file]

            const event = require(`${process.cwd()}/events/distube/${file}`)
            let eventName = file.split('.')[0]
            client.distube.on(eventName, (...args) => event(client, ...args))
        })
    } catch (e) {
        console.log(e)
    }
    await delay(4000)

    console.log(chalk.greenBright(`[INFORMATION] Distube Events Loaded`))
}
