import Phaser from 'phaser';
import { DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import { Danubia } from '../characters/Danubia';
import {
    homeRoomInteractionDialogues,
    homeOpeningDialogue,
    homeRoomEntryDialogues,
    livingRoomInteractionDialogues,
} from '../data/dialogues';
import { homeRooms } from '../data/homeRooms';
import type {
    DialogueSequence,
    HomeRoomConfig,
    HomeRoomId,
    RectArea,
    RoomDoor,
    RoomInteraction,
} from '../game/types';
import { DialogueController } from '../systems/DialogueController';
import { InteractionPrompt } from '../ui/InteractionPrompt';

export class HomeScene extends Phaser.Scene {
    private static readonly DELAYED_ENTRY_DIALOGUE_MS = 950;
    private danubia?: Danubia;
    private background?: Phaser.GameObjects.Image;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private debugBlockerLabels: Phaser.GameObjects.Text[] = [];
    private debugDoorLabels: Phaser.GameObjects.Text[] = [];
    private interactionPrompt?: InteractionPrompt;
    private currentRoomId: HomeRoomId = 'living-room';
    private currentRoom: HomeRoomConfig = homeRooms['living-room'];
    private activeDoor?: RoomDoor;
    private activeInteraction?: RoomInteraction;
    private isTransitioning = false;
    private interactKey?: Phaser.Input.Keyboard.Key;
    private dialogueController?: DialogueController;
    private readonly visitedRoomDialogues = new Set<HomeRoomId>();
    private pendingRoomEntryDialogue?: Phaser.Time.TimerEvent;

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
        this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.dialogueController = new DialogueController(this, {
            onStateChange: (active) => {
                this.danubia?.setMovementBlocked(active);

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
        this.time.delayedCall(250, () => {
            this.startOpeningDialogue();
        });
    }

    update(): void {
        this.danubia?.update();
        this.updateDoorInteraction();
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
        this.interactionPrompt?.hide();
        this.pendingRoomEntryDialogue?.remove(false);
        this.pendingRoomEntryDialogue = undefined;

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
        if (!this.danubia || !this.interactionPrompt || this.isTransitioning) {
            return;
        }

        if (this.dialogueController?.isActive) {
            this.activeDoor = undefined;
            this.activeInteraction = undefined;
            this.interactionPrompt.hide();
            return;
        }

        const foot = this.danubia.getFootBounds();
        this.activeDoor = this.currentRoom.doors.find((door) => this.rectsIntersect(foot, door));
        this.activeInteraction = this.activeDoor
            ? undefined
            : this.currentRoom.interactions?.find((interaction) => this.rectsIntersect(foot, interaction));

        const promptSource = this.activeDoor ?? this.activeInteraction;

        if (!promptSource) {
            this.interactionPrompt.hide();
            return;
        }

        this.interactionPrompt.show(promptSource.promptText);

        if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            if (this.activeDoor) {
                this.transitionToDoor(this.activeDoor);
                return;
            }

            if (this.activeInteraction) {
                this.startInteractionDialogue(this.activeInteraction);
            }
        }
    }

    private startOpeningDialogue(): void {
        if (this.isTransitioning) {
            return;
        }

        this.dialogueController?.start(homeOpeningDialogue);
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
