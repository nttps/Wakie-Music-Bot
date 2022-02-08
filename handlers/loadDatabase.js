const Enmap = require('enmap')

module.exports = (client) => {
    client.stats = new Enmap({
        name: 'stats',
        dataDir: './databases/stats'
    })
    client.musicsettings = new Enmap({
        name: 'musicsettings',
        dataDir: './databases/musicsettings'
    })
    client.autoresume = new Enmap({
        name: 'autoresume',
        dataDir: './databases/musicsettings'
    })

    client.histories = new Enmap({
        name: 'histories',
        dataDir: './databases/musicsettings',
        ensureProps: false
    })
    client.settings = new Enmap({
        name: 'settings',
        dataDir: './databases/settings'
    })
    client.premium = new Enmap({
        name: 'premium',
        dataDir: './databases/premium'
    })
    client.playlists = new Enmap({
        name: 'playlists',
        dataDir: './databases/playlists',
        ensureProps: false
    })

    client.premium.ensure('global', {
        guilds: []
    })

    client.stats.ensure('global', {
        commands: 0,
        songs: 0,
        setups: 0
    })
}
