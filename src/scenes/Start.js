import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('landscape', 'asset/small adventures/small adventure.png');
        this.load.spritesheet('tileframes', 'asset/small adventures/small adventure.png', {
            frameWidth: 18, frameHeight: 18, spacing: 1
        });
        this.load.tilemapTiledJSON('tilemap', 'asset/map/small adventure.tmj');
        this.load.tilemapTiledJSON('factoryMap', 'asset/map/level1.tmj');
        this.load.image('factoryIndustrial', 'asset/lvl1/industry (2).png');
        this.load.spritesheet('factoryIndustrialFrames', 'asset/lvl1/industry (2).png', {
            frameWidth: 18, frameHeight: 18
        });
        this.load.image('factoryTinyPacked', 'asset/lvl1/factory (2).png');
        this.load.image('factoryTinyTiles', 'asset/lvl1/factory (1).png');
        this.load.image('factoryCharacter', 'asset/characters/tile_0120.png');
        this.load.image('character', 'asset/characters/tile_0000.png');
        this.load.image('star', 'asset/particles/star_07_54x54.png');
        this.load.image('movingEffect', 'asset/particles/moving.png');
        this.load.image('jumpEffect', 'asset/particles/jump.png');
        this.load.audio('jump', 'asset/audio/jump.ogg');
    }

    create() {
        this.inGame = false;
        this.completed = false;
        this.cameras.main.setZoom(3);
        this.cameras.main.setBackgroundColor('#292239');

        const startImmediately = this.registry.get('startImmediately') === true;
        const previousLevels = this.registry.get('completedLevels');
        this.completedLevels = startImmediately && Array.isArray(previousLevels)
            ? previousLevels.filter(name => name === 'candy' || name === 'factory')
            : [];
        this.registry.set('startImmediately', false);
        if (startImmediately) {
            this.startAdventure(this.registry.get('currentLevel'));
        } else {
            this.showMainMenu();
        }
    }

    addButton(y, label, callback) {
        const button = this.add.rectangle(GAME_WIDTH / 2, y, 128, 20, 0x9c6e58)
            .setStrokeStyle(1, 0xe6c2aa)
            .setInteractive({useHandCursor: true});
        this.add.text(GAME_WIDTH / 2, y, label, {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5).setScale(1/3);
        button.on('pointerdown', callback);
        button.on('pointerover', () => button.setFillStyle(0xb9876c));
        button.on('pointerout', () => button.setFillStyle(0x9c6e58));
    }

    showMainMenu() {
        this.inGame = false;
        this.completedLevels = [];
        this.registry.set('completedLevels', []);
        this.registry.set('startImmediately', false);
        this.children.removeAll(true);
        this.cameras.main.stopFollow();
        this.cameras.main.setScroll(-180, -120);
        this.cameras.main.setZoom(3);
        this.add.text(GAME_WIDTH / 2, 25, 'SMALL ADVENTURE', {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '39px', color: '#ffe9bb'
        }).setOrigin(0.5).setScale(1/3);
        this.addButton(65, 'START GAME', () => this.startAdventure());
        this.addButton(95, 'LEVEL SELECT', () => this.showLevelSelect());
    }

    showLevelSelect() {
        this.children.removeAll(true);
        this.add.text(GAME_WIDTH / 2, 25, 'LEVEL SELECT', {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '39px', color: '#ffe9bb'
        }).setOrigin(0.5).setScale(1/3);
        this.addButton(52, 'CANDY', () => this.startAdventure('candy'));
        this.addButton(77, 'FACTORY', () => this.startAdventure('factory'));
        this.addButton(103, 'BACK', () => this.showMainMenu());
    }

    makeTilemap() {
        const isFactory = this.currentLevel === 'factory';
        this.map = this.make.tilemap({key: isFactory ? 'factoryMap' : 'tilemap'});
        let tilesets;
        if (isFactory) {
            tilesets = [
                this.map.addTilesetImage('tilemap_packed', 'factoryIndustrial', 18, 18, 0, 0),
                this.map.addTilesetImage('tilemap_packed2', 'factoryTinyPacked', 18, 18, 0, 0),
                this.map.addTilesetImage('tilemap', 'factoryTinyTiles', 18, 18, 0, 0)
            ];
        } else {
            tilesets = [this.map.addTilesetImage('landscape', 'landscape', 18, 18, 0, 1)];
        }
        if (tilesets.some(t => !t)) throw new Error('Could not load the map tilesets');

        this.map.createLayer('background', tilesets, 0, 0).setDepth(0);
        this.ground = this.map.createLayer('ground', tilesets, 0, 0).setDepth(3);
        if (isFactory) {
            this.map.createLayer('decoration', tilesets, 0, 0).setDepth(5);
        } else {
            this.map.createLayer('decorations', tilesets, 0, 0).setDepth(5);
            this.map.createLayer('decoration2', tilesets, 0, 0).setDepth(6);
        }
        this.platforms = this.map.createLayer('platforms', tilesets, 0, 0).setDepth(8);
        this.coins = this.add.group();
        this.powerups = this.add.group();
        const objects = this.map.getObjectLayer('collectibles');
        if (objects) {
            for (const obj of objects.objects) {
                if (!obj.gid) continue;
                const properties = Object.fromEntries(
                    (obj.properties || []).map(p => [p.name, p.value])
                );
                const frame = (obj.gid & 0x1fffffff) - 1;
                const frameKey = isFactory ? 'factoryIndustrialFrames' : 'tileframes';
                const collectible = this.physics.add.staticSprite(
                    obj.x + (obj.width || 18) / 2,
                    obj.y - (obj.height || 18) / 2,
                    frameKey, frame
                ).setDepth(18);
                if (properties.powerup === 'double points') {
                    collectible.powerup_type = properties.powerup;
                    this.powerups.add(collectible);
                } else {
                    collectible.value = Number(properties.value) || 10;
                    this.coins.add(collectible);
                }
            }
        }

        this.factoryCollectiblesRequired = isFactory ? this.coins.getChildren().length : 0;

        const particles = this.map.getObjectLayer('particles');
        if (particles) {
            for (const obj of particles.objects) {
                this.add.image(obj.x + (obj.width || 54) / 2,
                    obj.y - (obj.height || 54) / 2, 'star')
                    .setScale(0.30).setDepth(11);
            }
        }

        this.movingPlatforms = [];
        if (isFactory) this.createFactoryMovingPlatform();
        else this.createMovingPlatforms();
    }

    createMovingPlatforms() {
        for (const row of [3, 8, 13]) {
            for (let x = 0; x < this.map.width - 2; x++) {
                const tiles = [0, 1, 2].map(i => this.platforms.getTileAt(x+i, row));
                if (!tiles.every(t => t && t.index > 0)) continue;
                const segments = tiles.map((tile, i) => {
                    const piece = this.physics.add.image(
                        (x+i+0.5)*18, (row+0.5)*18, 'tileframes', tile.index - 1
                    ).setDepth(9).setImmovable(true);
                    piece.body.setAllowGravity(false);
                    piece.body.setSize(18, 14);
                    piece.setVelocityX(22);
                    this.platforms.removeTileAt(x+i, row);
                    return piece;
                });
                this.movingPlatforms.push({segments, startX: (x + .5)*18, range: 19, speed: 22});
                break;
            }
        }
    }

    createFactoryMovingPlatform() {
        const row = 5;
        const tiles = [10, 11].map(x => this.platforms.getTileAt(x, row));
        if (tiles.some(tile => !tile || tile.index <= 0)) return;
        const segments = tiles.map((tile, i) => {
            const x = 10 + i;
            const frame = tile.index - 1;
            const piece = this.physics.add.image(
                (x + 0.5) * 18, (row + 0.5) * 18, 'factoryIndustrialFrames', frame
            ).setDepth(9).setImmovable(true);
            piece.body.setAllowGravity(false);
            piece.body.setSize(18, 14);
            piece.body.setFriction(1, 0);
            piece.setVelocityX(28);
            this.platforms.removeTileAt(x, row);
            return piece;
        });
        this.movingPlatforms.push({segments, startX: 10.5 * 18, range: 36, speed: 28});
    }

    createPoisonZones() {
        if (this.currentLevel !== 'factory') return;
        const poisonLayer = this.map.getObjectLayer('posion');
        if (!poisonLayer) return;
        for (const obj of poisonLayer.objects) {
            if ((obj.type || obj.class || obj.name || '').toLowerCase() !== 'dead') continue;
            if (!(obj.width > 0 && obj.height > 0)) continue;
            const trigger = this.add.zone(
                obj.x + obj.width / 2, obj.y + obj.height / 2,
                obj.width, obj.height
            );
            this.physics.add.existing(trigger, true);
            this.physics.add.overlap(this.player, trigger, () => this.gameOver());
        }
    }

    startAdventure(level = 'candy') {
        this.currentLevel = level === 'factory' ? 'factory' : 'candy';
        this.registry.set('currentLevel', this.currentLevel);
        this.children.removeAll(true);
        this.inGame = true;
        this.completed = false;
        this.score = 0;
        this.level = 1;
        this.doublePoints = false;
        this.jumpsUsed = 0;
        this.factoryCollectiblesCollected = 0;
        this.lastGoalWarningAt = -Infinity;

        this.makeTilemap();
        const character = this.map.getObjectLayer('character');
        const spawn = character && character.objects[0];
        const x = spawn ? spawn.x + (spawn.width || 24)/2 : 30;
        const y = spawn ? spawn.y - (spawn.height || 24)/2 : 230;
        const isFactory = this.currentLevel === 'factory';
        this.player = this.physics.add.sprite(
            x, y, isFactory ? 'factoryCharacter' : 'character'
        ).setDepth(25);
        if (isFactory) {
            this.player.body.setSize(12, 15);
            this.player.body.setOffset(2, 1);
        } else {
            this.player.body.setSize(16, 21);
            this.player.body.setOffset(4, 2);
        }
        this.player.body.setMaxVelocity(120, 360);
        this.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels+70);
        this.ground.setCollisionByExclusion([-1]);
        this.platforms.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);
        for (const moving of this.movingPlatforms) {
            for (const piece of moving.segments) {
                this.physics.add.collider(this.player, piece);
            }
        }
        this.createPoisonZones();

        const finishLayer = this.map.getObjectLayer('end');
        const goal = finishLayer && finishLayer.objects.find(o => o.type === 'finish');
        if (!goal) throw new Error('End layer must contain an object with type=finish');
        this.finish = this.add.zone(goal.x+goal.width/2, goal.y+goal.height/2,
            goal.width, goal.height);
        this.physics.add.existing(this.finish, true);
        this.physics.add.overlap(this.player, this.finish, () => this.completeLevel());
        if (isFactory) {
            this.add.text(goal.x + goal.width / 2, goal.y - 6, 'EXIT', {
                fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '10px',
                color: '#fff59e', stroke: '#332419', strokeThickness: 2
            }).setOrigin(0.5, 1).setDepth(21);
        }

        this.left = this.input.keyboard.addKey('A');
        this.right = this.input.keyboard.addKey('D');
        this.jump = this.input.keyboard.addKey('SPACE');
        this.input.keyboard.addCapture('SPACE');

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
        this.cameras.main.setDeadzone(18, 12);

        this.stars = this.add.particles(0, 0, 'star', {
            lifespan: 260, speed: {min: 12, max: 65},
            scale: {start: 0.10, end: 0},
            alpha: {start: 1, end: 0}, emitting: false
        }).setDepth(40);
        this.moving = this.add.particles(0, 0, 'movingEffect', {
            lifespan: 250,
            speed: {min: 5, max: 20},
            scale: {start: 0.4, end: 0},
            alpha: {start: 0.8, end: 0},
            emitting: false
        }).setDepth(24);

        this.jumpeffect = this.add.particles(0, 0, 'jumpEffect', {
            lifespan: 300,
            speed: {min: 15, max: 40},
            scale: {start: 0.08, end: 0},
            alpha: {start: 0.9, end: 0},
            emitting: false
        }).setDepth(24);
        this.lastMovingParticle = 0;

        this.add.rectangle(GAME_WIDTH, GAME_HEIGHT, GAME_WIDTH, 16, 0x211931, .86)
            .setOrigin(0).setScrollFactor(0).setDepth(70);
        this.scoreLabel = this.add.text(GAME_WIDTH + 4, GAME_HEIGHT + 4, '', {
            fontFamily: 'Arial, sans-serif', fontStyle: 'bold', fontSize: '24px', color: '#fff7df'
        }).setScrollFactor(0).setDepth(71).setScale(1/3);
        this.effectMessage = this.add.text(GAME_WIDTH + GAME_WIDTH / 2, GAME_HEIGHT + 23, '', {
            fontFamily: 'Arial, sans-serif', fontSize: '27px', fontStyle: 'bold',
            color: '#fff9d8', align: 'center',
            backgroundColor: '#403050', padding: { x: 4, y: 3 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(80)
          .setScale(1/3).setVisible(false);
        this.updateScore();
    }

    threshold(level) {
        const n = level;
        return (n*(n+1)*(2*n+1)/6)*10;
    }

    checkLevelUp() {
        while (this.score >= this.threshold(this.level)) {
            this.level++;
            this.stars.explode(15, this.player.x, this.player.y);
        }
    }

    updateScore() {
        const multiplier = Math.pow(1.25, this.level - 1) * (this.doublePoints ? 2 : 1);
        const collectiblesStatus = this.currentLevel === 'factory'
            ? `  Items ${this.factoryCollectiblesCollected}/${this.factoryCollectiblesRequired}`
            : '';
        this.scoreLabel.setText(`Score ${this.score}  Lv ${this.level}  x${multiplier.toFixed(2)}${collectiblesStatus}`);
    }

    showPowerupMessage(text) {
        this.effectMessage.setText(text).setVisible(true);
        if (this.effectTimer) this.effectTimer.remove();
        this.effectTimer = this.time.delayedCall(2300, () => {
            if (this.effectMessage && this.effectMessage.active) {
                this.effectMessage.setVisible(false);
            }
        });
    }

    applyPowerup(type) {
        if (type === 'double points') {
            this.doublePoints = true;
            this.showPowerupMessage('POWER-UP!\nCollectibles give 2x points!');
        }
    }

    gameOver() {
        if (this.completed) return;
        this.completed = true;
        this.player.setVelocity(0, 0);
        this.registry.set('finalScore', this.score);
        this.registry.set('currentLevel', this.currentLevel);
        this.registry.set('completedLevels', [...this.completedLevels]);
        this.scene.start('GameOver');
    }

    completeLevel() {
        if (this.completed) return;
        if (this.currentLevel === 'factory' &&
            this.factoryCollectiblesCollected < this.factoryCollectiblesRequired) {
            if (this.time.now - this.lastGoalWarningAt >= 2000) {
                this.showPowerupMessage(
                    `Collect all items first! (${this.factoryCollectiblesCollected}/${this.factoryCollectiblesRequired})`
                );
                this.lastGoalWarningAt = this.time.now;
            }
            return;
        }
        this.completed = true;
        this.player.setVelocity(0, 0);
        this.registry.set('finalScore', this.score);
        this.registry.set('currentLevel', this.currentLevel);
        this.registry.set('completedLevels', [...new Set([...this.completedLevels, this.currentLevel])]);
        this.scene.start('NextLvl');
    }

    update() {
        if (!this.inGame || this.completed) return;
        if (this.left.isDown) this.player.setVelocityX(-110).setFlipX(true);
        else if (this.right.isDown) this.player.setVelocityX(110).setFlipX(false);
        else this.player.setVelocityX(0);
        const grounded = this.player.body.blocked.down ||
                 this.player.body.touching.down;
        if (grounded && (this.left.isDown || this.right.isDown) && 
            this.time.now - this.lastMovingParticle > 85) {
                const behindX = this.player.body.velocity.x > 0? this.player.x - 8 : this.player.x + 8;
                this.moving.explode(2, behindX, this.player.y + 10
            );
            this.lastMovingParticle = this.time.now;
        }

        if (this.player.body.blocked.down || this.player.body.touching.down) {
            this.jumpsUsed = 0;
        }
        
        const maxJumps = 2;
        if (Phaser.Input.Keyboard.JustDown(this.jump) && this.jumpsUsed < maxJumps) {
        const jumpSpeed = this.currentLevel === 'factory'? (this.jumpsUsed === 0 ? -205 : -175): -205;

        this.player.setVelocityY(jumpSpeed);
        this.jumpsUsed++;
        this.sound.play('jump', {volume: .45});
        this.jumpeffect.explode(7, this.player.x, this.player.y + 10);
        }

        this.physics.world.overlap(this.player, this.coins, (player, coin) => {
            if (!coin.active) return;
            coin.disableBody(true, true);
            if (this.currentLevel === 'factory') {
                this.factoryCollectiblesCollected++;
            }
            const multiplier = Math.pow(1.25, this.level - 1) * (this.doublePoints ? 2 : 1);
            this.score += Math.round(coin.value * multiplier);
            this.checkLevelUp();
            this.updateScore();
            this.stars.explode(9, coin.x, coin.y);
        });
        this.physics.world.overlap(this.player, this.powerups, (player, powerup) => {
            if (!powerup.active) return;
            powerup.disableBody(true, true);
            this.applyPowerup(powerup.powerup_type);
            this.updateScore();
            this.stars.explode(15, powerup.x, powerup.y);
        });

        for (const platform of this.movingPlatforms) {
            const first = platform.segments[0];
            if (first.x >= platform.startX + platform.range) {
                platform.segments.forEach(p => p.setVelocityX(-platform.speed));
            } else if (first.x <= platform.startX - platform.range) {
                platform.segments.forEach(p => p.setVelocityX(platform.speed));
            }
        }
        if (this.player.y > this.map.heightInPixels + 30) {
            this.gameOver();
        }
    }
}
