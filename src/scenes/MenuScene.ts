import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, UI_FONT_FAMILY } from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';
import { isConfirmJustPressed } from '../systems/controllerInput';

const ASSET_KEYS = {
    cover: 'bg-cover',
} as const;

export class MenuScene extends Phaser.Scene {
    private hasStarted = false;

    constructor() {
        super(SCENE_KEYS.menu);
    }

    create(): void {
        installDevModeHotkeys(this);
        this.add.image(0, 0, ASSET_KEYS.cover).setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        const titleGroup = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 92);

        const titleGlow = this.add.text(0, 0, 'PRESSIONE ✕ PARA COMEÇAR', {
            fontFamily: UI_FONT_FAMILY,
            fontSize: '25px',
            color: '#d8b46a',
            stroke: '#291641',
            strokeThickness: 8,
            align: 'center',
            letterSpacing: 1.8,
        }).setOrigin(0.5);
        titleGlow.setAlpha(0.28);

        const titleShadow = this.add.text(0, 1, 'PRESSIONE ✕ PARA COMEÇAR', {
            fontFamily: UI_FONT_FAMILY,
            fontSize: '25px',
            color: '#1b102f',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            letterSpacing: 1.8,
        }).setOrigin(0.5);

        const titleText = this.add.text(0, -1, 'PRESSIONE ✕ PARA COMEÇAR', {
            fontFamily: UI_FONT_FAMILY,
            fontSize: '25px',
            color: '#f8e9b3',
            stroke: '#5a3a08',
            strokeThickness: 4,
            align: 'center',
            letterSpacing: 1.8,
        }).setOrigin(0.5);

        const subtitleText = this.add.text(0, 28, 'USE SEU CONTROLE PLAYSTATION', {
            fontFamily: UI_FONT_FAMILY,
            fontSize: '13px',
            color: '#e7d6a1',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            letterSpacing: 1,
        }).setOrigin(0.5);

        titleGroup.add([titleGlow, titleShadow, titleText, subtitleText]);

        this.tweens.add({
            targets: titleGroup,
            y: { from: GAME_HEIGHT - 92, to: GAME_HEIGHT - 96 },
            alpha: { from: 0.95, to: 1 },
            duration: 2200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.tweens.add({
            targets: titleText,
            scaleX: { from: 1, to: 1.02 },
            scaleY: { from: 1, to: 1.02 },
            duration: 1800,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

    }

    update(): void {
        if (isConfirmJustPressed(this)) {
            this.startHomeScene();
        }
    }

    private startHomeScene(): void {
        if (this.hasStarted) {
            return;
        }

        this.hasStarted = true;

        if (this.scale.game.device.fullscreen.available && !this.scale.isFullscreen) {
            try {
                this.scale.startFullscreen();
            } catch {
                // Ignore fullscreen failures and continue the game normally.
            }
        }

        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.time.delayedCall(250, () => {
            this.scene.start(SCENE_KEYS.home);
        });
    }
}
