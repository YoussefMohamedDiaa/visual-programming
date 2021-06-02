import { Application } from '@pixi/app'

import { Renderer } from '@pixi/core'

import { BatchRenderer } from '@pixi/core'
Renderer.registerPlugin('batch', BatchRenderer)

import { TickerPlugin } from '@pixi/ticker'
Application.registerPlugin(TickerPlugin)

import { AppLoaderPlugin } from '@pixi/loaders'
Application.registerPlugin(AppLoaderPlugin)

import { Sprite } from '@pixi/Sprite'

const app = new Application({
    autoResize: true,
    resolution: devicePixelRatio,
    backgroundColor: 0x1099bb
})
document.getElementById('canvas').appendChild(app.view)

let catSprite = null

app.loader.add('cat', './assets/cat.png')
app.loader.load(() => {
    catSprite = Sprite.from('cat')
    catSprite.scale.set(0.2, 0.2)
    catSprite.anchor.set(0.5)

    app.stage.addChild(catSprite)

    catSprite.x = app.screen.width * 0.5
    catSprite.y = app.screen.height * 0.5

    app.ticker.add((delta) => {
        catSprite.rotation += 0.02 * delta
    })
})

const inputElement = document.getElementById('scratchCodeInput')
inputElement.addEventListener('change', handleFiles, false)

function handleFiles() {
    const codeFile = this.files[0]
    const reader = new FileReader()
    reader.onload = onReaderLoad
    reader.readAsText(codeFile)
}

function onReaderLoad(event) {
    const obj = JSON.parse(event.target.result)
    alert(obj.name + ' ' + obj.version)
}

window.addEventListener('resize', resize)

function resize() {
    const parent = app.view.parentNode

    app.renderer.resize(parent.clientWidth, parent.clientHeight)

    if (catSprite)
        catSprite.position.set(app.screen.width * 0.5, app.screen.height * 0.5)
}

resize()
