// ==UserScript==
// @name         Dungeon runner + Quick RUN v3
// @namespace    http://tampermonkey.net/
// @version      2026-09-18_01:00
// @description  Adds a quick RUN/STOP button next to Run Macro and reuses the existing Run Dungeon action.
// @author       dmnhard
// @match        https://www.hero-wars-alliance.com/*
// @require      https://raw.githubusercontent.com/dmnhard/hwa_web_scripts/refs/heads/main/hwa_extension.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict'

    const DAILY_BUTTON_ID = 'dailyButton'
    const DUNGEON_BUTTON_ID = 'dungeonMacroButton'
    const QUICK_BUTTON_ID = 'runDungeonQuickButton'
    const DUNGEON_STOP_PREFIX = 'Stop dungeon'

    const ACTIVE_STYLE_PROPERTIES = [
        'background',
        'border',
        'boxShadow',
        'color',
        'textShadow'
    ]

    function copyStateStyle(source, target) {
        for (const property of ACTIVE_STYLE_PROPERTIES) {
            target.style[property] = source.style[property]
        }
    }

    function syncQuickButton(runButton, dailyButton) {
        const isDungeonRunning =
            typeof dailyButton.dataset.baseLabel === 'string' &&
            dailyButton.dataset.baseLabel.startsWith(DUNGEON_STOP_PREFIX)

        runButton.textContent = isDungeonRunning ? 'STOP' : 'RUN'
        runButton.title = isDungeonRunning ? 'Stop Dungeon' : 'Run Dungeon'

        // The original Run Macro button is switched to the exact Stop-Dungeon
        // colors by the existing setActivated() function. Copy that state so
        // QUICK RUN uses the same active/inactive appearance.
        copyStateStyle(dailyButton, runButton)
    }

    function addQuickRunButton() {
        if (document.getElementById(QUICK_BUTTON_ID)) {
            return true
        }

        const dailyButton = document.getElementById(DAILY_BUTTON_ID)
        const dungeonButton = document.getElementById(DUNGEON_BUTTON_ID)

        if (!dailyButton || !dungeonButton || !dailyButton.parentElement) {
            return false
        }

        // Clone the existing Run Macro button so the quick button inherits
        // the same base typography, border radius, dimensions, etc.
        const runButton = dailyButton.cloneNode(true)
        runButton.id = QUICK_BUTTON_ID
        runButton.style.minWidth = '80px'
        runButton.style.width = '80px'
        runButton.dataset.baseLabel = ''

        runButton.onmouseenter = () => {
            runButton.style.filter = 'brightness(1.12)'
        }
        runButton.onmouseleave = () => {
            runButton.style.filter = 'brightness(1)'
        }

        runButton.addEventListener('click', (event) => {
            event.preventDefault()
            event.stopPropagation()

            // Invoke the exact same handler as the existing "Run Dungeon"
            // button. runDungeonMacro() already implements both start and stop:
            // pressing it while the Dungeon macro is running stops the macro.
            dungeonButton.click()
        })

        dailyButton.insertAdjacentElement('afterend', runButton)

        // Keep RUN/STOP and the button color synchronized with the existing
        // macro button. The source script updates these properties internally,
        // so polling avoids depending on private lexical variables/functions.
        syncQuickButton(runButton, dailyButton)
        const syncTimer = window.setInterval(() => {
            if (!document.contains(dailyButton) || !document.contains(runButton)) {
                window.clearInterval(syncTimer)
                return
            }
            syncQuickButton(runButton, dailyButton)
        }, 250)

        return true
    }

    let attempts = 0
    const maxAttempts = 120
    const interval = window.setInterval(() => {
        attempts += 1

        if (addQuickRunButton() || attempts >= maxAttempts) {
            window.clearInterval(interval)
        }
    }, 250)
})()
