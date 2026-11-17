import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class NextLvl extends Phaser.Scene {
    constructor() { super('NextLvl'); }

    create() {
        this.finalScore = this.registry.get('finalScore') || 0;
        this.currentLevel = this.registry.get('currentLevel') === 'factory' ? 'factory' : 'candy';
        const completedLevels = this.registry.get('completedLevels') || [];
        const opposite = this.currentLevel === 'candy' ? 'factory' : 'candy';
        this.nextLevel = completedLevels.includes(opposite) ? null : opposite;

        this.cameras.main.setZoom(3);
        this.cameras.main.setScroll(-180, -120);
        this.cameras.main.setBackgroundColor('#2a2139');
        this.add.text(GAME_WIDTH/2, 25, this.nextLevel ? 'LEVEL COMPLETE!' : 'ALL LEVELS CLEARED!', {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '36px', color: '#ffe9bb'
        }).setOrigin(0.5).setScale(1/3);
        this.add.text(GAME_WIDTH/2, 44, `Score: ${this.finalScore}`, {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5).setScale(1/3);
        if (this.nextLevel) {
            this.addButton(69, 'NEXT: ' + this.nextLevel.toUpperCase(), () => {
                this.registry.set('currentLevel', this.nextLevel);
                this.registry.set('startImmediately', true);
                this.scene.start('Start');
            });
        } else {
            this.add.text(GAME_WIDTH / 2, 69, 'YOU FINISHED BOTH MAPS!', {
                fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
                fontSize: '24px', color: '#fff7a9'
            }).setOrigin(0.5).setScale(1/3);
        }
        this.addButton(96, 'MAIN MENU', () => this.scene.start('Start'));
    }

    addButton(y, name, action) {
        const box = this.add.rectangle(GAME_WIDTH/2, y, 124, 18, 0x9c6e58)
            .setStrokeStyle(1, 0xffdfbe)
            .setInteractive({useHandCursor:true});
        this.add.text(GAME_WIDTH/2, y, name, {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5).setScale(1/3);
        box.on('pointerdown', action);
    }
}
