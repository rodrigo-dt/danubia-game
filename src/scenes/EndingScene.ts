import Phaser from 'phaser';
import { endingLivingRoomDialogue } from '../data/dialogues';
import { homeRooms } from '../data/homeRooms';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, UI_FONT_FAMILY } from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';
import { DialogueController } from '../systems/DialogueController';

const ENDING_LAYOUT = {
    danubia: { x: 404, y: 418, scale: 1.78, flipX: false, key: 'danubia-victory' },
    husband: { x: 514, y: 422, scale: 0.98, flipX: true },
    daughter: { x: 586, y: 414, scale: 0.92, flipX: true },
    son: { x: 648, y: 416, scale: 0.92, flipX: true },
    pets: [
        { key: 'pet-pudim', x: 274, y: 472, scale: 0.7, flipX: false },
        { key: 'pet-drogo', x: 736, y: 470, scale: 0.68, flipX: true },
        { key: 'pet-zoe', x: 330, y: 472, scale: 0.62, flipX: false },
        { key: 'pet-brecko-lelo-pure', x: 814, y: 455, scale: 0.6, flipX: true },
    ],
} as const;

const ENDING_FINALE = {
    overlayFadeDurationMs: 520,
    finalCardDelayMs: 260,
    finalInstructionDelayMs: 1400,
} as const;

export class EndingScene extends Phaser.Scene {
    private dialogueController?: DialogueController;

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
        this.time.delayedCall(460, () => {
            this.startEndingDialogue();
        });
    }

    update(): void {
        this.dialogueController?.update();
    }

    private createFamilyReunionLayout(): void {
        this.addCharacter(
            ENDING_LAYOUT.danubia.x,
            ENDING_LAYOUT.danubia.y,
            this.getDanubiaEndingTextureKey(),
            ENDING_LAYOUT.danubia.scale,
            ENDING_LAYOUT.danubia.flipX,
            3.2,
        );
        this.addCharacter(
            ENDING_LAYOUT.husband.x,
            ENDING_LAYOUT.husband.y,
            'family-husband',
            ENDING_LAYOUT.husband.scale,
            ENDING_LAYOUT.husband.flipX,
            3.1,
        );
        this.addCharacter(
            ENDING_LAYOUT.daughter.x,
            ENDING_LAYOUT.daughter.y,
            'family-daughter',
            ENDING_LAYOUT.daughter.scale,
            ENDING_LAYOUT.daughter.flipX,
            3.1,
        );
        this.addCharacter(
            ENDING_LAYOUT.son.x,
            ENDING_LAYOUT.son.y,
            'family-son',
            ENDING_LAYOUT.son.scale,
            ENDING_LAYOUT.son.flipX,
            3.1,
        );

        for (const pet of ENDING_LAYOUT.pets) {
            if (!this.textures.exists(pet.key)) {
                continue;
            }

            const sprite = this.add.image(pet.x, pet.y, pet.key);
            sprite.setScale(pet.scale);
            sprite.setFlipX(pet.flipX);
            sprite.setDepth(2.8);

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
    ): Phaser.GameObjects.Image {
        const sprite = this.add.image(x, y, textureKey);
        sprite.setScale(scale);
        sprite.setFlipX(flipX);
        sprite.setDepth(depth);
        return sprite;
    }

    private getDanubiaEndingTextureKey(): string {
        if (this.textures.exists('danubia-victory')) {
            return 'danubia-victory';
        }

        return this.textures.exists('danubia-power-01') ? 'danubia-power-01' : 'danubia-idle';
    }

    private startEndingDialogue(): void {
        const started = this.dialogueController?.start(endingLivingRoomDialogue, {
            onComplete: () => {
                this.showFinalVictoryCard();
            },
        }) ?? false;

        if (!started) {
            this.showFinalVictoryCard();
        }
    }

    private showFinalVictoryCard(): void {
        const overlay = this.add.container(0, 0).setDepth(950);
        const shade = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            0x030712,
            0.78,
        );
        overlay.add(shade);

        if (this.textures.exists('ending-family-victory')) {
            const image = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ending-family-victory');
            image.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
            overlay.add(image);
        } else {
            const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 240, 0x07111f, 0.9);
            panel.setStrokeStyle(2, 0xf6d365, 0.36);
            const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 34, 'Danúbia em: O Desaparecimento', {
                fontFamily: UI_FONT_FAMILY,
                fontSize: '30px',
                color: '#f8fafc',
                align: 'center',
            }).setOrigin(0.5);
            const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 12, 'Família reunida.', {
                fontFamily: UI_FONT_FAMILY,
                fontSize: '24px',
                color: '#fde68a',
                align: 'center',
            }).setOrigin(0.5);
            const ending = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 62, 'Fim', {
                fontFamily: UI_FONT_FAMILY,
                fontSize: '38px',
                color: '#ffffff',
                align: 'center',
            }).setOrigin(0.5);
            overlay.add([panel, title, subtitle, ending]);
        }

        overlay.setAlpha(0);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: ENDING_FINALE.overlayFadeDurationMs,
            ease: 'Sine.Out',
            onComplete: () => {
                this.time.delayedCall(ENDING_FINALE.finalInstructionDelayMs, () => {
                    this.showFinalInstruction();
                });
            },
        });
    }

    private showFinalInstruction(): void {
        const instruction = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 58, 'Olhe para sua família.', {
            fontFamily: UI_FONT_FAMILY,
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
            backgroundColor: '#000000aa',
            padding: { x: 14, y: 8 },
        }).setOrigin(0.5).setDepth(980);

        instruction.setAlpha(0);

        this.tweens.add({
            targets: instruction,
            alpha: 1,
            duration: 420,
            ease: 'Sine.Out',
        });
    }
}
