import Phaser from 'phaser';
import {
    DEBUG_ROOM_GEOMETRY,
    DEV_SKIP_DIALOGUES,
    GAME_HEIGHT,
    GAME_WIDTH,
    SCENE_KEYS,
} from '../game/constants';
import { Danubia } from '../characters/Danubia';
import {
    firstMonsieurCallDialogue,
    homeRoomInteractionDialogues,
    homeOpeningDialogue,
    homeRoomEntryDialogues,
    livingRoomInteractionDialogues,
} from '../data/dialogues';
import { homeRooms } from '../data/homeRooms';
import type {
    DialogueSequence,
    FragmentId,
    HomeRoomConfig,
    HomeRoomId,
    RectArea,
    RoomFragment,
    RoomDoor,
    RoomInteraction,
} from '../game/types';
import {
    collectFragment,
    getHomePortalState,
    hasStartedClockSequence,
    hasUnlockedHomePortal,
    hasUnlockedPhoneHud,
    isFragmentCollected,
    markClockSequenceStarted,
    setHomePortalState,
    unlockHomePortal,
    unlockPhoneHud,
} from '../game/states';
import { DialogueController } from '../systems/DialogueController';
import { FragmentNotification } from '../ui/FragmentNotification';
import { IncomingCallOverlay } from '../ui/IncomingCallOverlay';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { PHONE_HUD_CONFIG, PhoneHud } from '../ui/PhoneHud';

export class HomeScene extends Phaser.Scene {
    private static readonly DELAYED_ENTRY_DIALOGUE_MS = 950;
    private static readonly FRAGMENT_DISPLAY_SCALE = 0.72;
    private static readonly FRAGMENT_FLOAT_OFFSET_Y = 8;
    private static readonly FRAGMENT_FLOAT_DURATION_MS = 1450;
    private static readonly PORTAL_CONFIG = {
        horizontalOffset: 236,
        screenMarginX: 104,
        scale: 0.92,
        footAlignmentOffsetY: 10,
        jumpFallbackY: 0,
        backDepth: 1,
        characterDepth: 2,
        frontDepth: 3,
        pulseScaleMultiplier: 1.06,
        pulseDurationMs: 920,
        pulseAlphaMin: 0.86,
        pulseAlphaMax: 1,
        driftAngle: 1.4,
        driftDurationMs: 1600,
        interactionWidth: 248,
        interactionHeight: 208,
        promptText: 'Atravessar portal',
        pullSpeedPxPerSecond: 122,
        fadeDurationMs: 320,
        fadeStartDistancePx: 52,
        postFadeDelayMs: 90,
        fadeColor: { red: 228, green: 244, blue: 255 },
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
    } as const;
    private danubia?: Danubia;
    private background?: Phaser.GameObjects.Image;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private debugBlockerLabels: Phaser.GameObjects.Text[] = [];
    private debugDoorLabels: Phaser.GameObjects.Text[] = [];
    private interactionPrompt?: InteractionPrompt;
    private fragmentNotification?: FragmentNotification;
    private incomingCallOverlay?: IncomingCallOverlay;
    private phoneHud?: PhoneHud;
    private currentRoomId: HomeRoomId = 'living-room';
    private currentRoom: HomeRoomConfig = homeRooms['living-room'];
    private activeDoor?: RoomDoor;
    private activeInteraction?: RoomInteraction;
    private activeFragment?: RoomFragment;
    private portalBackSprite?: Phaser.GameObjects.Image;
    private portalFrontSprite?: Phaser.GameObjects.Image;
    private portalPulseTween?: Phaser.Tweens.Tween;
    private portalDriftTween?: Phaser.Tweens.Tween;
    private portalInteractionZone?: RectArea;
    private portalTransitionOverlay?: Phaser.GameObjects.Container;
    private isTransitioning = false;
    private isPortalCutsceneActive = false;
    private interactKey?: Phaser.Input.Keyboard.Key;
    private togglePhoneKey?: Phaser.Input.Keyboard.Key;
    private dialogueController?: DialogueController;
    private readonly visitedRoomDialogues = new Set<HomeRoomId>();
    private pendingRoomEntryDialogue?: Phaser.Time.TimerEvent;
    private fragmentSprites = new Map<FragmentId, Phaser.GameObjects.Image>();
    private fragmentTweens = new Map<FragmentId, Phaser.Tweens.Tween>();
    private wasSquarePressed = false;
    private isIncomingCallActive = false;
    private hasShownFragmentHint = false;

