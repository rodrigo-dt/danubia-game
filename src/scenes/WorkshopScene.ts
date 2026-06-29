import Phaser from 'phaser';
import { DANUBIA_ASSET_KEYS, Danubia } from '../characters/Danubia';
import { DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, UI_FONT_FAMILY } from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';
import {
    workshopEndingDialogue,
    workshopMainDialogue,
    workshopOpeningSceneBubbles,
} from '../data/dialogues';
import { hasUnlockedPhoneHud, markFamilyMemberRescued } from '../game/states';
import { DialogueController } from '../systems/DialogueController';
import { isInteractHeld as isControllerInteractHeld } from '../systems/controllerInput';
import type { RectArea } from '../game/types';
import { FragmentNotification } from '../ui/FragmentNotification';
import { GameHud } from '../ui/GameHud';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { PHONE_CHECKLIST_CONFIG, PhoneChecklist } from '../ui/PhoneChecklist';
import {playMusic} from "../systems/musicManager.ts";

const WORKSHOP_ARENA_CONFIG = {
    walkArea: {
        x: 20,
        y: 427,
        width: 930,
        height: 110,
        baseScaleY: 434,
    },
    depthScale: {
        baseScale: 1.7,
        farY: 364,
        nearY: 490,
        farScale: 1.54,
        nearScale: 1.76,
        baseY: 434,
    },
    movement: {
        horizontalSpeedMultiplier: 0.84,
        verticalSpeedMultiplier: 0.8,
        minScale: 1.54,
        maxScale: 1.76,
    },
} as const;

const WORKSHOP_LAYOUT = {
    danubiaSpawn: { x: 54, y: 416 },
    danubiaStop: { x: 252, y: 416 },
    monsieur: { x: 704, y: 415, scale: 1.8 },
    familyBubble: { x: 504, y: 176, bubbleScale: 0.44 },
    husband: { x: 504, y: 185, scale: 1.02 },
    daughter: { x: 450, y: 180, scale: 0.95 },
    son: { x: 560, y: 180, scale: 0.95 },
    arenaCenter: { x: 494, y: 360 },
} as const;

const OPENING_SEQUENCE = {
    fadeInDurationMs: 320,
    walkInSpeedPxPerSecond: 126,
    familyFocusDelayMs: 220,
    sceneBubbleGapMs: 140,
} as const;

const FAMILY_BUBBLE_EFFECT = {
    glowTint: 0x7c6cff,
    glowAlphaMin: 0.18,
    glowAlphaMax: 0.36,
    pulseDurationMs: 940,
    floatDistancePx: 8,
    floatDurationMs: 2100,
} as const;

const MONSIEUR_EFFECT = {
    auraTint: 0x7c6cff,
    auraAlphaMin: 0.1,
    auraAlphaMax: 0.24,
    pulseDurationMs: 1200,
} as const;

const COMBAT_PREP_NOTIFICATION = {
    message: 'A oficina desperta ao redor.',
    visibleDurationMs: 2400,
} as const;

const ANCHOR_PROMPT_TEXT = 'Segure Quadrado para desativar';
const PHASE_RESTART_NOTIFICATION = 'A sincronização foi interrompida.';
const COMBAT_COMPLETE_NOTIFICATION = 'A prisão temporal entrou em colapso.';
const WORKSHOP_ENDING_SEQUENCE = {
    danubiaCastX: 208,
    danubiaFamilyMeetX: 388,
    walkSpeedPxPerSecond: 210,
    powerChargeDurationMs: 700,
    projectileDurationMs: 940,
    impactHoldDurationMs: 420,
    monsieurFlickerDurationMs: 1380,
    familyDropDurationMs: 920,
    familyBounceDurationMs: 180,
    victoryHoldDurationMs: 1300,
} as const;

const WORKSHOP_SCENE_BUBBLE_CONFIG = {
    maxWidth: 332,
    minWidth: 190,
    minHeight: 62,
    paddingX: 20,
    paddingY: 16,
    offsetY: 146,
    clampPadding: 16,
    backgroundColor: 0xfafaf9,
    backgroundAlpha: 0.97,
    borderColor: 0x111827,
    borderAlpha: 0.18,
    borderWidth: 2,
    radius: 16,
    tailWidth: 24,
    tailHeight: 16,
    textFontSize: '18px',
    textColor: '#111111',
    textVerticalOffset: -2,
} as const;

const FAMILY_FREED_SCALE = {
    daughter: 1.5,
    husband: 1.58,
    son: 1.5,
} as const;

const COMBAT_LAYOUT = {
    anchorPositions: [
        { x: 170, y: 415 },
        { x: 480, y: 415 },
        { x: 790, y: 415 },
    ],
    phaseRespawnPositions: [
        { x: 122, y: 416 },
        { x: 122, y: 416 },
        { x: 122, y: 416 },
    ],
    pulseLaneY: 414,
    gearLaneY: 430,
        familyGroundPositions: {
        daughter: { x: 446, y: 420 },
        husband: { x: 505, y: 428 },
        son: { x: 564, y: 420 },
    },
} as const;

const ANCHOR_SYNC_CONFIG = {
    progressPerSecond: 74,
    uiX: GAME_WIDTH * 0.5,
    uiY: 68,
    uiDepth: 250,
    barWidth: 300,
    barHeight: 18,
} as const;

const COMBAT_PHASE_CONFIG = {
    1: {
        checkpointPrisonState: 'intact',
        completedPrisonState: 'cracked-light',
        introMessage: 'Primeira âncora ativa.',
        feedbackSpeakerId: 'daughter',
        feedbackText: 'A bolha enfraqueceu!',
        pulseIntervalMs: 1800,
        gearIntervalMs: 0,
        clockIntervalMs: 0,
    },
    2: {
        checkpointPrisonState: 'cracked-light',
        completedPrisonState: 'cracked-strong',
        introMessage: 'Segunda âncora ativada.',
        feedbackSpeakerId: 'son',
        feedbackText: 'Só mais uma!',
        pulseIntervalMs: 1720,
        gearIntervalMs: 4200,
        clockIntervalMs: 0,
    },
    3: {
        checkpointPrisonState: 'cracked-strong',
        completedPrisonState: 'broken',
        introMessage: 'Última âncora. Aguente firme.',
        feedbackSpeakerId: 'monsieur',
        feedbackText: 'Então venha até o fim.',
        pulseIntervalMs: 1120,
        gearIntervalMs: 2650,
        clockIntervalMs: 0,
    },
} as const;

type WorkshopSpeakerId =
    (typeof workshopOpeningSceneBubbles)[number]['speakerId'];

type CombatPhase = 1 | 2 | 3;
type FamilyPrisonState = 'intact' | 'cracked-light' | 'cracked-strong' | 'broken';
type AnchorState = 'idle' | 'active' | 'syncing' | 'disabled';
type HazardKind = 'temporal-pulse' | 'rolling-gear';

type SceneBubbleRuntime = {
    container: Phaser.GameObjects.Container;
};

type FamilyPrisonRuntime = {
    container: Phaser.GameObjects.Container;
    glow: Phaser.GameObjects.Image;
    bubble: Phaser.GameObjects.Image;
    husband: Phaser.GameObjects.Image;
    daughter: Phaser.GameObjects.Image;
    son: Phaser.GameObjects.Image;
    crackOverlay: Phaser.GameObjects.Graphics;
    state: FamilyPrisonState;
};

type MonsieurRuntime = {
    sprite: Phaser.GameObjects.Image;
    aura: Phaser.GameObjects.Image;
    mode: 'idle' | 'channeling';
    poseResetTimer?: Phaser.Time.TimerEvent;
    flickerTween?: Phaser.Tweens.Tween;
};

type TemporalAnchorRuntime = {
    id: string;
    index: number;
    state: AnchorState;
    syncProgress: number;
    container: Phaser.GameObjects.Container;
    baseGlow: Phaser.GameObjects.Image;
    anchor: Phaser.GameObjects.Image;
    pedestal: Phaser.GameObjects.Image;
    interactionZone: RectArea;
    pulseTween?: Phaser.Tweens.Tween;
    glowTween?: Phaser.Tweens.Tween;
};

type HazardRuntime = {
    id: string;
    kind: HazardKind;
    sprite: Phaser.GameObjects.Image;
    hitbox: RectArea;
    velocityX: number;
    active: boolean;
    update: (deltaMs: number) => void;
    destroy: () => void;
};

type BattleCheckpointState = {
    phase: CombatPhase;
    activeAnchorIndex: number;
    prisonState: FamilyPrisonState;
};

