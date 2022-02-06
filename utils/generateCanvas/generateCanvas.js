const { createCanvas, loadImage } = require('canvas')

const generateCanvas = async (client, guildId, leave) => {
    const canvas = createCanvas(1024, 500)
    const context = canvas.getContext('2d')

    const background = await Canvas.loadImage('./assets/background.jpg')
    context.drawImage(background, 0, 0, canvas.width, canvas.height)

    context.strokeStyle = '#0099ff'
    context.strokeRect(0, 0, canvas.width, canvas.height)

    context.font = '28px sans-serif'
    context.fillStyle = '#ffffff'
    context.fillText('Profile', canvas.width / 2.5, canvas.height / 3.5)

    context.font = applyText(canvas, `${interaction.member.displayName}!`)
    context.fillStyle = '#ffffff'
    context.fillText(`${interaction.member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8)

    context.beginPath()
    context.arc(125, 125, 100, 0, Math.PI * 2, true)
    context.closePath()
    context.clip()

    const avatar = await loadImage(interaction.user.displayAvatarURL({ format: 'jpg' }))
    context.drawImage(avatar, 25, 25, 200, 200)

    const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png')
}