    constructor() {
        super(SCENE_KEYS.home);
    }

    create(): void {
        this.background = this.add
            .image(0, 0, this.currentRoom.backgroundKey)
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.danubia = new Danubia(this, this.currentRoom.playerSpawn.x, this.currentRoom.playerSpawn.y);
        this.interactionPrompt = new InteractionPrompt(this);
        this.fragmentNotification = new FragmentNotification(this);
        this.incomingCallOverlay = new IncomingCallOverlay(this);
        this.phoneHud = new PhoneHud(this);
        this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.togglePhoneKey = this.input.keyboard?.addKey(PHONE_HUD_CONFIG.toggleKeyCode);
        this.dialogueController = new DialogueController(this, {
            onStateChange: (active) => {
                this.danubia?.setMovementBlocked(active || this.phoneHud?.isOpen === true);

                if (active) {
                    this.interactionPrompt?.hide();
                }
            },
            getBubbleAnchor: () => {
                if (!this.danubia) {
                    return undefined;
                }

                return {
                    x: this.danubia.x,
                    y: this.danubia.y - this.danubia.displayHeight * 0.35,
                };
            },
            getBubbleAnimationTarget: () => this.danubia,
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

        this.registerRoomTestHotkeys();
        this.loadRoom(this.currentRoomId);

        if (hasUnlockedPhoneHud()) {
            this.phoneHud.unlock();
        }

        this.time.delayedCall(250, () => {
            this.startOpeningDialogue();
        });
    }

    update(): void {
        this.danubia?.update();
        this.updateDoorInteraction();
        this.updatePhoneHudToggle();
        this.dialogueController?.update();

        if (DEBUG_ROOM_GEOMETRY) {
            this.drawDebugGeometry();
        }
    }

    private registerRoomTestHotkeys(): void {
        const keyboard = this.input.keyboard;

        keyboard?.on('keydown-ONE', () => this.loadRoom('living-room'));
        keyboard?.on('keydown-TWO', () => this.loadRoom('hall'));
        keyboard?.on('keydown-THREE', () => this.loadRoom('son-bedroom'));
        keyboard?.on('keydown-FOUR', () => this.loadRoom('daughter-bedroom'));
        keyboard?.on('keydown-FIVE', () => this.loadRoom('office'));
    }

    private loadRoom(
        roomId: HomeRoomId,
        spawnOverride?: { x: number; y: number },
        facingOverride: 'left' | 'right' = 'right',
    ): void {
        const room = homeRooms[roomId];

        this.currentRoomId = roomId;
        this.currentRoom = room;

        this.background?.setTexture(room.backgroundKey);
        this.activeDoor = undefined;
        this.activeInteraction = undefined;
        this.activeFragment = undefined;
        this.interactionPrompt?.hide();
        this.pendingRoomEntryDialogue?.remove(false);
        this.pendingRoomEntryDialogue = undefined;
        this.clearRoomFragments();

        if (!this.danubia) {
            return;
        }

        this.danubia.setWalkPlaneMode(
            room.walkArea,
            room.blockers,
            room.depthScale,
            room.shadow,
        );
        this.danubia.setWalkPlaneSpawn(spawnOverride ?? room.playerSpawn, facingOverride);
        this.createRoomFragments();
        this.refreshPortal();

        if (DEBUG_ROOM_GEOMETRY) {
            this.refreshDebugBlockerLabels();
            this.refreshDebugDoorLabels();
        }
    }

    private drawDebugGeometry(): void {
        if (!this.debugGraphics || !this.debugText || !this.danubia) {
            return;
        }

        this.debugGraphics.clear();

        this.fillRect(this.debugGraphics, this.currentRoom.walkArea, 0x00ff66, 0.18, 0x00ff66, 1);

        for (const blocker of this.currentRoom.blockers) {
            this.fillRect(this.debugGraphics, blocker, 0xff3355, 0.22, 0xff3355, 1);
        }

        for (const door of this.currentRoom.doors) {
            this.fillRect(this.debugGraphics, door, 0x3399ff, 0.18, 0x3399ff, 1);
        }

        const foot = this.danubia.getFootBounds();
        this.fillRect(this.debugGraphics, foot, 0xffdd00, 0.28, 0xffdd00, 1);

        const shadow = this.danubia.getShadowBounds();
        this.fillRect(this.debugGraphics, shadow, 0x66aaff, 0.16, 0x66aaff, 1);
        const logical = this.danubia.getLogicalPosition();

        const pointer = this.input.activePointer;
        this.debugText.setText(
            [
                `room: ${this.currentRoomId}`,
                `mouse x:${Math.round(pointer.worldX)} y:${Math.round(pointer.worldY)}`,
                `logical x:${Math.round(logical.x)} y:${Math.round(logical.y)}`,
                `door: ${this.activeDoor?.id ?? 'none'}`,
                `shadow x:${Math.round(shadow.x)} y:${Math.round(shadow.y)}`,
                `shadow w:${Math.round(shadow.width)} h:${Math.round(shadow.height)} a:${this.danubia.getShadowAlpha().toFixed(2)}`,
            ].join('\n'),
        );
    }

    private refreshDebugBlockerLabels(): void {
        for (const label of this.debugBlockerLabels) {
            label.destroy();
        }

        this.debugBlockerLabels = this.currentRoom.blockers.map((blocker) =>
            this.add
                .text(blocker.x + 4, blocker.y + 4, blocker.id, {
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#ff9db0',
                    backgroundColor: '#00000099',
                })
                .setDepth(999),
        );
    }

    private refreshDebugDoorLabels(): void {
        for (const label of this.debugDoorLabels) {
            label.destroy();
        }

        this.debugDoorLabels = this.currentRoom.doors.map((door) =>
            this.add
                .text(door.x + 4, door.y + 4, door.id, {
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#9fd1ff',
                    backgroundColor: '#00000099',
                })
                .setDepth(999),
        );
    }

    private updateDoorInteraction(): void {
        if (!this.danubia || !this.interactionPrompt || this.isTransitioning || this.isPortalCutsceneActive) {
            this.wasSquarePressed = this.isSquarePressed();
            return;
        }

        if (this.isIncomingCallActive) {
            this.activeDoor = undefined;
            this.activeInteraction = undefined;
            this.activeFragment = undefined;
            this.interactionPrompt.hide();

            if (this.incomingCallOverlay?.isReadyToAccept && this.isInteractJustPressed()) {
                this.acceptIncomingCall();
                return;
            }

            this.wasSquarePressed = this.isSquarePressed();

            return;
        }

        if (this.phoneHud?.isOpen) {
            this.activeDoor = undefined;
            this.activeInteraction = undefined;
            this.activeFragment = undefined;
            this.interactionPrompt.hide();
            this.wasSquarePressed = this.isSquarePressed();
            return;
        }

        if (this.dialogueController?.isActive) {
            this.activeDoor = undefined;
            this.activeInteraction = undefined;
            this.activeFragment = undefined;
            this.interactionPrompt.hide();
            this.wasSquarePressed = this.isSquarePressed();
            return;
        }

        const foot = this.danubia.getFootBounds();
        this.activeDoor = this.currentRoom.doors.find((door) => this.rectsIntersect(foot, door));
        this.activeInteraction = this.activeDoor
            ? undefined
            : this.currentRoom.interactions?.find((interaction) => this.rectsIntersect(foot, interaction));
        this.activeFragment = this.activeDoor || this.activeInteraction
            ? undefined
            : this.currentRoom.fragments?.find(
                (fragment) => !isFragmentCollected(fragment.id) && this.rectsIntersect(foot, fragment),
            );
        const activePortal = this.activeDoor || this.activeInteraction || this.activeFragment || !this.portalInteractionZone
            ? false
            : this.isPortalAvailable() && this.rectsIntersect(foot, this.portalInteractionZone);

        const promptSource = this.activeDoor ?? this.activeInteraction ?? this.activeFragment;

        if (!promptSource && !activePortal) {
            this.interactionPrompt.hide();
            this.wasSquarePressed = this.isSquarePressed();
            return;
        }

        const promptText = activePortal
            ? HomeScene.PORTAL_CONFIG.promptText
            : promptSource?.promptText;

        if (!promptText) {
            this.interactionPrompt.hide();
            this.wasSquarePressed = this.isSquarePressed();
            return;
        }

        this.interactionPrompt.show(promptText);

        if (this.isInteractJustPressed()) {
            if (this.activeDoor) {
                this.transitionToDoor(this.activeDoor);
                return;
            }

            if (this.activeInteraction) {
                this.startInteractionDialogue(this.activeInteraction);
                return;
            }

            if (this.activeFragment) {
                this.collectRoomFragment(this.activeFragment);
                return;
            }

            if (activePortal) {
                this.startPortalCutscene();
            }
        }
    }

    private startOpeningDialogue(): void {
        if (this.isTransitioning) {
            return;
        }

        this.dialogueController?.start(homeOpeningDialogue, {
            onComplete: () => {
                this.showHint('Inicie sua busca. Experimente ir para o corredor.');
            },
        });
    }

    private transitionToDoor(door: RoomDoor): void {
        if (this.isTransitioning || !this.danubia) {
            return;
        }

        this.isTransitioning = true;
        this.interactionPrompt?.hide();
        this.danubia.setMovementBlocked(true);
        this.cameras.main.fadeOut(180, 0, 0, 0);

        this.time.delayedCall(180, () => {
            this.loadRoom(door.targetRoom, door.targetSpawn, door.targetFacing ?? 'right');

            this.cameras.main.fadeIn(180, 0, 0, 0);
            this.time.delayedCall(180, () => {
                this.isTransitioning = false;
                const startedDialogue = this.startRoomEntryDialogueIfNeeded(door.targetRoom);

                if (!startedDialogue) {
                    this.danubia?.setMovementBlocked(false);
                }
            });
        });
    }

    private startRoomEntryDialogueIfNeeded(roomId: HomeRoomId): boolean {
        if (this.visitedRoomDialogues.has(roomId)) {
            return false;
        }

        const dialogue = homeRoomEntryDialogues[roomId as keyof typeof homeRoomEntryDialogues];

        if (!dialogue) {
            return false;
        }

        this.visitedRoomDialogues.add(roomId);

        if (roomId === 'son-bedroom' || roomId === 'daughter-bedroom' || roomId === 'office') {
            this.danubia?.setMovementBlocked(true);
            this.pendingRoomEntryDialogue = this.time.delayedCall(
                HomeScene.DELAYED_ENTRY_DIALOGUE_MS,
                () => {
                    this.pendingRoomEntryDialogue = undefined;
                    const started = this.dialogueController?.start(dialogue) ?? false;

                    if (!started) {
                        this.danubia?.setMovementBlocked(false);
                    }
                },
            );

            return true;
        }

        const started = this.dialogueController?.start(dialogue) ?? false;

        if (!started) {
            this.danubia?.setMovementBlocked(false);
        }

        return started;
    }

    private startInteractionDialogue(interaction: RoomInteraction): void {
        const dialogue = this.getInteractionDialogue(interaction.id);

        if (!dialogue) {
            return;
        }

        this.dialogueController?.start(dialogue);
    }

    private getInteractionDialogue(interactionId: string): DialogueSequence | undefined {
        switch (interactionId) {
        case 'living-room-sofa':
            return livingRoomInteractionDialogues.sofa;
        case 'living-room-bowls':
            return livingRoomInteractionDialogues.bowls;
        case 'living-room-clock':
            return livingRoomInteractionDialogues.clock;
        case 'son-bedroom-desk':
            return homeRoomInteractionDialogues['son-bedroom-desk'];
        case 'daughter-bedroom-style':
            return homeRoomInteractionDialogues['daughter-bedroom-style'];
        case 'office-desk':
            return homeRoomInteractionDialogues['office-desk'];
        default:
            return undefined;
        }
    }

    private createRoomFragments(): void {
        for (const fragment of this.currentRoom.fragments ?? []) {
            if (isFragmentCollected(fragment.id)) {
                continue;
            }

            const sprite = this.add
                .image(fragment.spriteX, fragment.spriteY, fragment.assetKey)
                .setScale(HomeScene.FRAGMENT_DISPLAY_SCALE)
                .setDepth(fragment.spriteY + 20);

            const tween = this.tweens.add({
                targets: sprite,
                y: fragment.spriteY - HomeScene.FRAGMENT_FLOAT_OFFSET_Y,
                duration: HomeScene.FRAGMENT_FLOAT_DURATION_MS,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1,
            });

            this.fragmentSprites.set(fragment.id, sprite);
            this.fragmentTweens.set(fragment.id, tween);
        }
    }

    private clearRoomFragments(): void {
        for (const tween of this.fragmentTweens.values()) {
            tween.stop();
        }

        for (const sprite of this.fragmentSprites.values()) {
            sprite.destroy();
        }

        this.fragmentTweens.clear();
        this.fragmentSprites.clear();
    }

    private refreshPortal(): void {
        this.portalPulseTween?.stop();
        this.portalPulseTween = undefined;
        this.portalDriftTween?.stop();
        this.portalDriftTween = undefined;
        this.portalBackSprite?.destroy();
        this.portalBackSprite = undefined;
        this.portalFrontSprite?.destroy();
        this.portalFrontSprite = undefined;
        this.portalInteractionZone = undefined;

        if (!this.isPortalAvailable()) {
            return;
        }

        const portalState = getHomePortalState();

        if (!portalState) {
            return;
        }

        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            return;
        }

        const halfFrameWidth = Math.floor(textureFrame.width * 0.5);
        const remainingFrameWidth = textureFrame.width - halfFrameWidth;

        const leftSprite = this.add
            .image(portalState.x, portalState.y, 'effect-time-portal')
            .setScale(HomeScene.PORTAL_CONFIG.scale);
        const rightSprite = this.add
            .image(portalState.x, portalState.y, 'effect-time-portal')
            .setScale(HomeScene.PORTAL_CONFIG.scale);

        leftSprite.setCrop(0, 0, halfFrameWidth, textureFrame.height);
        rightSprite.setCrop(halfFrameWidth, 0, remainingFrameWidth, textureFrame.height);
        leftSprite.setOrigin(0.5, 0.5);
        rightSprite.setOrigin(0.5, 0.5);

        const leftIsBehind = portalState.side === 'right';
        leftSprite.setDepth(leftIsBehind ? HomeScene.PORTAL_CONFIG.backDepth : HomeScene.PORTAL_CONFIG.frontDepth);
        rightSprite.setDepth(leftIsBehind ? HomeScene.PORTAL_CONFIG.frontDepth : HomeScene.PORTAL_CONFIG.backDepth);

        this.portalBackSprite = leftIsBehind ? leftSprite : rightSprite;
        this.portalFrontSprite = leftIsBehind ? rightSprite : leftSprite;
        this.portalInteractionZone = {
            x: portalState.x - HomeScene.PORTAL_CONFIG.interactionWidth * 0.5,
            y: portalState.footY - HomeScene.PORTAL_CONFIG.interactionHeight,
            width: HomeScene.PORTAL_CONFIG.interactionWidth,
            height: HomeScene.PORTAL_CONFIG.interactionHeight,
        };
        this.danubia?.setDepth(HomeScene.PORTAL_CONFIG.characterDepth);

        this.portalPulseTween = this.tweens.add({
            targets: [leftSprite, rightSprite],
            scaleX: HomeScene.PORTAL_CONFIG.scale * HomeScene.PORTAL_CONFIG.pulseScaleMultiplier,
            scaleY: HomeScene.PORTAL_CONFIG.scale * HomeScene.PORTAL_CONFIG.pulseScaleMultiplier,
            alpha: {
                from: HomeScene.PORTAL_CONFIG.pulseAlphaMin,
                to: HomeScene.PORTAL_CONFIG.pulseAlphaMax,
            },
            duration: HomeScene.PORTAL_CONFIG.pulseDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.portalDriftTween = this.tweens.add({
            targets: [leftSprite, rightSprite],
            angle: {
                from: -HomeScene.PORTAL_CONFIG.driftAngle,
                to: HomeScene.PORTAL_CONFIG.driftAngle,
            },
            duration: HomeScene.PORTAL_CONFIG.driftDurationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private collectRoomFragment(fragment: RoomFragment): void {
        const collectedCount = collectFragment(fragment.id);

        this.fragmentTweens.get(fragment.id)?.stop();
        this.fragmentTweens.delete(fragment.id);
        this.fragmentSprites.get(fragment.id)?.destroy();
        this.fragmentSprites.delete(fragment.id);
        this.activeFragment = undefined;
        this.interactionPrompt?.hide();
        this.fragmentNotification?.show(`Fragmento de tempo encontrado: ${collectedCount}/3`);

        if (collectedCount === 1 && !this.hasShownFragmentHint) {
            this.hasShownFragmentHint = true;
            this.time.delayedCall(2700, () => {
                this.showHint('Dica: você também pode interagir com objetos dos cômodos.');
            });
        }

        if (collectedCount === 3 && !hasStartedClockSequence()) {
            this.storePortalSpawnForCurrentRoom();
            this.showIncomingCall();
        }
    }

    private showIncomingCall(): void {
        if (this.isIncomingCallActive || hasStartedClockSequence()) {
            return;
        }

        if (DEV_SKIP_DIALOGUES) {
            this.acceptIncomingCall();
            return;
        }

        this.isIncomingCallActive = true;
        this.danubia?.setMovementBlocked(true);
        this.interactionPrompt?.hide();
        this.incomingCallOverlay?.show();
    }

    private acceptIncomingCall(): void {
        this.isIncomingCallActive = false;
        this.incomingCallOverlay?.hide();

        const started = this.dialogueController?.start(firstMonsieurCallDialogue, {
            onComplete: () => {
                markClockSequenceStarted();
                unlockHomePortal();
                unlockPhoneHud();
                this.phoneHud?.unlock();
                this.refreshPortal();
            },
        }) ?? false;

        if (!started) {
            this.danubia?.setMovementBlocked(false);
        }
    }

    private updatePhoneHudToggle(): void {
        if (!this.phoneHud?.isUnlocked || !this.togglePhoneKey) {
            return;
        }

        if (
            this.isTransitioning ||
            this.isIncomingCallActive ||
            this.dialogueController?.isActive
        ) {
            return;
        }

        if (!Phaser.Input.Keyboard.JustDown(this.togglePhoneKey)) {
            return;
        }

        this.phoneHud.toggle();
        this.interactionPrompt?.hide();
        this.danubia?.setMovementBlocked(this.phoneHud.isOpen);
    }

    private isPortalAvailable(): boolean {
        const portalState = getHomePortalState();

        return (
            hasUnlockedHomePortal() &&
            portalState?.roomId === this.currentRoomId &&
            this.scene.isActive(SCENE_KEYS.home)
        );
    }

    private startPortalCutscene(): void {
        if (this.isTransitioning || this.isPortalCutsceneActive || !this.danubia) {
            return;
        }

        this.isTransitioning = true;
        this.isPortalCutsceneActive = true;
        this.interactionPrompt?.hide();
        this.danubia.setMovementBlocked(true);
        this.phoneHud?.close(false);

        const portalState = getHomePortalState();

        if (!portalState) {
            this.finishPortalSceneTransition();
            return;
        }

        const direction = portalState.side === 'right' ? 'right' : 'left';
        const logicalStart = this.danubia.getLogicalPosition();
        const targetY = this.resolveDanubiaCutsceneY(portalState.footY);
        const target = {
            x: portalState.x,
            y: targetY,
        };
        const distance = Phaser.Math.Distance.Between(
            logicalStart.x,
            logicalStart.y,
            target.x,
            target.y,
        );
        const walkDurationMs = Math.max(
            240,
            (distance / HomeScene.PORTAL_CONFIG.pullSpeedPxPerSecond) * 1000,
        );
        const proxy = { ...logicalStart };
        const fadeProxy = { alpha: 1 };

        this.danubia.setFacing(direction);
        this.danubia.setDepth(HomeScene.PORTAL_CONFIG.characterDepth);
        this.danubia.playIdleCutscene(direction);

        this.tweens.add({
            targets: proxy,
            x: target.x,
            y: target.y,
            duration: walkDurationMs,
            ease: 'Cubic.In',
            onUpdate: () => {
                if (!this.danubia) {
                    return;
                }

                this.danubia.setCutscenePosition(proxy);

                const remainingDistance = Phaser.Math.Distance.Between(
                    proxy.x,
                    proxy.y,
                    target.x,
                    target.y,
                );

                if (remainingDistance <= HomeScene.PORTAL_CONFIG.fadeStartDistancePx) {
                    const fadeProgress =
                        1 - remainingDistance / Math.max(HomeScene.PORTAL_CONFIG.fadeStartDistancePx, 1);
                    this.danubia.setCharacterAlpha(1 - fadeProgress);
                }
            },
            onComplete: () => {
                this.danubia?.setCutscenePosition(target);
                this.danubia?.playIdleCutscene(direction);
                this.danubia?.setCharacterAlpha(0);
                this.finishPortalSceneTransition();
            },
        });

        const fadeDelayMs = Math.max(0, walkDurationMs - HomeScene.PORTAL_CONFIG.fadeDurationMs);
        this.time.delayedCall(fadeDelayMs, () => {
            this.tweens.add({
                targets: fadeProxy,
                alpha: 0,
                duration: HomeScene.PORTAL_CONFIG.fadeDurationMs,
                ease: 'Quad.In',
                onUpdate: () => {
                    this.danubia?.setCharacterAlpha(fadeProxy.alpha);
                },
            });
        });
    }

    private finishPortalSceneTransition(): void {
        this.playPortalScreenTransition(() => {
            this.scene.start(SCENE_KEYS.montmartre, {
                transitionFromPortal: true,
            });
        });
    }

    private storePortalSpawnForCurrentRoom(): void {
        if (!this.danubia) {
            return;
        }

        const textureFrame = this.textures.getFrame('effect-time-portal');

        if (!textureFrame) {
            return;
        }

        const logicalPosition = this.danubia.getLogicalPosition();
        const footBounds = this.danubia.getFootBounds();
        const footY = this.danubia.isAirborne()
            ? this.danubia.getWalkPlaneFloorY() + HomeScene.PORTAL_CONFIG.jumpFallbackY
            : footBounds.y + footBounds.height;
        const portalWidth = textureFrame.width * HomeScene.PORTAL_CONFIG.scale;
        const portalHeight = textureFrame.height * HomeScene.PORTAL_CONFIG.scale;
        const portalSide = logicalPosition.x < GAME_WIDTH * 0.5 ? 'right' : 'left';
        const directionSign = portalSide === 'right' ? 1 : -1;
        const unclampedX = logicalPosition.x + directionSign * HomeScene.PORTAL_CONFIG.horizontalOffset;
        const minX = HomeScene.PORTAL_CONFIG.screenMarginX + portalWidth * 0.5;
        const maxX = GAME_WIDTH - HomeScene.PORTAL_CONFIG.screenMarginX - portalWidth * 0.5;
        const portalX = Phaser.Math.Clamp(unclampedX, minX, maxX);
        const portalY =
            footY
            - portalHeight * 0.5
            + HomeScene.PORTAL_CONFIG.footAlignmentOffsetY;

        setHomePortalState({
            roomId: this.currentRoomId,
            x: portalX,
            y: portalY,
            footY,
            side: portalSide,
        });
    }

    private resolveDanubiaCutsceneY(portalFootY: number): number {
        if (!this.danubia) {
            return portalFootY;
        }

        const foot = this.danubia.getFootBounds();
        return this.danubia.getLogicalPosition().y + (portalFootY - (foot.y + foot.height));
    }

    private playPortalScreenTransition(onComplete: () => void): void {
        const transitionConfig = HomeScene.PORTAL_CONFIG.transition;
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
            36,
        );
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

    private showHint(message: string): void {
        this.fragmentNotification?.show(message, {
            visibleDurationMs: 2600,
        });
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
        return !(
            a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y
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