type AnchorSyncUiRuntime = {
    container: Phaser.GameObjects.Container;
    label: Phaser.GameObjects.Text;
    fill: Phaser.GameObjects.Rectangle;
};

export class WorkshopScene extends Phaser.Scene {
    private danubia?: Danubia;
    private monsieurRuntime?: MonsieurRuntime;
    private familyPrison?: FamilyPrisonRuntime;
    private temporalAnchors: TemporalAnchorRuntime[] = [];
    private activeHazards: HazardRuntime[] = [];
    private interactionPrompt?: InteractionPrompt;
    private gameHud?: GameHud;
    private phoneChecklist?: PhoneChecklist;
    private fragmentNotification?: FragmentNotification;
    private dialogueController?: DialogueController;
    private togglePhoneKey?: Phaser.Input.Keyboard.Key;
    private interactKey?: Phaser.Input.Keyboard.Key;
    private currentSceneBubble?: SceneBubbleRuntime;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private anchorSyncUi?: AnchorSyncUiRuntime;
    private activeHazardTimers: Phaser.Time.TimerEvent[] = [];
    private battlePhase: CombatPhase = 1;
    private activeAnchorIndex = 0;
    private currentCheckpoint: BattleCheckpointState = {
        phase: 1,
        activeAnchorIndex: 0,
        prisonState: 'intact',
    };
    private isOpeningSequenceActive = false;
    private isSceneBubbleSequenceActive = false;
    private isCombatSetupPending = false;
    private isCombatPrepared = false;
    private isCombatActive = false;
    private isAnchorInteractionActive = false;
    private isFamilyPrisoned = true;
    private isPlayerRecoveringFromHit = false;
    private isPhaseTransitionActive = false;
    private isCombatEndingActive = false;

    constructor() {
        super(SCENE_KEYS.workshop);
    }

