import { Application } from '@pixi/app'

import { Renderer } from '@pixi/core'

import { BatchRenderer } from '@pixi/core'
Renderer.registerPlugin('batch', BatchRenderer)

import { TickerPlugin } from '@pixi/ticker'
Application.registerPlugin(TickerPlugin)

import { AppLoaderPlugin } from '@pixi/loaders'
Application.registerPlugin(AppLoaderPlugin)

import { Sprite } from '@pixi/Sprite'

import parseScratchProject from './parser'
import execute from './executor'

// Mounting PIXI

const app = new Application({
    autoResize: true,
    resolution: devicePixelRatio,
    backgroundColor: 0x1099bb
})
document.getElementById('canvas').appendChild(app.view)

let catSprite = null

function initScene() {
    catSprite.x = app.screen.width * 0.5
    catSprite.y = app.screen.height * 0.5
    catSprite.rotation = 0
}

app.loader.add('cat', './assets/cat.png')
app.loader.load(() => {
    catSprite = Sprite.from('cat')
    catSprite.scale.set(0.2, 0.2)
    catSprite.anchor.set(0.5)
    app.stage.addChild(catSprite)
    initListeners()
    initScene()
})

// JSON Upload

const inputElement = document.getElementById('scratchCodeInput')
inputElement.addEventListener('change', handleFiles, false)

function handleFiles() {
    const codeFile = this.files[0]
    if (codeFile.type !== 'application/json') alertJSONUploadFailure()
    const reader = new FileReader()
    reader.onload = onReaderLoad
    reader.readAsText(codeFile)
}

function onReaderLoad(event) {
    initScene()
    alertJSONUploadSuccess()
    const plainTextData = event.target.result
    const code = parseScratchProject(plainTextData)
    updateEventCode(code)
    console.log(code)
}

function alertJSONUploadSuccess() {
    alert('JSON file uploaded successfully!')
}

function alertJSONUploadFailure() {
    alert('Please upload a JSON file')
}

// Screen Resize

window.addEventListener('resize', resize)

function resize() {
    const parent = app.view.parentNode

    app.renderer.resize(parent.clientWidth, parent.clientHeight)

    if (catSprite)
        catSprite.position.set(app.screen.width * 0.5, app.screen.height * 0.5)
}

resize()

// Dialog Controller

const dialogController = {
    _editDialogText: function (verb, text) {
        const dialogElement = document.getElementById('dialog')
        dialogElement.innerHTML = `
        <div id="dialogCard" class="card">
            <div id="dialogContent" class="card-body">
                <strong>Scratch ${verb}: </strong>${text}
            </div>
        </div>`
    },
    say: function (text) {
        this._editDialogText('saying', text)
    },
    think: function (text) {
        this._editDialogText('thinking', text)
    },
    clear: function () {
        document.getElementById('dialog').innerHTML = ''
    }
}

let eventCode = {}

function updateEventCode(code) {
    eventCode = {}
    const splittedCode = code.split('\n')
    for (let i = 0; i < splittedCode.length; i++) {
        const initial = splittedCode[i].substring(0, 4)
        if (initial === 'WHEN') {
            const codeBlocks = []
            const eventType = getEventType(splittedCode[i])
            for (let j = i + 2; j < splittedCode.length; j++) {
                const subInitial = splittedCode[j].substring(0, 4)
                if (subInitial === '  EN') {
                    i = j
                    break
                }
                codeBlocks.push(splittedCode[j].substring(4))
            }
            eventCode[eventType] = codeBlocks.join('\n')
        }
    }
    console.log(eventCode)
}

function getEventType(eventLine) {
    const eventCause = eventLine.split(' ')[1]
    switch (eventCause) {
        case 'Green':
            return 'greenFlag'
        case 'space':
            return ' '
        case 'up':
            return 'ArrowUp'
        case 'down':
            return 'ArrowDown'
        case 'left':
            return 'ArrowLeft'
        case 'right':
            return 'ArrowRight'
        default:
            return eventCause
    }
}

function initListeners() {
    const goButton = document.getElementById('go-btn')
    goButton.onclick = () => {
        if (eventCode['greenFlag'])
            execute(eventCode['greenFlag'], catSprite, dialogController)
    }

    document.addEventListener('keydown', ({ key }) => {
        if (eventCode[key]) execute(eventCode[key], catSprite, dialogController)
    })
}
