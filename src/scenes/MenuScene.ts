import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';

const ASSET_KEYS = {
    cover: 'bg-cover',
} as const;

export class MenuScene extends Phaser.Scene {
    private hasStarted = false;

    constructor() {
        super(SCENE_KEYS.menu);
    }

    create(): void {
        this.add.image(0, 0, ASSET_KEYS.cover).setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT - 88, 'Pressione X ou Espaço para começar', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center',
            })
            .setOrigin(0.5);

        this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT - 48, 'Use controle de PlayStation ou teclado', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#f2f2f2',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center',
            })
            .setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.startHomeScene();
        });

        this.input.gamepad?.once('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
            if (button.index === 0) {
                this.startHomeScene();
            }
        });
    }

    private startHomeScene(): void {
        if (this.hasStarted) {
            return;
        }

        this.hasStarted = true;
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.time.delayedCall(250, () => {
            this.scene.start(SCENE_KEYS.home);
        });
    }
}
