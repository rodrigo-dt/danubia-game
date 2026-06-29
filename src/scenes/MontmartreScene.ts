import Phaser from 'phaser';
import { Danubia } from '../characters/Danubia';
import { DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import {
    montmartreArrivalDialogue,
    montmartreDrogoBarrierDialogue,
    montmartreDrogoRescueDialogue,
    montmartreMonsieurFollowUpDialogue,
    montmartrePudimRescueDialogue,
    montmartreZoeRescueDialogue,
} from '../data/dialogues';
import { installDevModeHotkeys } from '../game/devMode';
import type { DialogueSequence, RectArea, RoomBlocker } from '../game/types';
import {
    hasShownMontmartrePhoneHint,
    hasUnlockedPhoneHud,
    isPetRescued,
    markMontmartrePhoneHintShown,
    markPetRescued,
    setHomePortalUnlocked,
    setPhoneHudUnlocked,
} from '../game/states';
import { DialogueController } from '../systems/DialogueController';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { GameHud } from '../ui/GameHud';
import { FragmentNotification } from '../ui/FragmentNotification';
import { IncomingCallOverlay } from '../ui/IncomingCallOverlay';
import { PHONE_CHECKLIST_CONFIG, PhoneChecklist } from '../ui/PhoneChecklist';
import {playMusic} from "../systems/musicManager.ts";

type MontmartreAreaId = 'montmartre-a' | 'montmartre-b';

const MONTMARTRE_AREA_CONFIGS = {
    'montmartre-a': {
        backgroundKey: 'bg-paris-montmartre-a',
        fallbackBackgroundKey: 'bg-paris-montmartre-a',
        walkArea: {
            x: 20,
            y: 427,
            width: 930,
            height: 110,
            baseScaleY: 418,
        },
        depthScale: {
            baseScale: 2,
            farY: 340,
            nearY: 500,
            farScale: 1.74,
            nearScale: 1.94,
            baseY: 418,
        },
        defaultSpawn: { x: 187, y: 370 },
        defaultFacing: 'right',
        blockers: [] as RoomBlocker[],
    },
    'montmartre-b': {
        backgroundKey: 'bg-paris-montmartre-b',
        fallbackBackgroundKey: 'bg-paris-montmartre-a',
        walkArea: {
            x: 20,
            y: 427,
            width: 930,
            height: 110,
            baseScaleY: 418,
        },
        depthScale: {
            baseScale: 2,
            farY: 340,
            nearY: 500,
            farScale: 1.74,
            nearScale: 1.94,
            baseY: 418,
        },
        defaultSpawn: { x: 48, y: 370 },
        defaultFacing: 'right',
        blockers: [] as RoomBlocker[],
    },
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
    glowWidth: 236,
    glowHeight: 308,
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

const MONTMARTRE_PHONE_HINT_CONFIG = {
    delayAfterArrivalMs: 1100,
    visibleDurationMs: 2600,
    message: 'Dica: pressione Touchpad para abrir o celular.',
} as const;

const AREA_TRANSITION_CONFIG = {
    fadeOutDurationMs: 40,
    fadeInDurationMs: 50,
    overlayColor: 0x000000,
    overlayAlpha: 0.26,
} as const;

const SEINE_PORTAL_CONFIG = {
    position: {
        x: 828,
        y: 316,
    },
    footY: 446,
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
    interactionWidth: 500,
    interactionHeight: 500,
    promptText: 'Pressione Quadrado para atravessar o portal',
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

const PUDIM_RESCUE_CONFIG = {
    position: {
        x: 646,
        y: 394,
    },
    petScale: 0.90,
    bubbleScale: 0.58,
    interactionZone: {
        x: 518,
        y: 431,
        width: 200,
        height: 200,
    },
    promptText: 'Libertar Pudim',
    hiddenInitially: true,
    revealTriggerType: 'walk-trigger',
    revealTriggerX: 428,
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.44,
    glowWidth: 164,
    glowHeight: 188,
    glowPulseScaleMultiplier: 1.16,
    glowPulseDurationMs: 920,
    bubbleRotationDurationMs: 5200,
    bubbleShakeOffsetPx: 6,
    bubbleShakeDurationMs: 64,
    bubbleShakeRepeats: 5,
    bubbleFadeDurationMs: 260,
    petJumpHeightPx: 26,
    petJumpUpDurationMs: 180,
    petJumpDownDurationMs: 220,
    checklistVisibleDurationMs: 2000,
    petFadeDurationMs: 260,
} as const;

const MONTMARTRE_A_EXIT_CONFIG = {
    triggerX: 900,
    targetArea: 'montmartre-b',
    targetSpawn: { x: 48, y: 370 },
    targetFacing: 'right',
} as const;

const PET_REVEAL_CONFIG = {
    blockDurationMs: 260,
    areaEnterDelayMs: 380,
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
    flashAlpha: 0.2,
    danubiaRecoilDistancePx: 24,
    danubiaRecoilDurationMs: 180,
    sequenceRevealGapMs: 180,
} as const;

const ZOE_RESCUE_CONFIG = {
    position: {
        x: 332,
        y: 396,
    },
    petScale: 0.77,
    bubbleScale: 0.54,
    interactionZone: {
        x: 225,
        y: 431,
        width: 200,
        height: 200,
    },
    promptText: 'Libertar Zoe',
    hiddenInitially: true,
    revealTriggerType: 'area-enter',
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.44,
    glowWidth: 156,
    glowHeight: 176,
    glowPulseScaleMultiplier: 1.16,
    glowPulseDurationMs: 920,
    bubbleRotationDurationMs: 5200,
    bubbleShakeOffsetPx: 6,
    bubbleShakeDurationMs: 64,
    bubbleShakeRepeats: 5,
    bubbleFadeDurationMs: 260,
    petJumpHeightPx: 24,
    petJumpUpDurationMs: 170,
    petJumpDownDurationMs: 210,
    checklistVisibleDurationMs: 2000,
    petFadeDurationMs: 260,
} as const;

const DROGO_RESCUE_CONFIG = {
    position: {
        x: 776,
        y: 392,
    },
    petScale: 1.18,
    bubbleScale: 0.62,
    interactionZone: {
        x: 680,
        y: 431,
        width: 200,
        height: 200,
    },
    promptText: 'Libertar Drogo',
    hiddenInitially: true,
    revealTriggerType: 'area-enter',
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.44,
    glowWidth: 168,
    glowHeight: 188,
    glowPulseScaleMultiplier: 1.16,
    glowPulseDurationMs: 920,
    bubbleRotationDurationMs: 5200,
    bubbleShakeOffsetPx: 6,
    bubbleShakeDurationMs: 64,
    bubbleShakeRepeats: 5,
    bubbleFadeDurationMs: 260,
    petJumpHeightPx: 24,
    petJumpUpDurationMs: 170,
    petJumpDownDurationMs: 210,
    checklistVisibleDurationMs: 2000,
    petFadeDurationMs: 260,
} as const;

const DROGO_BARRIER_CONFIG = {
    position: {
        x: 606,
        y: 294,
    },
    scaleX: 1.36,
    scaleY: 2.18,
    interactionZone: {
        x: 477,
        y: 429,
        width: 200,
        height: 300,
    },
    blocker: {
        id: 'montmartre-b-drogo-barrier-blocker',
        x: 511,
        y: 428,
        width: 150,
        height: 300,
    },
    hintZone: {
        x: 500,
        y: 238,
        width: 154,
        height: 214,
    },
    promptText: 'Pressione Quadrado repetidamente para romper',
    idleAlphaMin: 0.64,
    idleAlphaMax: 0.86,
    pulseScaleMultiplier: 1.04,
    pulseDurationMs: 920,
    tremorOffsetPx: 7,
    tremorDurationMs: 52,
    tremorRepeats: 4,
    completionShakeDurationMs: 220,
    completionShakeIntensity: 0.005,
    fadeDurationMs: 340,
    glowColor: 0x8b5cf6,
    glowAlphaMin: 0.24,
    glowAlphaMax: 0.5,
    glowPulseScaleMultiplier: 1.12,
    glowPulseDurationMs: 860,
    spawnTriggerZone: {
        x: 444,
        y: 429,
        width: 232,
        height: 300,
    },
    spawnDurationMs: 500,
    spawnEase: 'Back.Out',
    spawnInitialScale: 0.05,
    spawnParticleCount: 10,
    spawnParticleDistance: 52,
    spawnParticleDurationMs: 440,
    spawnCameraShakeDurationMs: 180,
    spawnCameraShakeIntensity: 0.0038,
    qte: {
        progressPerPress: 11,
        decayDelayMs: 260,
        decayPerSecond: 74,
        barWidth: 284,
        barHeight: 18,
        uiDepth: 960,
        uiX: GAME_WIDTH / 2,
        uiY: GAME_HEIGHT - 94,
    },
} as const;

type MontmartreSceneData = {
    transitionFromPortal?: boolean;
    startArea?: MontmartreAreaId;
};

type AreaInteraction = {
    id: string;
    zone: RectArea;
    promptText: string;
    onInteract: () => void;
    priority: number;
};

type PetRevealTriggerType = 'walk-trigger' | 'area-enter';

type PetEncounterConfig = {
    id: 'pudim' | 'zoe' | 'drogo';
    areaId: MontmartreAreaId;
    assetKey: string;
    bubbleAssetKey: string;
    position: { x: number; y: number };
    petOffsetY: number;
    petScale: number;
    bubbleScale: number;
    interactionZone: RectArea;
    promptText: string;
    hiddenInitially: boolean;
    revealTriggerType: PetRevealTriggerType;
    revealTriggerX?: number;
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
    revealTriggered: boolean;
    rescued: boolean;
};

type AreaAutoTransition = {
    edge: 'left' | 'right';
    triggerX: number;
    targetArea: MontmartreAreaId;
    targetSpawn: { x: number; y: number };
    targetFacing: 'left' | 'right';
};

type BarrierRuntime = {
    glow: Phaser.GameObjects.Image;
    barrier: Phaser.GameObjects.Image;
    pulseTween?: Phaser.Tweens.Tween;
    glowTween?: Phaser.Tweens.Tween;
    active: boolean;
};

type BarrierBreakUi = {
    container: Phaser.GameObjects.Container;
    fill: Phaser.GameObjects.Rectangle;
};

type RevealPetEncounterOptions = {
    onComplete?: () => void;
    registerInteractionOnComplete?: boolean;
    recoilDanubia?: boolean;
};

type BubbleAnchorTarget = Phaser.GameObjects.Image | Danubia;

const PUDIM_ENCOUNTER_CONFIG: PetEncounterConfig = {
    id: 'pudim',
    areaId: 'montmartre-a',
    assetKey: 'pet-pudim',
    bubbleAssetKey: 'effect-time-bubble',
    position: PUDIM_RESCUE_CONFIG.position,
    petOffsetY: 18,
    petScale: PUDIM_RESCUE_CONFIG.petScale,
    bubbleScale: PUDIM_RESCUE_CONFIG.bubbleScale,
    interactionZone: PUDIM_RESCUE_CONFIG.interactionZone,
    promptText: PUDIM_RESCUE_CONFIG.promptText,
    hiddenInitially: PUDIM_RESCUE_CONFIG.hiddenInitially,
    revealTriggerType: PUDIM_RESCUE_CONFIG.revealTriggerType,
    revealTriggerX: PUDIM_RESCUE_CONFIG.revealTriggerX,
    dialogue: montmartrePudimRescueDialogue,
    rescueJumpHeightPx: PUDIM_RESCUE_CONFIG.petJumpHeightPx,
    checklistVisibleDurationMs: PUDIM_RESCUE_CONFIG.checklistVisibleDurationMs,
    glowColor: PUDIM_RESCUE_CONFIG.glowColor,
    glowAlphaMin: PUDIM_RESCUE_CONFIG.glowAlphaMin,
    glowAlphaMax: PUDIM_RESCUE_CONFIG.glowAlphaMax,
    glowPulseScaleMultiplier: PUDIM_RESCUE_CONFIG.glowPulseScaleMultiplier,
    glowPulseDurationMs: PUDIM_RESCUE_CONFIG.glowPulseDurationMs,
    bubbleRotationDurationMs: PUDIM_RESCUE_CONFIG.bubbleRotationDurationMs,
    bubbleFadeDurationMs: PUDIM_RESCUE_CONFIG.bubbleFadeDurationMs,
    bubbleShakeOffsetPx: PUDIM_RESCUE_CONFIG.bubbleShakeOffsetPx,
    bubbleShakeDurationMs: PUDIM_RESCUE_CONFIG.bubbleShakeDurationMs,
    bubbleShakeRepeats: PUDIM_RESCUE_CONFIG.bubbleShakeRepeats,
    petFadeDurationMs: PUDIM_RESCUE_CONFIG.petFadeDurationMs,
    petFlipX: true,
};

const ZOE_ENCOUNTER_CONFIG: PetEncounterConfig = {
    id: 'zoe',
    areaId: 'montmartre-b',
    assetKey: 'pet-zoe',
    bubbleAssetKey: 'effect-time-bubble',
    position: ZOE_RESCUE_CONFIG.position,
    petOffsetY: 16,
    petScale: ZOE_RESCUE_CONFIG.petScale,
    bubbleScale: ZOE_RESCUE_CONFIG.bubbleScale,
    interactionZone: ZOE_RESCUE_CONFIG.interactionZone,
    promptText: ZOE_RESCUE_CONFIG.promptText,
    hiddenInitially: ZOE_RESCUE_CONFIG.hiddenInitially,
    revealTriggerType: ZOE_RESCUE_CONFIG.revealTriggerType,
    dialogue: montmartreZoeRescueDialogue,
    rescueJumpHeightPx: ZOE_RESCUE_CONFIG.petJumpHeightPx,
    checklistVisibleDurationMs: ZOE_RESCUE_CONFIG.checklistVisibleDurationMs,
    glowColor: ZOE_RESCUE_CONFIG.glowColor,
    glowAlphaMin: ZOE_RESCUE_CONFIG.glowAlphaMin,
    glowAlphaMax: ZOE_RESCUE_CONFIG.glowAlphaMax,
    glowPulseScaleMultiplier: ZOE_RESCUE_CONFIG.glowPulseScaleMultiplier,
    glowPulseDurationMs: ZOE_RESCUE_CONFIG.glowPulseDurationMs,
    bubbleRotationDurationMs: ZOE_RESCUE_CONFIG.bubbleRotationDurationMs,
    bubbleFadeDurationMs: ZOE_RESCUE_CONFIG.bubbleFadeDurationMs,
    bubbleShakeOffsetPx: ZOE_RESCUE_CONFIG.bubbleShakeOffsetPx,
    bubbleShakeDurationMs: ZOE_RESCUE_CONFIG.bubbleShakeDurationMs,
    bubbleShakeRepeats: ZOE_RESCUE_CONFIG.bubbleShakeRepeats,
    petFadeDurationMs: ZOE_RESCUE_CONFIG.petFadeDurationMs,
    petFlipX: true,
};

const DROGO_ENCOUNTER_CONFIG: PetEncounterConfig = {
    id: 'drogo',
    areaId: 'montmartre-b',
    assetKey: 'pet-drogo',
    bubbleAssetKey: 'effect-time-bubble',
    position: DROGO_RESCUE_CONFIG.position,
    petOffsetY: 18,
    petScale: DROGO_RESCUE_CONFIG.petScale,
    bubbleScale: DROGO_RESCUE_CONFIG.bubbleScale,
    interactionZone: DROGO_RESCUE_CONFIG.interactionZone,
    promptText: DROGO_RESCUE_CONFIG.promptText,
    hiddenInitially: DROGO_RESCUE_CONFIG.hiddenInitially,
    revealTriggerType: DROGO_RESCUE_CONFIG.revealTriggerType,
    dialogue: montmartreDrogoRescueDialogue,
    rescueJumpHeightPx: DROGO_RESCUE_CONFIG.petJumpHeightPx,
    checklistVisibleDurationMs: DROGO_RESCUE_CONFIG.checklistVisibleDurationMs,
    glowColor: DROGO_RESCUE_CONFIG.glowColor,
    glowAlphaMin: DROGO_RESCUE_CONFIG.glowAlphaMin,
    glowAlphaMax: DROGO_RESCUE_CONFIG.glowAlphaMax,
    glowPulseScaleMultiplier: DROGO_RESCUE_CONFIG.glowPulseScaleMultiplier,
    glowPulseDurationMs: DROGO_RESCUE_CONFIG.glowPulseDurationMs,
    bubbleRotationDurationMs: DROGO_RESCUE_CONFIG.bubbleRotationDurationMs,
    bubbleFadeDurationMs: DROGO_RESCUE_CONFIG.bubbleFadeDurationMs,
    bubbleShakeOffsetPx: DROGO_RESCUE_CONFIG.bubbleShakeOffsetPx,
    bubbleShakeDurationMs: DROGO_RESCUE_CONFIG.bubbleShakeDurationMs,
    bubbleShakeRepeats: DROGO_RESCUE_CONFIG.bubbleShakeRepeats,
    petFadeDurationMs: DROGO_RESCUE_CONFIG.petFadeDurationMs,
    petFlipX: true,
};

const MONTMARTRE_AREA_AUTO_TRANSITIONS: Partial<Record<MontmartreAreaId, AreaAutoTransition[]>> = {
    'montmartre-a': [
        {
            edge: 'right',
            triggerX: MONTMARTRE_A_EXIT_CONFIG.triggerX,
            targetArea: MONTMARTRE_A_EXIT_CONFIG.targetArea,
            targetSpawn: MONTMARTRE_A_EXIT_CONFIG.targetSpawn,
            targetFacing: MONTMARTRE_A_EXIT_CONFIG.targetFacing,
        },
    ],
};

export class MontmartreScene extends Phaser.Scene {
    private static readonly ARRIVAL_DIALOGUE_DELAY_MS = 220;
    private danubia?: Danubia;
    private background?: Phaser.GameObjects.Image;
    private areaRoot?: Phaser.GameObjects.Container;
    private areaTransitionOverlay?: Phaser.GameObjects.Rectangle;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private interactionPrompt?: InteractionPrompt;
    private gameHud?: GameHud;
    private phoneChecklist?: PhoneChecklist;
    private fragmentNotification?: FragmentNotification;
    private incomingCallOverlay?: IncomingCallOverlay;
    private dialogueController?: DialogueController;
    private portalBackHalf?: Phaser.GameObjects.Image;
    private portalFrontHalf?: Phaser.GameObjects.Image;
    private portalGlow?: Phaser.GameObjects.Image;
    private portalPulseTween?: Phaser.Tweens.Tween;
    private portalDriftTween?: Phaser.Tweens.Tween;
    private portalGlowTween?: Phaser.Tweens.Tween;
    private arrivalOverlay?: Phaser.GameObjects.Container;
    private portalTransitionOverlay?: Phaser.GameObjects.Container;
    private interactKey?: Phaser.Input.Keyboard.Key;
    private togglePhoneKey?: Phaser.Input.Keyboard.Key;
    private currentArea: MontmartreAreaId = 'montmartre-a';
    private areaObjects: Phaser.GameObjects.GameObject[] = [];
    private areaInteractions: AreaInteraction[] = [];
    private activePetEncounters: PetEncounterRuntime[] = [];
    private pendingAreaEnterRevealTimer?: Phaser.Time.TimerEvent;
    private currentAreaBlockers: RoomBlocker[] = [];
    private barrierRuntime?: BarrierRuntime;
    private barrierBreakUi?: BarrierBreakUi;
    private currentDialogueBubbleAnchorTarget?: BubbleAnchorTarget;
    private isDrogoBarrierBroken = false;
    private isBreakingDrogoBarrier = false;
    private isDrogoBarrierSpawning = false;
    private drogoBarrierProgress = 0;
    private lastDrogoBarrierPressAt = 0;
    private seinePortalInteractionZone?: RectArea;
    private hasTriggeredMontmartreEnding = false;
    private hasCompletedMontmartreCall = false;
    private hasShownDrogoBarrierHint = false;
    private hasTriggeredCurrentAreaTransition = false;
    private wasSquarePressed = false;
    private isArrivalCutsceneActive = false;
    private isArrivalNarrativeActive = false;
    private isAreaTransitionActive = false;
    private isIncomingCallActive = false;
    private isSeinePortalCutsceneActive = false;
    private isSeinePortalSpawning = false;
    private isPetRevealActive = false;
    private isRescueSequenceActive = false;

    constructor() {
        super(SCENE_KEYS.montmartre);
    }

    create(data?: MontmartreSceneData): void {
        this.background = this.add
            .image(0, 0, MONTMARTRE_AREA_CONFIGS['montmartre-a'].backgroundKey)
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        playMusic(this, 'music-paris', {
            volume: 0.38,
            fadeInMs: 1200,
            fadeOutMs: 1000,
        });

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.areaRoot = this.add.container(0, 0).setDepth(0);
        this.danubia = new Danubia(
            this,
            MONTMARTRE_AREA_CONFIGS['montmartre-a'].defaultSpawn.x,
            MONTMARTRE_AREA_CONFIGS['montmartre-a'].defaultSpawn.y,
        );
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
                    || this.isSeinePortalCutsceneActive
                    || this.isSeinePortalSpawning
                    || this.isDrogoBarrierSpawning
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
        this.areaTransitionOverlay = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            AREA_TRANSITION_CONFIG.overlayColor,
            0,
        ).setScrollFactor(0).setDepth(1950).setVisible(false);

        this.loadArea(data?.startArea ?? 'montmartre-a', {
            applyFade: false,
            spawn: data?.transitionFromPortal
                ? MONTMARTRE_AREA_CONFIGS['montmartre-a'].defaultSpawn
                : undefined,
            facing: data?.transitionFromPortal ? 'right' : undefined,
        });

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
        this.isArrivalNarrativeActive = true;
        this.time.delayedCall(MontmartreScene.ARRIVAL_DIALOGUE_DELAY_MS, () => {
            this.startArrivalDialogue();
        });
    }

    update(_time?: number, delta = this.game.loop.delta): void {
        this.danubia?.update();
        this.dialogueController?.update();
        this.updateDrogoBarrierBreak(delta);
        this.updateAreaAutoTransition();
        this.updatePetRevealTriggers();
        this.updateAreaInteraction();
        this.gameHud?.setCompactPhoneVisible(
            !this.phoneChecklist?.isPhoneAnimatingOrVisible && !this.isIncomingCallActive,
        );
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
        const portalAnchor = this.getPortalArrivalAnchor();
        this.createPortalHalves(portalAnchor);
        this.createArrivalOverlay();

        const portalFootY = portalAnchor.y
            + this.getPortalScaledHeight() * 0.5
            - 10;
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
            .image(
                portalAnchor.x,
                portalAnchor.y,
                'effect-time-portal',
            )
            .setScale(PORTAL_ARRIVAL_CONFIG.scale)
            .setDepth(PORTAL_ARRIVAL_CONFIG.frontDepth);
        const rightHalf = this.add
            .image(
                portalAnchor.x,
                portalAnchor.y,
                'effect-time-portal',
            )
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

        const currentArea = this.getCurrentAreaConfig();
        this.debugGraphics.clear();
        this.fillRect(this.debugGraphics, currentArea.walkArea, 0x00ff66, 0.18, 0x00ff66, 1);

        const foot = this.danubia.getFootBounds();
        this.fillRect(this.debugGraphics, foot, 0xffdd00, 0.28, 0xffdd00, 1);

        const shadow = this.danubia.getShadowBounds();
        this.fillRect(this.debugGraphics, shadow, 0x66aaff, 0.16, 0x66aaff, 1);

        const logical = this.danubia.getLogicalPosition();
        const pointer = this.input.activePointer;

        this.debugText.setText(
            [
                `room: ${this.currentArea}`,
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

    private getPortalArrivalAnchor(): { x: number; y: number } {
        const spawn = MONTMARTRE_AREA_CONFIGS['montmartre-a'].defaultSpawn;
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

    private updateChecklistToggle(): void {
        if (
            !this.danubia ||
            !this.phoneChecklist ||
            !this.togglePhoneKey ||
            !hasUnlockedPhoneHud() ||
            this.isAreaTransitionActive ||
            this.isArrivalCutsceneActive ||
            this.isArrivalNarrativeActive ||
            this.isIncomingCallActive ||
            this.isSeinePortalCutsceneActive ||
            this.isSeinePortalSpawning ||
            this.isDrogoBarrierSpawning ||
            this.isPetRevealActive ||
            this.isRescueSequenceActive ||
            this.isBreakingDrogoBarrier ||
            this.dialogueController?.isActive === true
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

    private startArrivalDialogue(): void {
        if (this.dialogueController?.isActive) {
            return;
        }

        const started = this.dialogueController?.start(montmartreArrivalDialogue, {
            onComplete: () => {
                this.isArrivalNarrativeActive = false;
                this.fragmentNotification?.show('Checklist atualizada.\nEncontre os desaparecidos.', {
                    visibleDurationMs: 2200,
                });
                this.schedulePhoneHint();
            },
        });

        if (!started) {
            this.isArrivalNarrativeActive = false;
            this.schedulePhoneHint();
        }
    }

    private getCurrentAreaConfig(): (typeof MONTMARTRE_AREA_CONFIGS)[MontmartreAreaId] {
        return MONTMARTRE_AREA_CONFIGS[this.currentArea];
    }

    private loadArea(
        areaId: MontmartreAreaId,
        options: {
            applyFade?: boolean;
            spawn?: { x: number; y: number };
            facing?: 'left' | 'right';
        } = {},
    ): void {
        if (options.applyFade) {
            this.transitionToArea(areaId, options);
            return;
        }

        this.applyArea(areaId, options.spawn, options.facing);
    }

    private transitionToArea(
        areaId: MontmartreAreaId,
        options: {
            spawn?: { x: number; y: number };
            facing?: 'left' | 'right';
        } = {},
    ): void {
        if (this.isAreaTransitionActive || !this.areaTransitionOverlay) {
            return;
        }

        this.isAreaTransitionActive = true;
        this.areaTransitionOverlay.setVisible(true);
        this.areaTransitionOverlay.setAlpha(0);
        this.syncDanubiaMovementBlock();

        this.tweens.add({
            targets: this.areaTransitionOverlay,
            alpha: AREA_TRANSITION_CONFIG.overlayAlpha,
            duration: AREA_TRANSITION_CONFIG.fadeOutDurationMs,
            ease: 'Sine.Out',
            onComplete: () => {
                this.applyArea(areaId, options.spawn, options.facing);

                this.tweens.add({
                    targets: this.areaTransitionOverlay,
                    alpha: 0,
                    duration: AREA_TRANSITION_CONFIG.fadeInDurationMs,
                    ease: 'Sine.In',
                    onComplete: () => {
                        this.areaTransitionOverlay?.setVisible(false);
                        this.isAreaTransitionActive = false;
                    },
                });
            },
        });
    }

    private applyArea(
        areaId: MontmartreAreaId,
        spawn?: { x: number; y: number },
        facing?: 'left' | 'right',
    ): void {
        const areaConfig = MONTMARTRE_AREA_CONFIGS[areaId];

        this.clearCurrentArea();
        this.currentArea = areaId;
        this.hasTriggeredCurrentAreaTransition = false;
        this.background?.setTexture(this.resolveAreaBackgroundKey(areaConfig));
        this.currentAreaBlockers = this.resolveAreaBlockers(areaId);
        this.danubia?.setWalkPlaneMode(
            areaConfig.walkArea,
            this.currentAreaBlockers,
            areaConfig.depthScale,
            {
                enabled: true,
            },
        );
        this.danubia?.setWalkPlaneSpawn(
            spawn ?? areaConfig.defaultSpawn,
            facing ?? areaConfig.defaultFacing,
        );
        this.createAreaContent(areaId);
    }

    private clearCurrentArea(): void {
        this.pendingAreaEnterRevealTimer?.remove(false);
        this.pendingAreaEnterRevealTimer = undefined;
        this.clearSeinePortal();
        this.isDrogoBarrierSpawning = false;
        for (const gameObject of this.areaObjects) {
            gameObject.destroy();
        }

        this.areaObjects = [];
        this.areaInteractions = [];
        this.activePetEncounters = [];
        this.currentAreaBlockers = [];
        this.barrierRuntime = undefined;
        this.currentDialogueBubbleAnchorTarget = undefined;
        this.stopDrogoBarrierBreak(false);
        this.interactionPrompt?.hide();
        this.areaRoot?.removeAll(false);
    }

    private createAreaContent(areaId: MontmartreAreaId): void {
        if (areaId === 'montmartre-a') {
            this.createMontmartreAContent();
            return;
        }

        if (areaId === 'montmartre-b') {
            this.createMontmartreBContent();
            this.prepareAreaEnterReveals();
        }
    }

    private createMontmartreAContent(): void {
        if (!isPetRescued('pudim')) {
            this.createPetEncounter(PUDIM_ENCOUNTER_CONFIG);
        }
    }

    private createMontmartreBContent(): void {
        if (!isPetRescued('zoe')) {
            this.createPetEncounter(ZOE_ENCOUNTER_CONFIG);
        }

        if (!isPetRescued('drogo')) {
            this.createPetEncounter(DROGO_ENCOUNTER_CONFIG);
        }
    }

    private createDrogoBarrier(): void {
        this.isDrogoBarrierSpawning = true;
        this.syncDanubiaMovementBlock();
        this.interactionPrompt?.hide();

        const glow = this.add.image(
            DROGO_BARRIER_CONFIG.position.x,
            DROGO_BARRIER_CONFIG.position.y,
            'effect-time-barrier',
        );
        glow.setScale(
            DROGO_BARRIER_CONFIG.spawnInitialScale,
            DROGO_BARRIER_CONFIG.spawnInitialScale,
        );
        glow.setTint(DROGO_BARRIER_CONFIG.glowColor);
        glow.setAlpha(0);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setDepth(4.2);

        const barrier = this.add.image(
            DROGO_BARRIER_CONFIG.position.x,
            DROGO_BARRIER_CONFIG.position.y,
            'effect-time-barrier',
        );
        barrier.setScale(
            DROGO_BARRIER_CONFIG.spawnInitialScale,
            DROGO_BARRIER_CONFIG.spawnInitialScale,
        );
        barrier.setDepth(4.6);
        barrier.setAlpha(0);

        this.areaRoot?.add([glow, barrier]);
        this.areaObjects.push(glow, barrier);
        this.barrierRuntime = {
            glow,
            barrier,
            active: false,
        };

        this.spawnTemporalBurstParticles(
            DROGO_BARRIER_CONFIG.position.x,
            DROGO_BARRIER_CONFIG.position.y,
            DROGO_BARRIER_CONFIG.spawnParticleCount,
            DROGO_BARRIER_CONFIG.spawnParticleDistance,
            DROGO_BARRIER_CONFIG.spawnParticleDurationMs,
            0xc084fc,
            6,
            4,
        );
        this.cameras.main.shake(
            DROGO_BARRIER_CONFIG.spawnCameraShakeDurationMs,
            DROGO_BARRIER_CONFIG.spawnCameraShakeIntensity,
        );

        this.tweens.add({
            targets: [glow, barrier],
            alpha: 1,
            duration: DROGO_BARRIER_CONFIG.spawnDurationMs * 0.7,
            ease: 'Sine.Out',
        });

        this.tweens.add({
            targets: glow,
            scaleX: DROGO_BARRIER_CONFIG.scaleX * 1.14,
            scaleY: DROGO_BARRIER_CONFIG.scaleY * 1.1,
            duration: DROGO_BARRIER_CONFIG.spawnDurationMs,
            ease: DROGO_BARRIER_CONFIG.spawnEase,
        });

        this.tweens.add({
            targets: barrier,
            scaleX: DROGO_BARRIER_CONFIG.scaleX,
            scaleY: DROGO_BARRIER_CONFIG.scaleY,
            duration: DROGO_BARRIER_CONFIG.spawnDurationMs,
            ease: DROGO_BARRIER_CONFIG.spawnEase,
            onComplete: () => {
                if (!this.barrierRuntime || !barrier.scene || !glow.scene) {
                    this.isDrogoBarrierSpawning = false;
                    return;
                }

                this.barrierRuntime.active = true;
                this.barrierRuntime.pulseTween = this.tweens.add({
                    targets: barrier,
                    alpha: {
                        from: DROGO_BARRIER_CONFIG.idleAlphaMin,
                        to: DROGO_BARRIER_CONFIG.idleAlphaMax,
                    },
                    scaleX: DROGO_BARRIER_CONFIG.scaleX * DROGO_BARRIER_CONFIG.pulseScaleMultiplier,
                    scaleY: DROGO_BARRIER_CONFIG.scaleY * DROGO_BARRIER_CONFIG.pulseScaleMultiplier,
                    duration: DROGO_BARRIER_CONFIG.pulseDurationMs,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });
                this.barrierRuntime.glowTween = this.tweens.add({
                    targets: glow,
                    alpha: {
                        from: DROGO_BARRIER_CONFIG.glowAlphaMin,
                        to: DROGO_BARRIER_CONFIG.glowAlphaMax,
                    },
                    scaleX: DROGO_BARRIER_CONFIG.scaleX * 1.14 * DROGO_BARRIER_CONFIG.glowPulseScaleMultiplier,
                    scaleY: DROGO_BARRIER_CONFIG.scaleY * 1.1 * DROGO_BARRIER_CONFIG.glowPulseScaleMultiplier,
                    duration: DROGO_BARRIER_CONFIG.glowPulseDurationMs,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });
                this.currentAreaBlockers = this.resolveAreaBlockers(this.currentArea);
                this.refreshCurrentAreaMovementBlockers();
                this.registerAreaInteraction({
                    id: 'disable-drogo-barrier',
                    zone: DROGO_BARRIER_CONFIG.interactionZone,
                    promptText: DROGO_BARRIER_CONFIG.promptText,
                    priority: 11,
                    onInteract: () => {
                        this.startDrogoBarrierBreak();
                    },
                });
                this.isDrogoBarrierSpawning = false;
                this.syncDanubiaMovementBlock();
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
        glow.setAlpha(config.hiddenInitially ? 0 : config.glowAlphaMin);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setScale(config.hiddenInitially ? 0 : config.bubbleScale * 1.16);
        glow.setDepth(3.5);
        const bubble = this.add.image(
            config.position.x,
            config.position.y,
            config.bubbleAssetKey,
        );
        bubble.setScale(config.hiddenInitially ? 0 : config.bubbleScale);
        bubble.setDepth(4);
        bubble.setAlpha(config.hiddenInitially ? 0 : 1);

        const pet = this.add.image(
            config.position.x,
            config.position.y + config.petOffsetY,
            config.assetKey,
        );
        pet.setScale(config.hiddenInitially ? 0 : config.petScale);
        pet.setDepth(5);
        pet.setAlpha(config.hiddenInitially ? 0 : 1);
        pet.setFlipX(config.petFlipX === true);

        this.areaRoot?.add([glow, bubble, pet]);
        this.areaObjects.push(glow, bubble, pet);

        const runtime: PetEncounterRuntime = {
            config,
            glow,
            bubble,
            pet,
            interactionId: `rescue-${config.id}`,
            glowTween: config.hiddenInitially
                ? undefined
                : this.createGlowTween(
                    glow,
                    config.bubbleScale * 1.16,
                    config.glowAlphaMin,
                    config.glowAlphaMax,
                    config.glowPulseScaleMultiplier,
                    config.glowPulseDurationMs,
                ),
            bubbleRotationTween: config.hiddenInitially
                ? undefined
                : this.createBubbleRotationTween(bubble, config.bubbleRotationDurationMs),
            revealed: !config.hiddenInitially,
            revealTriggered: !config.hiddenInitially,
            rescued: false,
        };
        this.activePetEncounters.push(runtime);

        if (runtime.revealed) {
            this.registerPetInteraction(runtime);
        }
    }

    private resolveAreaBlockers(areaId: MontmartreAreaId): RoomBlocker[] {
        const baseBlockers = [...MONTMARTRE_AREA_CONFIGS[areaId].blockers];

        if (
            areaId === 'montmartre-b'
            && !isPetRescued('drogo')
            && this.barrierRuntime?.active !== false
        ) {
            baseBlockers.push(DROGO_BARRIER_CONFIG.blocker);
        }

        return baseBlockers;
    }

    private refreshCurrentAreaMovementBlockers(): void {
        if (!this.danubia) {
            return;
        }

        const currentPosition = this.danubia.getLogicalPosition();
        const currentAreaConfig = this.getCurrentAreaConfig();

        this.danubia.setWalkPlaneMode(
            currentAreaConfig.walkArea,
            this.currentAreaBlockers,
            currentAreaConfig.depthScale,
            {
                enabled: true,
            },
        );
        this.danubia.setCutscenePosition(currentPosition);
    }

    private registerAreaInteraction(interaction: AreaInteraction): void {
        this.areaInteractions.push(interaction);
    }

    private updateAreaInteraction(): void {
        if (!this.danubia) {
            return;
        }

        if (this.isIncomingCallActive) {
            this.interactionPrompt?.hide();

            if (this.incomingCallOverlay?.isReadyToAccept && this.isInteractJustPressed()) {
                this.acceptMontmartreIncomingCall();
            }

            return;
        }

        const shouldBlockInteraction =
            this.isAreaTransitionActive
            || this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isSeinePortalCutsceneActive
            || this.isSeinePortalSpawning
            || this.isDrogoBarrierSpawning
            || this.isPetRevealActive
            || this.isRescueSequenceActive
            || this.isBreakingDrogoBarrier
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true;

        if (shouldBlockInteraction) {
            this.interactionPrompt?.hide();
            return;
        }

        const foot = this.danubia.getFootBounds();
        this.maybeTriggerDrogoBarrierHint(foot);
        this.maybeTriggerDrogoBarrierSpawn(foot);
        const activeSeinePortal =
            !this.areaInteractions.some((interaction) => this.rectsIntersect(foot, interaction.zone))
            && this.seinePortalInteractionZone
            && this.rectsIntersect(foot, this.seinePortalInteractionZone);
        const nextInteraction = this.areaInteractions
            .filter((interaction) => this.rectsIntersect(foot, interaction.zone))
            .sort((left, right) => right.priority - left.priority)[0];

        if (!nextInteraction && !activeSeinePortal) {
            this.interactionPrompt?.hide();
            return;
        }

        if (activeSeinePortal) {
            this.interactionPrompt?.show(SEINE_PORTAL_CONFIG.promptText);

            if (this.isInteractJustPressed()) {
                this.startSeinePortalCutscene();
            }

            return;
        }

        this.interactionPrompt?.show(nextInteraction.promptText);

        if (this.isInteractJustPressed()) {
            nextInteraction.onInteract();
        }
    }

    private registerPetInteraction(runtime: PetEncounterRuntime): void {
        if (
            runtime.config.id === 'drogo'
            && this.barrierRuntime?.active
        ) {
            return;
        }

        this.areaInteractions = this.areaInteractions.filter(
            (interaction) => interaction.id !== runtime.interactionId,
        );
        this.registerAreaInteraction({
            id: runtime.interactionId,
            zone: runtime.config.interactionZone,
            promptText: runtime.config.promptText,
            priority: 10,
            onInteract: () => {
                this.startPetRescueSequence(runtime);
            },
        });
    }

    private registerDrogoInteractionIfReady(): void {
        const drogoRuntime = this.activePetEncounters.find(
            (runtime) => runtime.config.id === 'drogo',
        );

        if (
            !drogoRuntime
            || drogoRuntime.rescued
            || !drogoRuntime.revealed
            || !this.isDrogoBarrierBroken
            || this.barrierRuntime?.active
            || this.isDrogoBarrierSpawning
            || this.isBreakingDrogoBarrier
        ) {
            return;
        }

        this.registerPetInteraction(drogoRuntime);
    }

    private maybeTriggerDrogoBarrierHint(foot: RectArea): void {
        if (
            this.currentArea !== 'montmartre-b'
            || this.hasShownDrogoBarrierHint
            || !this.barrierRuntime?.active
            || !this.rectsIntersect(foot, DROGO_BARRIER_CONFIG.hintZone)
        ) {
            return;
        }

        this.hasShownDrogoBarrierHint = true;
        this.dialogueController?.start(montmartreDrogoBarrierDialogue);
    }

    private maybeTriggerDrogoBarrierSpawn(foot: RectArea): void {
        if (
            this.currentArea !== 'montmartre-b'
            || this.isDrogoBarrierBroken
            || this.isDrogoBarrierSpawning
            || this.barrierRuntime?.active
            || isPetRescued('drogo')
            || !isPetRescued('zoe')
            || !this.rectsIntersect(foot, DROGO_BARRIER_CONFIG.spawnTriggerZone)
        ) {
            return;
        }

        this.createDrogoBarrier();
    }

    private disableDrogoBarrier(): void {
        if (!this.barrierRuntime?.active) {
            return;
        }

        const { barrier, glow, glowTween, pulseTween } = this.barrierRuntime;
        glowTween?.stop();
        pulseTween?.stop();
        this.barrierRuntime.glowTween = undefined;
        this.barrierRuntime.pulseTween = undefined;
        this.barrierRuntime.active = false;
        this.isDrogoBarrierBroken = true;
        this.areaInteractions = this.areaInteractions.filter((interaction) => interaction.id !== 'disable-drogo-barrier');

        this.tweens.add({
            targets: barrier,
            x: {
                from: barrier.x - DROGO_BARRIER_CONFIG.tremorOffsetPx,
                to: barrier.x + DROGO_BARRIER_CONFIG.tremorOffsetPx,
            },
            duration: DROGO_BARRIER_CONFIG.tremorDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: DROGO_BARRIER_CONFIG.tremorRepeats,
            onComplete: () => {
                barrier.x = DROGO_BARRIER_CONFIG.position.x;
                this.cameras.main.shake(
                    DROGO_BARRIER_CONFIG.completionShakeDurationMs,
                    DROGO_BARRIER_CONFIG.completionShakeIntensity,
                );

                this.tweens.add({
                    targets: [barrier, glow],
                    alpha: 0,
                    duration: DROGO_BARRIER_CONFIG.fadeDurationMs,
                    ease: 'Quad.Out',
                });

                this.tweens.add({
                    targets: barrier,
                    scaleX: DROGO_BARRIER_CONFIG.scaleX * 1.08,
                    scaleY: DROGO_BARRIER_CONFIG.scaleY * 1.08,
                    duration: DROGO_BARRIER_CONFIG.fadeDurationMs,
                    ease: 'Quad.Out',
                    onComplete: () => {
                        barrier.destroy();
                        glow.destroy();
                        this.areaObjects = this.areaObjects.filter((gameObject) =>
                            gameObject !== barrier && gameObject !== glow,
                        );
                        this.stopDrogoBarrierBreak(false);
                        this.syncDanubiaMovementBlock();
                        this.currentAreaBlockers = this.resolveAreaBlockers(this.currentArea);
                        this.refreshCurrentAreaMovementBlockers();
                        this.registerDrogoInteractionIfReady();
                    },
                });
            },
        });
    }

    private startPetRescueSequence(runtime: PetEncounterRuntime): void {
        if (
            this.isRescueSequenceActive
            || this.isDrogoBarrierSpawning
            || this.isBreakingDrogoBarrier
            || runtime.rescued
        ) {
            return;
        }

        this.isRescueSequenceActive = true;
        this.interactionPrompt?.hide();
        runtime.rescued = true;
        this.areaInteractions = this.areaInteractions.filter(
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
                        this.areaObjects = this.areaObjects.filter((gameObject) =>
                            gameObject !== runtime.glow && gameObject !== bubble,
                        );
                    },
                });

                this.tweens.add({
                    targets: pet,
                    y: originalPetY - runtime.config.rescueJumpHeightPx,
                    duration: runtime.config.id === 'pudim'
                        ? PUDIM_RESCUE_CONFIG.petJumpUpDurationMs
                        : runtime.config.id === 'zoe'
                            ? ZOE_RESCUE_CONFIG.petJumpUpDurationMs
                            : DROGO_RESCUE_CONFIG.petJumpUpDurationMs,
                    ease: 'Quad.Out',
                    yoyo: true,
                    hold: 60,
                    repeat: 0,
                    repeatDelay: 0,
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
            runtime.config.id === 'zoe' ? runtime.pet : undefined;

        this.time.delayedCall(this.getAutoChecklistTotalMs(runtime.config.checklistVisibleDurationMs), () => {
            const started = this.dialogueController?.start(runtime.config.dialogue, {
                onComplete: () => {
                    this.currentDialogueBubbleAnchorTarget = undefined;
                    this.fadeOutRescuedPet(runtime);
                },
            });

            if (!started) {
                this.currentDialogueBubbleAnchorTarget = undefined;
                this.fadeOutRescuedPet(runtime);
            }
        });
    }

    private fadeOutRescuedPet(runtime: PetEncounterRuntime): void {
        if (!runtime.pet.scene) {
            this.isRescueSequenceActive = false;
            return;
        }

        this.tweens.add({
            targets: runtime.pet,
            alpha: 0,
            duration: runtime.config.petFadeDurationMs,
            ease: 'Quad.Out',
            onComplete: () => {
                runtime.pet.destroy();
                this.areaObjects = this.areaObjects.filter((gameObject) => gameObject !== runtime.pet);
                this.activePetEncounters = this.activePetEncounters.filter((entry) => entry !== runtime);
                this.isRescueSequenceActive = false;
                this.maybeStartMontmartreEndingFlow();
            },
        });
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

    private updatePetRevealTriggers(): void {
        if (
            !this.danubia
            || this.isAreaTransitionActive
            || this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isIncomingCallActive
            || this.isSeinePortalCutsceneActive
            || this.isSeinePortalSpawning
            || this.isDrogoBarrierSpawning
            || this.isPetRevealActive
            || this.isRescueSequenceActive
            || this.isBreakingDrogoBarrier
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true
        ) {
            return;
        }

        const logicalPosition = this.danubia.getLogicalPosition();
        const runtimeToReveal = this.activePetEncounters.find((runtime) =>
            !runtime.revealed
            && !runtime.revealTriggered
            && runtime.config.revealTriggerType === 'walk-trigger'
            && typeof runtime.config.revealTriggerX === 'number'
            && logicalPosition.x >= runtime.config.revealTriggerX,
        );

        if (!runtimeToReveal) {
            return;
        }

        runtimeToReveal.revealTriggered = true;
        this.revealPetEncounter(runtimeToReveal, {
            recoilDanubia: true,
        });
    }

    private prepareAreaEnterReveals(): void {
        this.pendingAreaEnterRevealTimer?.remove(false);
        const pendingRuntimes = this.activePetEncounters.filter((runtime) =>
            !runtime.revealed
            && !runtime.revealTriggered
            && runtime.config.revealTriggerType === 'area-enter',
        ).sort((left, right) => left.config.position.x - right.config.position.x);

        if (pendingRuntimes.length === 0) {
            return;
        }

        this.isPetRevealActive = true;
        this.syncDanubiaMovementBlock();

        this.pendingAreaEnterRevealTimer = this.time.delayedCall(
            PET_REVEAL_CONFIG.areaEnterDelayMs,
            () => {
                this.pendingAreaEnterRevealTimer = undefined;
                this.runAreaEnterRevealSequence(pendingRuntimes, 0);
            },
        );
    }

    private runAreaEnterRevealSequence(
        runtimes: PetEncounterRuntime[],
        index: number,
    ): void {
        const runtime = runtimes[index];

        if (!runtime) {
            for (const revealedRuntime of runtimes) {
                if (revealedRuntime.config.id === 'drogo') {
                    this.registerDrogoInteractionIfReady();
                } else {
                    this.registerPetInteraction(revealedRuntime);
                }
            }

            this.isPetRevealActive = false;
            this.syncDanubiaMovementBlock();
            return;
        }

        runtime.revealTriggered = true;
        this.revealPetEncounter(runtime, {
            recoilDanubia: true,
            registerInteractionOnComplete: false,
            onComplete: () => {
                this.time.delayedCall(PET_REVEAL_CONFIG.sequenceRevealGapMs, () => {
                    this.runAreaEnterRevealSequence(runtimes, index + 1);
                });
            },
        });
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
            if (options.registerInteractionOnComplete !== false) {
                this.isPetRevealActive = false;
            }
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

        if (options.registerInteractionOnComplete !== false) {
            if (runtime.config.id === 'drogo') {
                this.registerDrogoInteractionIfReady();
            } else {
                this.registerPetInteraction(runtime);
            }

            this.isPetRevealActive = false;
            this.syncDanubiaMovementBlock();
        }

        options.onComplete?.();
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
            this.areaRoot?.add(particle);
            this.areaObjects.push(particle);

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
                    this.areaObjects = this.areaObjects.filter((gameObject) => gameObject !== particle);
                },
            });
        }
    }

    private updateAreaAutoTransition(): void {
        if (
            !this.danubia
            || this.hasTriggeredCurrentAreaTransition
            || this.isAreaTransitionActive
            || this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isIncomingCallActive
            || this.isSeinePortalCutsceneActive
            || this.isSeinePortalSpawning
            || this.isDrogoBarrierSpawning
            || this.isPetRevealActive
            || this.isRescueSequenceActive
            || this.isBreakingDrogoBarrier
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true
        ) {
            return;
        }

        const transitions = MONTMARTRE_AREA_AUTO_TRANSITIONS[this.currentArea] ?? [];
        const logicalPosition = this.danubia.getLogicalPosition();
        const matchedTransition = transitions.find((transition) =>
            transition.edge === 'right'
                ? logicalPosition.x >= transition.triggerX
                : logicalPosition.x <= transition.triggerX,
        );

        if (!matchedTransition) {
            return;
        }

        this.hasTriggeredCurrentAreaTransition = true;
        this.changeAreaForFutureContent(matchedTransition.targetArea, {
            spawn: matchedTransition.targetSpawn,
            facing: matchedTransition.targetFacing,
        });
    }

    private resolveAreaBackgroundKey(
        areaConfig: (typeof MONTMARTRE_AREA_CONFIGS)[MontmartreAreaId],
    ): string {
        if (this.textures.exists(areaConfig.backgroundKey)) {
            return areaConfig.backgroundKey;
        }

        return areaConfig.fallbackBackgroundKey;
    }

    private syncDanubiaMovementBlock(): void {
        this.danubia?.setMovementBlocked(
            this.isAreaTransitionActive
            || this.isArrivalCutsceneActive
            || this.isArrivalNarrativeActive
            || this.isIncomingCallActive
            || this.isSeinePortalCutsceneActive
            || this.isSeinePortalSpawning
            || this.isDrogoBarrierSpawning
            || this.isPetRevealActive
            || this.isRescueSequenceActive
            || this.isBreakingDrogoBarrier
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true,
        );
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

    protected changeAreaForFutureContent(
        areaId: MontmartreAreaId,
        options?: {
            spawn?: { x: number; y: number };
            facing?: 'left' | 'right';
        },
    ): void {
        this.loadArea(areaId, {
            applyFade: true,
            spawn: options?.spawn,
            facing: options?.facing,
        });
    }

    private startDrogoBarrierBreak(): void {
        if (
            !this.barrierRuntime?.active
            || this.isBreakingDrogoBarrier
            || this.isRescueSequenceActive
            || this.phoneChecklist?.blocksMovement === true
            || this.dialogueController?.isActive === true
        ) {
            return;
        }

        this.isBreakingDrogoBarrier = true;
        this.interactionPrompt?.hide();
        this.ensureDrogoBarrierBreakUi();
        this.updateDrogoBarrierBreakUi();
        this.syncDanubiaMovementBlock();
        this.handleDrogoBarrierBreakPress();
    }

    private stopDrogoBarrierBreak(resetProgress: boolean): void {
        this.isBreakingDrogoBarrier = false;

        if (resetProgress) {
            this.drogoBarrierProgress = 0;
        }

        this.barrierBreakUi?.container.setVisible(false);
    }

    private updateDrogoBarrierBreak(delta: number): void {
        if (!this.isBreakingDrogoBarrier || !this.barrierRuntime?.active) {
            return;
        }

        if (this.isInteractJustPressed()) {
            this.handleDrogoBarrierBreakPress();
        }

        const elapsedSinceLastPress = this.time.now - this.lastDrogoBarrierPressAt;

        if (elapsedSinceLastPress >= DROGO_BARRIER_CONFIG.qte.decayDelayMs) {
            const decayAmount = DROGO_BARRIER_CONFIG.qte.decayPerSecond * (delta / 1000);
            const nextProgress = Math.max(0, this.drogoBarrierProgress - decayAmount);

            if (nextProgress !== this.drogoBarrierProgress) {
                this.drogoBarrierProgress = nextProgress;
                this.updateDrogoBarrierBreakUi();
            }
        }
    }

    private handleDrogoBarrierBreakPress(): void {
        if (!this.barrierRuntime?.active) {
            return;
        }

        this.lastDrogoBarrierPressAt = this.time.now;
        this.drogoBarrierProgress = Math.min(
            100,
            this.drogoBarrierProgress + DROGO_BARRIER_CONFIG.qte.progressPerPress,
        );
        this.updateDrogoBarrierBreakUi();
        this.pulseDrogoBarrierOnProgress();

        if (this.drogoBarrierProgress >= 100) {
            this.disableDrogoBarrier();
        }
    }

    private ensureDrogoBarrierBreakUi(): void {
        if (this.barrierBreakUi) {
            this.barrierBreakUi.container.setVisible(true);
            return;
        }

        const width = 348;
        const height = 82;
        const container = this.add.container(
            DROGO_BARRIER_CONFIG.qte.uiX,
            DROGO_BARRIER_CONFIG.qte.uiY,
        );
        const panel = this.add.rectangle(0, 0, width, height, 0x08111f, 0.82);
        panel.setStrokeStyle(2, 0xf6d365, 0.44);
        const label = this.add.text(0, -20, 'Rompendo barreira temporal', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#f8fafc',
            align: 'center',
        }).setOrigin(0.5);
        const track = this.add.rectangle(
            0,
            16,
            DROGO_BARRIER_CONFIG.qte.barWidth,
            DROGO_BARRIER_CONFIG.qte.barHeight,
            0x17263c,
            0.96,
        );
        track.setStrokeStyle(2, 0xc084fc, 0.38);
        const fill = this.add.rectangle(
            -DROGO_BARRIER_CONFIG.qte.barWidth * 0.5 + 2,
            16,
            0,
            DROGO_BARRIER_CONFIG.qte.barHeight - 4,
            0xf6d365,
            1,
        ).setOrigin(0, 0.5);

        container.add([panel, label, track, fill]);
        container.setDepth(DROGO_BARRIER_CONFIG.qte.uiDepth);
        container.setScrollFactor(0);
        container.setVisible(true);

        this.barrierBreakUi = {
            container,
            fill,
        };
    }

    private updateDrogoBarrierBreakUi(): void {
        if (!this.barrierBreakUi) {
            return;
        }

        this.barrierBreakUi.container.setVisible(this.isBreakingDrogoBarrier);
        this.barrierBreakUi.fill.width =
            (DROGO_BARRIER_CONFIG.qte.barWidth - 4) * (this.drogoBarrierProgress / 100);
    }

    private pulseDrogoBarrierOnProgress(): void {
        if (!this.barrierRuntime?.active) {
            return;
        }

        const { barrier, glow } = this.barrierRuntime;

        this.tweens.add({
            targets: barrier,
            alpha: Math.min(1, DROGO_BARRIER_CONFIG.idleAlphaMax + 0.08),
            duration: 70,
            yoyo: true,
            ease: 'Sine.InOut',
        });

        this.tweens.add({
            targets: barrier,
            x: {
                from: DROGO_BARRIER_CONFIG.position.x - DROGO_BARRIER_CONFIG.tremorOffsetPx,
                to: DROGO_BARRIER_CONFIG.position.x + DROGO_BARRIER_CONFIG.tremorOffsetPx,
            },
            duration: DROGO_BARRIER_CONFIG.tremorDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                barrier.x = DROGO_BARRIER_CONFIG.position.x;
            },
        });

        this.tweens.add({
            targets: glow,
            alpha: Math.min(0.72, DROGO_BARRIER_CONFIG.glowAlphaMax + 0.16),
            duration: 90,
            yoyo: true,
            ease: 'Sine.InOut',
        });
    }

    private maybeStartMontmartreEndingFlow(): void {
        if (
            this.hasTriggeredMontmartreEnding
            || !isPetRescued('pudim')
            || !isPetRescued('zoe')
            || !isPetRescued('drogo')
        ) {
            return;
        }

        this.hasTriggeredMontmartreEnding = true;
        this.startMontmartreIncomingCall();
    }

    private startMontmartreIncomingCall(): void {
        if (this.isIncomingCallActive || this.hasCompletedMontmartreCall) {
            return;
        }

        this.phoneChecklist?.close();
        this.isIncomingCallActive = true;
        this.interactionPrompt?.hide();
        this.syncDanubiaMovementBlock();
        this.incomingCallOverlay?.show();
    }

    private acceptMontmartreIncomingCall(): void {
        this.isIncomingCallActive = false;
        this.incomingCallOverlay?.hide();

        const started = this.dialogueController?.start(montmartreMonsieurFollowUpDialogue, {
            onComplete: () => {
                this.hasCompletedMontmartreCall = true;
                this.isSeinePortalSpawning = true;
                this.syncDanubiaMovementBlock();
                this.time.delayedCall(180, () => {
                    this.spawnSeinePortal();
                });
            },
        }) ?? false;

        if (!started) {
            this.hasCompletedMontmartreCall = true;
            this.isSeinePortalSpawning = true;
            this.spawnSeinePortal();
        }
    }

    private spawnSeinePortal(): void {
        this.clearSeinePortal();

        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            this.isSeinePortalSpawning = false;
            this.syncDanubiaMovementBlock();
            return;
        }

        const halfFrameWidth = Math.floor(textureFrame.width * 0.5);
        const remainingFrameWidth = textureFrame.width - halfFrameWidth;
        const glow = this.add.image(
            SEINE_PORTAL_CONFIG.position.x,
            SEINE_PORTAL_CONFIG.position.y,
            'effect-time-portal',
        ).setDepth(SEINE_PORTAL_CONFIG.backDepth - 0.1);
        glow.setScale(SEINE_PORTAL_CONFIG.spawn.initialScale, SEINE_PORTAL_CONFIG.spawn.initialScale);
        glow.setTint(SEINE_PORTAL_CONFIG.glowColor);
        glow.setAlpha(0);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        const leftSprite = this.add
            .image(SEINE_PORTAL_CONFIG.position.x, SEINE_PORTAL_CONFIG.position.y, 'effect-time-portal')
            .setScale(SEINE_PORTAL_CONFIG.spawn.initialScale)
            .setAlpha(0);
        const rightSprite = this.add
            .image(SEINE_PORTAL_CONFIG.position.x, SEINE_PORTAL_CONFIG.position.y, 'effect-time-portal')
            .setScale(SEINE_PORTAL_CONFIG.spawn.initialScale)
            .setAlpha(0);

        leftSprite.setCrop(0, 0, halfFrameWidth, textureFrame.height);
        rightSprite.setCrop(halfFrameWidth, 0, remainingFrameWidth, textureFrame.height);

        const leftIsBehind = SEINE_PORTAL_CONFIG.side === 'right';
        leftSprite.setDepth(leftIsBehind ? SEINE_PORTAL_CONFIG.backDepth : SEINE_PORTAL_CONFIG.frontDepth);
        rightSprite.setDepth(leftIsBehind ? SEINE_PORTAL_CONFIG.frontDepth : SEINE_PORTAL_CONFIG.backDepth);

        this.portalGlow = glow;
        this.portalBackHalf = leftIsBehind ? leftSprite : rightSprite;
        this.portalFrontHalf = leftIsBehind ? rightSprite : leftSprite;
        this.areaRoot?.add([glow, leftSprite, rightSprite]);
        this.areaObjects.push(glow, leftSprite, rightSprite);
        this.spawnTemporalBurstParticles(
            SEINE_PORTAL_CONFIG.position.x,
            SEINE_PORTAL_CONFIG.position.y,
            SEINE_PORTAL_CONFIG.spawn.particleCount,
            SEINE_PORTAL_CONFIG.spawn.particleDistance,
            SEINE_PORTAL_CONFIG.spawn.particleDurationMs,
            0x7dd3fc,
            5,
            4,
        );
        this.cameras.main.shake(
            SEINE_PORTAL_CONFIG.spawn.cameraShakeDurationMs,
            SEINE_PORTAL_CONFIG.spawn.cameraShakeIntensity,
        );

        this.tweens.add({
            targets: [glow, leftSprite, rightSprite],
            alpha: 1,
            duration: SEINE_PORTAL_CONFIG.spawn.durationMs * 0.72,
            ease: 'Sine.Out',
        });

        this.tweens.add({
            targets: glow,
            scaleX: SEINE_PORTAL_CONFIG.scale * 1.14,
            scaleY: SEINE_PORTAL_CONFIG.scale * 1.14,
            duration: SEINE_PORTAL_CONFIG.spawn.durationMs,
            ease: SEINE_PORTAL_CONFIG.spawn.ease,
        });

        this.tweens.add({
            targets: [leftSprite, rightSprite],
            scaleX: SEINE_PORTAL_CONFIG.scale,
            scaleY: SEINE_PORTAL_CONFIG.scale,
            duration: SEINE_PORTAL_CONFIG.spawn.durationMs,
            ease: SEINE_PORTAL_CONFIG.spawn.ease,
            onComplete: () => {
                this.seinePortalInteractionZone = {
                    x: SEINE_PORTAL_CONFIG.position.x - SEINE_PORTAL_CONFIG.interactionWidth * 0.5,
                    y: SEINE_PORTAL_CONFIG.footY - SEINE_PORTAL_CONFIG.interactionHeight,
                    width: SEINE_PORTAL_CONFIG.interactionWidth,
                    height: SEINE_PORTAL_CONFIG.interactionHeight,
                };
                this.portalPulseTween = this.tweens.add({
                    targets: [leftSprite, rightSprite],
                    scaleX: SEINE_PORTAL_CONFIG.scale * SEINE_PORTAL_CONFIG.pulseScaleMultiplier,
                    scaleY: SEINE_PORTAL_CONFIG.scale * SEINE_PORTAL_CONFIG.pulseScaleMultiplier,
                    alpha: {
                        from: SEINE_PORTAL_CONFIG.pulseAlphaMin,
                        to: SEINE_PORTAL_CONFIG.pulseAlphaMax,
                    },
                    duration: SEINE_PORTAL_CONFIG.pulseDurationMs,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });

                this.portalDriftTween = this.tweens.add({
                    targets: [leftSprite, rightSprite],
                    angle: {
                        from: -SEINE_PORTAL_CONFIG.driftAngle,
                        to: SEINE_PORTAL_CONFIG.driftAngle,
                    },
                    duration: SEINE_PORTAL_CONFIG.driftDurationMs,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });

                this.portalGlowTween = this.tweens.add({
                    targets: glow,
                    alpha: {
                        from: SEINE_PORTAL_CONFIG.glowAlphaMin,
                        to: SEINE_PORTAL_CONFIG.glowAlphaMax,
                    },
                    scaleX: SEINE_PORTAL_CONFIG.scale * 1.2,
                    scaleY: SEINE_PORTAL_CONFIG.scale * 1.2,
                    duration: SEINE_PORTAL_CONFIG.glowPulseDurationMs,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });

                this.isSeinePortalSpawning = false;
                this.syncDanubiaMovementBlock();
            },
        });
    }

    private clearSeinePortal(): void {
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
        this.seinePortalInteractionZone = undefined;
    }

    private startSeinePortalCutscene(): void {
        if (
            this.isSeinePortalCutsceneActive
            || !this.danubia
            || !this.seinePortalInteractionZone
        ) {
            return;
        }

        this.isSeinePortalCutsceneActive = true;
        this.interactionPrompt?.hide();
        this.phoneChecklist?.close();
        this.syncDanubiaMovementBlock();

        const direction = SEINE_PORTAL_CONFIG.side === 'right' ? 'right' : 'left';
        const logicalStart = this.danubia.getLogicalPosition();
        const target = {
            x: SEINE_PORTAL_CONFIG.position.x,
            y: this.resolveDanubiaCutsceneY(SEINE_PORTAL_CONFIG.footY),
        };
        const distance = Phaser.Math.Distance.Between(
            logicalStart.x,
            logicalStart.y,
            target.x,
            target.y,
        );
        const walkDurationMs = Math.max(
            240,
            (distance / SEINE_PORTAL_CONFIG.pullSpeedPxPerSecond) * 1000,
        );
        const proxy = { ...logicalStart };
        const fadeProxy = { alpha: 1 };

        this.danubia.setFacing(direction);
        this.danubia.setDepth(SEINE_PORTAL_CONFIG.characterDepth);
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

                if (remainingDistance <= SEINE_PORTAL_CONFIG.fadeStartDistancePx) {
                    const fadeProgress =
                        1 - remainingDistance / Math.max(SEINE_PORTAL_CONFIG.fadeStartDistancePx, 1);
                    this.danubia?.setCharacterAlpha(1 - fadeProgress);
                }
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(target);
                this.danubia?.playIdleCutscene(direction);
                this.danubia?.setCharacterAlpha(0);
                this.finishSeineSceneTransition();
            },
        });

        const fadeDelayMs = Math.max(0, walkDurationMs - SEINE_PORTAL_CONFIG.fadeDurationMs);
        this.time.delayedCall(fadeDelayMs, () => {
            this.tweens.add({
                targets: fadeProxy,
                alpha: 0,
                duration: SEINE_PORTAL_CONFIG.fadeDurationMs,
                ease: 'Quad.In',
                onUpdate: () => {
                    this.danubia?.setCharacterAlpha(fadeProxy.alpha);
                },
            });
        });
    }

    private finishSeineSceneTransition(): void {
        this.playPortalScreenTransition(() => {
            // TODO: persist checkpoint "paris-seine" when the checkpoint/save system is implemented.
            this.scene.start(SCENE_KEYS.seine);
        });
    }

    private playPortalScreenTransition(onComplete: () => void): void {
        const transitionConfig = SEINE_PORTAL_CONFIG.transition;
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
            ease: 'Cubic.Out',
        });

        this.tweens.add({
            targets: ringB,
            scaleX: transitionConfig.ringMaxRadius / ringB.radius,
            scaleY: transitionConfig.ringMaxRadius / ringB.radius,
            alpha: 0,
            duration: transitionConfig.durationMs * 0.9,
            ease: 'Cubic.Out',
            delay: 70,
        });

        this.time.delayedCall(transitionConfig.durationMs, () => {
            onComplete();
        });
    }
}
