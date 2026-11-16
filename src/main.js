import { Start } from './scenes/Start.js';
import { NextLvl } from './scenes/nextlvl.js';
import { GameOver } from './scenes/GG.js';

export const GAME_WIDTH = 180;
export const GAME_HEIGHT = 120;

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    title: 'Small Adventure',
    width: GAME_WIDTH * 3,
    height: GAME_HEIGHT * 3,
    backgroundColor: '#292239',
    pixelArt: true,
    render: {antialias: false, roundPixels: true},
    physics: {
        default: 'arcade',
        arcade: {gravity: {y: 500}, debug: false}
    },
    scene: [Start, NextLvl, GameOver],
    scale: {mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH}
};

new Phaser.Game(config);
