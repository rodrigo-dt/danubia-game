import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';

export const PHONE_HUD_CONFIG = {
    toggleKeyCode: Phaser.Input.Keyboard.KeyCodes.TAB,
    compact: {
        x: 92,
        y: GAME_HEIGHT - 82,
        scale: 0.74,
    },
    expanded: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        scale: 1,
    },
    overlay: {
        color: 0x020617,
        alpha: 0.42,
    },
    placeholder: {
        title: 'Checklist em breve',
        subtitle: 'Pressione Tab para fechar',
    },
    depth: 930,
} as const;

export class PhoneHud extends Phaser.GameObjects.Container {
    private readonly overlay: Phaser.GameObjects.Rectangle;
    private readonly phoneImage: Phaser.GameObjects.Image;
    private readonly titleText: Phaser.GameObjects.Text;
    private readonly subtitleText: Phaser.GameObjects.Text;
    private unlocked = false;
    private open = false;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        this.overlay = scene.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            PHONE_HUD_CONFIG.overlay.color,
            PHONE_HUD_CONFIG.overlay.alpha,
        );
        this.overlay.setVisible(false);

        this.phoneImage = scene.add.image(
            PHONE_HUD_CONFIG.compact.x,
            PHONE_HUD_CONFIG.compact.y,
            'ui-phone-compact',
        );
        this.phoneImage.setScale(PHONE_HUD_CONFIG.compact.scale);
        this.phoneImage.setVisible(false);

        this.titleText = scene.add.text(
            PHONE_HUD_CONFIG.expanded.x,
            PHONE_HUD_CONFIG.expanded.y - 42,
            PHONE_HUD_CONFIG.placeholder.title,
            {
                fontFamily: 'monospace',
                fontSize: '22px',
                color: '#f8fafc',
                align: 'center',
            },
        );
        this.titleText.setOrigin(0.5);
        this.titleText.setVisible(false);

        this.subtitleText = scene.add.text(
            PHONE_HUD_CONFIG.expanded.x,
            PHONE_HUD_CONFIG.expanded.y + 118,
            PHONE_HUD_CONFIG.placeholder.subtitle,
            {
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#cbd5e1',
                align: 'center',
            },
        );
        this.subtitleText.setOrigin(0.5);
        this.subtitleText.setVisible(false);

        this.add([
            this.overlay,
            this.phoneImage,
            this.titleText,
            this.subtitleText,
        ]);

        this.setScrollFactor(0);
        this.setDepth(PHONE_HUD_CONFIG.depth);
        scene.add.existing(this);
    }

    get isUnlocked(): boolean {
        return this.unlocked;
    }

    get isOpen(): boolean {
        return this.open;
    }

    unlock(): void {
        if (this.unlocked) {
            return;
        }

        this.unlocked = true;
        this.close(false);
        this.phoneImage.setVisible(true);
    }

    toggle(): void {
        if (!this.unlocked) {
            return;
        }

        if (this.open) {
            this.close();
            return;
        }

        this.openOverlay();
    }

    close(animate = true): void {
        if (!this.unlocked) {
            return;
        }

        this.open = false;
        this.overlay.setVisible(false);
        this.titleText.setVisible(false);
        this.subtitleText.setVisible(false);
        this.phoneImage.setTexture('ui-phone-compact');
        this.phoneImage.setVisible(true);

        if (animate) {
            this.scene.tweens.killTweensOf(this.phoneImage);
        }

        this.phoneImage.setPosition(
            PHONE_HUD_CONFIG.compact.x,
            PHONE_HUD_CONFIG.compact.y,
        );
        this.phoneImage.setScale(PHONE_HUD_CONFIG.compact.scale);
        this.phoneImage.setAngle(0);
    }

    private openOverlay(): void {
        this.open = true;
        this.overlay.setVisible(true);
        this.phoneImage.setVisible(true);
        this.phoneImage.setTexture('ui-phone-expanded');
        this.phoneImage.setPosition(
            PHONE_HUD_CONFIG.expanded.x,
            PHONE_HUD_CONFIG.expanded.y,
        );
        this.phoneImage.setScale(PHONE_HUD_CONFIG.expanded.scale);
        this.phoneImage.setAngle(0);
        this.titleText.setVisible(true);
        this.subtitleText.setVisible(true);
    }
}
