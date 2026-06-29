import Phaser from 'phaser';
import { endingLivingRoomDialogue } from '../data/dialogues';
import { homeRooms } from '../data/homeRooms';
import {DEBUG_ROOM_GEOMETRY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, UI_FONT_FAMILY} from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';
import type { RectArea } from '../game/types';
import { DialogueController } from '../systems/DialogueController';

const ENDING_LAYOUT = {
    danubia: { x: 390, y: 390, scale: 1.86, flipX: false, key: 'danubia-idle' },
    husband: { x: 520, y: 330, scale: 2.0, flipX: true },
    daughter: { x: 602, y: 360, scale: 1.90, flipX: true },
    son: { x: 676, y: 390, scale: 1.90, flipX: true },
    pets: [
        { key: 'pet-pudim', x: 203, y: 394, scale: 0.85, flipX: false },
        { key: 'pet-drogo', x: 777, y: 250, scale: 1.1, flipX: true },
        { key: 'pet-pirata', x: 72, y: 330, scale: 1.2, flipX: false },
        { key: 'pet-zoe', x: 280, y: 470, scale: 0.85, flipX: false },
        { key: 'pet-batata', x: 856, y: 410, scale: 0.75, flipX: true },
        { key: 'pet-pituca', x: 770, y: 415, scale: 0.70, flipX: true },
        { key: 'pet-brecko-lelo-pure', x: 850, y: 452, scale: 1.2, flipX: true },
    ],
} as const;

const ENDING_TIMING = {
    dialogueStartDelayMs: 1900,
} as const;

type EndingSpriteRuntime = {
    label: string;
    sprite: Phaser.GameObjects.Image;
};

export class EndingScene extends Phaser.Scene {
    private dialogueController?: DialogueController;
    private debugGraphics?: Phaser.GameObjects.Graphics;
    private debugText?: Phaser.GameObjects.Text;
    private reunionSprites: EndingSpriteRuntime[] = [];

    constructor() {
        super(SCENE_KEYS.ending);
    }

