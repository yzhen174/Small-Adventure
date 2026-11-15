// Like Activity 7: register Phaser scenes in src/main.js.
import { Start } from './scenes/Start.js';
import { NextLvl } from './scenes/nextlvl.js';

export const GAME_WIDTH = 180;
export const GAME_HEIGHT = 120;

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    title: 'Small Adventure',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#292239',
    pixelArt: true,
    render: {antialias: false, roundPixels: true},
    physics: {
        default: 'arcade',
        arcade: {gravity: {y: 500}, debug: false}
    },
    scene: [Start, NextLvl],
    scale: {mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH}
};

new Phaser.Game(config);