    create(): void {
        installDevModeHotkeys(this);

        this.add
            .image(0, 0, 'bg-paris-workshop')
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        playMusic(this, 'music-workshop', {
            volume: 0.5,
            fadeInMs: 900,
            fadeOutMs: 900,
        });

        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        this.cameras.main.fadeIn(OPENING_SEQUENCE.fadeInDurationMs, 228, 244, 255);

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.createArenaProps();
        this.createFamilyPrison();
        this.createMonsieur();
        this.createTemporalAnchors();
        this.initializeCombatCheckpoint();

        this.danubia = new Danubia(
            this,
            WORKSHOP_LAYOUT.danubiaSpawn.x,
            WORKSHOP_LAYOUT.danubiaSpawn.y,
        );
        this.danubia.setWalkPlaneMode(
            WORKSHOP_ARENA_CONFIG.walkArea,
            [],
            WORKSHOP_ARENA_CONFIG.depthScale,
            {
                enabled: true,
            },
            {
                horizontalSpeedMultiplier: WORKSHOP_ARENA_CONFIG.movement.horizontalSpeedMultiplier,
                verticalSpeedMultiplier: WORKSHOP_ARENA_CONFIG.movement.verticalSpeedMultiplier,
                minScale: WORKSHOP_ARENA_CONFIG.movement.minScale,
                maxScale: WORKSHOP_ARENA_CONFIG.movement.maxScale,
                smoothScale: false,
                smoothSpeed: false,
                scaleReference: 'foot-area',
            },
        );
        this.danubia.setWalkPlaneSpawn(WORKSHOP_LAYOUT.danubiaSpawn, 'right');

        this.interactionPrompt = new InteractionPrompt(this);
        this.gameHud = new GameHud(this);
        this.phoneChecklist = new PhoneChecklist(this);
        this.fragmentNotification = new FragmentNotification(this);
        this.togglePhoneKey = this.input.keyboard?.addKey(PHONE_CHECKLIST_CONFIG.toggleKeyCode);
        this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.dialogueController = new DialogueController(this, {
            onStateChange: () => {
                this.syncDanubiaMovementBlock();
            },
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

        this.startOpeningSequence();
    }

    update(_time?: number, delta = this.game.loop.delta): void {
        this.danubia?.update(undefined, delta);
        this.dialogueController?.update();
        this.updateActiveHazards(delta);
        this.updateCombatFlow(delta);
        this.updateAnchorPrompt();
        this.updateChecklistToggle();
        this.gameHud?.setCompactPhoneVisible(!this.phoneChecklist?.isPhoneAnimatingOrVisible);
        this.gameHud?.refresh();
        this.phoneChecklist?.refresh();
        this.syncDanubiaMovementBlock();

        if (DEBUG_ROOM_GEOMETRY) {
            this.drawDebugGeometry();
        }
    }

    private createArenaProps(): void {
        // Decorative time-switch and side time-barriers were removed from the final arena.
        // They were visually noisy and did not contribute to the combat readability.
    }

    private createFamilyPrison(): void {
        const container = this.add.container(0, 0).setDepth(2);

        const glow = this.add.image(
            WORKSHOP_LAYOUT.familyBubble.x,
            WORKSHOP_LAYOUT.familyBubble.y,
            'effect-time-bubble',
        );
        glow.setScale(WORKSHOP_LAYOUT.familyBubble.bubbleScale * 1.16);
        glow.setTint(FAMILY_BUBBLE_EFFECT.glowTint);
        glow.setAlpha(FAMILY_BUBBLE_EFFECT.glowAlphaMin);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        const bubble = this.add.image(
            WORKSHOP_LAYOUT.familyBubble.x,
            WORKSHOP_LAYOUT.familyBubble.y,
            'effect-time-bubble',
        );
        bubble.setScale(WORKSHOP_LAYOUT.familyBubble.bubbleScale);
        bubble.setAlpha(0.88);

        const husband = this.add.image(
            WORKSHOP_LAYOUT.husband.x,
            WORKSHOP_LAYOUT.husband.y,
            'family-husband',
        );
        husband.setScale(WORKSHOP_LAYOUT.husband.scale);
        husband.setTint(0xd6ecff);
        husband.setAlpha(0.88);

        const daughter = this.add.image(
            WORKSHOP_LAYOUT.daughter.x,
            WORKSHOP_LAYOUT.daughter.y,
            'family-daughter',
        );
        daughter.setScale(WORKSHOP_LAYOUT.daughter.scale);
        daughter.setTint(0xd6ecff);
        daughter.setAlpha(0.88);

        const son = this.add.image(
            WORKSHOP_LAYOUT.son.x,
            WORKSHOP_LAYOUT.son.y,
            'family-son',
        );
        son.setScale(WORKSHOP_LAYOUT.son.scale);
        son.setTint(0xd6ecff);
        son.setAlpha(0.88);

        const crackOverlay = this.add.graphics();

        container.add([glow, bubble, husband, daughter, son, crackOverlay]);

        this.familyPrison = {
            container,
            glow,
            bubble,
            husband,
            daughter,
            son,
            crackOverlay,
            state: 'intact',
        };

        this.setFamilyPrisonState('intact');

        this.tweens.add({
            targets: [container],
            y: `-=${FAMILY_BUBBLE_EFFECT.floatDistancePx}`,
            duration: FAMILY_BUBBLE_EFFECT.floatDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.tweens.add({
            targets: bubble,
            scaleX: WORKSHOP_LAYOUT.familyBubble.bubbleScale * 1.03,
            scaleY: WORKSHOP_LAYOUT.familyBubble.bubbleScale * 1.03,
            alpha: { from: 0.82, to: 0.94 },
            duration: FAMILY_BUBBLE_EFFECT.pulseDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.tweens.add({
            targets: glow,
            scaleX: WORKSHOP_LAYOUT.familyBubble.bubbleScale * 1.22,
            scaleY: WORKSHOP_LAYOUT.familyBubble.bubbleScale * 1.22,
            alpha: {
                from: FAMILY_BUBBLE_EFFECT.glowAlphaMin,
                to: FAMILY_BUBBLE_EFFECT.glowAlphaMax,
            },
            duration: FAMILY_BUBBLE_EFFECT.pulseDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private setFamilyPrisonState(state: FamilyPrisonState): void {
        if (!this.familyPrison) {
            return;
        }

        this.familyPrison.state = state;
        this.familyPrison.crackOverlay.clear();

        if (state === 'broken') {
            this.familyPrison.bubble.setAlpha(0);
            this.familyPrison.glow.setAlpha(0);
            this.familyPrison.husband.clearTint();
            this.familyPrison.daughter.clearTint();
            this.familyPrison.son.clearTint();
            this.familyPrison.husband.setAlpha(1);
            this.familyPrison.daughter.setAlpha(1);
            this.familyPrison.son.setAlpha(1);
            return;
        }

        this.familyPrison.husband.setTint(0xd6ecff);
        this.familyPrison.daughter.setTint(0xd6ecff);
        this.familyPrison.son.setTint(0xd6ecff);
        this.familyPrison.husband.setAlpha(0.88);
        this.familyPrison.daughter.setAlpha(0.88);
        this.familyPrison.son.setAlpha(0.88);
        this.familyPrison.bubble.setAlpha(state === 'intact' ? 0.88 : state === 'cracked-light' ? 0.74 : 0.62);
        this.familyPrison.glow.setAlpha(state === 'intact' ? 0.24 : state === 'cracked-light' ? 0.3 : 0.36);

        if (state === 'intact') {
            return;
        }

        const centerX = WORKSHOP_LAYOUT.familyBubble.x;
        const centerY = WORKSHOP_LAYOUT.familyBubble.y;
        const graphics = this.familyPrison.crackOverlay;
        graphics.lineStyle(
            2,
            0xdbeafe,
            state === 'cracked-light' ? 0.32 : 0.56,
        );
        graphics.beginPath();
        graphics.moveTo(centerX - 18, centerY - 10);
        graphics.lineTo(centerX + 6, centerY + 12);
        graphics.lineTo(centerX + 22, centerY + 4);

        if (state === 'cracked-strong') {
            graphics.moveTo(centerX - 34, centerY + 2);
            graphics.lineTo(centerX - 8, centerY - 18);
            graphics.lineTo(centerX + 28, centerY - 12);
        }

        graphics.strokePath();
    }

    private createMonsieur(): void {
        const aura = this.add.image(
            WORKSHOP_LAYOUT.monsieur.x,
            WORKSHOP_LAYOUT.monsieur.y + 4,
            'effect-time-bubble',
        );
        aura.setScale(0.4, 0.22);
        aura.setTint(MONSIEUR_EFFECT.auraTint);
        aura.setAlpha(MONSIEUR_EFFECT.auraAlphaMin);
        aura.setBlendMode(Phaser.BlendModes.ADD);
        aura.setDepth(2.7);

        const sprite = this.add.image(
            WORKSHOP_LAYOUT.monsieur.x,
            WORKSHOP_LAYOUT.monsieur.y,
            'monsieur-idle',
        );
        sprite.setScale(WORKSHOP_LAYOUT.monsieur.scale);
        sprite.setDepth(3);

        this.monsieurRuntime = {
            sprite,
            aura,
            mode: 'channeling',
        };

        this.setMonsieurBossMode('channeling');
    }

    private setMonsieurBossMode(mode: 'idle' | 'channeling'): void {
        if (!this.monsieurRuntime) {
            return;
        }

        this.tweens.killTweensOf(this.monsieurRuntime.sprite);
        this.tweens.killTweensOf(this.monsieurRuntime.aura);
        this.monsieurRuntime.poseResetTimer?.remove(false);
        this.monsieurRuntime.poseResetTimer = undefined;
        this.monsieurRuntime.flickerTween?.stop();
        this.monsieurRuntime.flickerTween = undefined;
        this.monsieurRuntime.mode = mode;
        this.monsieurRuntime.sprite.clearTint();
        this.monsieurRuntime.sprite.setY(WORKSHOP_LAYOUT.monsieur.y);
        this.monsieurRuntime.sprite.setAngle(0);
        this.monsieurRuntime.sprite.setAlpha(1);
        this.monsieurRuntime.aura.setScale(0.4, 0.22);
        this.monsieurRuntime.sprite.setTexture(this.getMonsieurTextureKey('idle'));
        this.monsieurRuntime.sprite.setFlipX(true);

        if (mode === 'channeling') {
            this.monsieurRuntime.sprite.setTint(0xf5e7b8);
            this.tweens.add({
                targets: this.monsieurRuntime.sprite,
                y: WORKSHOP_LAYOUT.monsieur.y - 5,
                duration: 1800,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1,
            });
            this.tweens.add({
                targets: this.monsieurRuntime.aura,
                alpha: {
                    from: MONSIEUR_EFFECT.auraAlphaMin,
                    to: MONSIEUR_EFFECT.auraAlphaMax,
                },
                scaleX: 0.48,
                scaleY: 0.28,
                duration: MONSIEUR_EFFECT.pulseDurationMs,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1,
            });
            return;
        }

        this.monsieurRuntime.aura.setAlpha(MONSIEUR_EFFECT.auraAlphaMin);
    }

    private getMonsieurTextureKey(kind: 'idle' | 'gesture' | 'watch'): string {
        const candidates =
            kind === 'gesture'
                ? ['monsieur-gesture-01', 'monsieur-gesture-02', 'monsieur-idle']
                : kind === 'watch'
                    ? ['monsieur-watch-01', 'monsieur-watch-02', 'monsieur-idle']
                    : ['monsieur-idle'];

        return candidates.find((key) => this.textures.exists(key)) ?? 'monsieur-idle';
    }

    private getDanubiaPowerTextureKey(): string {
        if (this.textures.exists('danubia-power-02')) {
            return 'danubia-power-02';
        }

        if (this.textures.exists('danubia-power-01')) {
            return 'danubia-power-01';
        }

        return DANUBIA_ASSET_KEYS.jump;
    }

    private getMonsieurDefeatedTextureKey(): string {
        const candidates = [
            'monsieur-defeated',
            'monsieur-watch-02',
            'monsieur-gesture-02',
            'monsieur-idle',
        ];

        return candidates.find((key) => this.textures.exists(key)) ?? 'monsieur-idle';
    }

    private playMonsieurAttackPose(kind: 'gesture' | 'watch', durationMs = 360): void {
        if (!this.monsieurRuntime) {
            return;
        }

        this.monsieurRuntime.poseResetTimer?.remove(false);
        this.monsieurRuntime.sprite.setTexture(this.getMonsieurTextureKey(kind));
        this.monsieurRuntime.sprite.setFlipX(true);
        this.monsieurRuntime.poseResetTimer = this.time.delayedCall(durationMs, () => {
            if (!this.monsieurRuntime) {
                return;
            }

            this.monsieurRuntime.sprite.setTexture(this.getMonsieurTextureKey('idle'));
            this.monsieurRuntime.sprite.setFlipX(true);
            this.monsieurRuntime.poseResetTimer = undefined;
        });
    }

    private startMonsieurDefeatedFlicker(): void {
        if (!this.monsieurRuntime) {
            return;
        }

        this.monsieurRuntime.flickerTween?.stop();
        this.monsieurRuntime.sprite.setTexture(this.getMonsieurDefeatedTextureKey());
        this.monsieurRuntime.sprite.setAlpha(1);
        this.monsieurRuntime.aura.setAlpha(0.04);
        this.monsieurRuntime.flickerTween = this.tweens.add({
            targets: this.monsieurRuntime.sprite,
            alpha: { from: 1, to: 0.2 },
            duration: 120,
            yoyo: true,
            repeat: 6,
        });
    }

    private createTemporalAnchors(): void {
        COMBAT_LAYOUT.anchorPositions.forEach((position, index) => {
            const baseGlow = this.add.image(position.x, position.y + 8, 'effect-time-bubble');
            baseGlow.setScale(0.2, 0.1);
            baseGlow.setTint(0x60a5fa);
            baseGlow.setAlpha(0.08);
            baseGlow.setBlendMode(Phaser.BlendModes.ADD);
            baseGlow.setDepth(1.15);

            const pedestal = this.add.image(position.x, position.y + 10, 'effect-time-switch');
            pedestal.setScale(0.5);
            pedestal.setAlpha(0.72);
            pedestal.setDepth(1.2);

            const anchor = this.add.image(position.x, position.y - 22, 'effect-time-anchor');
            anchor.setScale(0.74);
            anchor.setDepth(1.35);

            const container = this.add.container(0, 0, [baseGlow, pedestal, anchor]).setDepth(1.3);
            const runtime: TemporalAnchorRuntime = {
                id: `workshop-anchor-${index + 1}`,
                index,
                state: 'idle',
                syncProgress: 0,
                container,
                baseGlow,
                anchor,
                pedestal,
                interactionZone: {
                    x: position.x - 52,
                    y: position.y - 48,
                    width: 104,
                    height: 92,
                },
            };

            this.temporalAnchors.push(runtime);
            this.setAnchorState(runtime, 'idle');
        });

        this.setActiveAnchorByIndex(0);
    }

    private setAnchorState(anchor: TemporalAnchorRuntime, state: AnchorState): void {
        anchor.state = state;
        anchor.pulseTween?.stop();
        anchor.pulseTween = undefined;
        anchor.glowTween?.stop();
        anchor.glowTween = undefined;
        anchor.anchor.clearTint();
        anchor.baseGlow.clearTint();

        switch (state) {
            case 'active':
                anchor.anchor.setAlpha(1);
                anchor.baseGlow.setAlpha(0.18);
                anchor.anchor.setTint(0xf4d35e);
                anchor.baseGlow.setTint(0xf4d35e);
                anchor.glowTween = this.tweens.add({
                    targets: anchor.baseGlow,
                    alpha: { from: 0.18, to: 0.32 },
                    scaleX: 0.24,
                    scaleY: 0.12,
                    duration: 820,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });
                anchor.pulseTween = this.tweens.add({
                    targets: anchor.anchor,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    duration: 760,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });
                break;
            case 'syncing':
                anchor.anchor.setAlpha(1);
                anchor.baseGlow.setAlpha(0.28);
                anchor.anchor.setTint(0xffffff);
                anchor.baseGlow.setTint(0xf4d35e);
                anchor.pulseTween = this.tweens.add({
                    targets: anchor.anchor,
                    angle: { from: -5, to: 5 },
                    scaleX: 0.84,
                    scaleY: 0.84,
                    duration: 120,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1,
                });
                break;
            case 'disabled':
                anchor.anchor.setAlpha(0.4);
                anchor.baseGlow.setAlpha(0.04);
                anchor.anchor.setTint(0x7c8aa8);
                anchor.baseGlow.setTint(0x7c8aa8);
                break;
            case 'idle':
            default:
                anchor.anchor.setAlpha(0.74);
                anchor.baseGlow.setAlpha(0.08);
                anchor.anchor.setTint(0xb9d3ff);
                anchor.baseGlow.setTint(0x60a5fa);
                break;
        }
    }

    private setActiveAnchorByIndex(index: number): void {
        this.activeAnchorIndex = Phaser.Math.Clamp(index, 0, this.temporalAnchors.length - 1);

        this.temporalAnchors.forEach((anchor, anchorIndex) => {
            if (anchor.state === 'disabled') {
                return;
            }

            this.setAnchorState(anchor, anchorIndex === this.activeAnchorIndex ? 'active' : 'idle');
        });
    }

    private initializeCombatCheckpoint(): void {
        this.currentCheckpoint = {
            phase: 1,
            activeAnchorIndex: 0,
            prisonState: 'intact',
        };
        this.battlePhase = 1;
        this.activeAnchorIndex = 0;
    }

    public updateCombatCheckpoint(phase: CombatPhase, activeAnchorIndex: number): void {
        this.currentCheckpoint = {
            phase,
            activeAnchorIndex,
            prisonState: COMBAT_PHASE_CONFIG[phase].checkpointPrisonState,
        };
    }

    public restoreCombatCheckpoint(): void {
        this.battlePhase = this.currentCheckpoint.phase;
        this.activeAnchorIndex = this.currentCheckpoint.activeAnchorIndex;
        this.setFamilyPrisonState(this.currentCheckpoint.prisonState);
        this.temporalAnchors.forEach((anchor, anchorIndex) => {
            anchor.syncProgress = 0;

            if (anchorIndex < this.currentCheckpoint.activeAnchorIndex) {
                this.setAnchorState(anchor, 'disabled');
                return;
            }

            this.setAnchorState(
                anchor,
                anchorIndex === this.currentCheckpoint.activeAnchorIndex ? 'active' : 'idle',
            );
        });

        const respawnPosition = COMBAT_LAYOUT.phaseRespawnPositions[this.currentCheckpoint.phase - 1];
        this.danubia?.setWalkPlaneSpawn(respawnPosition, 'right');
        this.danubia?.setCharacterAlpha(1);
        this.clearActiveHazards();
        this.clearHazardTimers();
        this.hideAnchorSyncUi();
        this.isPlayerRecoveringFromHit = false;
        this.isAnchorInteractionActive = false;
    }

    private startOpeningSequence(): void {
        if (!this.danubia) {
            return;
        }

        this.isOpeningSequenceActive = true;
        this.danubia.setCutsceneControlled(true);
        this.syncDanubiaMovementBlock();
        this.danubia.playWalkCutscene('right', { stableFrame: true });

        const start = this.danubia.getLogicalPosition();
        const end = WORKSHOP_LAYOUT.danubiaStop;
        const proxy = { ...start };
        const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
        const durationMs = Math.max(
            220,
            (distance / OPENING_SEQUENCE.walkInSpeedPxPerSecond) * 1000,
        );

        this.tweens.add({
            targets: proxy,
            x: end.x,
            y: end.y,
            duration: durationMs,
            ease: 'Sine.Out',
            onUpdate: () => {
                this.danubia?.setCutscenePosition(proxy);
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(end);
                this.danubia?.playIdleCutscene('right');
                this.time.delayedCall(OPENING_SEQUENCE.familyFocusDelayMs, () => {
                    this.time.delayedCall(80, () => {
                        this.startSceneBubbleSequence();
                    });
                });
            },
        });
    }

    private startSceneBubbleSequence(): void {
        this.isOpeningSequenceActive = false;
        this.danubia?.setCutsceneControlled(false);
        this.isSceneBubbleSequenceActive = true;
        this.syncDanubiaMovementBlock();
        this.playSceneBubbleLine(0);
    }

    private playSceneBubbleLine(index: number): void {
        if (index >= workshopOpeningSceneBubbles.length) {
            this.isSceneBubbleSequenceActive = false;
            this.startMainDialogue();
            return;
        }

        const line = workshopOpeningSceneBubbles[index];

        if (
            !line
            || typeof line.text !== 'string'
            || typeof line.speakerId !== 'string'
        ) {
            this.time.delayedCall(OPENING_SEQUENCE.sceneBubbleGapMs, () => {
                this.playSceneBubbleLine(index + 1);
            });
            return;
        }

        const anchor = this.getSpeakerAnchor(line.speakerId);

        this.showSceneBubble(anchor, line.text, () => {
            this.time.delayedCall(OPENING_SEQUENCE.sceneBubbleGapMs, () => {
                this.playSceneBubbleLine(index + 1);
            });
        });
    }

    private startMainDialogue(): void {
        this.destroyCurrentSceneBubble();
        this.isOpeningSequenceActive = false;
        this.isSceneBubbleSequenceActive = false;
        this.danubia?.setCutsceneControlled(false);
        this.syncDanubiaMovementBlock();

        const started = this.dialogueController?.start(workshopMainDialogue, {
            onComplete: () => {
                this.prepareCombatPhase();
            },
        }) ?? false;

        if (!started) {
            this.prepareCombatPhase();
        }
    }

    private prepareCombatPhase(): void {
        this.releaseOpeningControl();
        this.danubia?.playIdleCutscene('right');
        this.isCombatPrepared = true;
        this.isCombatActive = false;
        this.isPhaseTransitionActive = true;
        this.isCombatEndingActive = false;
        this.isFamilyPrisoned = true;
        this.restoreCombatCheckpoint();
        this.setFamilyPrisonState(this.isFamilyPrisoned ? 'intact' : 'broken');
        this.setMonsieurBossMode('channeling');
        this.updateCombatCheckpoint(1, 0);
        this.fragmentNotification?.show(COMBAT_PREP_NOTIFICATION.message, {
            visibleDurationMs: COMBAT_PREP_NOTIFICATION.visibleDurationMs,
        });
        this.time.delayedCall(850, () => {
            this.startCombatPhase(1);
        });
    }

    private releaseOpeningControl(): void {
        this.isOpeningSequenceActive = false;
        this.isSceneBubbleSequenceActive = false;
        this.isCombatSetupPending = false;
        this.danubia?.setCutsceneControlled(false);
        this.syncDanubiaMovementBlock();
    }

    private startCombatPhase(phase: CombatPhase): void {
        this.battlePhase = phase;
        this.activeAnchorIndex = phase - 1;
        this.isCombatPrepared = true;
        this.isCombatActive = true;
        this.isFamilyPrisoned = true;
        this.isPhaseTransitionActive = false;
        this.isCombatEndingActive = false;
        this.isPlayerRecoveringFromHit = false;
        this.isAnchorInteractionActive = false;
        this.hideAnchorSyncUi();
        this.clearActiveHazards();
        this.clearHazardTimers();

        this.temporalAnchors.forEach((anchor, index) => {
            if (index < phase - 1) {
                anchor.syncProgress = 100;
                this.setAnchorState(anchor, 'disabled');
                return;
            }

            if (index > phase - 1) {
                anchor.syncProgress = 0;
            }

            this.setAnchorState(anchor, index === phase - 1 ? 'active' : 'idle');
        });

        this.setMonsieurBossMode('idle');
        this.updateAnchorSyncStatusUi();
        this.syncDanubiaMovementBlock();
        this.fragmentNotification?.show(COMBAT_PHASE_CONFIG[phase].introMessage, {
            visibleDurationMs: 1650,
        });
        this.schedulePhaseHazards(phase);
    }

    private schedulePhaseHazards(phase: CombatPhase): void {
        const config = COMBAT_PHASE_CONFIG[phase];
        let pulseFromLeft = phase !== 2;
        let gearFromLeft = phase === 2;

        this.activeHazardTimers.push(this.time.addEvent({
            delay: config.pulseIntervalMs,
            loop: true,
            callback: () => {
                this.playMonsieurAttackPose(phase === 1 ? 'watch' : 'gesture', phase === 1 ? 320 : 360);
                this.spawnTemporalPulse(
                    pulseFromLeft ? -48 : GAME_WIDTH + 48,
                    pulseFromLeft ? 'right' : 'left',
                );
                pulseFromLeft = !pulseFromLeft;
            },
        }));

        if (config.gearIntervalMs > 0) {
            this.activeHazardTimers.push(this.time.addEvent({
                delay: config.gearIntervalMs,
                loop: true,
                callback: () => {
                    this.playMonsieurAttackPose('gesture', 420);
                    this.spawnRollingGear(
                        gearFromLeft ? -84 : GAME_WIDTH + 84,
                        gearFromLeft ? 'right' : 'left',
                    );
                    gearFromLeft = !gearFromLeft;
                },
            }));
        }

        this.time.delayedCall(420, () => {
            if (this.isCombatActive && this.battlePhase === phase) {
                this.playMonsieurAttackPose(phase === 1 ? 'watch' : 'gesture', phase === 1 ? 320 : 360);
                this.spawnTemporalPulse(pulseFromLeft ? -48 : GAME_WIDTH + 48, pulseFromLeft ? 'right' : 'left');
                pulseFromLeft = !pulseFromLeft;
            }
        });
    }

    private clearHazardTimers(): void {
        for (const timer of this.activeHazardTimers) {
            timer.remove(false);
        }

        this.activeHazardTimers = [];
    }

    private updateAnchorPrompt(): void {
        if (!this.interactionPrompt || !this.danubia) {
            return;
        }

        const shouldBlockPrompt =
            this.isOpeningSequenceActive
            || this.isSceneBubbleSequenceActive
            || this.isCombatSetupPending
            || this.isPlayerRecoveringFromHit
            || this.isPhaseTransitionActive
            || this.isCombatEndingActive
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true;

        if (
            shouldBlockPrompt
            || !(this.isCombatPrepared || this.isCombatActive)
            || !this.isFamilyPrisoned
            || this.temporalAnchors.length === 0
        ) {
            this.interactionPrompt.hide();
            this.isAnchorInteractionActive = false;
            return;
        }

        const activeAnchor = this.temporalAnchors[this.activeAnchorIndex];
        const foot = this.danubia.getFootBounds();
        const isNearAnchor =
            (activeAnchor?.state === 'active' || activeAnchor?.state === 'syncing')
            && this.rectsIntersect(foot, activeAnchor.interactionZone);

        this.isAnchorInteractionActive = Boolean(isNearAnchor);

        if (isNearAnchor && activeAnchor?.state === 'active') {
            this.interactionPrompt.show(ANCHOR_PROMPT_TEXT);
            return;
        }

        this.interactionPrompt.hide();
    }

    private showSceneBubble(
        anchor: { x: number; y: number },
        text: string,
        onComplete: () => void,
    ): void {
        this.destroyCurrentSceneBubble();

        const config = WORKSHOP_SCENE_BUBBLE_CONFIG;
        const measurementText = this.add.text(0, 0, text, {
            fontFamily: UI_FONT_FAMILY,
            fontSize: config.textFontSize,
            color: config.textColor,
            align: 'center',
            wordWrap: {
                width: config.maxWidth - config.paddingX * 2,
                useAdvancedWrap: true,
            },
            lineSpacing: 3,
        }).setOrigin(0.5);
        measurementText.setVisible(false);

        const bubbleWidth = Math.min(
            config.maxWidth,
            Math.max(config.minWidth, measurementText.width + config.paddingX * 2),
        );
        const bubbleHeight = Math.max(
            config.minHeight,
            measurementText.height + config.paddingY * 2,
        );
        const halfWidth = bubbleWidth * 0.5;
        const containerX = Phaser.Math.Clamp(
            anchor.x,
            halfWidth + config.clampPadding,
            GAME_WIDTH - halfWidth - config.clampPadding,
        );
        const containerY = Phaser.Math.Clamp(
            anchor.y - config.offsetY,
            74,
            GAME_HEIGHT - 120,
        );
        measurementText.destroy();

        const container = this.add.container(containerX, containerY);
        container.setDepth(50);
        container.setScrollFactor(0);

        const background = this.add.graphics();
        const textObject = this.add.text(0, config.textVerticalOffset, text, {
            fontFamily: UI_FONT_FAMILY,
            fontSize: config.textFontSize,
            color: config.textColor,
            align: 'center',
            wordWrap: {
                width: config.maxWidth - config.paddingX * 2,
                useAdvancedWrap: true,
            },
            lineSpacing: 3,
        }).setOrigin(0.5);

        const left = -bubbleWidth / 2;
        const top = -bubbleHeight / 2;
        const tailHalfWidth = config.tailWidth / 2;
        const tailStartY = bubbleHeight / 2 - 2;

        background.fillStyle(config.backgroundColor, config.backgroundAlpha);
        background.lineStyle(config.borderWidth, config.borderColor, config.borderAlpha);
        background.fillRoundedRect(left, top, bubbleWidth, bubbleHeight, config.radius);
        background.strokeRoundedRect(left, top, bubbleWidth, bubbleHeight, config.radius);
        background.fillTriangle(
            -tailHalfWidth,
            tailStartY,
            tailHalfWidth,
            tailStartY,
            0,
            tailStartY + config.tailHeight,
        );
        background.strokeTriangle(
            -tailHalfWidth,
            tailStartY,
            tailHalfWidth,
            tailStartY,
            0,
            tailStartY + config.tailHeight,
        );

        container.add([background, textObject]);
        container.setAlpha(0);
        this.currentSceneBubble = { container };

        const visibleDurationMs = Phaser.Math.Clamp(1100 + text.length * 28, 1450, 2400);
        let completed = false;

        const completeSafely = () => {
            if (completed) {
                return;
            }

            completed = true;
            this.destroyCurrentSceneBubble();
            onComplete();
        };

        const failsafeTimer = this.time.delayedCall(visibleDurationMs + 1000, () => {
            completeSafely();
        });

        this.tweens.add({
            targets: container,
            alpha: 1,
            y: container.y - 4,
            duration: 170,
            ease: 'Sine.Out',
            onComplete: () => {
                this.time.delayedCall(visibleDurationMs, () => {
                    this.tweens.add({
                        targets: container,
                        alpha: 0,
                        y: container.y - 4,
                        duration: 190,
                        ease: 'Sine.In',
                        onComplete: () => {
                            failsafeTimer.remove(false);
                            completeSafely();
                        },
                    });
                });
            },
        });
    }

    private destroyCurrentSceneBubble(): void {
        const currentBubble = this.currentSceneBubble;

        if (!currentBubble) {
            return;
        }

        this.currentSceneBubble = undefined;

        if (currentBubble.container.scene) {
            currentBubble.container.destroy();
        }
    }

    private getSpeakerAnchor(speakerId: WorkshopSpeakerId): { x: number; y: number } {
        switch (speakerId) {
            case 'daughter':
                return { x: WORKSHOP_LAYOUT.daughter.x, y: WORKSHOP_LAYOUT.daughter.y };
            case 'son':
                return { x: WORKSHOP_LAYOUT.son.x, y: WORKSHOP_LAYOUT.son.y };
            case 'husband':
                return { x: WORKSHOP_LAYOUT.husband.x, y: WORKSHOP_LAYOUT.husband.y };
            case 'monsieur':
                return { x: WORKSHOP_LAYOUT.monsieur.x, y: WORKSHOP_LAYOUT.monsieur.y - 10 };
            case 'danubia':
            default:
                return this.danubia?.getLogicalPosition() ?? WORKSHOP_LAYOUT.danubiaStop;
        }
    }

    private updateChecklistToggle(): void {
        if (
            !this.danubia
            || !this.phoneChecklist
            || !this.togglePhoneKey
            || !hasUnlockedPhoneHud()
            || this.isOpeningSequenceActive
            || this.isSceneBubbleSequenceActive
            || this.isCombatSetupPending
            || this.isAnchorInteractionActive
            || this.isPlayerRecoveringFromHit
            || this.isCombatActive
            || this.isPhaseTransitionActive
            || this.isCombatEndingActive
            || this.dialogueController?.isActive === true
        ) {
            return;
        }

        if (!Phaser.Input.Keyboard.JustDown(this.togglePhoneKey)) {
            return;
        }

        this.phoneChecklist.toggle();
        this.syncDanubiaMovementBlock();
    }

    private syncDanubiaMovementBlock(): void {
        const shouldBlockMovement =
            this.isOpeningSequenceActive
            || this.isSceneBubbleSequenceActive
            || this.isCombatSetupPending
            || this.isPhaseTransitionActive
            || this.isCombatEndingActive
            || this.isPlayerRecoveringFromHit
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true;

        this.danubia?.setMovementBlocked(shouldBlockMovement);
    }

    private updateCombatFlow(deltaMs: number): void {
        this.updateAnchorSyncStatusUi();
        this.updatePlayerHazardCollision();

        if (
            !this.isCombatPrepared
            || !this.isCombatActive
            || this.isPhaseTransitionActive
            || this.isCombatEndingActive
            || this.isPlayerRecoveringFromHit
            || this.dialogueController?.isActive === true
            || this.phoneChecklist?.blocksMovement === true
        ) {
            this.interruptAnchorSync(false);
            return;
        }

        const activeAnchor = this.temporalAnchors[this.activeAnchorIndex];
        const foot = this.danubia?.getFootBounds();

        if (!activeAnchor || !foot || activeAnchor.state === 'disabled') {
            this.interruptAnchorSync(false);
            return;
        }

        const isNearAnchor = this.rectsIntersect(foot, activeAnchor.interactionZone);

        if (!isNearAnchor) {
            this.interruptAnchorSync(false);
            return;
        }

        if (!this.isInteractHeld()) {
            if (activeAnchor.state === 'syncing') {
                this.setAnchorState(activeAnchor, 'active');
            }
            return;
        }

        this.isAnchorInteractionActive = true;

        if (activeAnchor.state !== 'syncing') {
            this.setAnchorState(activeAnchor, 'syncing');
        }

        activeAnchor.syncProgress = Math.min(
            100,
            activeAnchor.syncProgress + ANCHOR_SYNC_CONFIG.progressPerSecond * (deltaMs / 1000),
        );
        this.updateAnchorSyncStatusUi();

        if (activeAnchor.syncProgress >= 100) {
            this.completeActiveAnchor(activeAnchor);
        }
    }

    private updatePlayerHazardCollision(): void {
        if (
            !this.danubia
            || !this.isCombatActive
            || this.isPhaseTransitionActive
            || this.isCombatEndingActive
            || this.isPlayerRecoveringFromHit
        ) {
            return;
        }

        const foot = this.danubia.getFootBounds();
        const hitHazard = this.activeHazards.find((hazard) =>
            hazard.active && this.rectsIntersect(foot, hazard.hitbox),
        );

        if (hitHazard) {
            this.handlePlayerHit();
        }
    }

    private handlePlayerHit(): void {
        if (!this.danubia || this.isPlayerRecoveringFromHit) {
            return;
        }

        this.isPlayerRecoveringFromHit = true;
        this.interruptAnchorSync(false);
        this.clearHazardTimers();
        this.clearActiveHazards();
        this.cameras.main.shake(210, 0.0045);
        this.fragmentNotification?.show(PHASE_RESTART_NOTIFICATION, {
            visibleDurationMs: 900,
        });
        const respawnPosition = COMBAT_LAYOUT.phaseRespawnPositions[this.battlePhase - 1];
        this.danubia.setWalkPlaneSpawn(respawnPosition, 'right');
        this.syncDanubiaMovementBlock();

        this.tweens.add({
            targets: this.danubia,
            alpha: { from: 1, to: 0.32 },
            duration: 90,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
                this.danubia?.setCharacterAlpha(1);
            },
        });

        this.time.delayedCall(720, () => {
            this.isPlayerRecoveringFromHit = false;
            this.syncDanubiaMovementBlock();
            this.schedulePhaseHazards(this.battlePhase);
        });
    }

    private completeActiveAnchor(anchor: TemporalAnchorRuntime): void {
        if (this.isPhaseTransitionActive || this.isCombatEndingActive) {
            return;
        }

        this.isCombatActive = false;
        this.isPhaseTransitionActive = true;
        this.interruptAnchorSync(true);
        this.clearHazardTimers();
        this.clearActiveHazards();
        anchor.syncProgress = 100;
        this.setAnchorState(anchor, 'disabled');
        this.cameras.main.shake(220, 0.0036);
        this.setMonsieurBossMode('idle');

        const phaseConfig = COMBAT_PHASE_CONFIG[this.battlePhase];
        this.setFamilyPrisonState(phaseConfig.completedPrisonState);
        this.updateAnchorSyncStatusUi();

        if (this.battlePhase === 3) {
            this.startWorkshopEndingSequence();
            return;
        }

        const nextPhase = (this.battlePhase + 1) as CombatPhase;
        this.updateCombatCheckpoint(nextPhase, nextPhase - 1);
        this.showSceneBubble(
            this.getSpeakerAnchor(phaseConfig.feedbackSpeakerId),
            phaseConfig.feedbackText,
            () => {
                this.time.delayedCall(760, () => {
                    this.startCombatPhase(nextPhase);
                });
            },
        );
    }

    private startWorkshopEndingSequence(): void {
        if (!this.danubia) {
            return;
        }

        this.isCombatPrepared = false;
        this.isCombatActive = false;
        this.isCombatEndingActive = true;
        this.isPhaseTransitionActive = true;
        this.hideAnchorSyncUi();
        this.clearHazardTimers();
        this.clearActiveHazards();
        this.interactionPrompt?.hide();
        this.phoneChecklist?.close();
        this.danubia.setCutsceneControlled(true);
        this.danubia.playWalkCutscene('left');
        this.syncDanubiaMovementBlock();

        this.moveDanubiaTo(
            { x: WORKSHOP_ENDING_SEQUENCE.danubiaCastX, y: this.danubia.getLogicalPosition().y },
            'left',
            () => {
                this.danubia?.playIdleCutscene('right');
                this.time.delayedCall(320, () => {
                    this.launchDanubiaFinalPower();
                });
            },
        );
    }

    private moveDanubiaTo(
        target: { x: number; y: number },
        facing: 'left' | 'right',
        onComplete: () => void,
    ): void {
        if (!this.danubia) {
            return;
        }

        this.danubia.playWalkCutscene(facing);
        const start = this.danubia.getLogicalPosition();
        const proxy = { ...start };
        const distance = Phaser.Math.Distance.Between(start.x, start.y, target.x, target.y);
        const durationMs = Math.max(
            220,
            (distance / WORKSHOP_ENDING_SEQUENCE.walkSpeedPxPerSecond) * 1000,
        );

        this.tweens.add({
            targets: proxy,
            x: target.x,
            y: target.y,
            duration: durationMs,
            ease: 'Sine.Out',
            onUpdate: () => {
                this.danubia?.setCutscenePosition(proxy);
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(target);
                this.danubia?.playIdleCutscene(facing);
                onComplete();
            },
        });
    }

    private launchDanubiaFinalPower(): void {
        if (!this.danubia || !this.monsieurRuntime) {
            return;
        }

        this.danubia.setFacing('right');
        this.danubia.anims.stop();
        this.danubia.setTexture(this.getDanubiaPowerTextureKey());

        const start = this.danubia.getLogicalPosition();
        const castX = start.x + 34;
        const castY = start.y - 50;
        const targetX = this.monsieurRuntime.sprite.x - 18;
        const targetY = this.monsieurRuntime.sprite.y - 38;

        const chargeCore = this.add.circle(castX, castY, 12, 0xf4d35e, 0.86);
        chargeCore.setDepth(4.25);
        chargeCore.setBlendMode(Phaser.BlendModes.ADD);
        const chargeGlow = this.add.circle(castX, castY, 34, 0x8b5cf6, 0.22);
        chargeGlow.setDepth(4.2);
        chargeGlow.setBlendMode(Phaser.BlendModes.ADD);
        const chargeRing = this.add.circle(castX, castY, 22);
        chargeRing.setStrokeStyle(4, 0xf8fafc, 0.58);
        chargeRing.setDepth(4.26);
        chargeRing.setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
            targets: chargeGlow,
            scaleX: 1.28,
            scaleY: 1.28,
            alpha: { from: 0.16, to: 0.42 },
            duration: 260,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: Math.max(1, Math.floor(WORKSHOP_ENDING_SEQUENCE.powerChargeDurationMs / 520)),
        });
        this.tweens.add({
            targets: chargeRing,
            scaleX: 1.55,
            scaleY: 1.55,
            alpha: 0,
            duration: WORKSHOP_ENDING_SEQUENCE.powerChargeDurationMs,
            ease: 'Cubic.Out',
        });

        this.time.delayedCall(WORKSHOP_ENDING_SEQUENCE.powerChargeDurationMs, () => {
            chargeCore.destroy();
            chargeGlow.destroy();
            chargeRing.destroy();

            const projectile = this.add.circle(castX, castY, 13, 0xf4d35e, 0.94);
            projectile.setDepth(4.32);
            projectile.setBlendMode(Phaser.BlendModes.ADD);
            const glow = this.add.circle(castX, castY, 32, 0x8b5cf6, 0.34);
            glow.setDepth(4.3);
            glow.setBlendMode(Phaser.BlendModes.ADD);
            const travelRing = this.add.circle(castX, castY, 20);
            travelRing.setStrokeStyle(3, 0xf8fafc, 0.55);
            travelRing.setDepth(4.33);
            travelRing.setBlendMode(Phaser.BlendModes.ADD);

            this.tweens.add({
                targets: [projectile, glow, travelRing],
                x: targetX,
                y: targetY,
                duration: WORKSHOP_ENDING_SEQUENCE.projectileDurationMs,
                ease: 'Sine.InOut',
                onComplete: () => {
                    projectile.destroy();
                    glow.destroy();
                    travelRing.destroy();
                    this.resolveFinalPowerImpact();
                },
            });
        });
    }

    private resolveFinalPowerImpact(): void {
        if (!this.monsieurRuntime || !this.danubia) {
            return;
        }

        const impact = this.add.circle(
            this.monsieurRuntime.sprite.x,
            this.monsieurRuntime.sprite.y - 36,
            18,
            0xf8fafc,
            0.94,
        );
        impact.setDepth(4.3);
        impact.setBlendMode(Phaser.BlendModes.ADD);

        for (let index = 0; index < 14; index += 1) {
            const particle = this.add.circle(
                this.monsieurRuntime.sprite.x,
                this.monsieurRuntime.sprite.y - 36,
                Phaser.Math.FloatBetween(3, 5),
                index % 2 === 0 ? 0x8b5cf6 : 0xf4d35e,
                0.92,
            );
            particle.setDepth(4.25);
            particle.setBlendMode(Phaser.BlendModes.ADD);
            const angle = Phaser.Math.DegToRad((360 / 14) * index);
            this.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * Phaser.Math.Between(32, 58),
                y: particle.y + Math.sin(angle) * Phaser.Math.Between(32, 58),
                alpha: 0,
                duration: 620,
                ease: 'Quad.Out',
                onComplete: () => {
                    particle.destroy();
                },
            });
        }

        this.tweens.add({
            targets: impact,
            scaleX: 3.1,
            scaleY: 3.1,
            alpha: 0,
            duration: 520,
            ease: 'Quad.Out',
            onComplete: () => {
                impact.destroy();
            },
        });

        this.cameras.main.shake(260, 0.0052);
        this.startMonsieurDefeatedFlicker();
        this.time.delayedCall(WORKSHOP_ENDING_SEQUENCE.monsieurFlickerDurationMs, () => {
            this.danubia?.playIdleCutscene('right');
            this.startWorkshopEndingDialogue();
        });
    }

    private startWorkshopEndingDialogue(): void {
        const started = this.dialogueController?.start(workshopEndingDialogue, {
            onComplete: () => {
                this.fadeOutMonsieurAfterLesson();
            },
        }) ?? false;

        if (!started) {
            this.fadeOutMonsieurAfterLesson();
        }
    }

    private fadeOutMonsieurAfterLesson(): void {
        if (!this.monsieurRuntime) {
            this.beginFinalBubbleCollapse();
            return;
        }

        this.monsieurRuntime.flickerTween?.stop();
        this.monsieurRuntime.flickerTween = undefined;
        this.monsieurRuntime.poseResetTimer?.remove(false);
        this.monsieurRuntime.poseResetTimer = undefined;

        this.tweens.add({
            targets: [this.monsieurRuntime.sprite, this.monsieurRuntime.aura],
            alpha: 0,
            duration: 540,
            ease: 'Sine.Out',
            onComplete: () => {
                this.monsieurRuntime?.sprite.setVisible(false);
                this.monsieurRuntime?.aura.setVisible(false);
                this.beginFinalBubbleCollapse();
            },
        });
    }

    private beginFinalBubbleCollapse(): void {
        this.isFamilyPrisoned = false;
        this.hideAnchorSyncUi();
        this.interactionPrompt?.hide();
        this.syncDanubiaMovementBlock();

        if (this.familyPrison) {
            this.tweens.killTweensOf(this.familyPrison.container);
            this.familyPrison.container.setY(0);
        }

        this.time.delayedCall(420, () => {
            this.cameras.main.shake(320, 0.006);
            this.fragmentNotification?.show(COMBAT_COMPLETE_NOTIFICATION, {
                visibleDurationMs: 2200,
            });
            this.setFamilyPrisonState('broken');
            this.tweens.add({
                targets: this.familyPrison?.container,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 180,
                yoyo: true,
                ease: 'Sine.InOut',
            });
            this.dropFreedFamilyToGround();
        });
    }

    private dropFreedFamilyToGround(): void {
        if (!this.familyPrison) {
            this.transitionDanubiaToFamily();
            return;
        }

        this.familyPrison.container.setY(0);
        this.familyPrison.daughter.setFlipX(true);
        this.familyPrison.husband.setFlipX(true);
        this.familyPrison.son.setFlipX(true);
        this.familyPrison.daughter.setDepth(2.6);
        this.familyPrison.husband.setDepth(2.65);
        this.familyPrison.son.setDepth(2.6);

        const landings: Array<{
            target: Phaser.GameObjects.Image;
            x: number;
            y: number;
            scale: number;
        }> = [
            {
                target: this.familyPrison.daughter,
                x: COMBAT_LAYOUT.familyGroundPositions.daughter.x,
                y: COMBAT_LAYOUT.familyGroundPositions.daughter.y,
                scale: FAMILY_FREED_SCALE.daughter,
            },
            {
                target: this.familyPrison.husband,
                x: COMBAT_LAYOUT.familyGroundPositions.husband.x,
                y: COMBAT_LAYOUT.familyGroundPositions.husband.y,
                scale: FAMILY_FREED_SCALE.husband,
            },
            {
                target: this.familyPrison.son,
                x: COMBAT_LAYOUT.familyGroundPositions.son.x,
                y: COMBAT_LAYOUT.familyGroundPositions.son.y,
                scale: FAMILY_FREED_SCALE.son,
            },
        ];

        let completed = 0;
        for (const landing of landings) {
            this.tweens.add({
                targets: landing.target,
                x: landing.x,
                y: landing.y,
                scaleX: landing.scale,
                scaleY: landing.scale,
                duration: WORKSHOP_ENDING_SEQUENCE.familyDropDurationMs,
                ease: 'Cubic.In',
                onComplete: () => {
                    this.tweens.add({
                        targets: landing.target,
                        y: landing.y - 8,
                        duration: WORKSHOP_ENDING_SEQUENCE.familyBounceDurationMs,
                        yoyo: true,
                        ease: 'Quad.Out',
                        onComplete: () => {
                            completed += 1;
                            if (completed === landings.length) {
                                this.transitionDanubiaToFamily();
                            }
                        },
                    });
                },
            });
        }
    }

    private transitionDanubiaToFamily(): void {
        if (!this.danubia) {
            this.finishWorkshopScene();
            return;
        }

        this.moveDanubiaTo(
            { x: WORKSHOP_ENDING_SEQUENCE.danubiaFamilyMeetX, y: this.danubia.getLogicalPosition().y },
            'right',
            () => {
                this.danubia?.setTexture(this.textures.exists('danubia-victory') ? 'danubia-victory' : DANUBIA_ASSET_KEYS.idle);
                this.time.delayedCall(WORKSHOP_ENDING_SEQUENCE.victoryHoldDurationMs, () => {
                    this.finishWorkshopScene();
                });
            },
        );
    }

    private finishWorkshopScene(): void {
        markFamilyMemberRescued('daughter');
        markFamilyMemberRescued('son');
        markFamilyMemberRescued('husband');
        this.cameras.main.fadeOut(520, 228, 244, 255);
        this.time.delayedCall(540, () => {
            this.scene.start(SCENE_KEYS.ending);
        });
    }

    private interruptAnchorSync(clearProgress: boolean): void {
        const activeAnchor = this.temporalAnchors[this.activeAnchorIndex];

        this.isAnchorInteractionActive = false;

        if (!activeAnchor || activeAnchor.state === 'disabled') {
            return;
        }

        if (clearProgress) {
            activeAnchor.syncProgress = 0;
        }

        if (activeAnchor.state === 'syncing') {
            this.setAnchorState(activeAnchor, 'active');
        }
    }

    private ensureAnchorSyncUi(): void {
        if (this.anchorSyncUi) {
            this.anchorSyncUi.container.setVisible(true);
            return;
        }

        const container = this.add.container(ANCHOR_SYNC_CONFIG.uiX, ANCHOR_SYNC_CONFIG.uiY);
        const panel = this.add.rectangle(0, 0, 348, 74, 0x08111f, 0.86);
        panel.setStrokeStyle(2, 0xf4d35e, 0.44);
        const label = this.add.text(0, -18, '', {
            fontFamily: 'monospace',
            fontSize: '17px',
            color: '#f8fafc',
            align: 'center',
        }).setOrigin(0.5);
        const track = this.add.rectangle(
            0,
            14,
            ANCHOR_SYNC_CONFIG.barWidth,
            ANCHOR_SYNC_CONFIG.barHeight,
            0x17263c,
            0.96,
        );
        track.setStrokeStyle(2, 0xc084fc, 0.34);
        const fill = this.add.rectangle(
            -ANCHOR_SYNC_CONFIG.barWidth * 0.5 + 2,
            14,
            0,
            ANCHOR_SYNC_CONFIG.barHeight - 4,
            0xf4d35e,
            1,
        ).setOrigin(0, 0.5);

        container.add([panel, label, track, fill]);
        container.setDepth(ANCHOR_SYNC_CONFIG.uiDepth);
        container.setScrollFactor(0);
        container.setVisible(true);
        this.anchorSyncUi = { container, label, fill };
    }

    private updateAnchorSyncStatusUi(): void {
        const activeAnchor = this.temporalAnchors[this.activeAnchorIndex];
        const shouldShow =
            !!activeAnchor
            && this.isFamilyPrisoned
            && !this.isCombatEndingActive
            && (this.isCombatPrepared || this.isCombatActive)
            && activeAnchor.state !== 'disabled';

        if (!shouldShow) {
            this.hideAnchorSyncUi();
            return;
        }

        this.ensureAnchorSyncUi();
        if (!this.anchorSyncUi) {
            return;
        }

        const progress = Phaser.Math.Clamp(activeAnchor.syncProgress, 0, 100);
        this.anchorSyncUi.container.setVisible(true);
        this.anchorSyncUi.fill.width = (ANCHOR_SYNC_CONFIG.barWidth - 4) * (progress / 100);
        this.anchorSyncUi.label.setText(
            `Âncora temporal ${activeAnchor.index + 1}/3  (${Math.round(progress)}%)`,
        );
    }

    private hideAnchorSyncUi(): void {
        this.anchorSyncUi?.container.setVisible(false);
    }

    private updateActiveHazards(deltaMs: number): void {
        for (const hazard of [...this.activeHazards]) {
            if (!hazard.active) {
                continue;
            }

            hazard.update(deltaMs);
        }
    }

    private clearActiveHazards(): void {
        for (const hazard of [...this.activeHazards]) {
            hazard.destroy();
        }

        this.activeHazards = [];
    }

    public spawnTemporalPulse(
        startX: number,
        direction: 'left' | 'right' = 'right',
    ): HazardRuntime {
        const sprite = this.add.image(startX, COMBAT_LAYOUT.pulseLaneY, 'effect-time-golden-pulse');
        sprite.setScale(0.72);
        sprite.setDepth(2.9);
        sprite.setFlipX(direction === 'left');

        const velocityX = direction === 'right' ? 260 : -260;
        const runtime: HazardRuntime = {
            id: `temporal-pulse-${this.time.now}`,
            kind: 'temporal-pulse',
            sprite,
            hitbox: {
                x: sprite.x - 34,
                y: sprite.y - 24,
                width: 68,
                height: 48,
            },
            velocityX,
            active: true,
            update: (deltaMs: number) => {
                const deltaSeconds = deltaMs / 1000;
                sprite.x += velocityX * deltaSeconds;
                runtime.hitbox.x = sprite.x - runtime.hitbox.width * 0.5;
                runtime.hitbox.y = sprite.y - runtime.hitbox.height * 0.5;

                if (sprite.x < -120 || sprite.x > GAME_WIDTH + 120) {
                    runtime.destroy();
                }
            },
            destroy: () => {
                runtime.active = false;
                sprite.destroy();
                this.activeHazards = this.activeHazards.filter((hazard) => hazard !== runtime);
            },
        };

        this.activeHazards.push(runtime);
        return runtime;
    }

    public spawnRollingGear(
        startX: number,
        direction: 'left' | 'right' = 'right',
    ): HazardRuntime {
        const sprite = this.add.image(startX, COMBAT_LAYOUT.gearLaneY, 'hazard-gear');
        sprite.setScale(0.82);
        sprite.setDepth(2.7);
        const velocityX = direction === 'right' ? 218 : -218;

        const runtime: HazardRuntime = {
            id: `rolling-gear-${this.time.now}`,
            kind: 'rolling-gear',
            sprite,
            hitbox: {
                x: sprite.x - 42,
                y: sprite.y - 42,
                width: 84,
                height: 84,
            },
            velocityX,
            active: true,
            update: (deltaMs: number) => {
                const deltaSeconds = deltaMs / 1000;
                sprite.x += velocityX * deltaSeconds;
                sprite.angle += (direction === 'right' ? 220 : -220) * deltaSeconds;
                runtime.hitbox.x = sprite.x - runtime.hitbox.width * 0.5;
                runtime.hitbox.y = sprite.y - runtime.hitbox.height * 0.5;

                if (sprite.x < -140 || sprite.x > GAME_WIDTH + 140) {
                    runtime.destroy();
                }
            },
            destroy: () => {
                runtime.active = false;
                sprite.destroy();
                this.activeHazards = this.activeHazards.filter((hazard) => hazard !== runtime);
            },
        };

        this.activeHazards.push(runtime);
        return runtime;
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

        this.fillRect(this.debugGraphics, WORKSHOP_ARENA_CONFIG.walkArea, 0x00ff66, 0.12, 0x00ff66, 0.9);

        for (const anchor of this.temporalAnchors) {
            const color =
                anchor.state === 'active'
                    ? 0xf4d35e
                    : anchor.state === 'disabled'
                        ? 0x64748b
                        : anchor.state === 'syncing'
                            ? 0xffffff
                            : 0x60a5fa;
            this.fillRect(this.debugGraphics, anchor.interactionZone, color, 0.1, color, 0.9);
        }

        for (const hazard of this.activeHazards) {
            this.fillRect(this.debugGraphics, hazard.hitbox, 0xff4d6d, 0.12, 0xff4d6d, 0.9);
        }

        const foot = this.danubia.getFootBounds();
        this.fillRect(this.debugGraphics, foot, 0xffdd00, 0.28, 0xffdd00, 1);

        this.debugText.setText(
            [
                `room: workshop`,
                `mouse x:${Math.round(pointer.worldX)} y:${Math.round(pointer.worldY)}`,
                `phase:${this.battlePhase} active-anchor:${this.activeAnchorIndex + 1}`,
                `combat-prepared:${this.isCombatPrepared} combat-active:${this.isCombatActive}`,
                `anchor-interaction:${this.isAnchorInteractionActive} recovering:${this.isPlayerRecoveringFromHit}`,
                `phase-transition:${this.isPhaseTransitionActive} combat-ending:${this.isCombatEndingActive}`,
                `hazards:${this.activeHazards.length} prison:${this.familyPrison?.state ?? 'none'}`,
                `logical x:${Math.round(this.danubia.getLogicalPosition().x)} y:${Math.round(this.danubia.getLogicalPosition().y)}`,
                `foot x:${Math.round(foot.x)} y:${Math.round(foot.y)} w:${Math.round(foot.width)} h:${Math.round(foot.height)}`,
            ].join('\n'),
        );
    }

    private isInteractHeld(): boolean {
        return isControllerInteractHeld(this, this.interactKey);
    }

    private rectsIntersect(a: RectArea, b: RectArea): boolean {
        return (
            a.x < b.x + b.width
            && a.x + a.width > b.x
            && a.y < b.y + b.height
            && a.y + a.height > b.y
        );
    }
}