    create(): void {
        installDevModeHotkeys(this);

        this.add
            .image(0, 0, homeRooms['living-room'].backgroundKey)
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        this.cameras.main.fadeIn(320, 228, 244, 255);

        this.createFamilyReunionLayout();

        this.dialogueController = new DialogueController(this);

        if (DEBUG_ROOM_GEOMETRY) {
            this.debugGraphics = this.add.graphics().setDepth(1000);
            this.debugText = this.add.text(12, 12, '', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 6, y: 4 },
            }).setScrollFactor(0).setDepth(1001);
        }

        this.time.delayedCall(ENDING_TIMING.dialogueStartDelayMs, () => {
            this.startEndingDialogue();
        });
    }

    update(): void {
        this.dialogueController?.update();

        if (DEBUG_ROOM_GEOMETRY) {
            this.drawDebugGeometry();
        }
    }

    private createFamilyReunionLayout(): void {
        this.addCharacter(
            ENDING_LAYOUT.danubia.x,
            ENDING_LAYOUT.danubia.y,
            this.getDanubiaEndingTextureKey(),
            ENDING_LAYOUT.danubia.scale,
            ENDING_LAYOUT.danubia.flipX,
            3.2,
            'danubia',
        );
        this.addCharacter(
            ENDING_LAYOUT.husband.x,
            ENDING_LAYOUT.husband.y,
            'family-husband',
            ENDING_LAYOUT.husband.scale,
            ENDING_LAYOUT.husband.flipX,
            3.1,
            'husband',
        );
        this.addCharacter(
            ENDING_LAYOUT.daughter.x,
            ENDING_LAYOUT.daughter.y,
            'family-daughter',
            ENDING_LAYOUT.daughter.scale,
            ENDING_LAYOUT.daughter.flipX,
            3.1,
            'daughter',
        );
        this.addCharacter(
            ENDING_LAYOUT.son.x,
            ENDING_LAYOUT.son.y,
            'family-son',
            ENDING_LAYOUT.son.scale,
            ENDING_LAYOUT.son.flipX,
            3.1,
            'son',
        );

        for (const pet of ENDING_LAYOUT.pets) {
            if (!this.textures.exists(pet.key)) {
                continue;
            }

            const sprite = this.add.image(pet.x, pet.y, pet.key);
            sprite.setScale(pet.scale);
            sprite.setFlipX(pet.flipX);
            sprite.setDepth(2.8);
            this.reunionSprites.push({ label: pet.key, sprite });

            this.tweens.add({
                targets: sprite,
                y: sprite.y - Phaser.Math.Between(4, 8),
                duration: Phaser.Math.Between(1500, 2200),
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1,
            });
        }
    }

    private addCharacter(
        x: number,
        y: number,
        textureKey: string,
        scale: number,
        flipX: boolean,
        depth: number,
        label: string,
    ): Phaser.GameObjects.Image {
        const sprite = this.add.image(x, y, textureKey);
        sprite.setScale(scale);
        sprite.setFlipX(flipX);
        sprite.setDepth(depth);
        this.reunionSprites.push({ label, sprite });
        return sprite;
    }

    private getDanubiaEndingTextureKey(): string {
        if (this.textures.exists('danubia-idle')) {
            return 'danubia-idle';
        }

        return this.textures.exists('danubia-power-01') ? 'danubia-power-01' : 'danubia-idle';
    }

    private startEndingDialogue(): void {
        this.dialogueController?.start(endingLivingRoomDialogue, {
            onComplete: () => {
                this.completeEndingDialogue();
            },
        });
    }

    private completeEndingDialogue(): void {
        this.time.delayedCall(800, () => {
            const fade = this.add.rectangle(
                GAME_WIDTH / 2,
                GAME_HEIGHT / 2,
                GAME_WIDTH,
                GAME_HEIGHT,
                0x000000,
                1,
            )
                .setDepth(10000)
                .setScrollFactor(0)
                .setAlpha(0);

            this.tweens.add({
                targets: fade,
                alpha: 1,
                duration: 2600,
                ease: 'Sine.InOut',
                onComplete: () => {
                    const finalMessage = this.add.text(
                        GAME_WIDTH / 2,
                        GAME_HEIGHT / 2,
                        'Feliz aniversário,\nNós te amamos muito!',
                        {
                            fontFamily: UI_FONT_FAMILY,
                            fontSize: '34px',
                            color: '#ffffff',
                            align: 'center',
                            lineSpacing: 12,
                        },
                    )
                        .setOrigin(0.5)
                        .setDepth(10001)
                        .setScrollFactor(0)
                        .setAlpha(0);

                    // Garante que o texto fique acima do retângulo preto
                    this.children.bringToTop(finalMessage);

                    this.tweens.add({
                        targets: finalMessage,
                        alpha: 1,
                        duration: 1100,
                        ease: 'Sine.Out',
                    });
                },
            });
        });
    }

    private drawDebugGeometry(): void {
        if (!this.debugGraphics || !this.debugText) {
            return;
        }

        this.debugGraphics.clear();
        const pointer = this.input.activePointer;

        for (const runtime of this.reunionSprites) {
            const bounds = runtime.sprite.getBounds();
            this.fillRect(
                this.debugGraphics,
                {
                    x: bounds.x,
                    y: bounds.y,
                    width: bounds.width,
                    height: bounds.height,
                },
                0x60a5fa,
                0.1,
                0x60a5fa,
                0.9,
            );

            this.debugGraphics.lineStyle(1, 0xfde68a, 0.9);
            this.debugGraphics.strokeCircle(runtime.sprite.x, runtime.sprite.y, 4);
        }

        this.debugText.setText(
            [
                'room: ending',
                `mouse x:${Math.round(pointer.worldX)} y:${Math.round(pointer.worldY)}`,
                `sprites:${this.reunionSprites.length}`,
                ...this.reunionSprites.map((runtime) =>
                    `${runtime.label} x:${Math.round(runtime.sprite.x)} y:${Math.round(runtime.sprite.y)} scale:${runtime.sprite.scaleX.toFixed(2)}`,
                ),
            ].join('\n'),
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
