import Phaser from 'phaser';
import { GAME_WIDTH, UI_FONT_FAMILY } from '../game/constants';

export const FRAGMENT_NOTIFICATION_CONFIG = {
    x: GAME_WIDTH - 24,
    y: 28,
    minWidth: 320,
    minHeight: 42,
    maxTextWidth: 380,
    paddingX: 16,
    paddingY: 12,
    backgroundColor: 0x0f172a,
    backgroundAlpha: 0.72,
    borderColor: 0xe8d09a,
    borderAlpha: 0.26,
    borderWidth: 1,
    textColor: '#f8fafc',
    textFontSize: '15px',
    fadeInDurationMs: 140,
    visibleDurationMs: 2200,
    fadeOutDurationMs: 260,
} as const;

export class FragmentNotification extends Phaser.GameObjects.Container {
    private readonly background: Phaser.GameObjects.Rectangle;
    private readonly text: Phaser.GameObjects.Text;
    private hideTimer?: Phaser.Time.TimerEvent;
    private fadeTween?: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene) {
        super(scene, FRAGMENT_NOTIFICATION_CONFIG.x, FRAGMENT_NOTIFICATION_CONFIG.y);

        this.background = scene.add.rectangle(
            0,
            0,
            FRAGMENT_NOTIFICATION_CONFIG.minWidth,
            FRAGMENT_NOTIFICATION_CONFIG.minHeight,
            FRAGMENT_NOTIFICATION_CONFIG.backgroundColor,
            FRAGMENT_NOTIFICATION_CONFIG.backgroundAlpha,
        );
        this.background.setOrigin(1, 0);
        this.background.setStrokeStyle(
            FRAGMENT_NOTIFICATION_CONFIG.borderWidth,
            FRAGMENT_NOTIFICATION_CONFIG.borderColor,
            FRAGMENT_NOTIFICATION_CONFIG.borderAlpha,
        );

        this.text = scene.add.text(0, 0, '', {
            fontFamily: UI_FONT_FAMILY,
            fontSize: FRAGMENT_NOTIFICATION_CONFIG.textFontSize,
            color: FRAGMENT_NOTIFICATION_CONFIG.textColor,
            align: 'left',
            wordWrap: {
                width: FRAGMENT_NOTIFICATION_CONFIG.maxTextWidth,
                useAdvancedWrap: true,
            },
            lineSpacing: 4,
        }).setOrigin(1, 0);

        this.add([this.background, this.text]);
        this.setScrollFactor(0);
        this.setDepth(980);
        this.setVisible(false);
        this.setAlpha(0);

        scene.add.existing(this);
    }

    show(message: string, options?: { visibleDurationMs?: number }): void {
        this.clearAnimation();
        this.layout(message);
        this.setVisible(true);
        this.setAlpha(0);

        this.fadeTween = this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: FRAGMENT_NOTIFICATION_CONFIG.fadeInDurationMs,
            ease: 'Sine.Out',
        });

        this.hideTimer = this.scene.time.delayedCall(
            options?.visibleDurationMs ?? FRAGMENT_NOTIFICATION_CONFIG.visibleDurationMs,
            () => {
                this.fadeTween = this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: FRAGMENT_NOTIFICATION_CONFIG.fadeOutDurationMs,
                    ease: 'Sine.In',
                    onComplete: () => {
                        this.setVisible(false);
                    },
                });
            },
        );
    }

    private layout(message: string): void {
        this.text.setText(message);
        const width = Math.max(
            FRAGMENT_NOTIFICATION_CONFIG.minWidth,
            this.text.width + FRAGMENT_NOTIFICATION_CONFIG.paddingX * 2,
        );
        const height = Math.max(
            FRAGMENT_NOTIFICATION_CONFIG.minHeight,
            this.text.height + FRAGMENT_NOTIFICATION_CONFIG.paddingY * 2,
        );

        this.background.setSize(width, height);
        this.text.setPosition(
            -FRAGMENT_NOTIFICATION_CONFIG.paddingX,
            FRAGMENT_NOTIFICATION_CONFIG.paddingY,
        );
    }

    private clearAnimation(): void {
        this.hideTimer?.remove(false);
        this.hideTimer = undefined;
        this.fadeTween?.stop();
        this.fadeTween = undefined;
    }
}
