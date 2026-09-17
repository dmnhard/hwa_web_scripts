// ==UserScript==
// @name         Dungeon runner + Quick RUN
// @namespace    http://tampermonkey.net/
// @version      2026-09-18_01:00
// @description  Adds a quick RUN button next to Run Macro and reuses the existing Run Dungeon action.
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

    function addQuickRunButton() {
        if (document.getElementById(QUICK_BUTTON_ID)) {
            return true
        }

        const dailyButton = document.getElementById(DAILY_BUTTON_ID)
        const dungeonButton = document.getElementById(DUNGEON_BUTTON_ID)

        if (!dailyButton || !dungeonButton || !dailyButton.parentElement) {
            return false
        }

        // Copy the visual appearance of "Run Macro" so the new button looks
        // like a native part of the existing toolbar.
        const runButton = dailyButton.cloneNode(true)
        runButton.id = QUICK_BUTTON_ID
        runButton.textContent = 'RUN'
        runButton.title = 'Run Dungeon'

        // The original button is 160px wide; make the compact RUN button narrower.
        runButton.style.minWidth = '80px'
        runButton.style.width = '80px'

        // cloneNode() does not copy JS event handlers, so add the hover effect.
        runButton.onmouseenter = () => {
            runButton.style.filter = 'brightness(1.12)'
        }
        runButton.onmouseleave = () => {
            runButton.style.filter = 'brightness(1)'
        }

        runButton.addEventListener('click', (event) => {
            event.preventDefault()
            event.stopPropagation()

            // Use the exact same button that the Dungeon popup uses.
            // This preserves all existing Dungeon logic and settings.
            dungeonButton.click()
        })

        dailyButton.insertAdjacentElement('afterend', runButton)
        return true
    }

    let attempts = 0
    const maxAttempts = 120
    const interval = setInterval(() => {
        attempts += 1

        if (addQuickRunButton() || attempts >= maxAttempts) {
            clearInterval(interval)
        }
    }, 250)
})()
