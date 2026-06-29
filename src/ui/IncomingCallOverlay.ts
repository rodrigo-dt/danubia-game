import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { createActionPromptWidget } from './actionPrompt';

export const INCOMING_CALL_OVERLAY_CONFIG = {
    overlayColor: 0x020617,
    overlayAlpha: 0.62,
    entryStartX: 144,
    entryStartY: GAME_HEIGHT + 220,
    cornerX: 144,
    cornerY: GAME_HEIGHT - 126,
    cornerWidth: 208,
    cornerHeight: 266,
    centerX: GAME_WIDTH / 2,
    centerY: GAME_HEIGHT / 2 - 12,
    centerWidth: 360,
    centerHeight: 460,
    promptX: GAME_WIDTH / 2,
    promptY: GAME_HEIGHT - 54,
    vibrationOffsetX: 14,
    vibrationAngle: 3,
    vibrationDurationMs: 78,
    riseDurationMs: 380,
    cornerRingDurationMs: 620,
    moveToCenterDurationMs: 420,
    promptRevealDelayMs: 120,
    overlayFadeDurationMs: 240,
    promptText: 'Atender ligação',
} as const;

export class IncomingCallOverlay extends Phaser.GameObjects.Container {
    private readonly overlay: Phaser.GameObjects.Rectangle;
    private readonly phoneImage: Phaser.GameObjects.Image;
    private readonly prompt: ReturnType<typeof createActionPromptWidget>;
    private ringTween?: Phaser.Tweens.Tween;
    private sequenceTimer?: Phaser.Time.TimerEvent;
    private moveTween?: Phaser.Tweens.Tween;
    private readyToAccept = false;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        this.overlay = scene.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            INCOMING_CALL_OVERLAY_CONFIG.overlayColor,
            INCOMING_CALL_OVERLAY_CONFIG.overlayAlpha,
        );

        this.phoneImage = scene.add.image(
            INCOMING_CALL_OVERLAY_CONFIG.entryStartX,
            INCOMING_CALL_OVERLAY_CONFIG.entryStartY,
            'ui-phone-expanded',
        );
        this.phoneImage.setDisplaySize(
            INCOMING_CALL_OVERLAY_CONFIG.cornerWidth,
            INCOMING_CALL_OVERLAY_CONFIG.cornerHeight,
        );

        this.prompt = createActionPromptWidget(
            scene,
            INCOMING_CALL_OVERLAY_CONFIG.promptX,
            INCOMING_CALL_OVERLAY_CONFIG.promptY,
            '',
            {
                minWidth: 214,
                height: 40,
                paddingX: 16,
                paddingY: 8,
                backgroundColor: 0x0f172a,
                backgroundAlpha: 0.74,
                borderColor: 0xe8d09a,
                borderAlpha: 0.26,
                badgeWidth: 30,
                badgeHeight: 22,
                badgeColor: 0x111827,
                badgeAlpha: 0.95,
                badgeStrokeColor: 0xe8d09a,
                badgeStrokeAlpha: 0.34,
                keyFontSize: '13px',
                labelFontSize: '13px',
                labelMaxWidth: 300,
            },
        );

        this.add([
            this.overlay,
            this.phoneImage,
            this.prompt.container,
        ]);

        this.setScrollFactor(0);
        this.setDepth(940);
        this.setVisible(false);

        this.updatePromptText(INCOMING_CALL_OVERLAY_CONFIG.promptText);
        this.prompt.setVisible(false);
        this.overlay.setAlpha(0);

        scene.add.existing(this);
    }

    get isReadyToAccept(): boolean {
        return this.readyToAccept;
    }

    show(promptText: string = INCOMING_CALL_OVERLAY_CONFIG.promptText): void {
        this.updatePromptText(promptText);
        this.clearSequence();
        this.readyToAccept = false;
        this.prompt.setVisible(false);
        this.overlay.setAlpha(0);
        this.phoneImage.setPosition(
            INCOMING_CALL_OVERLAY_CONFIG.entryStartX,
            INCOMING_CALL_OVERLAY_CONFIG.entryStartY,
        );
        this.phoneImage.setDisplaySize(
            INCOMING_CALL_OVERLAY_CONFIG.cornerWidth,
            INCOMING_CALL_OVERLAY_CONFIG.cornerHeight,
        );
        this.phoneImage.setAngle(0);
        this.setVisible(true);

        this.moveTween = this.scene.tweens.add({
            targets: this.phoneImage,
            y: INCOMING_CALL_OVERLAY_CONFIG.cornerY,
            duration: INCOMING_CALL_OVERLAY_CONFIG.riseDurationMs,
            ease: 'Cubic.Out',
            onComplete: () => {
                this.startRinging();
                this.sequenceTimer = this.scene.time.delayedCall(
                    INCOMING_CALL_OVERLAY_CONFIG.cornerRingDurationMs,
                    () => {
                        this.sequenceTimer = undefined;
                        this.movePhoneToCenter();
                    },
                );
            },
        });
    }

    hide(): void {
        this.clearSequence();
        this.stopRinging();
        this.setVisible(false);
    }

    stopRinging(): void {
        this.ringTween?.stop();
        this.ringTween = undefined;
        this.phoneImage.setAngle(0);
    }

    private startRinging(): void {
        if (this.ringTween) {
            return;
        }

        // Reserved for ringtone/SFX hookup later.
        this.ringTween = this.scene.tweens.add({
            targets: this.phoneImage,
            x: this.phoneImage.x + INCOMING_CALL_OVERLAY_CONFIG.vibrationOffsetX,
            angle: INCOMING_CALL_OVERLAY_CONFIG.vibrationAngle,
            duration: INCOMING_CALL_OVERLAY_CONFIG.vibrationDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private movePhoneToCenter(): void {
        this.stopRinging();

        this.moveTween = this.scene.tweens.add({
            targets: this.phoneImage,
            x: INCOMING_CALL_OVERLAY_CONFIG.centerX,
            y: INCOMING_CALL_OVERLAY_CONFIG.centerY,
            scaleX: INCOMING_CALL_OVERLAY_CONFIG.centerWidth / this.phoneImage.width,
            scaleY: INCOMING_CALL_OVERLAY_CONFIG.centerHeight / this.phoneImage.height,
            duration: INCOMING_CALL_OVERLAY_CONFIG.moveToCenterDurationMs,
            ease: 'Cubic.InOut',
            onStart: () => {
                this.scene.tweens.add({
                    targets: this.overlay,
                    alpha: INCOMING_CALL_OVERLAY_CONFIG.overlayAlpha,
                    duration: INCOMING_CALL_OVERLAY_CONFIG.overlayFadeDurationMs,
                    ease: 'Sine.Out',
                });
            },
            onComplete: () => {
                this.startRinging();
                this.sequenceTimer = this.scene.time.delayedCall(
                    INCOMING_CALL_OVERLAY_CONFIG.promptRevealDelayMs,
                    () => {
                        this.sequenceTimer = undefined;
                        this.readyToAccept = true;
                        this.prompt.setVisible(true);
                    },
                );
            },
        });
    }

    private clearSequence(): void {
        this.readyToAccept = false;
        this.sequenceTimer?.remove(false);
        this.sequenceTimer = undefined;
        this.moveTween?.stop();
        this.moveTween = undefined;
    }

    private updatePromptText(text: string): void {
        this.prompt.setText(text.trim());
    }
}
