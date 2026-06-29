import Phaser from 'phaser';
import { Danubia } from '../characters/Danubia';
import { DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import {
    gardenArrivalDialogue,
    gardenCollectiveRescueDialogue,
    gardenDoorBlockedDialogue,
    gardenEchoOneFeedbackDialogue,
    gardenEchoThreeFeedbackDialogue,
    gardenEchoTwoFeedbackDialogue,
    gardenMonsieurCallDialogue,
} from '../data/dialogues';
import { installDevModeHotkeys } from '../game/devMode';
import {
    hasUnlockedPhoneHud,
    isPetRescued,
    markPetRescued,
} from '../game/states';
import { DialogueController } from '../systems/DialogueController';
import type { DialogueSequence, RectArea, RoomBlocker, WalkArea } from '../game/types';
import { FragmentNotification } from '../ui/FragmentNotification';
import { GameHud } from '../ui/GameHud';
import { IncomingCallOverlay } from '../ui/IncomingCallOverlay';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { PHONE_CHECKLIST_CONFIG, PhoneChecklist } from '../ui/PhoneChecklist';

type GardenWalkAreaId = 'lower' | 'upper';

type GardenWalkAreaConfig = {
    walkArea: WalkArea;
    depthScale: {
        baseScale: number;
        farY: number;
        nearY: number;
        farScale: number;
        nearScale: number;
        baseY: number;
    };
    movement: {
        horizontalSpeedMultiplier: number;
        verticalSpeedMultiplier: number;
        minScale: number;
        maxScale: number;
    };
    blockers: RoomBlocker[];
};

type TemporalEchoConfig = {
    id: 'echo-1' | 'echo-2' | 'echo-3';
    x: number;
    y: number;
    radius: number;
    zone: RectArea;
    feedbackDialogue: DialogueSequence;
};

type TemporalEchoRuntime = {
    config: TemporalEchoConfig;
    glow: Phaser.GameObjects.Arc;
    ring: Phaser.GameObjects.Arc;
    core: Phaser.GameObjects.Arc;
    pulseTween?: Phaser.Tweens.Tween;
    glowTween?: Phaser.Tweens.Tween;
    particleTimer?: Phaser.Time.TimerEvent;
    progress: number;
    activated: boolean;
};

type CatPrisonRuntime = {
    glow: Phaser.GameObjects.Image;
    bubble: Phaser.GameObjects.Image;
    group: Phaser.GameObjects.Image;
    glowTween?: Phaser.Tweens.Tween;
    bubbleTween?: Phaser.Tweens.Tween;
    revealed: boolean;
    broken: boolean;
};

type EchoSyncUi = {
    container: Phaser.GameObjects.Container;
    fill: Phaser.GameObjects.Rectangle;
};

type GardenSceneData = {
    transitionFromPortal?: boolean;
};

const PORTAL_ARRIVAL_CONFIG = {
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
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.28,
    glowAlphaMax: 0.5,
    glowPulseScaleMultiplier: 1.18,
    glowPulseDurationMs: 980,
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

const GARDEN_WALK_AREAS: Record<GardenWalkAreaId, GardenWalkAreaConfig> = {
    lower: {
        walkArea: {
            x: 20,
            y: 427,
            width: 930,
            height: 110,
            baseScaleY: 418,
        },
        depthScale: {
            baseScale: 2,
            farY: 427,
            nearY: 537,
            farScale: 1.96,
            nearScale: 2.04,
            baseY: 537,
        },
        movement: {
            horizontalSpeedMultiplier: 1,
            verticalSpeedMultiplier: 1,
            minScale: 1.94,
            maxScale: 2.08,
        },
        blockers: [],
    },
    upper: {
        walkArea: {
            x: 648,
            y: 286,
            width: 124,
            height: 58,
            baseScaleY: 315,
        },
        depthScale: {
            baseScale: 0.84,
            farY: 286,
            nearY: 344,
            farScale: 0.84,
            nearScale: 0.845,
            baseY: 315,
        },
        movement: {
            horizontalSpeedMultiplier: 0.2,
            verticalSpeedMultiplier: 0.18,
            minScale: 0.84,
            maxScale: 0.845,
        },
        blockers: [],
    },
};

const CAT_PRISON_CONFIG = {
    position: {
        x: 492,
        y: 348,
    },
    groupOffsetY: 14,
    groupScale: 1.08,
    bubbleScale: 0.6,
    glowScale: 0.7,
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.46,
    glowPulseScaleMultiplier: 1.14,
    glowPulseDurationMs: 920,
    bubbleRotationDurationMs: 6200,
    bubbleFadeDurationMs: 340,
    bubbleShakeOffsetPx: 9,
    bubbleShakeDurationMs: 58,
    bubbleShakeRepeats: 7,
    revealDurationMs: 620,
    revealEase: 'Back.Out',
    particleCount: 14,
    particleTravelDistance: 62,
    particleDurationMs: 480,
    particleColor: 0xf4d35e,
    impactShakeDurationMs: 170,
    impactShakeIntensity: 0.0038,
    jumpHeightPx: 20,
    jumpDurationMs: 220,
} as const;

const ECHO_SYNC_CONFIG = {
    promptText: 'Segure Quadrado / E para sincronizar',
    progressPerSecond: 82,
    decayPerSecond: 58,
    uiX: GAME_WIDTH / 2,
    uiY: GAME_HEIGHT - 94,
    barWidth: 268,
    barHeight: 16,
    uiDepth: 980,
} as const;

const TEMPORAL_ECHO_CONFIGS: TemporalEchoConfig[] = [
    {
        id: 'echo-1',
        x: 335,
        y: 472,
        radius: 36,
        zone: {
            x: 293,
            y: 431,
            width: 90,
            height: 90,
        },
        feedbackDialogue: gardenEchoOneFeedbackDialogue,
    },
    {
        id: 'echo-2',
        x: 820,
        y: 472,
        radius: 40,
        zone: {
            x: 778,
            y: 433,
            width: 95,
            height: 95,
        },
        feedbackDialogue: gardenEchoTwoFeedbackDialogue,
    },
    {
        id: 'echo-3',
        x: 610,
        y: 480,
        radius: 40,
        zone: {
            x: 565,
            y: 436,
            width: 90,
            height: 90,
        },
        feedbackDialogue: gardenEchoThreeFeedbackDialogue,
    },
];

const WORKSHOP_DOOR_CONFIG = {
    promptText: 'Pressione Quadrado / E para entrar na oficina',
    interactionZone: {
        x: 665,
        y: 193,
        width: 69,
        height: 111,
    },
    shimmerX: 700,
    shimmerY: 248,
    shimmerWidth: 84,
    shimmerHeight: 124,
    glowColor: 0xf4d35e,
    glowAlphaMin: 0.12,
    glowAlphaMax: 0.28,
} as const;

const LOWER_TO_UPPER_PORTAL_CONFIG = {
    promptText: 'Pressione Quadrado / E para atravessar o portal',
    lower: {
        x: 726,
        y: 362,
        scale: 0.68,
        interactionZone: {
            x: 654,
            y: 356,
            width: 140,
            height: 132,
        },
    },
    upper: {
        x: 694,
        y: 220,
        scale: 0.34,
        spawn: {
            x: 730,
            y: 300,
        },
        walkOutDistance: 34,
        walkOutSpeedPxPerSecond: 78,
    },
    lowerWalkInOffsetX: 10,
    transitionDurationMs: 620,
    flashAlpha: 0.38,
    overlayAlpha: 0.58,
    overlayColor: 0x23124b,
    particleColorA: 0x8b5cf6,
    particleColorB: 0xf4d35e,
    disappearDurationMs: 220,
    upperPortalFadeDurationMs: 300,
    notificationText: 'Uma passagem temporal apareceu no jardim.',
} as const;

const DOOR_SHIMMER_CONFIG = {
    pulseDurationMs: 980,
    particleDelayMs: 170,
    particleRiseDistance: 18,
    particleDurationMs: 780,
} as const;

const WORKSHOP_TRANSITION_CONFIG = {
    durationMs: 760,
    overlayColor: 0x05070d,
    accentColor: 0xf4d35e,
    overlayAlpha: 0.84,
    flashAlpha: 0.42,
    shakeDurationMs: 180,
    shakeIntensity: 0.0036,
} as const;

export class GardenScene extends Phaser.Scene {
    private static readonly ARRIVAL_DIALOGUE_DELAY_MS = 220;
    private danubia?: Danubia;
    private sceneRoot?: Phaser.GameObjects.Container;
    private interactionPrompt?: InteractionPrompt;
    private gameHud?: GameHud;
    private phoneChecklist?: PhoneChecklist;
    private fragmentNotification?: FragmentNotification;
    private incomingCallOverlay?: IncomingCallOverlay;
    private dialogueController?: DialogueController;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private interactKey?: Phaser.Input.Keyboard.Key;
    private togglePhoneKey?: Phaser.Input.Keyboard.Key;
    private portalBackHalf?: Phaser.GameObjects.Image;
    private portalFrontHalf?: Phaser.GameObjects.Image;
    private portalGlow?: Phaser.GameObjects.Image;
    private portalPulseTween?: Phaser.Tweens.Tween;
    private portalDriftTween?: Phaser.Tweens.Tween;
    private portalGlowTween?: Phaser.Tweens.Tween;
    private arrivalOverlay?: Phaser.GameObjects.Container;
    private workshopTransitionOverlay?: Phaser.GameObjects.Container;
    private sceneObjects: Phaser.GameObjects.GameObject[] = [];
    private catPrison?: CatPrisonRuntime;
    private temporalEchoes: TemporalEchoRuntime[] = [];
    private echoSyncUi?: EchoSyncUi;
    private doorAuraGlow?: Phaser.GameObjects.Image;
    private doorParticleTimer?: Phaser.Time.TimerEvent;
    private lowerPortal?: Phaser.GameObjects.Container;
    private lowerPortalInteractionZone?: RectArea;
    private upperPortal?: Phaser.GameObjects.Container;
    private currentWalkAreaId: GardenWalkAreaId = 'lower';
    private isArrivalCutsceneActive = false;
    private isArrivalNarrativeActive = false;
    private isCatPrisonRevealActive = false;
    private isSynchronizingEcho = false;
    private isCollectiveRescueSequenceActive = false;
    private isIncomingCallActive = false;
    private isWorkshopTransitionActive = false;
    private isLowerPortalUnlocked = false;
    private isLowerPortalTransitionActive = false;
    private hasCompletedCollectiveRescue = false;
    private hasTriggeredMonsieurCall = false;
    private hasCompletedMonsieurCall = false;
    private hasUsedLowerToUpperPortal = false;
    private isWorkshopDoorUnlocked = false;
    private wasSquarePressed = false;

    constructor() {
        super(SCENE_KEYS.garden);
    }

    create(data?: GardenSceneData): void {
        this.add.image(0, 0, 'bg-paris-garden').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.sceneRoot = this.add.container(0, 0).setDepth(0);
        this.danubia = new Danubia(this, 138, 392);
        this.interactionPrompt = new InteractionPrompt(this);
        this.gameHud = new GameHud(this);
        this.phoneChecklist = new PhoneChecklist(this);
        this.fragmentNotification = new FragmentNotification(this);
        this.incomingCallOverlay = new IncomingCallOverlay(this);
        this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.togglePhoneKey = this.input.keyboard?.addKey(PHONE_CHECKLIST_CONFIG.toggleKeyCode);
        this.dialogueController = new DialogueController(this, {
            onStateChange: (active) => {
                this.danubia?.setMovementBlocked(
                    active
                    || this.isArrivalCutsceneActive
                    || this.isArrivalNarrativeActive
                    || this.isCatPrisonRevealActive
                    || this.isSynchronizingEcho
                    || this.isCollectiveRescueSequenceActive
                    || this.isIncomingCallActive
                    || this.isLowerPortalTransitionActive
                    || this.isWorkshopTransitionActive
                    || this.phoneChecklist?.blocksMovement === true,
                );

                if (active) {
                    this.interactionPrompt?.hide();
                }
            },
        });
        installDevModeHotkeys(this);

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

        this.applyWalkArea('lower', {
            spawn: { x: 138, y: 392 },
            facing: 'right',
        });
        this.createGardenContent();

        if (data?.transitionFromPortal === false) {
            this.cameras.main.fadeIn(220, 228, 244, 255);
            this.isArrivalNarrativeActive = true;
            this.time.delayedCall(GardenScene.ARRIVAL_DIALOGUE_DELAY_MS, () => {
                this.startArrivalDialogue();
            });
            return;
        }

        this.startPortalArrivalCutscene();
    }

    update(_time?: number, delta = this.game.loop.delta): void {
        this.danubia?.update(undefined, delta);
        this.dialogueController?.update();

        const echoHandled = this.updateEchoSynchronization(delta);

        if (!echoHandled) {
            this.updatePortalAndDoorInteraction();
        }

        this.updateChecklistToggle();
        this.gameHud?.setCompactPhoneVisible(
            !this.phoneChecklist?.isPhoneAnimatingOrVisible && !this.isIncomingCallActive,
        );
        this.gameHud?.refresh();
        this.phoneChecklist?.refresh();
        this.syncDanubiaMovementBlock();

        if (DEBUG_ROOM_GEOMETRY) {
            this.drawDebugGeometry();
        }
    }

    private createGardenContent(): void {
        const catsAlreadyRescued =
            isPetRescued('brecko') && isPetRescued('lelo') && isPetRescued('pure');

        if (catsAlreadyRescued) {
            this.hasCompletedCollectiveRescue = true;
            this.hasTriggeredMonsieurCall = true;
            this.hasCompletedMonsieurCall = true;
            this.isLowerPortalUnlocked = true;
            this.isWorkshopDoorUnlocked = true;
            this.createLowerPortal();
            this.createWorkshopDoorAura();
            return;
        }

        this.createCatPrison();
        this.createTemporalEchoes();
    }

    private applyWalkArea(
        areaId: GardenWalkAreaId,
        options?: {
            spawn?: { x: number; y: number };
            facing?: 'left' | 'right';
        },
    ): void {
        const config = GARDEN_WALK_AREAS[areaId];
        const currentPosition = this.danubia?.getLogicalPosition();

        this.currentWalkAreaId = areaId;
        this.danubia?.setWalkPlaneMode(
            config.walkArea,
            config.blockers,
            config.depthScale,
            {
                enabled: true,
            },
            {
                horizontalSpeedMultiplier: config.movement.horizontalSpeedMultiplier,
                verticalSpeedMultiplier: config.movement.verticalSpeedMultiplier,
                minScale: config.movement.minScale,
                maxScale: config.movement.maxScale,
                smoothScale: false,
                smoothSpeed: false,
                scaleReference: 'foot-area',
            },
        );

        if (options?.spawn) {
            this.danubia?.setWalkPlaneSpawn(options.spawn, options.facing ?? 'right');
            return;
        }

        if (currentPosition) {
            this.danubia?.setCutscenePosition(currentPosition);
        }
    }


    private startPortalArrivalCutscene(): void {
        if (!this.danubia) {
            return;
        }

        this.isArrivalCutsceneActive = true;
        this.danubia.setMovementBlocked(true);
        this.danubia.setDepth(PORTAL_ARRIVAL_CONFIG.characterDepth);
        const portalAnchor = this.getPortalArrivalAnchor();
        this.createPortalHalves(portalAnchor);
        this.createArrivalOverlay();

        const portalFootY = portalAnchor.y + this.getPortalScaledHeight() * 0.5 - 10;
        const portalStart = {
            x: portalAnchor.x,
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
                    this.isArrivalNarrativeActive = true;
                    this.startArrivalDialogue();
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

    private startArrivalDialogue(): void {
        const started = this.dialogueController?.start(gardenArrivalDialogue, {
            onComplete: () => {
                this.isArrivalNarrativeActive = false;
                if (this.catPrison && !this.hasCompletedCollectiveRescue) {
                    this.startCatPrisonReveal();
                    return;
                }

                this.fragmentNotification?.show('Checklist atualizada.\nExplore o jardim.', {
                    visibleDurationMs: 2200,
                });
            },
        }) ?? false;

        if (!started) {
            this.isArrivalNarrativeActive = false;
            if (this.catPrison && !this.hasCompletedCollectiveRescue) {
                this.startCatPrisonReveal();
            }
        }
    }

    private createCatPrison(): void {
        const glow = this.add.image(
            CAT_PRISON_CONFIG.position.x,
            CAT_PRISON_CONFIG.position.y + 6,
            'effect-time-bubble',
        );
        glow.setTint(CAT_PRISON_CONFIG.glowColor);
        glow.setAlpha(0);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setScale(0);
        glow.setDepth(3.5);

        const bubble = this.add.image(
            CAT_PRISON_CONFIG.position.x,
            CAT_PRISON_CONFIG.position.y,
            'effect-time-bubble',
        );
        bubble.setScale(0);
        bubble.setAlpha(0);
        bubble.setDepth(4);

        const group = this.add.image(
            CAT_PRISON_CONFIG.position.x,
            CAT_PRISON_CONFIG.position.y + CAT_PRISON_CONFIG.groupOffsetY,
            'pet-brecko-lelo-pure',
        );
        group.setScale(0);
        group.setAlpha(0);
        group.setDepth(5);

        this.sceneRoot?.add([glow, bubble, group]);
        this.sceneObjects.push(glow, bubble, group);
        this.catPrison = {
            glow,
            bubble,
            group,
            revealed: false,
            broken: false,
        };
    }

    private startCatPrisonReveal(): void {
        if (!this.catPrison || this.catPrison.revealed) {
            return;
        }

        this.isCatPrisonRevealActive = true;
        this.syncDanubiaMovementBlock();
        this.interactionPrompt?.hide();

        this.time.delayedCall(220, () => {
            if (!this.catPrison?.bubble.scene || !this.catPrison.group.scene) {
                this.isCatPrisonRevealActive = false;
                return;
            }

            this.spawnTemporalBurstParticles(
                CAT_PRISON_CONFIG.position.x,
                CAT_PRISON_CONFIG.position.y,
                CAT_PRISON_CONFIG.particleCount,
                CAT_PRISON_CONFIG.particleTravelDistance,
                CAT_PRISON_CONFIG.particleDurationMs,
                CAT_PRISON_CONFIG.particleColor,
                6,
                4,
            );
            this.cameras.main.shake(
                CAT_PRISON_CONFIG.impactShakeDurationMs,
                CAT_PRISON_CONFIG.impactShakeIntensity,
            );

            this.tweens.add({
                targets: [this.catPrison.glow, this.catPrison.bubble, this.catPrison.group],
                alpha: 1,
                duration: CAT_PRISON_CONFIG.revealDurationMs * 0.72,
                ease: 'Sine.Out',
            });

            this.tweens.add({
                targets: this.catPrison.glow,
                scaleX: CAT_PRISON_CONFIG.glowScale,
                scaleY: CAT_PRISON_CONFIG.glowScale,
                duration: CAT_PRISON_CONFIG.revealDurationMs,
                ease: CAT_PRISON_CONFIG.revealEase,
            });

            this.tweens.add({
                targets: this.catPrison.bubble,
                scaleX: CAT_PRISON_CONFIG.bubbleScale,
                scaleY: CAT_PRISON_CONFIG.bubbleScale,
                duration: CAT_PRISON_CONFIG.revealDurationMs,
                ease: CAT_PRISON_CONFIG.revealEase,
            });

            this.tweens.add({
                targets: this.catPrison.group,
                scaleX: CAT_PRISON_CONFIG.groupScale,
                scaleY: CAT_PRISON_CONFIG.groupScale,
                duration: CAT_PRISON_CONFIG.revealDurationMs,
                ease: CAT_PRISON_CONFIG.revealEase,
                onComplete: () => {
                    if (!this.catPrison) {
                        return;
                    }

                    this.catPrison.revealed = true;
                    this.catPrison.glowTween = this.tweens.add({
                        targets: this.catPrison.glow,
                        alpha: {
                            from: CAT_PRISON_CONFIG.glowAlphaMin,
                            to: CAT_PRISON_CONFIG.glowAlphaMax,
                        },
                        scaleX: CAT_PRISON_CONFIG.glowScale * CAT_PRISON_CONFIG.glowPulseScaleMultiplier,
                        scaleY: CAT_PRISON_CONFIG.glowScale * CAT_PRISON_CONFIG.glowPulseScaleMultiplier,
                        duration: CAT_PRISON_CONFIG.glowPulseDurationMs,
                        ease: 'Sine.InOut',
                        yoyo: true,
                        repeat: -1,
                    });
                    this.catPrison.bubbleTween = this.tweens.add({
                        targets: this.catPrison.bubble,
                        angle: 360,
                        duration: CAT_PRISON_CONFIG.bubbleRotationDurationMs,
                        ease: 'Linear',
                        repeat: -1,
                    });
                    this.isCatPrisonRevealActive = false;
                    this.fragmentNotification?.show('Três assinaturas temporais detectadas.', {
                        visibleDurationMs: 2200,
                    });
                },
            });
        });
    }

    private createTemporalEchoes(): void {
        for (const config of TEMPORAL_ECHO_CONFIGS) {
            const glow = this.add.circle(config.x, config.y, config.radius * 0.82, 0x7c3aed, 0.16);
            glow.setDepth(2.8);
            glow.setBlendMode(Phaser.BlendModes.ADD);
            const ring = this.add.circle(config.x, config.y, config.radius);
            ring.setStrokeStyle(4, 0xc084fc, 0.72);
            ring.setFillStyle(0x0f172a, 0);
            ring.setDepth(2.9);
            const core = this.add.circle(config.x, config.y, config.radius * 0.3, 0xf4d35e, 0.12);
            core.setDepth(3);
            core.setBlendMode(Phaser.BlendModes.ADD);

            this.sceneRoot?.add([glow, ring, core]);
            this.sceneObjects.push(glow, ring, core);

            const runtime: TemporalEchoRuntime = {
                config,
                glow,
                ring,
                core,
                progress: 0,
                activated: false,
                pulseTween: this.tweens.add({
                    targets: ring,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    alpha: {
                        from: 0.62,
                        to: 0.92,
                    },
                    duration: 900,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                }),
                glowTween: this.tweens.add({
                    targets: glow,
                    scaleX: 1.12,
                    scaleY: 1.12,
                    alpha: {
                        from: 0.16,
                        to: 0.3,
                    },
                    duration: 840,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                }),
            };
            runtime.particleTimer = this.time.addEvent({
                delay: 440,
                loop: true,
                callback: () => {
                    this.emitEchoParticles(runtime);
                },
            });
            this.temporalEchoes.push(runtime);
        }
    }

    private emitEchoParticles(runtime: TemporalEchoRuntime): void {
        if (runtime.activated || !runtime.ring.scene) {
            return;
        }

        const count = 3;
        for (let index = 0; index < count; index += 1) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const radius = Phaser.Math.FloatBetween(runtime.config.radius * 0.45, runtime.config.radius * 0.95);
            const particle = this.add.circle(
                runtime.config.x + Math.cos(angle) * radius,
                runtime.config.y + Math.sin(angle) * radius,
                Phaser.Math.FloatBetween(2, 3.5),
                index % 2 === 0 ? 0xc084fc : 0xf4d35e,
                0.84,
            );
            particle.setDepth(3.1);
            this.sceneRoot?.add(particle);
            this.sceneObjects.push(particle);

            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.FloatBetween(10, 18),
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: Phaser.Math.Between(320, 480),
                ease: 'Quad.Out',
                onComplete: () => {
                    particle.destroy();
                    this.sceneObjects = this.sceneObjects.filter((gameObject) => gameObject !== particle);
                },
            });
        }
    }

    private updateEchoSynchronization(delta: number): boolean {
        if (!this.danubia) {
            return false;
        }

        if (this.isIncomingCallActive) {
            this.interactionPrompt?.hide();

            if (this.incomingCallOverlay?.isReadyToAccept && this.isInteractJustPressed()) {
                this.acceptMonsieurCall();
            }

            return true;
        }

        const blocked =
            this.hasCompletedCollectiveRescue
            || this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isCatPrisonRevealActive
            || this.isCollectiveRescueSequenceActive
            || this.isLowerPortalTransitionActive
            || this.isWorkshopTransitionActive
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true;

        if (blocked) {
            this.isSynchronizingEcho = false;
            this.hideEchoSyncUi();
            this.decayEchoProgress(delta);
            return false;
        }

        const foot = this.danubia.getFootBounds();
        const activeRuntime = this.temporalEchoes.find((runtime) =>
            !runtime.activated && this.rectsIntersect(foot, runtime.config.zone),
        );

        if (!activeRuntime) {
            this.isSynchronizingEcho = false;
            this.hideEchoSyncUi();
            this.decayEchoProgress(delta);
            return false;
        }

        if (this.isInteractHeld()) {
            this.isSynchronizingEcho = true;
            activeRuntime.progress = Math.min(
                100,
                activeRuntime.progress + ECHO_SYNC_CONFIG.progressPerSecond * (delta / 1000),
            );
            this.updateEchoProgressVisual(activeRuntime);
            this.ensureEchoSyncUi();
            this.updateEchoSyncUi(activeRuntime.progress);
            this.pulseCatPrisonWhileSync(activeRuntime.progress / 100);

            if (activeRuntime.progress >= 100) {
                this.completeEchoActivation(activeRuntime);
            }

            return true;
        }

        this.isSynchronizingEcho = false;
        this.interactionPrompt?.show(ECHO_SYNC_CONFIG.promptText);
        this.decayEchoProgress(delta, activeRuntime.config.id);

        if (activeRuntime.progress > 0) {
            this.ensureEchoSyncUi();
            this.updateEchoSyncUi(activeRuntime.progress);
            return true;
        }

        this.hideEchoSyncUi();
        return true;
    }

    private completeEchoActivation(runtime: TemporalEchoRuntime): void {
        runtime.activated = true;
        runtime.progress = 100;
        this.isSynchronizingEcho = false;
        this.hideEchoSyncUi();
        this.interactionPrompt?.hide();
        runtime.pulseTween?.stop();
        runtime.glowTween?.stop();
        runtime.particleTimer?.remove(false);
        runtime.ring.setStrokeStyle(4, 0xf4d35e, 0.92);
        runtime.glow.setFillStyle(0xf4d35e, 0.18);
        runtime.glow.setAlpha(0.28);
        runtime.glow.setScale(1.08);
        runtime.core.setFillStyle(0xfde68a, 0.22);
        runtime.core.setAlpha(0.3);

        this.spawnTemporalBurstParticles(
            runtime.config.x,
            runtime.config.y,
            8,
            runtime.config.radius * 1.4,
            360,
            0xf4d35e,
            3.2,
            3,
        );
        this.weakenCatPrisonVisual();

        const activatedCount = this.temporalEchoes.filter((echo) => echo.activated).length;
        const onFeedbackComplete = () => {
            if (activatedCount === TEMPORAL_ECHO_CONFIGS.length) {
                this.startCollectiveRescueSequence();
            }
        };

        this.dialogueController?.start(runtime.config.feedbackDialogue, {
            onComplete: onFeedbackComplete,
        });
    }

    private weakenCatPrisonVisual(): void {
        if (!this.catPrison || this.catPrison.broken) {
            return;
        }

        const activatedCount = this.temporalEchoes.filter((echo) => echo.activated).length;
        const progress = Phaser.Math.Clamp(activatedCount / TEMPORAL_ECHO_CONFIGS.length, 0, 1);
        const bubbleAlpha = Phaser.Math.Linear(1, 0.34, progress);
        const glowAlpha = Phaser.Math.Linear(0.44, 0.16, progress);

        this.tweens.add({
            targets: this.catPrison.bubble,
            alpha: bubbleAlpha,
            duration: 180,
            ease: 'Sine.Out',
        });
        this.tweens.add({
            targets: this.catPrison.glow,
            alpha: glowAlpha,
            duration: 180,
            ease: 'Sine.Out',
        });
    }

    private pulseCatPrisonWhileSync(syncStrength: number): void {
        if (!this.catPrison || this.catPrison.broken) {
            return;
        }

        const strength = Phaser.Math.Clamp(syncStrength, 0, 1);
        this.catPrison.glow.setAlpha(
            Phaser.Math.Clamp(this.catPrison.glow.alpha + 0.01 + strength * 0.01, 0, 0.68),
        );
        this.catPrison.bubble.setScale(
            CAT_PRISON_CONFIG.bubbleScale + strength * 0.015,
        );
    }

    private startCollectiveRescueSequence(): void {
        if (!this.catPrison || this.catPrison.broken) {
            return;
        }

        this.isCollectiveRescueSequenceActive = true;
        this.interactionPrompt?.hide();
        this.catPrison.broken = true;
        this.catPrison.glowTween?.stop();
        this.catPrison.bubbleTween?.stop();

        const originalBubbleX = this.catPrison.bubble.x;
        const originalGroupY = this.catPrison.group.y;

        this.tweens.add({
            targets: this.catPrison.bubble,
            x: {
                from: originalBubbleX - CAT_PRISON_CONFIG.bubbleShakeOffsetPx,
                to: originalBubbleX + CAT_PRISON_CONFIG.bubbleShakeOffsetPx,
            },
            duration: CAT_PRISON_CONFIG.bubbleShakeDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: CAT_PRISON_CONFIG.bubbleShakeRepeats,
            onComplete: () => {
                if (!this.catPrison) {
                    return;
                }

                this.catPrison.bubble.x = originalBubbleX;
                this.spawnTemporalBurstParticles(
                    CAT_PRISON_CONFIG.position.x,
                    CAT_PRISON_CONFIG.position.y,
                    16,
                    80,
                    420,
                    0xf4d35e,
                    6,
                    4,
                );
                this.tweens.add({
                    targets: [this.catPrison.glow, this.catPrison.bubble],
                    alpha: 0,
                    duration: CAT_PRISON_CONFIG.bubbleFadeDurationMs,
                    ease: 'Quad.Out',
                });
                this.tweens.add({
                    targets: this.catPrison.bubble,
                    scaleX: CAT_PRISON_CONFIG.bubbleScale * 1.12,
                    scaleY: CAT_PRISON_CONFIG.bubbleScale * 1.12,
                    duration: CAT_PRISON_CONFIG.bubbleFadeDurationMs,
                    ease: 'Quad.Out',
                    onComplete: () => {
                        this.catPrison?.glow.destroy();
                        this.catPrison?.bubble.destroy();
                        this.sceneObjects = this.sceneObjects.filter((gameObject) =>
                            gameObject !== this.catPrison?.glow && gameObject !== this.catPrison?.bubble,
                        );
                    },
                });
                this.tweens.add({
                    targets: this.catPrison.group,
                    y: originalGroupY - CAT_PRISON_CONFIG.jumpHeightPx,
                    duration: CAT_PRISON_CONFIG.jumpDurationMs,
                    ease: 'Quad.Out',
                    yoyo: true,
                    hold: 80,
                    onComplete: () => {
                        this.catPrison?.group.setY(originalGroupY);
                        this.completeCollectiveRescue();
                    },
                });
            },
        });
    }

    private completeCollectiveRescue(): void {
        markPetRescued('brecko');
        markPetRescued('lelo');
        markPetRescued('pure');
        this.hasCompletedCollectiveRescue = true;
        this.gameHud?.refresh();
        this.phoneChecklist?.refresh();
        this.phoneChecklist?.openTemporarily(2400);
        this.fragmentNotification?.show('Todos os animais foram encontrados!', {
            visibleDurationMs: 2400,
        });

        this.time.delayedCall(this.getAutoChecklistTotalMs(2400), () => {
            const started = this.dialogueController?.start(gardenCollectiveRescueDialogue, {
                onComplete: () => {
                    this.fadeOutRescuedCatGroup(() => {
                        this.time.delayedCall(520, () => {
                            this.startMonsieurCall();
                        });
                    });
                },
            }) ?? false;

            if (!started) {
                this.fadeOutRescuedCatGroup(() => {
                    this.time.delayedCall(520, () => {
                        this.startMonsieurCall();
                    });
                });
            }
        });
    }

    private fadeOutRescuedCatGroup(onComplete?: () => void): void {
        if (!this.catPrison?.group.scene) {
            this.isCollectiveRescueSequenceActive = false;
            onComplete?.();
            return;
        }

        this.tweens.add({
            targets: this.catPrison.group,
            alpha: 0,
            duration: 280,
            ease: 'Quad.Out',
            onComplete: () => {
                this.catPrison?.group.destroy();
                this.sceneObjects = this.sceneObjects.filter((gameObject) => gameObject !== this.catPrison?.group);
                this.isCollectiveRescueSequenceActive = false;
                onComplete?.();
            },
        });
    }

    private startMonsieurCall(): void {
        if (this.hasTriggeredMonsieurCall) {
            return;
        }

        this.hasTriggeredMonsieurCall = true;
        this.phoneChecklist?.close();
        this.isIncomingCallActive = true;
        this.interactionPrompt?.hide();
        this.syncDanubiaMovementBlock();
        this.incomingCallOverlay?.show();
    }

    private acceptMonsieurCall(): void {
        this.isIncomingCallActive = false;
        this.incomingCallOverlay?.hide();

        const started = this.dialogueController?.start(gardenMonsieurCallDialogue, {
            onComplete: () => {
                this.hasCompletedMonsieurCall = true;
                this.isLowerPortalUnlocked = true;
                this.isWorkshopDoorUnlocked = true;
                this.createLowerPortal();
                this.createWorkshopDoorAura();
                this.fragmentNotification?.show(LOWER_TO_UPPER_PORTAL_CONFIG.notificationText, {
                    visibleDurationMs: 2200,
                });
            },
        }) ?? false;

        if (!started) {
            this.hasCompletedMonsieurCall = true;
            this.isLowerPortalUnlocked = true;
            this.isWorkshopDoorUnlocked = true;
            this.createLowerPortal();
            this.createWorkshopDoorAura();
            this.fragmentNotification?.show(LOWER_TO_UPPER_PORTAL_CONFIG.notificationText, {
                visibleDurationMs: 2200,
            });
        }
    }

    private updatePortalAndDoorInteraction(): void {
        if (!this.danubia) {
            return;
        }

        const shouldBlock =
            this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isCatPrisonRevealActive
            || this.isSynchronizingEcho
            || this.isCollectiveRescueSequenceActive
            || this.isIncomingCallActive
            || this.isLowerPortalTransitionActive
            || this.isWorkshopTransitionActive
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true;

        if (shouldBlock) {
            this.interactionPrompt?.hide();
            return;
        }

        const foot = this.danubia.getFootBounds();

        if (
            this.currentWalkAreaId === 'lower'
            && this.isLowerPortalUnlocked
            && !this.hasUsedLowerToUpperPortal
            && this.lowerPortalInteractionZone
            && this.rectsIntersect(foot, this.lowerPortalInteractionZone)
        ) {
            this.interactionPrompt?.show(LOWER_TO_UPPER_PORTAL_CONFIG.promptText);

            if (this.isInteractJustPressed()) {
                this.startLowerToUpperPortalTransition();
            }

            return;
        }

        if (this.currentWalkAreaId !== 'upper') {
            this.interactionPrompt?.hide();
            return;
        }

        if (!this.rectsIntersect(foot, WORKSHOP_DOOR_CONFIG.interactionZone)) {
            this.interactionPrompt?.hide();
            return;
        }

        this.interactionPrompt?.show(WORKSHOP_DOOR_CONFIG.promptText);

        if (!this.isInteractJustPressed()) {
            return;
        }

        if (!this.hasCompletedCollectiveRescue) {
            this.dialogueController?.start(gardenDoorBlockedDialogue);
            return;
        }

        if (!this.hasCompletedMonsieurCall) {
            return;
        }

        if (!this.isWorkshopDoorUnlocked) {
            return;
        }

        this.startWorkshopDoorTransition();
    }

    private createLowerPortal(): void {
        if (this.lowerPortal) {
            this.lowerPortal.setVisible(true);
            return;
        }

        const glow = this.add.image(
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.x,
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.y,
            'effect-time-portal',
        );
        glow.setScale(LOWER_TO_UPPER_PORTAL_CONFIG.lower.scale * 1.12);
        glow.setTint(0x8b5cf6);
        glow.setAlpha(0.26);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        const portal = this.add.image(
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.x,
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.y,
            'effect-time-portal',
        );
        portal.setScale(LOWER_TO_UPPER_PORTAL_CONFIG.lower.scale);
        portal.setAlpha(0.92);

        const container = this.add.container(0, 0, [glow, portal]);
        container.setDepth(3.1);
        this.sceneRoot?.add(container);
        this.sceneObjects.push(container);
        this.lowerPortal = container;
        this.lowerPortalInteractionZone = LOWER_TO_UPPER_PORTAL_CONFIG.lower.interactionZone;

        this.tweens.add({
            targets: portal,
            scaleX: LOWER_TO_UPPER_PORTAL_CONFIG.lower.scale * 1.04,
            scaleY: LOWER_TO_UPPER_PORTAL_CONFIG.lower.scale * 1.04,
            alpha: { from: 0.84, to: 1 },
            duration: 940,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
        this.tweens.add({
            targets: glow,
            scaleX: LOWER_TO_UPPER_PORTAL_CONFIG.lower.scale * 1.2,
            scaleY: LOWER_TO_UPPER_PORTAL_CONFIG.lower.scale * 1.2,
            alpha: { from: 0.2, to: 0.38 },
            duration: 980,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private startLowerToUpperPortalTransition(): void {
        if (!this.danubia || this.isLowerPortalTransitionActive) {
            return;
        }

        this.isLowerPortalTransitionActive = true;
        this.interactionPrompt?.hide();
        this.phoneChecklist?.close();
        this.syncDanubiaMovementBlock();
        this.danubia.setCutsceneControlled(true);

        const lowerPortalCenter = {
            x: LOWER_TO_UPPER_PORTAL_CONFIG.lower.x + LOWER_TO_UPPER_PORTAL_CONFIG.lowerWalkInOffsetX,
            y: this.danubia.getLogicalPosition().y,
        };
        const startPosition = this.danubia.getLogicalPosition();
        const walkProxy = { ...startPosition };
        const walkDistance = Phaser.Math.Distance.Between(
            startPosition.x,
            startPosition.y,
            lowerPortalCenter.x,
            lowerPortalCenter.y,
        );
        const walkDurationMs = Phaser.Math.Clamp(walkDistance * 5.5, 160, 280);

        this.danubia.playWalkCutscene('right', { stableFrame: true });

        this.tweens.add({
            targets: walkProxy,
            x: lowerPortalCenter.x,
            y: lowerPortalCenter.y,
            duration: walkDurationMs,
            ease: 'Sine.Out',
            onUpdate: () => {
                this.danubia?.setCutscenePosition(walkProxy);
            },
            onComplete: () => {
                this.danubia?.playIdleCutscene('right');
                this.playLowerPortalTransition();
            },
        });
    }

    private playLowerPortalTransition(): void {
        if (!this.danubia) {
            return;
        }

        const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        const wash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            LOWER_TO_UPPER_PORTAL_CONFIG.overlayColor,
            0,
        );
        const flash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            LOWER_TO_UPPER_PORTAL_CONFIG.particleColorB,
            0,
        );
        overlay.add([wash, flash]);
        this.arrivalOverlay?.destroy();
        this.arrivalOverlay = overlay;

        this.spawnTemporalBurstParticles(
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.x,
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.y,
            10,
            56,
            460,
            LOWER_TO_UPPER_PORTAL_CONFIG.particleColorA,
            3.2,
            4,
        );
        this.spawnTemporalBurstParticles(
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.x,
            LOWER_TO_UPPER_PORTAL_CONFIG.lower.y,
            8,
            44,
            420,
            LOWER_TO_UPPER_PORTAL_CONFIG.particleColorB,
            3.25,
            3,
        );
        this.cameras.main.shake(180, 0.0034);

        this.tweens.add({
            targets: wash,
            alpha: LOWER_TO_UPPER_PORTAL_CONFIG.overlayAlpha,
            duration: LOWER_TO_UPPER_PORTAL_CONFIG.transitionDurationMs * 0.38,
            ease: 'Sine.Out',
            yoyo: true,
        });
        this.tweens.add({
            targets: flash,
            alpha: LOWER_TO_UPPER_PORTAL_CONFIG.flashAlpha,
            duration: LOWER_TO_UPPER_PORTAL_CONFIG.transitionDurationMs * 0.22,
            ease: 'Sine.Out',
            yoyo: true,
        });
        this.tweens.add({
            targets: this.lowerPortal,
            alpha: 0.32,
            duration: LOWER_TO_UPPER_PORTAL_CONFIG.disappearDurationMs,
            ease: 'Sine.Out',
        });
        const alphaProxy = { value: 1 };
        this.tweens.add({
            targets: alphaProxy,
            value: 0,
            duration: LOWER_TO_UPPER_PORTAL_CONFIG.disappearDurationMs,
            ease: 'Quad.In',
            onUpdate: () => {
                this.danubia?.setCharacterAlpha(alphaProxy.value);
            },
            onComplete: () => {
                this.finishLowerToUpperPortalTransition();
            },
        });
    }

    private finishLowerToUpperPortalTransition(): void {
        if (!this.danubia) {
            return;
        }

        this.hasUsedLowerToUpperPortal = true;
        this.applyWalkArea('upper', {
            spawn: LOWER_TO_UPPER_PORTAL_CONFIG.upper.spawn,
            facing: 'right',
        });
        this.danubia.setCharacterAlpha(0);
        this.danubia.setCutscenePosition(LOWER_TO_UPPER_PORTAL_CONFIG.upper.spawn);
        this.danubia.playWalkCutscene('right', { stableFrame: true });

        const upperGlow = this.add.image(
            LOWER_TO_UPPER_PORTAL_CONFIG.upper.x,
            LOWER_TO_UPPER_PORTAL_CONFIG.upper.y,
            'effect-time-portal',
        );
        upperGlow.setScale(LOWER_TO_UPPER_PORTAL_CONFIG.upper.scale * 1.14);
        upperGlow.setTint(0x8b5cf6);
        upperGlow.setAlpha(0);
        upperGlow.setBlendMode(Phaser.BlendModes.ADD);
        const upperPortal = this.add.image(
            LOWER_TO_UPPER_PORTAL_CONFIG.upper.x,
            LOWER_TO_UPPER_PORTAL_CONFIG.upper.y,
            'effect-time-portal',
        );
        upperPortal.setScale(LOWER_TO_UPPER_PORTAL_CONFIG.upper.scale * 0.86);
        upperPortal.setAlpha(0);
        const container = this.add.container(0, 0, [upperGlow, upperPortal]).setDepth(3.05);
        this.sceneRoot?.add(container);
        this.sceneObjects.push(container);
        this.upperPortal = container;

        const exitTarget = {
            x: LOWER_TO_UPPER_PORTAL_CONFIG.upper.spawn.x + LOWER_TO_UPPER_PORTAL_CONFIG.upper.walkOutDistance,
            y: LOWER_TO_UPPER_PORTAL_CONFIG.upper.spawn.y,
        };
        const walkProxy = { ...LOWER_TO_UPPER_PORTAL_CONFIG.upper.spawn };

        this.tweens.add({
            targets: [upperGlow, upperPortal],
            alpha: 1,
            duration: 180,
            ease: 'Sine.Out',
        });
        this.tweens.add({
            targets: upperPortal,
            scaleX: LOWER_TO_UPPER_PORTAL_CONFIG.upper.scale,
            scaleY: LOWER_TO_UPPER_PORTAL_CONFIG.upper.scale,
            duration: 260,
            ease: 'Back.Out',
        });
        this.tweens.add({
            targets: this.danubia,
            alpha: 1,
            duration: 160,
            ease: 'Sine.Out',
        });
        this.tweens.add({
            targets: walkProxy,
            x: exitTarget.x,
            y: exitTarget.y,
            duration: Math.max(
                220,
                (LOWER_TO_UPPER_PORTAL_CONFIG.upper.walkOutDistance / LOWER_TO_UPPER_PORTAL_CONFIG.upper.walkOutSpeedPxPerSecond) * 1000,
            ),
            ease: 'Sine.Out',
            onUpdate: () => {
                this.danubia?.setCutscenePosition(walkProxy);
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(exitTarget);
                this.danubia?.playIdleCutscene('right');
                this.danubia?.setCutsceneControlled(false);
                this.isLowerPortalTransitionActive = false;
                this.lowerPortal?.setVisible(false);
                this.syncDanubiaMovementBlock();
            },
        });
        this.tweens.add({
            targets: [upperGlow, upperPortal],
            alpha: 0,
            scaleX: LOWER_TO_UPPER_PORTAL_CONFIG.upper.scale * 0.86,
            scaleY: LOWER_TO_UPPER_PORTAL_CONFIG.upper.scale * 0.86,
            duration: LOWER_TO_UPPER_PORTAL_CONFIG.upperPortalFadeDurationMs,
            ease: 'Quad.Out',
            delay: 220,
            onComplete: () => {
                this.upperPortal?.destroy();
                this.upperPortal = undefined;
                this.arrivalOverlay?.destroy();
                this.arrivalOverlay = undefined;
            },
        });
    }

    private createWorkshopDoorAura(): void {
        if (this.doorAuraGlow) {
            this.doorAuraGlow.setVisible(true);
            return;
        }

        const glow = this.add.image(
            WORKSHOP_DOOR_CONFIG.shimmerX,
            WORKSHOP_DOOR_CONFIG.shimmerY,
            'effect-time-bubble',
        );
        glow.setScale(0.34, 0.46);
        glow.setTint(WORKSHOP_DOOR_CONFIG.glowColor);
        glow.setAlpha(WORKSHOP_DOOR_CONFIG.glowAlphaMin);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setDepth(3.12);
        this.sceneRoot?.add(glow);
        this.sceneObjects.push(glow);
        this.doorAuraGlow = glow;

        this.tweens.add({
            targets: glow,
            alpha: {
                from: WORKSHOP_DOOR_CONFIG.glowAlphaMin,
                to: WORKSHOP_DOOR_CONFIG.glowAlphaMax,
            },
            scaleX: 0.38,
            scaleY: 0.52,
            duration: DOOR_SHIMMER_CONFIG.pulseDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.doorParticleTimer?.remove(false);
        this.doorParticleTimer = this.time.addEvent({
            delay: DOOR_SHIMMER_CONFIG.particleDelayMs,
            loop: true,
            callback: () => {
                this.emitWorkshopDoorParticles();
            },
        });
    }

    private emitWorkshopDoorParticles(): void {
        if (!this.doorAuraGlow?.scene) {
            return;
        }

        const particle = this.add.circle(
            Phaser.Math.Between(
                WORKSHOP_DOOR_CONFIG.shimmerX - Math.floor(WORKSHOP_DOOR_CONFIG.shimmerWidth * 0.4),
                WORKSHOP_DOOR_CONFIG.shimmerX + Math.floor(WORKSHOP_DOOR_CONFIG.shimmerWidth * 0.4),
            ),
            Phaser.Math.Between(
                WORKSHOP_DOOR_CONFIG.shimmerY + Math.floor(WORKSHOP_DOOR_CONFIG.shimmerHeight * 0.1),
                WORKSHOP_DOOR_CONFIG.shimmerY + Math.floor(WORKSHOP_DOOR_CONFIG.shimmerHeight * 0.45),
            ),
            Phaser.Math.FloatBetween(1.8, 3.4),
            Phaser.Math.Between(0, 1) === 0 ? 0xf4d35e : 0xfff2a8,
            Phaser.Math.FloatBetween(0.72, 0.95),
        );
        particle.setDepth(3.2);
        this.sceneRoot?.add(particle);
        this.sceneObjects.push(particle);

        this.tweens.add({
            targets: particle,
            y: particle.y - Phaser.Math.FloatBetween(
                DOOR_SHIMMER_CONFIG.particleRiseDistance * 0.6,
                DOOR_SHIMMER_CONFIG.particleRiseDistance,
            ),
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: Phaser.Math.Between(
                Math.floor(DOOR_SHIMMER_CONFIG.particleDurationMs * 0.7),
                DOOR_SHIMMER_CONFIG.particleDurationMs,
            ),
            ease: 'Quad.Out',
            onComplete: () => {
                particle.destroy();
                this.sceneObjects = this.sceneObjects.filter((gameObject) => gameObject !== particle);
            },
        });
    }

    private startWorkshopDoorTransition(): void {
        if (this.isWorkshopTransitionActive) {
            return;
        }

        this.isWorkshopTransitionActive = true;
        this.interactionPrompt?.hide();
        this.phoneChecklist?.close();
        this.syncDanubiaMovementBlock();
        this.playWorkshopTransition(() => {
            // TODO: persist checkpoint "workshop" when the checkpoint/save system is implemented.
            this.scene.start(SCENE_KEYS.workshop);
        });
    }

    private playWorkshopTransition(onComplete: () => void): void {
        const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        const wash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            WORKSHOP_TRANSITION_CONFIG.overlayColor,
            0,
        );
        const flash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            WORKSHOP_TRANSITION_CONFIG.accentColor,
            0,
        );
        overlay.add([wash, flash]);
        this.workshopTransitionOverlay?.destroy();
        this.workshopTransitionOverlay = overlay;

        this.cameras.main.shake(
            WORKSHOP_TRANSITION_CONFIG.shakeDurationMs,
            WORKSHOP_TRANSITION_CONFIG.shakeIntensity,
        );

        this.tweens.add({
            targets: wash,
            alpha: WORKSHOP_TRANSITION_CONFIG.overlayAlpha,
            duration: WORKSHOP_TRANSITION_CONFIG.durationMs,
            ease: 'Quad.Out',
        });

        this.tweens.add({
            targets: flash,
            alpha: WORKSHOP_TRANSITION_CONFIG.flashAlpha,
            duration: WORKSHOP_TRANSITION_CONFIG.durationMs * 0.28,
            ease: 'Sine.Out',
            yoyo: true,
            repeat: 1,
        });

        this.time.delayedCall(WORKSHOP_TRANSITION_CONFIG.durationMs, () => {
            onComplete();
        });
    }

    private ensureEchoSyncUi(): void {
        if (this.echoSyncUi) {
            this.echoSyncUi.container.setVisible(true);
            return;
        }

        const width = 336;
        const height = 76;
        const container = this.add.container(ECHO_SYNC_CONFIG.uiX, ECHO_SYNC_CONFIG.uiY);
        const panel = this.add.rectangle(0, 0, width, height, 0x08111f, 0.82);
        panel.setStrokeStyle(2, 0xf6d365, 0.38);
        const label = this.add.text(0, -18, 'Sincronizando eco temporal', {
            fontFamily: 'monospace',
            fontSize: '17px',
            color: '#f8fafc',
            align: 'center',
        }).setOrigin(0.5);
        const track = this.add.rectangle(
            0,
            14,
            ECHO_SYNC_CONFIG.barWidth,
            ECHO_SYNC_CONFIG.barHeight,
            0x17263c,
            0.96,
        );
        track.setStrokeStyle(2, 0xc084fc, 0.34);
        const fill = this.add.rectangle(
            -ECHO_SYNC_CONFIG.barWidth * 0.5 + 2,
            14,
            0,
            ECHO_SYNC_CONFIG.barHeight - 4,
            0xf6d365,
            1,
        ).setOrigin(0, 0.5);

        container.add([panel, label, track, fill]);
        container.setDepth(ECHO_SYNC_CONFIG.uiDepth);
        container.setScrollFactor(0);
        container.setVisible(true);
        this.echoSyncUi = { container, fill };
    }

    private updateEchoSyncUi(progress: number): void {
        if (!this.echoSyncUi) {
            return;
        }

        this.echoSyncUi.container.setVisible(true);
        this.echoSyncUi.fill.width = (ECHO_SYNC_CONFIG.barWidth - 4) * (progress / 100);
    }

    private hideEchoSyncUi(): void {
        this.echoSyncUi?.container.setVisible(false);
    }

    private decayEchoProgress(delta: number, prioritizedEchoId?: TemporalEchoConfig['id']): void {
        let hasVisibleProgress = false;

        for (const runtime of this.temporalEchoes) {
            if (runtime.activated || runtime.progress <= 0) {
                continue;
            }

            const multiplier = prioritizedEchoId && runtime.config.id === prioritizedEchoId ? 1 : 1.06;
            runtime.progress = Math.max(
                0,
                runtime.progress - ECHO_SYNC_CONFIG.decayPerSecond * multiplier * (delta / 1000),
            );
            this.updateEchoProgressVisual(runtime);
            hasVisibleProgress ||= runtime.progress > 0;
        }

        if (!hasVisibleProgress) {
            this.hideEchoSyncUi();
        }
    }

    private updateEchoProgressVisual(runtime: TemporalEchoRuntime): void {
        if (runtime.activated) {
            runtime.ring.setStrokeStyle(4, 0xf4d35e, 0.92);
            runtime.glow.setFillStyle(0xf4d35e, 0.18);
            runtime.glow.setAlpha(0.28);
            runtime.core.setFillStyle(0xfde68a, 0.22);
            runtime.core.setAlpha(0.3);
            return;
        }

        const progressRatio = Phaser.Math.Clamp(runtime.progress / 100, 0, 1);
        runtime.glow.setAlpha(Phaser.Math.Linear(0.16, 0.46, progressRatio));
        runtime.core.setAlpha(Phaser.Math.Linear(0.12, 0.34, progressRatio));
        runtime.glow.setScale(1 + progressRatio * 0.12);
        runtime.core.setScale(1 + progressRatio * 0.08);
        runtime.ring.setStrokeStyle(
            4,
            progressRatio > 0.5 ? 0xf4d35e : 0xc084fc,
            Phaser.Math.Linear(0.66, 0.96, progressRatio),
        );
    }

    private updateChecklistToggle(): void {
        if (
            !this.danubia
            || !this.phoneChecklist
            || !this.togglePhoneKey
            || !hasUnlockedPhoneHud()
            || this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isCatPrisonRevealActive
            || this.isSynchronizingEcho
            || this.isCollectiveRescueSequenceActive
            || this.isIncomingCallActive
            || this.isLowerPortalTransitionActive
            || this.isWorkshopTransitionActive
            || this.dialogueController?.isActive === true
        ) {
            return;
        }

        if (!Phaser.Input.Keyboard.JustDown(this.togglePhoneKey)) {
            return;
        }

        this.phoneChecklist.toggle();
        this.danubia.setMovementBlocked(this.phoneChecklist.blocksMovement);
    }

    private syncDanubiaMovementBlock(): void {
        this.danubia?.setMovementBlocked(
            this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isCatPrisonRevealActive
            || this.isSynchronizingEcho
            || this.isCollectiveRescueSequenceActive
            || this.isIncomingCallActive
            || this.isLowerPortalTransitionActive
            || this.isWorkshopTransitionActive
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true,
        );
    }

    private getAutoChecklistTotalMs(visibleDurationMs: number): number {
        return PHONE_CHECKLIST_CONFIG.animation.cornerExpandDurationMs
            + PHONE_CHECKLIST_CONFIG.animation.moveToCenterDurationMs
            + PHONE_CHECKLIST_CONFIG.animation.fadeInContentDurationMs
            + visibleDurationMs
            + PHONE_CHECKLIST_CONFIG.animation.closeToCornerDurationMs;
    }

    private createPortalHalves(portalAnchor: { x: number; y: number }): void {
        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            return;
        }

        const halfFrameWidth = Math.floor(textureFrame.width * 0.5);
        const remainingFrameWidth = textureFrame.width - halfFrameWidth;
        const glow = this.add.image(
            portalAnchor.x,
            portalAnchor.y,
            'effect-time-portal',
        ).setDepth(PORTAL_ARRIVAL_CONFIG.backDepth - 0.1);
        glow.setScale(PORTAL_ARRIVAL_CONFIG.scale * 1.14);
        glow.setTint(PORTAL_ARRIVAL_CONFIG.glowColor);
        glow.setAlpha(PORTAL_ARRIVAL_CONFIG.glowAlphaMin);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        const leftHalf = this.add
            .image(portalAnchor.x, portalAnchor.y, 'effect-time-portal')
            .setScale(PORTAL_ARRIVAL_CONFIG.scale)
            .setDepth(PORTAL_ARRIVAL_CONFIG.frontDepth);
        const rightHalf = this.add
            .image(portalAnchor.x, portalAnchor.y, 'effect-time-portal')
            .setScale(PORTAL_ARRIVAL_CONFIG.scale)
            .setDepth(PORTAL_ARRIVAL_CONFIG.backDepth);

        leftHalf.setCrop(0, 0, halfFrameWidth, textureFrame.height);
        rightHalf.setCrop(halfFrameWidth, 0, remainingFrameWidth, textureFrame.height);

        this.portalGlow = glow;
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

        this.portalGlowTween = this.tweens.add({
            targets: glow,
            alpha: {
                from: PORTAL_ARRIVAL_CONFIG.glowAlphaMin,
                to: PORTAL_ARRIVAL_CONFIG.glowAlphaMax,
            },
            scaleX: PORTAL_ARRIVAL_CONFIG.scale * 1.2,
            scaleY: PORTAL_ARRIVAL_CONFIG.scale * 1.2,
            duration: PORTAL_ARRIVAL_CONFIG.glowPulseDurationMs,
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
        this.portalGlowTween?.stop();
        this.portalGlowTween = undefined;

        this.tweens.add({
            targets: [this.portalGlow, this.portalFrontHalf, this.portalBackHalf].filter(Boolean),
            alpha: 0,
            scaleX: PORTAL_ARRIVAL_CONFIG.scale * 0.88,
            scaleY: PORTAL_ARRIVAL_CONFIG.scale * 0.88,
            duration: PORTAL_ARRIVAL_CONFIG.portalFadeDurationMs,
            ease: 'Quad.Out',
            onComplete: () => {
                this.portalGlow?.destroy();
                this.portalGlow = undefined;
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
        const ringA = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 48);
        ringA.setStrokeStyle(
            transitionConfig.ringStrokeWidth,
            transitionConfig.accentColor,
            transitionConfig.ringStrokeAlpha,
        );
        ringA.setFillStyle(transitionConfig.baseColor, 0.08);

        const ringB = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 34);
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

    private spawnTemporalBurstParticles(
        x: number,
        y: number,
        particleCount: number,
        particleTravelDistance: number,
        particleDurationMs: number,
        particleColor: number,
        depth: number,
        particleRadius: number,
    ): void {
        for (let index = 0; index < particleCount; index += 1) {
            const angle = Phaser.Math.DegToRad((360 / particleCount) * index);
            const particle = this.add.circle(
                x,
                y,
                particleRadius,
                particleColor,
                0.95,
            );
            particle.setDepth(depth);
            this.sceneRoot?.add(particle);
            this.sceneObjects.push(particle);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * particleTravelDistance,
                y: y + Math.sin(angle) * particleTravelDistance,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: particleDurationMs,
                ease: 'Quad.Out',
                onComplete: () => {
                    particle.destroy();
                    this.sceneObjects = this.sceneObjects.filter((gameObject) => gameObject !== particle);
                },
            });
        }
    }

    private getPortalScaledHeight(): number {
        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            return 0;
        }

        return textureFrame.height * PORTAL_ARRIVAL_CONFIG.scale;
    }

    private getPortalArrivalAnchor(): { x: number; y: number } {
        const spawn = { x: 138, y: 392 };
        const portalHalfHeight = this.getPortalScaledHeight() * 0.5;
        const danubiaFootOffsetFromLogicalY = 120;
        const portalFootAlignmentOffset = 10;

        return {
            x: spawn.x,
            y: spawn.y + danubiaFootOffsetFromLogicalY - portalHalfHeight + portalFootAlignmentOffset,
        };
    }

    private resolveDanubiaCutsceneY(portalFootY: number): number {
        if (!this.danubia) {
            return portalFootY;
        }

        const foot = this.danubia.getFootBounds();
        return this.danubia.getLogicalPosition().y + (portalFootY - (foot.y + foot.height));
    }

    private isInteractJustPressed(): boolean {
        const keyboardPressed = this.interactKey ? Phaser.Input.Keyboard.JustDown(this.interactKey) : false;

        return keyboardPressed || this.isSquareJustPressed();
    }

    private isInteractHeld(): boolean {
        const keyboardHeld = this.interactKey?.isDown ?? false;

        return keyboardHeld || this.isSquarePressed();
    }

    private isSquarePressed(): boolean {
        const pad = this.input.gamepad?.getPad(0);

        if (!pad) {
            return false;
        }

        return pad.buttons[2]?.pressed ?? false;
    }

    private isSquareJustPressed(): boolean {
        const isPressed = this.isSquarePressed();
        const justPressed = isPressed && !this.wasSquarePressed;

        this.wasSquarePressed = isPressed;

        return justPressed;
    }

    private rectsIntersect(a: RectArea, b: RectArea): boolean {
        return (
            a.x < b.x + b.width
            && a.x + a.width > b.x
            && a.y < b.y + b.height
            && a.y + a.height > b.y
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

    private drawDebugGeometry(): void {
        if (!this.debugGraphics || !this.debugText || !this.danubia) {
            return;
        }

        this.debugGraphics.clear();
        const pointer = this.input.activePointer;

        for (const [areaId, areaConfig] of Object.entries(GARDEN_WALK_AREAS) as Array<[GardenWalkAreaId, GardenWalkAreaConfig]>) {
            const fillColor = areaId === 'lower' ? 0x00ff66 : 0xff66cc;
            this.fillRect(this.debugGraphics, areaConfig.walkArea, fillColor, 0.12, fillColor, 0.9);
        }

        this.fillRect(this.debugGraphics, WORKSHOP_DOOR_CONFIG.interactionZone, 0xf4d35e, 0.1, 0xf4d35e, 0.9);

        if (this.lowerPortalInteractionZone) {
            this.fillRect(this.debugGraphics, this.lowerPortalInteractionZone, 0x7c3aed, 0.08, 0x7c3aed, 0.9);
        }

        for (const echo of this.temporalEchoes) {
            this.fillRect(this.debugGraphics, echo.config.zone, 0xc084fc, 0.08, 0xc084fc, 0.9);
        }

        const foot = this.danubia.getFootBounds();
        this.fillRect(this.debugGraphics, foot, 0xffdd00, 0.28, 0xffdd00, 1);
        const logical = this.danubia.getLogicalPosition();
        this.debugText.setText(
            [
                `room: garden (${this.currentWalkAreaId})`,
                `mouse x:${Math.round(pointer.worldX)} y:${Math.round(pointer.worldY)}`,
                `logical x:${Math.round(logical.x)} y:${Math.round(logical.y)}`,
                `foot x:${Math.round(foot.x)} y:${Math.round(foot.y)} w:${Math.round(foot.width)} h:${Math.round(foot.height)}`,
            ].join('\n'),
        );
    }
}
