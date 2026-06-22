import Phaser from 'phaser';
import { DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import { Danubia } from '../characters/Danubia';
import { homeRooms } from '../data/homeRooms';
import type { HomeRoomConfig, RectArea } from '../game/types';

export class HomeScene extends Phaser.Scene {
    private danubia?: Danubia;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private readonly room: HomeRoomConfig = homeRooms['living-room'];

    constructor() {
        super(SCENE_KEYS.home);
    }

    create(): void {
        this.add
            .image(0, 0, this.room.backgroundKey)
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.danubia = new Danubia(this, this.room.playerSpawn.x, this.room.playerSpawn.y);
        this.danubia.setWalkPlaneMode(this.room.walkArea, this.room.blockers, this.room.shadow);

        if (DEBUG_ROOM_GEOMETRY) {
            this.debugGraphics = this.add.graphics();
            this.debugText = this.add.text(12, 12, '', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 6, y: 4 },
            }).setScrollFactor(0).setDepth(1000);

            for (const blocker of this.room.blockers) {
                this.add
                    .text(blocker.x + 4, blocker.y + 4, blocker.id, {
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#ff9db0',
                        backgroundColor: '#00000099',
                    })
                    .setDepth(999);
            }
        }
    }

    update(): void {
        this.danubia?.update();

        if (DEBUG_ROOM_GEOMETRY) {
            this.drawDebugGeometry();
        }
    }

    private drawDebugGeometry(): void {
        if (!this.debugGraphics || !this.debugText || !this.danubia) {
            return;
        }

        this.debugGraphics.clear();

        this.fillRect(this.debugGraphics, this.room.walkArea, 0x00ff66, 0.18, 0x00ff66, 1);

        for (const blocker of this.room.blockers) {
            this.fillRect(this.debugGraphics, blocker, 0xff3355, 0.22, 0xff3355, 1);
        }

        const foot = this.danubia.getFootBounds();
        this.fillRect(this.debugGraphics, foot, 0xffdd00, 0.28, 0xffdd00, 1);

        const shadow = this.danubia.getShadowBounds();
        this.fillRect(this.debugGraphics, shadow, 0x66aaff, 0.16, 0x66aaff, 1);

        const pointer = this.input.activePointer;
        this.debugText.setText(
            [
                `mouse x:${Math.round(pointer.worldX)} y:${Math.round(pointer.worldY)}`,
                `shadow x:${Math.round(shadow.x)} y:${Math.round(shadow.y)}`,
                `shadow w:${Math.round(shadow.width)} h:${Math.round(shadow.height)} a:${this.danubia.getShadowAlpha().toFixed(2)}`,
            ].join('\n'),
        );
    }

    private fillRect(
        graphics: Phaser.GameObjects.Graphics,
        rect: RectArea,
        fillColor: number,
        fillAlpha: number,
        strokeColor: number,
        strokeAlpha: number,
    ): void {
        graphics.fillStyle(fillColor, fillAlpha);
        graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        graphics.lineStyle(1, strokeColor, strokeAlpha);
        graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
}
