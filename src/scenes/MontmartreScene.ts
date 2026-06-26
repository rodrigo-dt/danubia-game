import Phaser from 'phaser';
import { Danubia } from '../characters/Danubia';
import { DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';
import type { RectArea } from '../game/types';
import {
    hasShownMontmartrePhoneHint,
    hasUnlockedPhoneHud,
    markMontmartrePhoneHintShown,
    setHomePortalUnlocked,
    setPhoneHudUnlocked,
} from '../game/states';
import { GameHud } from '../ui/GameHud';
import { FragmentNotification } from '../ui/FragmentNotification';
import { PHONE_CHECKLIST_CONFIG, PhoneChecklist } from '../ui/PhoneChecklist';

const MONTMARTRE_WALK_AREA = {
    x: 20,
    y: 427,
    width: 920,
    height: 168,
    baseScaleY: 418,
} as const;

const MONTMARTRE_DEPTH_SCALE = {
    baseScale: 2,
    farY: 340,
    nearY: 500,
    farScale: 1.74,
    nearScale: 1.94,
    baseY: 418,
} as const;

const PORTAL_ARRIVAL_CONFIG = {
    position: {
        x: 170,
        y: 372,
    },
    scale: 0.92,
    backDepth: 1,
    characterDepth: 2,
    frontDepth: 3,
    pulseScaleMultiplier: 1.06,
    pulseDurationMs: 920,
    pulseAlphaMin: 0.86,
    pulseAlphaMax: 1,
    driftAngle: 1.4,
    driftDurationMs: 1600,
    walkOutDistance: 112,
    walkOutSpeedPxPerSecond: 108,
    initialAlpha: 0.28,
    fadeInDurationMs: 360,
    portalFadeDelayMs: 240,
    portalFadeDurationMs: 320,
    inputUnlockDelayMs: 140,
    transition: {
        durationMs: 760,
        cameraZoomStart: 1.06,
        cameraZoomEnd: 1,
        cameraShakeDurationMs: 220,
        cameraShakeIntensity: 0.004,
        baseColor: 0x2b1f65,
        accentColor: 0x5fb4ff,
        highlightColor: 0xf4d35e,
        overlayAlpha: 0.68,
        flashAlpha: 0.46,
        ringStrokeAlpha: 0.7,
        ringStrokeWidth: 4,
        ringMaxRadius: 780,
    },
} as const;

const MONTMARTRE_PHONE_HINT_CONFIG = {
    delayAfterArrivalMs: 1100,
    visibleDurationMs: 2600,
    message: 'Dica: pressione TAB para abrir o celular.',
} as const;

type MontmartreSceneData = {
    transitionFromPortal?: boolean;
};

export class MontmartreScene extends Phaser.Scene {
    private danubia?: Danubia;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private gameHud?: GameHud;
    private phoneChecklist?: PhoneChecklist;
    private fragmentNotification?: FragmentNotification;
    private portalBackHalf?: Phaser.GameObjects.Image;
    private portalFrontHalf?: Phaser.GameObjects.Image;
    private portalPulseTween?: Phaser.Tweens.Tween;
    private portalDriftTween?: Phaser.Tweens.Tween;
    private arrivalOverlay?: Phaser.GameObjects.Container;
    private togglePhoneKey?: Phaser.Input.Keyboard.Key;
    private isArrivalCutsceneActive = false;

    constructor() {
        super(SCENE_KEYS.montmartre);
    }

    create(data?: MontmartreSceneData): void {
        this.add
            .image(0, 0, 'bg-paris-montmartre')
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.danubia = new Danubia(this, 156, 438);
        this.gameHud = new GameHud(this);
        this.phoneChecklist = new PhoneChecklist(this);
        this.fragmentNotification = new FragmentNotification(this);
        this.togglePhoneKey = this.input.keyboard?.addKey(PHONE_CHECKLIST_CONFIG.toggleKeyCode);
        installDevModeHotkeys(this, {
            onUnlockPhoneHud: () => {
                setPhoneHudUnlocked(true);
                this.fragmentNotification?.show('DEV: celular HUD desbloqueado.', {
                    visibleDurationMs: 1800,
                });
            },
            onUnlockHomePortal: () => {
                setHomePortalUnlocked(true);
                this.fragmentNotification?.show('DEV: portal da casa desbloqueado no estado.', {
                    visibleDurationMs: 1800,
                });
            },
        });
        this.danubia.setWalkPlaneMode(
            MONTMARTRE_WALK_AREA,
            [],
            MONTMARTRE_DEPTH_SCALE,
            {
                enabled: true,
            },
        );
        this.danubia.setWalkPlaneSpawn({ x: 156, y: 438 }, 'right');

        if (DEBUG_ROOM_GEOMETRY) {
            this.debugGraphics = this.add.graphics();
            this.debugText = this.add.text(12, 12, '', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 6, y: 4 },
            }).setScrollFactor(0).setDepth(1000);
        }

        if (data?.transitionFromPortal) {
            this.startPortalArrivalCutscene();
            return;
        }

        this.cameras.main.fadeIn(220, 228, 244, 255);
        this.schedulePhoneHint();
    }

    update(): void {
        this.danubia?.update();
        this.gameHud?.setCompactPhoneVisible(!this.phoneChecklist?.isPhoneAnimatingOrVisible);
        this.gameHud?.refresh();
        this.phoneChecklist?.refresh();
        this.updateChecklistToggle();
        this.syncDanubiaMovementBlock();

        if (DEBUG_ROOM_GEOMETRY) {
            this.drawDebugGeometry();
        }
    }

    private startPortalArrivalCutscene(): void {
        if (!this.danubia) {
            return;
        }

        this.isArrivalCutsceneActive = true;
        this.danubia.setMovementBlocked(true);
        this.danubia.setDepth(PORTAL_ARRIVAL_CONFIG.characterDepth);
        this.createPortalHalves();
        this.createArrivalOverlay();

        const portalFootY = PORTAL_ARRIVAL_CONFIG.position.y
            + this.getPortalScaledHeight() * 0.5
            - 10;
        const portalStart = {
            x: PORTAL_ARRIVAL_CONFIG.position.x,
            y: this.resolveDanubiaCutsceneY(portalFootY),
        };
        const exitTarget = {
            x: portalStart.x + PORTAL_ARRIVAL_CONFIG.walkOutDistance,
            y: portalStart.y,
        };
        const proxy = { ...portalStart };
        const alphaProxy = { alpha: PORTAL_ARRIVAL_CONFIG.initialAlpha };
        const distance = Phaser.Math.Distance.Between(
            portalStart.x,
            portalStart.y,
            exitTarget.x,
            exitTarget.y,
        );
        const walkDurationMs = Math.max(
            240,
            (distance / PORTAL_ARRIVAL_CONFIG.walkOutSpeedPxPerSecond) * 1000,
        );

        this.danubia.setCutscenePosition(portalStart);
        this.danubia.setCharacterAlpha(PORTAL_ARRIVAL_CONFIG.initialAlpha);
        this.danubia.playWalkCutscene('right');
        this.cameras.main.shake(
            PORTAL_ARRIVAL_CONFIG.transition.cameraShakeDurationMs,
            PORTAL_ARRIVAL_CONFIG.transition.cameraShakeIntensity,
        );

        this.tweens.add({
            targets: alphaProxy,
            alpha: 1,
            duration: PORTAL_ARRIVAL_CONFIG.fadeInDurationMs,
            ease: 'Quad.Out',
            onUpdate: () => {
                this.danubia?.setCharacterAlpha(alphaProxy.alpha);
            },
        });

        this.tweens.add({
            targets: proxy,
            x: exitTarget.x,
            duration: walkDurationMs,
            ease: 'Sine.Out',
            onUpdate: () => {
                this.danubia?.setCutscenePosition(proxy);
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(exitTarget);
                this.danubia?.playIdleCutscene('right');

                this.time.delayedCall(PORTAL_ARRIVAL_CONFIG.inputUnlockDelayMs, () => {
                    this.isArrivalCutsceneActive = false;
                    this.danubia?.setMovementBlocked(false);
                    this.schedulePhoneHint();
                });
            },
        });

        this.time.delayedCall(PORTAL_ARRIVAL_CONFIG.portalFadeDelayMs, () => {
            this.fadeOutPortal();
        });

        this.time.delayedCall(PORTAL_ARRIVAL_CONFIG.transition.durationMs, () => {
            this.clearArrivalOverlay();
        });
    }

    private createPortalHalves(): void {
        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            return;
        }

        const halfFrameWidth = Math.floor(textureFrame.width * 0.5);
        const remainingFrameWidth = textureFrame.width - halfFrameWidth;
        const leftHalf = this.add
            .image(
                PORTAL_ARRIVAL_CONFIG.position.x,
                PORTAL_ARRIVAL_CONFIG.position.y,
                'effect-time-portal',
            )
            .setScale(PORTAL_ARRIVAL_CONFIG.scale)
            .setDepth(PORTAL_ARRIVAL_CONFIG.frontDepth);
        const rightHalf = this.add
            .image(
                PORTAL_ARRIVAL_CONFIG.position.x,
                PORTAL_ARRIVAL_CONFIG.position.y,
                'effect-time-portal',
            )
            .setScale(PORTAL_ARRIVAL_CONFIG.scale)
            .setDepth(PORTAL_ARRIVAL_CONFIG.backDepth);

        leftHalf.setCrop(0, 0, halfFrameWidth, textureFrame.height);
        rightHalf.setCrop(halfFrameWidth, 0, remainingFrameWidth, textureFrame.height);

        this.portalFrontHalf = leftHalf;
        this.portalBackHalf = rightHalf;

        this.portalPulseTween = this.tweens.add({
            targets: [leftHalf, rightHalf],
            scaleX: PORTAL_ARRIVAL_CONFIG.scale * PORTAL_ARRIVAL_CONFIG.pulseScaleMultiplier,
            scaleY: PORTAL_ARRIVAL_CONFIG.scale * PORTAL_ARRIVAL_CONFIG.pulseScaleMultiplier,
            alpha: {
                from: PORTAL_ARRIVAL_CONFIG.pulseAlphaMin,
                to: PORTAL_ARRIVAL_CONFIG.pulseAlphaMax,
            },
            duration: PORTAL_ARRIVAL_CONFIG.pulseDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.portalDriftTween = this.tweens.add({
            targets: [leftHalf, rightHalf],
            angle: {
                from: -PORTAL_ARRIVAL_CONFIG.driftAngle,
                to: PORTAL_ARRIVAL_CONFIG.driftAngle,
            },
            duration: PORTAL_ARRIVAL_CONFIG.driftDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private fadeOutPortal(): void {
        if (!this.portalFrontHalf || !this.portalBackHalf) {
            return;
        }

        this.portalPulseTween?.stop();
        this.portalPulseTween = undefined;
        this.portalDriftTween?.stop();
        this.portalDriftTween = undefined;

        this.tweens.add({
            targets: [this.portalFrontHalf, this.portalBackHalf],
            alpha: 0,
            scaleX: PORTAL_ARRIVAL_CONFIG.scale * 0.88,
            scaleY: PORTAL_ARRIVAL_CONFIG.scale * 0.88,
            duration: PORTAL_ARRIVAL_CONFIG.portalFadeDurationMs,
            ease: 'Quad.Out',
            onComplete: () => {
                this.portalFrontHalf?.destroy();
                this.portalFrontHalf = undefined;
                this.portalBackHalf?.destroy();
                this.portalBackHalf = undefined;
            },
        });
    }

    private createArrivalOverlay(): void {
        const transitionConfig = PORTAL_ARRIVAL_CONFIG.transition;
        const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        const wash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            transitionConfig.baseColor,
            transitionConfig.overlayAlpha,
        );
        const flash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            transitionConfig.highlightColor,
            transitionConfig.flashAlpha,
        );
        const ringA = this.add.circle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            48,
        );
        ringA.setStrokeStyle(
            transitionConfig.ringStrokeWidth,
            transitionConfig.accentColor,
            transitionConfig.ringStrokeAlpha,
        );
        ringA.setFillStyle(transitionConfig.baseColor, 0.08);

        const ringB = this.add.circle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            34,
        );
        ringB.setStrokeStyle(
            transitionConfig.ringStrokeWidth,
            transitionConfig.highlightColor,
            transitionConfig.ringStrokeAlpha,
        );
        ringB.setFillStyle(transitionConfig.accentColor, 0.06);

        overlay.add([wash, flash, ringA, ringB]);
        this.arrivalOverlay = overlay;
        this.cameras.main.setZoom(transitionConfig.cameraZoomStart);

        this.tweens.add({
            targets: this.cameras.main,
            zoom: transitionConfig.cameraZoomEnd,
            duration: transitionConfig.durationMs,
            ease: 'Cubic.Out',
        });

        this.tweens.add({
            targets: wash,
            alpha: 0,
            duration: transitionConfig.durationMs,
            ease: 'Quad.Out',
        });

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: transitionConfig.durationMs * 0.45,
            ease: 'Sine.Out',
        });

        this.tweens.add({
            targets: ringA,
            scaleX: transitionConfig.ringMaxRadius / ringA.radius,
            scaleY: transitionConfig.ringMaxRadius / ringA.radius,
            alpha: 0,
            duration: transitionConfig.durationMs,
            ease: 'Cubic.Out',
        });

        this.tweens.add({
            targets: ringB,
            scaleX: transitionConfig.ringMaxRadius / ringB.radius,
            scaleY: transitionConfig.ringMaxRadius / ringB.radius,
            alpha: 0,
            duration: transitionConfig.durationMs * 0.88,
            ease: 'Cubic.Out',
            delay: 50,
        });
    }

    private clearArrivalOverlay(): void {
        this.arrivalOverlay?.destroy();
        this.arrivalOverlay = undefined;
    }

    private drawDebugGeometry(): void {
        if (!this.debugGraphics || !this.debugText || !this.danubia) {
            return;
        }

        this.debugGraphics.clear();
        this.fillRect(this.debugGraphics, MONTMARTRE_WALK_AREA, 0x00ff66, 0.18, 0x00ff66, 1);

        const foot = this.danubia.getFootBounds();
        this.fillRect(this.debugGraphics, foot, 0xffdd00, 0.28, 0xffdd00, 1);

        const shadow = this.danubia.getShadowBounds();
        this.fillRect(this.debugGraphics, shadow, 0x66aaff, 0.16, 0x66aaff, 1);

        const logical = this.danubia.getLogicalPosition();
        const pointer = this.input.activePointer;

        this.debugText.setText(
            [
                'room: montmartre',
                `mouse x:${Math.round(pointer.worldX)} y:${Math.round(pointer.worldY)}`,
                `logical x:${Math.round(logical.x)} y:${Math.round(logical.y)}`,
                `foot x:${Math.round(foot.x)} y:${Math.round(foot.y)} w:${Math.round(foot.width)} h:${Math.round(foot.height)}`,
                `shadow x:${Math.round(shadow.x)} y:${Math.round(shadow.y)}`,
                `shadow w:${Math.round(shadow.width)} h:${Math.round(shadow.height)} a:${this.danubia.getShadowAlpha().toFixed(2)}`,
            ].join('\n'),
        );
    }

    private getPortalScaledHeight(): number {
        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            return 0;
        }

        return textureFrame.height * PORTAL_ARRIVAL_CONFIG.scale;
    }

    private resolveDanubiaCutsceneY(portalFootY: number): number {
        if (!this.danubia) {
            return portalFootY;
        }

        const foot = this.danubia.getFootBounds();
        return this.danubia.getLogicalPosition().y + (portalFootY - (foot.y + foot.height));
    }

    private updateChecklistToggle(): void {
        if (
            !this.danubia ||
            !this.phoneChecklist ||
            !this.togglePhoneKey ||
            !hasUnlockedPhoneHud() ||
            this.isArrivalCutsceneActive
        ) {
            return;
        }

        if (!Phaser.Input.Keyboard.JustDown(this.togglePhoneKey)) {
            return;
        }

        this.phoneChecklist.toggle();
        this.danubia.setMovementBlocked(this.phoneChecklist.blocksMovement);
    }

    private schedulePhoneHint(): void {
        if (
            hasShownMontmartrePhoneHint() ||
            !hasUnlockedPhoneHud()
        ) {
            return;
        }

        markMontmartrePhoneHintShown();
        this.time.delayedCall(MONTMARTRE_PHONE_HINT_CONFIG.delayAfterArrivalMs, () => {
            this.fragmentNotification?.show(MONTMARTRE_PHONE_HINT_CONFIG.message, {
                visibleDurationMs: MONTMARTRE_PHONE_HINT_CONFIG.visibleDurationMs,
            });
        });
    }

    private syncDanubiaMovementBlock(): void {
        this.danubia?.setMovementBlocked(
            this.isArrivalCutsceneActive || this.phoneChecklist?.blocksMovement === true,
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
