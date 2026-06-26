import Phaser from 'phaser';
import { GAME_HEIGHT } from '../game/constants';
import { hasUnlockedPhoneHud } from '../game/states';

export const GAME_HUD_CONFIG = {
    depth: 920,
    compactPhone: {
        x: 84,
        y: GAME_HEIGHT - 76,
        scale: 0.7,
    },
} as const;

export class GameHud extends Phaser.GameObjects.Container {
    private readonly compactPhone: Phaser.GameObjects.Image;
    private compactPhoneVisible = true;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        this.compactPhone = scene.add.image(
            GAME_HUD_CONFIG.compactPhone.x,
            GAME_HUD_CONFIG.compactPhone.y,
            'ui-phone-compact',
        );
        this.compactPhone.setScale(GAME_HUD_CONFIG.compactPhone.scale);

        this.add(this.compactPhone);
        this.setScrollFactor(0);
        this.setDepth(GAME_HUD_CONFIG.depth);

        scene.add.existing(this);
        this.refresh();
    }

    setCompactPhoneVisible(visible: boolean): void {
        this.compactPhoneVisible = visible;
        this.refresh();
    }

    refresh(): void {
        const unlocked = hasUnlockedPhoneHud();
        const visible = unlocked && this.compactPhoneVisible;

        this.setVisible(visible);
        this.compactPhone.setVisible(visible);
    }
}
