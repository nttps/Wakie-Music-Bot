module.exports = {
    once: true,
    run: async (client) => {
        client.manager.init(client.user.id)
        console.log(`${client.user.username} online!`, 'ready')
        console.log(`Ready on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users`, 'ready')
    }
}
