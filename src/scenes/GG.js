import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.finalScore = (data && data.score) || 0;
    }

    create() {
        this.cameras.main.setZoom(3);
        this.cameras.main.setScroll(-180, -120);
        this.cameras.main.setBackgroundColor('#292239');
        this.add.text(GAME_WIDTH / 2, 25, 'GAME OVER', {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
            fontSize: '45px', color: '#ffcebe'
        }).setOrigin(0.5).setScale(1/3);
        this.add.text(GAME_WIDTH / 2, 43, 'Score: ' + this.finalScore, {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
            fontSize: '27px', color: '#ffffff'
        }).setOrigin(0.5).setScale(1/3);

        this.addButton(69, 'RESTART', () => {
            this.scene.start('Start', { startGame: true });
        });
        this.addButton(97, 'MAIN MENU', () => {
            this.scene.start('Start');
        });
    }

    addButton(y, label, callback) {
        const button = this.add.rectangle(GAME_WIDTH / 2, y, 128, 20, 0x9c6e58)
            .setStrokeStyle(1, 0xe6c2aa)
            .setInteractive({ useHandCursor: true });
        this.add.text(GAME_WIDTH / 2, y, label, {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
            fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5).setScale(1/3);
        button.on('pointerdown', callback);
        button.on('pointerover', () => button.setFillStyle(0xb9876c));
        button.on('pointerout', () => button.setFillStyle(0x9c6e58));
    }
}
