import Phaser from 'phaser';
import { Danubia } from '../characters/Danubia';
import { DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import {
    seineArrivalDialogue,
    seineBatataRescueDialogue,
    seineMonsieurFollowUpDialogue,
    seinePirataRescueDialogue,
    seinePitucaRescueDialogue,
} from '../data/dialogues';
import { installDevModeHotkeys } from '../game/devMode';
import type { DialogueSequence, RectArea, RoomBlocker } from '../game/types';
import {
    hasUnlockedPhoneHud,
    isPetRescued,
    markPetRescued,
} from '../game/states';
import { DialogueController } from '../systems/DialogueController';
import { FragmentNotification } from '../ui/FragmentNotification';
import { GameHud } from '../ui/GameHud';
import { IncomingCallOverlay } from '../ui/IncomingCallOverlay';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { PHONE_CHECKLIST_CONFIG, PhoneChecklist } from '../ui/PhoneChecklist';

const SEINE_CONFIG = {
    backgroundKey: 'bg-paris-seine',
    walkArea: {
        x: 18,
        y: 424,
        width: 924,
        height: 112,
        baseScaleY: 416,
    },
    depthScale: {
        baseScale: 2,
        farY: 338,
        nearY: 500,
        farScale: 1.74,
        nearScale: 1.94,
        baseY: 416,
    },
    defaultSpawn: { x: 178, y: 372 },
    defaultFacing: 'right',
    blockers: [] as RoomBlocker[],
} as const;

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

const PET_REVEAL_CONFIG = {
    blockDurationMs: 260,
    areaEnterDelayMs: 260,
    revealDurationMs: 560,
    revealEase: 'Back.Out',
    settleDurationMs: 120,
    particleCount: 11,
    particleRadius: 4,
    particleTravelDistance: 54,
    particleDurationMs: 460,
    particleColor: 0xf4d35e,
    impactShakeDurationMs: 150,
    impactShakeIntensity: 0.0036,
    danubiaRecoilDistancePx: 24,
    danubiaRecoilDurationMs: 180,
    sequenceRevealGapMs: 180,
} as const;

const GARDEN_PORTAL_CONFIG = {
    position: {
        x: 600,
        y: 350,
    },
    footY: 550,
    side: 'right',
    scale: 0.92,
    backDepth: 1,
    characterDepth: 2,
    frontDepth: 3,
    pulseScaleMultiplier: 1.06,
    pulseDurationMs: 920,
    pulseAlphaMin: 0.86,
    pulseAlphaMax: 1,
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.28,
    glowAlphaMax: 0.5,
    glowPulseScaleMultiplier: 1.18,
    glowPulseDurationMs: 980,
    driftAngle: 1.4,
    driftDurationMs: 1600,
    interactionWidth: 400,
    interactionHeight: 400,
    promptText: 'Pressione Quadrado / E para atravessar o portal',
    pullSpeedPxPerSecond: 122,
    fadeDurationMs: 320,
    fadeStartDistancePx: 52,
    transition: {
        durationMs: 820,
        cameraZoom: 1.08,
        cameraShakeDurationMs: 260,
        cameraShakeIntensity: 0.005,
        baseColor: 0x2b1f65,
        accentColor: 0x5fb4ff,
        highlightColor: 0xf4d35e,
        overlayAlpha: 0.7,
        flashAlpha: 0.5,
        ringStrokeAlpha: 0.72,
        ringStrokeWidth: 4,
        ringMaxRadius: 780,
    },
    spawn: {
        durationMs: 520,
        ease: 'Back.Out',
        initialScale: 0.04,
        particleCount: 9,
        particleDistance: 54,
        particleDurationMs: 460,
        cameraShakeDurationMs: 170,
        cameraShakeIntensity: 0.0036,
    },
} as const;

type AreaInteraction = {
    id: string;
    zone: RectArea;
    promptText: string;
    onInteract: () => void;
    priority: number;
};

type PetEncounterConfig = {
    id: 'pirata' | 'batata' | 'pituca';
    assetKey: string;
    bubbleAssetKey: string;
    position: { x: number; y: number };
    petOffsetY: number;
    petScale: number;
    bubbleScale: number;
    interactionZone: RectArea;
    promptText: string;
    dialogue: DialogueSequence;
    rescueJumpHeightPx: number;
    checklistVisibleDurationMs: number;
    glowColor: number;
    glowAlphaMin: number;
    glowAlphaMax: number;
    glowPulseScaleMultiplier: number;
    glowPulseDurationMs: number;
    bubbleRotationDurationMs: number;
    bubbleFadeDurationMs: number;
    bubbleShakeOffsetPx: number;
    bubbleShakeDurationMs: number;
    bubbleShakeRepeats: number;
    petFadeDurationMs: number;
    petFlipX?: boolean;
};

type PetEncounterRuntime = {
    config: PetEncounterConfig;
    glow: Phaser.GameObjects.Image;
    bubble: Phaser.GameObjects.Image;
    pet: Phaser.GameObjects.Image;
    interactionId: string;
    glowTween?: Phaser.Tweens.Tween;
    bubbleRotationTween?: Phaser.Tweens.Tween;
    revealed: boolean;
    rescued: boolean;
};

type RevealPetEncounterOptions = {
    onComplete?: () => void;
    recoilDanubia?: boolean;
};

type BubbleAnchorTarget = Phaser.GameObjects.Image | Danubia;

type SeineSceneData = {
    transitionFromPortal?: boolean;
};

const PIRATA_ENCOUNTER_CONFIG: PetEncounterConfig = {
    id: 'pirata',
    assetKey: 'pet-pirata',
    bubbleAssetKey: 'effect-time-bubble',
    position: { x: 445, y: 330 },
    petOffsetY: 18,
    petScale: 0.98,
    bubbleScale: 0.54,
    interactionZone: {
        x: 370,
        y: 350,
        width: 154,
        height: 116,
    },
    promptText: 'Libertar Pirata',
    dialogue: seinePirataRescueDialogue,
    rescueJumpHeightPx: 24,
    checklistVisibleDurationMs: 2000,
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.44,
    glowPulseScaleMultiplier: 1.16,
    glowPulseDurationMs: 920,
    bubbleRotationDurationMs: 5200,
    bubbleFadeDurationMs: 260,
    bubbleShakeOffsetPx: 6,
    bubbleShakeDurationMs: 64,
    bubbleShakeRepeats: 5,
    petFadeDurationMs: 260,
    petFlipX: true,
};

const BATATA_ENCOUNTER_CONFIG: PetEncounterConfig = {
    id: 'batata',
    assetKey: 'pet-batata',
    bubbleAssetKey: 'effect-time-bubble',
    position: { x: 710, y: 320 },
    petOffsetY: 16,
    petScale: 0.6,
    bubbleScale: 0.4,
    interactionZone: {
        x: 600,
        y: 400,
        width: 152,
        height: 114,
    },
    promptText: 'Libertar Batata',
    dialogue: seineBatataRescueDialogue,
    rescueJumpHeightPx: 22,
    checklistVisibleDurationMs: 2000,
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.44,
    glowPulseScaleMultiplier: 1.16,
    glowPulseDurationMs: 920,
    bubbleRotationDurationMs: 5200,
    bubbleFadeDurationMs: 260,
    bubbleShakeOffsetPx: 6,
    bubbleShakeDurationMs: 64,
    bubbleShakeRepeats: 5,
    petFadeDurationMs: 260,
    petFlipX: true,
};

const PITUCA_ENCOUNTER_CONFIG: PetEncounterConfig = {
    id: 'pituca',
    assetKey: 'pet-pituca',
    bubbleAssetKey: 'effect-time-bubble',
    position: { x: 870, y: 390 },
    petOffsetY: 16,
    petScale: 0.6,
    bubbleScale: 0.4,
    interactionZone: {
        x: 800,
        y: 420,
        width: 148,
        height: 114,
    },
    promptText: 'Libertar Pituca',
    dialogue: seinePitucaRescueDialogue,
    rescueJumpHeightPx: 22,
    checklistVisibleDurationMs: 2000,
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.44,
    glowPulseScaleMultiplier: 1.16,
    glowPulseDurationMs: 920,
    bubbleRotationDurationMs: 5200,
    bubbleFadeDurationMs: 260,
    bubbleShakeOffsetPx: 6,
    bubbleShakeDurationMs: 64,
    bubbleShakeRepeats: 5,
    petFadeDurationMs: 260,
    petFlipX: true,
};

const SEINE_PET_CONFIGS = [
    PIRATA_ENCOUNTER_CONFIG,
    BATATA_ENCOUNTER_CONFIG,
    PITUCA_ENCOUNTER_CONFIG,
] as const;

export class SeineScene extends Phaser.Scene {
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
    private portalTransitionOverlay?: Phaser.GameObjects.Container;
    private sceneObjects: Phaser.GameObjects.GameObject[] = [];
    private sceneInteractions: AreaInteraction[] = [];
    private activePetEncounters: PetEncounterRuntime[] = [];
    private currentDialogueBubbleAnchorTarget?: BubbleAnchorTarget;
    private finalPortalInteractionZone?: RectArea;
    private hasPlayedFinalMessage = false;
    private hasTriggeredFinalPortal = false;
    private wasSquarePressed = false;
    private isArrivalCutsceneActive = false;
    private isArrivalNarrativeActive = false;
    private isIncomingCallActive = false;
    private isPetRevealActive = false;
    private isRescueSequenceActive = false;
    private isFinalPortalSpawning = false;
    private isFinalPortalCutsceneActive = false;

    constructor() {
        super(SCENE_KEYS.seine);
    }

    create(data?: SeineSceneData): void {
        this.add
            .image(0, 0, SEINE_CONFIG.backgroundKey)
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.sceneRoot = this.add.container(0, 0).setDepth(0);
        this.danubia = new Danubia(
            this,
            SEINE_CONFIG.defaultSpawn.x,
            SEINE_CONFIG.defaultSpawn.y,
        );
        this.danubia.setWalkPlaneMode(
            SEINE_CONFIG.walkArea,
            SEINE_CONFIG.blockers,
            SEINE_CONFIG.depthScale,
            {
                enabled: true,
            },
        );
        this.danubia.setWalkPlaneSpawn(SEINE_CONFIG.defaultSpawn, SEINE_CONFIG.defaultFacing);
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
                    || this.isIncomingCallActive
                    || this.isPetRevealActive
                    || this.isRescueSequenceActive
                    || this.isFinalPortalSpawning
                    || this.isFinalPortalCutsceneActive
                    || this.phoneChecklist?.blocksMovement === true,
                );

                if (active) {
                    this.interactionPrompt?.hide();
                }
            },
            getBubbleAnchor: () => {
                const anchorTarget = this.currentDialogueBubbleAnchorTarget ?? this.danubia;

                if (!anchorTarget) {
                    return undefined;
                }

                const displayHeight =
                    'displayHeight' in anchorTarget ? anchorTarget.displayHeight : 0;

                return {
                    x: anchorTarget.x,
                    y: anchorTarget.y - displayHeight * 0.35,
                };
            },
            getBubbleAnimationTarget: () => this.currentDialogueBubbleAnchorTarget ?? this.danubia,
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

        this.createSceneContent();

        if (data?.transitionFromPortal === false) {
            this.cameras.main.fadeIn(220, 228, 244, 255);
            this.isArrivalNarrativeActive = true;
            this.time.delayedCall(SeineScene.ARRIVAL_DIALOGUE_DELAY_MS, () => {
                this.startArrivalDialogue();
            });
            return;
        }

        this.startPortalArrivalCutscene();
    }

    update(): void {
        this.danubia?.update();
        this.dialogueController?.update();
        this.updateAreaInteraction();
        this.updateChecklistToggle();
        this.gameHud?.setCompactPhoneVisible(!this.phoneChecklist?.isPhoneAnimatingOrVisible);
        this.gameHud?.refresh();
        this.phoneChecklist?.refresh();
        this.syncDanubiaMovementBlock();

        if (DEBUG_ROOM_GEOMETRY) {
            this.drawDebugGeometry();
        }
    }

    private createSceneContent(): void {
        this.clearSceneContent();

        for (const config of SEINE_PET_CONFIGS) {
            if (isPetRescued(config.id)) {
                continue;
            }

            this.createPetEncounter(config);
        }

        if (
            isPetRescued('pirata')
            && isPetRescued('batata')
            && isPetRescued('pituca')
        ) {
            this.hasPlayedFinalMessage = true;
            this.hasTriggeredFinalPortal = true;
            this.spawnFinalPortal(false);
        }
    }

    private clearSceneContent(): void {
        this.clearFinalPortal();
        for (const gameObject of this.sceneObjects) {
            gameObject.destroy();
        }

        this.sceneObjects = [];
        this.sceneInteractions = [];
        this.activePetEncounters = [];
        this.currentDialogueBubbleAnchorTarget = undefined;
        this.interactionPrompt?.hide();
        this.sceneRoot?.removeAll(false);
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
        const started = this.dialogueController?.start(seineArrivalDialogue, {
            onComplete: () => {
                this.isArrivalNarrativeActive = false;
                this.fragmentNotification?.show('Checklist atualizada.\nEncontre os desaparecidos no Sena.', {
                    visibleDurationMs: 2200,
                });
                this.startPetRevealSequence();
            },
        }) ?? false;

        if (!started) {
            this.isArrivalNarrativeActive = false;
            this.startPetRevealSequence();
        }
    }

    private startPetRevealSequence(): void {
        const pendingRuntimes = this.activePetEncounters.filter((runtime) => !runtime.revealed);

        if (pendingRuntimes.length === 0) {
            return;
        }

        this.isPetRevealActive = true;
        this.syncDanubiaMovementBlock();
        this.time.delayedCall(PET_REVEAL_CONFIG.areaEnterDelayMs, () => {
            this.runRevealSequence(pendingRuntimes, 0);
        });
    }

    private runRevealSequence(runtimes: PetEncounterRuntime[], index: number): void {
        const runtime = runtimes[index];

        if (!runtime) {
            for (const revealedRuntime of runtimes) {
                this.registerPetInteraction(revealedRuntime);
            }

            this.isPetRevealActive = false;
            this.syncDanubiaMovementBlock();
            return;
        }

        this.revealPetEncounter(runtime, {
            recoilDanubia: true,
            onComplete: () => {
                this.time.delayedCall(PET_REVEAL_CONFIG.sequenceRevealGapMs, () => {
                    this.runRevealSequence(runtimes, index + 1);
                });
            },
        });
    }

    private createPetEncounter(config: PetEncounterConfig): void {
        const glow = this.add.image(
            config.position.x,
            config.position.y + config.petOffsetY * 0.25,
            config.bubbleAssetKey,
        );
        glow.setTint(config.glowColor);
        glow.setAlpha(0);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setScale(0);
        glow.setDepth(3.5);

        const bubble = this.add.image(
            config.position.x,
            config.position.y,
            config.bubbleAssetKey,
        );
        bubble.setScale(0);
        bubble.setDepth(4);
        bubble.setAlpha(0);

        const pet = this.add.image(
            config.position.x,
            config.position.y + config.petOffsetY,
            config.assetKey,
        );
        pet.setScale(0);
        pet.setDepth(5);
        pet.setAlpha(0);
        pet.setFlipX(config.petFlipX === true);

        this.sceneRoot?.add([glow, bubble, pet]);
        this.sceneObjects.push(glow, bubble, pet);

        const runtime: PetEncounterRuntime = {
            config,
            glow,
            bubble,
            pet,
            interactionId: `rescue-${config.id}`,
            revealed: false,
            rescued: false,
        };
        this.activePetEncounters.push(runtime);
    }

    private revealPetEncounter(
        runtime: PetEncounterRuntime,
        options: RevealPetEncounterOptions = {},
    ): void {
        this.isPetRevealActive = true;
        this.interactionPrompt?.hide();
        this.syncDanubiaMovementBlock();

        this.time.delayedCall(PET_REVEAL_CONFIG.blockDurationMs, () => {
            if (!runtime.pet.scene || !runtime.bubble.scene) {
                this.isPetRevealActive = false;
                options.onComplete?.();
                return;
            }

            this.spawnTemporalBurstParticles(
                runtime.config.position.x,
                runtime.config.position.y,
                PET_REVEAL_CONFIG.particleCount,
                PET_REVEAL_CONFIG.particleTravelDistance,
                PET_REVEAL_CONFIG.particleDurationMs,
                PET_REVEAL_CONFIG.particleColor,
                6,
                PET_REVEAL_CONFIG.particleRadius,
            );
            this.cameras.main.shake(
                PET_REVEAL_CONFIG.impactShakeDurationMs,
                PET_REVEAL_CONFIG.impactShakeIntensity,
            );

            if (options.recoilDanubia) {
                this.playDanubiaTemporalRecoil();
            }

            this.tweens.add({
                targets: [runtime.glow, runtime.bubble, runtime.pet],
                alpha: 1,
                duration: PET_REVEAL_CONFIG.revealDurationMs * 0.72,
                ease: 'Sine.Out',
            });

            this.tweens.add({
                targets: runtime.glow,
                scaleX: runtime.config.bubbleScale * 1.16,
                scaleY: runtime.config.bubbleScale * 1.16,
                duration: PET_REVEAL_CONFIG.revealDurationMs,
                ease: PET_REVEAL_CONFIG.revealEase,
            });

            this.tweens.add({
                targets: runtime.bubble,
                scaleX: runtime.config.bubbleScale,
                scaleY: runtime.config.bubbleScale,
                duration: PET_REVEAL_CONFIG.revealDurationMs,
                ease: PET_REVEAL_CONFIG.revealEase,
            });

            this.tweens.add({
                targets: runtime.pet,
                scaleX: runtime.config.petScale,
                scaleY: runtime.config.petScale,
                duration: PET_REVEAL_CONFIG.revealDurationMs,
                ease: PET_REVEAL_CONFIG.revealEase,
                onComplete: () => {
                    this.time.delayedCall(PET_REVEAL_CONFIG.settleDurationMs, () => {
                        this.finishRevealRuntime(runtime, options);
                    });
                },
            });
        });
    }

    private finishRevealRuntime(
        runtime: PetEncounterRuntime,
        options: RevealPetEncounterOptions,
    ): void {
        if (!runtime.pet.scene || !runtime.bubble.scene || !runtime.glow.scene) {
            options.onComplete?.();
            return;
        }

        runtime.revealed = true;
        runtime.glowTween = this.createGlowTween(
            runtime.glow,
            runtime.config.bubbleScale * 1.16,
            runtime.config.glowAlphaMin,
            runtime.config.glowAlphaMax,
            runtime.config.glowPulseScaleMultiplier,
            runtime.config.glowPulseDurationMs,
        );
        runtime.bubbleRotationTween = this.createBubbleRotationTween(
            runtime.bubble,
            runtime.config.bubbleRotationDurationMs,
        );
        options.onComplete?.();
    }

    private registerPetInteraction(runtime: PetEncounterRuntime): void {
        this.sceneInteractions = this.sceneInteractions.filter(
            (interaction) => interaction.id !== runtime.interactionId,
        );
        this.sceneInteractions.push({
            id: runtime.interactionId,
            zone: runtime.config.interactionZone,
            promptText: runtime.config.promptText,
            priority: 10,
            onInteract: () => {
                this.startPetRescueSequence(runtime);
            },
        });
    }

    private startPetRescueSequence(runtime: PetEncounterRuntime): void {
        if (this.isRescueSequenceActive || runtime.rescued) {
            return;
        }

        this.isRescueSequenceActive = true;
        this.interactionPrompt?.hide();
        runtime.rescued = true;
        this.sceneInteractions = this.sceneInteractions.filter(
            (interaction) => interaction.id !== runtime.interactionId,
        );

        const bubble = runtime.bubble;
        const pet = runtime.pet;
        const originalBubbleX = bubble.x;
        const originalPetY = pet.y;

        runtime.glowTween?.stop();
        runtime.glowTween = undefined;
        runtime.bubbleRotationTween?.stop();
        runtime.bubbleRotationTween = undefined;

        this.tweens.add({
            targets: bubble,
            x: {
                from: originalBubbleX - runtime.config.bubbleShakeOffsetPx,
                to: originalBubbleX + runtime.config.bubbleShakeOffsetPx,
            },
            duration: runtime.config.bubbleShakeDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: runtime.config.bubbleShakeRepeats,
            onComplete: () => {
                bubble.x = originalBubbleX;

                this.tweens.add({
                    targets: [runtime.glow, bubble],
                    alpha: 0,
                    duration: runtime.config.bubbleFadeDurationMs,
                    ease: 'Quad.Out',
                });

                this.tweens.add({
                    targets: runtime.glow,
                    scaleX: runtime.config.bubbleScale * 1.24,
                    scaleY: runtime.config.bubbleScale * 1.24,
                    duration: runtime.config.bubbleFadeDurationMs,
                    ease: 'Quad.Out',
                });

                this.tweens.add({
                    targets: bubble,
                    scaleX: runtime.config.bubbleScale * 1.08,
                    scaleY: runtime.config.bubbleScale * 1.08,
                    duration: runtime.config.bubbleFadeDurationMs,
                    ease: 'Quad.Out',
                    onComplete: () => {
                        runtime.glow.destroy();
                        bubble.destroy();
                        this.sceneObjects = this.sceneObjects.filter((gameObject) =>
                            gameObject !== runtime.glow && gameObject !== bubble,
                        );
                    },
                });

                this.tweens.add({
                    targets: pet,
                    y: originalPetY - runtime.config.rescueJumpHeightPx,
                    duration: 180,
                    ease: 'Quad.Out',
                    yoyo: true,
                    hold: 60,
                    onComplete: () => {
                        pet.y = originalPetY;
                        this.completePetRescue(runtime);
                    },
                });
            },
        });
    }

    private completePetRescue(runtime: PetEncounterRuntime): void {
        markPetRescued(runtime.config.id);
        this.gameHud?.refresh();
        this.phoneChecklist?.refresh();
        this.phoneChecklist?.openTemporarily(runtime.config.checklistVisibleDurationMs);
        this.currentDialogueBubbleAnchorTarget =
            runtime.config.id === 'batata' ? runtime.pet : undefined;

        this.time.delayedCall(this.getAutoChecklistTotalMs(runtime.config.checklistVisibleDurationMs), () => {
            const started = this.dialogueController?.start(runtime.config.dialogue, {
                onComplete: () => {
                    this.currentDialogueBubbleAnchorTarget = undefined;
                    this.fadeOutRescuedPet(runtime);
                },
            }) ?? false;

            if (!started) {
                this.currentDialogueBubbleAnchorTarget = undefined;
                this.fadeOutRescuedPet(runtime);
            }
        });
    }

    private fadeOutRescuedPet(runtime: PetEncounterRuntime): void {
        this.tweens.add({
            targets: runtime.pet,
            alpha: 0,
            duration: runtime.config.petFadeDurationMs,
            ease: 'Quad.Out',
            onComplete: () => {
                runtime.pet.destroy();
                this.sceneObjects = this.sceneObjects.filter((gameObject) => gameObject !== runtime.pet);
                this.activePetEncounters = this.activePetEncounters.filter((entry) => entry !== runtime);
                this.isRescueSequenceActive = false;
                this.maybeSpawnFinalPortal();
            },
        });
    }

    private maybeSpawnFinalPortal(): void {
        if (
            this.hasPlayedFinalMessage
            || !isPetRescued('pirata')
            || !isPetRescued('batata')
            || !isPetRescued('pituca')
        ) {
            return;
        }

        this.hasPlayedFinalMessage = true;
        this.startFinalMessage();
    }

    private startFinalMessage(): void {
        this.phoneChecklist?.close();
        this.isIncomingCallActive = true;
        this.interactionPrompt?.hide();
        this.syncDanubiaMovementBlock();
        this.incomingCallOverlay?.show('Atender mensagem');
    }

    private acceptFinalMessage(): void {
        this.isIncomingCallActive = false;
        this.incomingCallOverlay?.hide();

        const started = this.dialogueController?.start(seineMonsieurFollowUpDialogue, {
            onComplete: () => {
                this.triggerFinalPortalSequence();
            },
        }) ?? false;

        if (!started) {
            this.triggerFinalPortalSequence();
        }
    }

    private triggerFinalPortalSequence(): void {
        if (this.hasTriggeredFinalPortal) {
            return;
        }

        this.hasTriggeredFinalPortal = true;
        this.fragmentNotification?.show('Uma nova fissura temporal se abriu.', {
            visibleDurationMs: 2200,
        });
        this.isFinalPortalSpawning = true;
        this.syncDanubiaMovementBlock();
        this.time.delayedCall(180, () => {
            this.spawnFinalPortal(true);
        });
    }

    private spawnFinalPortal(animated: boolean): void {
        this.clearFinalPortal();

        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            this.isFinalPortalSpawning = false;
            return;
        }

        const halfFrameWidth = Math.floor(textureFrame.width * 0.5);
        const remainingFrameWidth = textureFrame.width - halfFrameWidth;
        const startScale = animated ? GARDEN_PORTAL_CONFIG.spawn.initialScale : GARDEN_PORTAL_CONFIG.scale;
        const startAlpha = animated ? 0 : 1;
        const glow = this.add.image(
            GARDEN_PORTAL_CONFIG.position.x,
            GARDEN_PORTAL_CONFIG.position.y,
            'effect-time-portal',
        ).setDepth(GARDEN_PORTAL_CONFIG.backDepth - 0.1);
        glow.setScale(startScale, startScale);
        glow.setTint(GARDEN_PORTAL_CONFIG.glowColor);
        glow.setAlpha(startAlpha);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        const leftSprite = this.add
            .image(GARDEN_PORTAL_CONFIG.position.x, GARDEN_PORTAL_CONFIG.position.y, 'effect-time-portal')
            .setScale(startScale)
            .setAlpha(startAlpha);
        const rightSprite = this.add
            .image(GARDEN_PORTAL_CONFIG.position.x, GARDEN_PORTAL_CONFIG.position.y, 'effect-time-portal')
            .setScale(startScale)
            .setAlpha(startAlpha);

        leftSprite.setCrop(0, 0, halfFrameWidth, textureFrame.height);
        rightSprite.setCrop(halfFrameWidth, 0, remainingFrameWidth, textureFrame.height);

        const leftIsBehind = GARDEN_PORTAL_CONFIG.side === 'right';
        leftSprite.setDepth(leftIsBehind ? GARDEN_PORTAL_CONFIG.backDepth : GARDEN_PORTAL_CONFIG.frontDepth);
        rightSprite.setDepth(leftIsBehind ? GARDEN_PORTAL_CONFIG.frontDepth : GARDEN_PORTAL_CONFIG.backDepth);

        this.portalGlow = glow;
        this.portalBackHalf = leftIsBehind ? leftSprite : rightSprite;
        this.portalFrontHalf = leftIsBehind ? rightSprite : leftSprite;
        this.sceneRoot?.add([glow, leftSprite, rightSprite]);
        this.sceneObjects.push(glow, leftSprite, rightSprite);

        if (!animated) {
            this.finalizeFinalPortal(leftSprite, rightSprite, glow);
            return;
        }

        this.spawnTemporalBurstParticles(
            GARDEN_PORTAL_CONFIG.position.x,
            GARDEN_PORTAL_CONFIG.position.y,
            GARDEN_PORTAL_CONFIG.spawn.particleCount,
            GARDEN_PORTAL_CONFIG.spawn.particleDistance,
            GARDEN_PORTAL_CONFIG.spawn.particleDurationMs,
            0x7dd3fc,
            5,
            4,
        );
        this.cameras.main.shake(
            GARDEN_PORTAL_CONFIG.spawn.cameraShakeDurationMs,
            GARDEN_PORTAL_CONFIG.spawn.cameraShakeIntensity,
        );

        this.tweens.add({
            targets: [glow, leftSprite, rightSprite],
            alpha: 1,
            duration: GARDEN_PORTAL_CONFIG.spawn.durationMs * 0.72,
            ease: 'Sine.Out',
        });

        this.tweens.add({
            targets: glow,
            scaleX: GARDEN_PORTAL_CONFIG.scale * 1.14,
            scaleY: GARDEN_PORTAL_CONFIG.scale * 1.14,
            duration: GARDEN_PORTAL_CONFIG.spawn.durationMs,
            ease: GARDEN_PORTAL_CONFIG.spawn.ease,
        });

        this.tweens.add({
            targets: [leftSprite, rightSprite],
            scaleX: GARDEN_PORTAL_CONFIG.scale,
            scaleY: GARDEN_PORTAL_CONFIG.scale,
            duration: GARDEN_PORTAL_CONFIG.spawn.durationMs,
            ease: GARDEN_PORTAL_CONFIG.spawn.ease,
            onComplete: () => {
                this.finalizeFinalPortal(leftSprite, rightSprite, glow);
            },
        });
    }

    private finalizeFinalPortal(
        leftSprite: Phaser.GameObjects.Image,
        rightSprite: Phaser.GameObjects.Image,
        glow: Phaser.GameObjects.Image,
    ): void {
        this.finalPortalInteractionZone = {
            x: GARDEN_PORTAL_CONFIG.position.x - GARDEN_PORTAL_CONFIG.interactionWidth * 0.5,
            y: GARDEN_PORTAL_CONFIG.footY - GARDEN_PORTAL_CONFIG.interactionHeight,
            width: GARDEN_PORTAL_CONFIG.interactionWidth,
            height: GARDEN_PORTAL_CONFIG.interactionHeight,
        };
        this.portalPulseTween = this.tweens.add({
            targets: [leftSprite, rightSprite],
            scaleX: GARDEN_PORTAL_CONFIG.scale * GARDEN_PORTAL_CONFIG.pulseScaleMultiplier,
            scaleY: GARDEN_PORTAL_CONFIG.scale * GARDEN_PORTAL_CONFIG.pulseScaleMultiplier,
            alpha: {
                from: GARDEN_PORTAL_CONFIG.pulseAlphaMin,
                to: GARDEN_PORTAL_CONFIG.pulseAlphaMax,
            },
            duration: GARDEN_PORTAL_CONFIG.pulseDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.portalDriftTween = this.tweens.add({
            targets: [leftSprite, rightSprite],
            angle: {
                from: -GARDEN_PORTAL_CONFIG.driftAngle,
                to: GARDEN_PORTAL_CONFIG.driftAngle,
            },
            duration: GARDEN_PORTAL_CONFIG.driftDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.portalGlowTween = this.tweens.add({
            targets: glow,
            alpha: {
                from: GARDEN_PORTAL_CONFIG.glowAlphaMin,
                to: GARDEN_PORTAL_CONFIG.glowAlphaMax,
            },
            scaleX: GARDEN_PORTAL_CONFIG.scale * 1.2,
            scaleY: GARDEN_PORTAL_CONFIG.scale * 1.2,
            duration: GARDEN_PORTAL_CONFIG.glowPulseDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.isFinalPortalSpawning = false;
        this.syncDanubiaMovementBlock();
    }

    private updateAreaInteraction(): void {
        if (!this.danubia) {
            return;
        }

        if (this.isIncomingCallActive) {
            this.interactionPrompt?.hide();

            if (this.incomingCallOverlay?.isReadyToAccept && this.isInteractJustPressed()) {
                this.acceptFinalMessage();
            }

            return;
        }

        const shouldBlockInteraction =
            this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isIncomingCallActive
            || this.isPetRevealActive
            || this.isRescueSequenceActive
            || this.isFinalPortalSpawning
            || this.isFinalPortalCutsceneActive
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true;

        if (shouldBlockInteraction) {
            this.interactionPrompt?.hide();
            return;
        }

        const foot = this.danubia.getFootBounds();
        const activeFinalPortal =
            !this.sceneInteractions.some((interaction) => this.rectsIntersect(foot, interaction.zone))
            && this.finalPortalInteractionZone
            && this.rectsIntersect(foot, this.finalPortalInteractionZone);
        const nextInteraction = this.sceneInteractions
            .filter((interaction) => this.rectsIntersect(foot, interaction.zone))
            .sort((left, right) => right.priority - left.priority)[0];

        if (!nextInteraction && !activeFinalPortal) {
            this.interactionPrompt?.hide();
            return;
        }

        if (activeFinalPortal) {
            this.interactionPrompt?.show(GARDEN_PORTAL_CONFIG.promptText);

            if (this.isInteractJustPressed()) {
                this.startFinalPortalCutscene();
            }

            return;
        }

        this.interactionPrompt?.show(nextInteraction.promptText);

        if (this.isInteractJustPressed()) {
            nextInteraction.onInteract();
        }
    }

    private startFinalPortalCutscene(): void {
        if (
            this.isFinalPortalCutsceneActive
            || !this.danubia
            || !this.finalPortalInteractionZone
        ) {
            return;
        }

        this.isFinalPortalCutsceneActive = true;
        this.interactionPrompt?.hide();
        this.phoneChecklist?.close();
        this.syncDanubiaMovementBlock();

        const direction = GARDEN_PORTAL_CONFIG.side === 'right' ? 'right' : 'left';
        const logicalStart = this.danubia.getLogicalPosition();
        const target = {
            x: GARDEN_PORTAL_CONFIG.position.x,
            y: this.resolveDanubiaCutsceneY(GARDEN_PORTAL_CONFIG.footY),
        };
        const distance = Phaser.Math.Distance.Between(
            logicalStart.x,
            logicalStart.y,
            target.x,
            target.y,
        );
        const walkDurationMs = Math.max(
            240,
            (distance / GARDEN_PORTAL_CONFIG.pullSpeedPxPerSecond) * 1000,
        );
        const proxy = { ...logicalStart };
        const fadeProxy = { alpha: 1 };

        this.danubia.setFacing(direction);
        this.danubia.setDepth(GARDEN_PORTAL_CONFIG.characterDepth);
        this.danubia.playIdleCutscene(direction);

        this.tweens.add({
            targets: proxy,
            x: target.x,
            y: target.y,
            duration: walkDurationMs,
            ease: 'Cubic.In',
            onUpdate: () => {
                this.danubia?.setCutscenePosition(proxy);

                const remainingDistance = Phaser.Math.Distance.Between(
                    proxy.x,
                    proxy.y,
                    target.x,
                    target.y,
                );

                if (remainingDistance <= GARDEN_PORTAL_CONFIG.fadeStartDistancePx) {
                    const fadeProgress =
                        1 - remainingDistance / Math.max(GARDEN_PORTAL_CONFIG.fadeStartDistancePx, 1);
                    this.danubia?.setCharacterAlpha(1 - fadeProgress);
                }
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(target);
                this.danubia?.playIdleCutscene(direction);
                this.danubia?.setCharacterAlpha(0);
                this.finishSceneTransition();
            },
        });

        const fadeDelayMs = Math.max(0, walkDurationMs - GARDEN_PORTAL_CONFIG.fadeDurationMs);
        this.time.delayedCall(fadeDelayMs, () => {
            this.tweens.add({
                targets: fadeProxy,
                alpha: 0,
                duration: GARDEN_PORTAL_CONFIG.fadeDurationMs,
                ease: 'Quad.In',
                onUpdate: () => {
                    this.danubia?.setCharacterAlpha(fadeProxy.alpha);
                },
            });
        });
    }

    private finishSceneTransition(): void {
        this.playPortalScreenTransition(() => {
            // TODO: persist checkpoint "paris-garden" when the checkpoint/save system is implemented.
            this.scene.start(SCENE_KEYS.garden);
        });
    }

    private updateChecklistToggle(): void {
        if (
            !this.danubia
            || !this.phoneChecklist
            || !this.togglePhoneKey
            || !hasUnlockedPhoneHud()
            || this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isIncomingCallActive
            || this.isPetRevealActive
            || this.isRescueSequenceActive
            || this.isFinalPortalSpawning
            || this.isFinalPortalCutsceneActive
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
            || this.isIncomingCallActive
            || this.isPetRevealActive
            || this.isRescueSequenceActive
            || this.isFinalPortalSpawning
            || this.isFinalPortalCutsceneActive
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true,
        );
    }

    private createGlowTween(
        glow: Phaser.GameObjects.Image,
        baseScale: number,
        alphaMin: number,
        alphaMax: number,
        scaleMultiplier: number,
        durationMs: number,
    ): Phaser.Tweens.Tween {
        return this.tweens.add({
            targets: glow,
            alpha: {
                from: alphaMin,
                to: alphaMax,
            },
            scaleX: baseScale * scaleMultiplier,
            scaleY: baseScale * scaleMultiplier,
            duration: durationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private createBubbleRotationTween(
        bubble: Phaser.GameObjects.Image,
        durationMs: number,
    ): Phaser.Tweens.Tween {
        return this.tweens.add({
            targets: bubble,
            angle: 360,
            duration: durationMs,
            ease: 'Linear',
            repeat: -1,
        });
    }

    private getAutoChecklistTotalMs(visibleDurationMs: number): number {
        return PHONE_CHECKLIST_CONFIG.animation.cornerExpandDurationMs
            + PHONE_CHECKLIST_CONFIG.animation.moveToCenterDurationMs
            + PHONE_CHECKLIST_CONFIG.animation.fadeInContentDurationMs
            + visibleDurationMs
            + PHONE_CHECKLIST_CONFIG.animation.closeToCornerDurationMs;
    }

    private playDanubiaTemporalRecoil(): void {
        if (!this.danubia) {
            return;
        }

        const start = this.danubia.getLogicalPosition();
        const target = {
            x: Math.max(32, start.x - PET_REVEAL_CONFIG.danubiaRecoilDistancePx),
            y: start.y,
        };
        const proxy = { ...start };

        this.danubia.playIdleCutscene('left');
        this.tweens.add({
            targets: proxy,
            x: target.x,
            duration: PET_REVEAL_CONFIG.danubiaRecoilDurationMs,
            ease: 'Sine.Out',
            yoyo: true,
            onUpdate: () => {
                this.danubia?.setCutscenePosition(proxy);
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(start);
                this.danubia?.playIdleCutscene('right');
            },
        });
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

    private clearFinalPortal(): void {
        this.portalPulseTween?.stop();
        this.portalPulseTween = undefined;
        this.portalDriftTween?.stop();
        this.portalDriftTween = undefined;
        this.portalGlowTween?.stop();
        this.portalGlowTween = undefined;
        this.portalGlow?.destroy();
        this.portalGlow = undefined;
        this.portalBackHalf?.destroy();
        this.portalBackHalf = undefined;
        this.portalFrontHalf?.destroy();
        this.portalFrontHalf = undefined;
        this.finalPortalInteractionZone = undefined;
    }

    private playPortalScreenTransition(onComplete: () => void): void {
        const transitionConfig = GARDEN_PORTAL_CONFIG.transition;
        const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        const wash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            transitionConfig.baseColor,
            0,
        );
        const flash = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            transitionConfig.highlightColor,
            0,
        );
        const ringA = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 48);
        ringA.setStrokeStyle(
            transitionConfig.ringStrokeWidth,
            transitionConfig.accentColor,
            transitionConfig.ringStrokeAlpha,
        );
        ringA.setFillStyle(transitionConfig.baseColor, 0.08);

        const ringB = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 36);
        ringB.setStrokeStyle(
            transitionConfig.ringStrokeWidth,
            transitionConfig.highlightColor,
            transitionConfig.ringStrokeAlpha,
        );
        ringB.setFillStyle(transitionConfig.accentColor, 0.06);

        overlay.add([wash, flash, ringA, ringB]);
        this.portalTransitionOverlay?.destroy();
        this.portalTransitionOverlay = overlay;

        this.cameras.main.shake(
            transitionConfig.cameraShakeDurationMs,
            transitionConfig.cameraShakeIntensity,
        );

        this.tweens.add({
            targets: this.cameras.main,
            zoom: transitionConfig.cameraZoom,
            duration: transitionConfig.durationMs,
            ease: 'Cubic.In',
        });

        this.tweens.add({
            targets: wash,
            alpha: transitionConfig.overlayAlpha,
            duration: transitionConfig.durationMs * 0.45,
            ease: 'Quad.Out',
        });

        this.tweens.add({
            targets: flash,
            alpha: transitionConfig.flashAlpha,
            duration: transitionConfig.durationMs * 0.18,
            ease: 'Sine.Out',
            yoyo: true,
            repeat: 1,
        });

        this.tweens.add({
            targets: ringA,
            scaleX: transitionConfig.ringMaxRadius / ringA.radius,
            scaleY: transitionConfig.ringMaxRadius / ringA.radius,
            alpha: 0,
            duration: transitionConfig.durationMs,
            ease: 'Cubic.In',
        });

        this.tweens.add({
            targets: ringB,
            scaleX: transitionConfig.ringMaxRadius / ringB.radius,
            scaleY: transitionConfig.ringMaxRadius / ringB.radius,
            alpha: 0,
            duration: transitionConfig.durationMs * 0.88,
            ease: 'Cubic.In',
            delay: 50,
        });

        this.time.delayedCall(transitionConfig.durationMs, () => {
            onComplete();
        });
    }

    private getPortalScaledHeight(): number {
        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            return 0;
        }

        return textureFrame.height * PORTAL_ARRIVAL_CONFIG.scale;
    }

    private getPortalArrivalAnchor(): { x: number; y: number } {
        const spawn = SEINE_CONFIG.defaultSpawn;
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
        this.fillRect(this.debugGraphics, SEINE_CONFIG.walkArea, 0x00ff66, 0.18, 0x00ff66, 1);

        for (const interaction of this.sceneInteractions) {
            this.fillRect(this.debugGraphics, interaction.zone, 0xaa66ff, 0.12, 0xaa66ff, 0.9);
        }

        if (this.finalPortalInteractionZone) {
            this.fillRect(this.debugGraphics, this.finalPortalInteractionZone, 0x66ccff, 0.12, 0x66ccff, 0.9);
        }

        const foot = this.danubia.getFootBounds();
        this.fillRect(this.debugGraphics, foot, 0xffdd00, 0.28, 0xffdd00, 1);

        const logical = this.danubia.getLogicalPosition();
        this.debugText.setText(
            [
                'room: seine',
                `logical x:${Math.round(logical.x)} y:${Math.round(logical.y)}`,
                `foot x:${Math.round(foot.x)} y:${Math.round(foot.y)} w:${Math.round(foot.width)} h:${Math.round(foot.height)}`,
            ].join('\n'),
        );
    }
}
