import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class NextLvl extends Phaser.Scene {
    constructor() { super('NextLvl'); }

    init(data) { this.finalScore = data.score || 0; }

    create() {
        this.cameras.main.setZoom(3);
        this.cameras.main.setScroll(-180, -120);
        this.cameras.main.setBackgroundColor('#2a2139');
        this.add.text(GAME_WIDTH/2, 25, 'LEVEL COMPLETE!', {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '36px', color: '#ffe9bb'
        }).setOrigin(0.5).setScale(1/3);
        this.add.text(GAME_WIDTH/2, 44, `Score: ${this.finalScore}`, {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5).setScale(1/3);
        this.addButton(69, 'NEXT LEVEL', () => {
            if (this.scene.manager.keys.Level1) this.scene.start('Level1');
            else this.notice.setText('Level 1 tileset not added yet');
        });
        this.addButton(96, 'MAIN MENU', () => this.scene.start('Start'));
        this.notice = this.add.text(GAME_WIDTH/2, 114, '', {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '24px', color: '#ffc8bb'
        }).setOrigin(0.5).setScale(1/3);
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
