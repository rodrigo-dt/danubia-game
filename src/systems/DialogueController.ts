import Phaser from 'phaser';
import { DEV_SKIP_DIALOGUES } from '../game/constants';
import type { DialogueLine, DialogueSequence, Point2D } from '../game/types';
import { isConfirmJustPressed } from './controllerInput';
import { DialogueBox } from '../ui/DialogueBox';

type BubbleAnimationTarget = Phaser.GameObjects.GameObject & {
    scaleX: number;
    scaleY: number;
    setScale: (x: number, y?: number) => unknown;
};

const BUBBLE_TALK_ANIMATION = {
    scaleMultiplier: 1.02,
    durationMs: 380,
} as const;

const TYPEWRITER_CONFIG = {
    charDelayMs: 45,
    autoAdvance: {
        minDelayMs: 1500,
        perCharacterMs: 50,
        maxDelayMs: 2400,
    },
} as const;

type DialogueControllerOptions = {
    onStateChange?: (active: boolean) => void;
    getBubbleAnchor?: () => Point2D | undefined;
    getBubbleAnimationTarget?: () => BubbleAnimationTarget | undefined;
};

type StartDialogueOptions = {
    onComplete?: () => void;
};

export class DialogueController {
    private readonly scene: Phaser.Scene;
    private readonly dialogueBox: DialogueBox;
    private readonly onStateChange?: (active: boolean) => void;
    private readonly getBubbleAnchor?: () => Point2D | undefined;
    private readonly getBubbleAnimationTarget?: () => BubbleAnimationTarget | undefined;
    private activeDialogue?: DialogueSequence;
    private currentIndex = 0;
    private onComplete?: () => void;
    private movementLocked = false;
    private bubbleTalkTween?: Phaser.Tweens.Tween;
    private bubbleTalkBaseScale?: { x: number; y: number };
    private typewriterEvent?: Phaser.Time.TimerEvent;
    private autoAdvanceEvent?: Phaser.Time.TimerEvent;
    private currentCharacters: string[] = [];
    private visibleCharacterCount = 0;
    private lineFullyRevealed = false;

    constructor(scene: Phaser.Scene, options: DialogueControllerOptions = {}) {
        this.scene = scene;
        this.dialogueBox = new DialogueBox(scene);
        this.onStateChange = options.onStateChange;
        this.getBubbleAnchor = options.getBubbleAnchor;
        this.getBubbleAnimationTarget = options.getBubbleAnimationTarget;
    }

    get isActive(): boolean {
        return Boolean(this.activeDialogue);
    }

    start(dialogue: DialogueSequence, options: StartDialogueOptions = {}): boolean {
        if (this.isActive || dialogue.length === 0) {
            return false;
        }

        if (DEV_SKIP_DIALOGUES) {
            this.skipDialogue(options.onComplete);
            return true;
        }

        this.activeDialogue = dialogue;
        this.currentIndex = 0;
        this.onComplete = options.onComplete;
        this.renderCurrentLine();

        return true;
    }

    update(): void {
        if (!this.activeDialogue) {
            return;
        }

        const currentLine = this.getCurrentLine();
        if (currentLine?.mode === 'bubble') {
            this.dialogueBox.updateBubbleAnchor(this.getBubbleAnchor?.());
        }

        const advancePressed = isConfirmJustPressed(this.scene);

        if (currentLine?.mode === 'bubble') {
            return;
        }

        if (!advancePressed) {
            return;
        }

        if (!this.lineFullyRevealed) {
            this.revealCurrentLineImmediately();
            return;
        }

        this.advanceToNextLine();
    }

    stop(): void {
        if (!this.activeDialogue) {
            return;
        }

        this.finish();
    }

    private renderCurrentLine(): void {
        const currentLine = this.getCurrentLine();

        if (!currentLine) {
            this.finish();
            return;
        }

        this.clearLineTimers();
        this.currentCharacters = Array.from(currentLine.text);
        this.visibleCharacterCount = 0;
        this.lineFullyRevealed = false;

        this.dialogueBox.showLine(currentLine);
        this.dialogueBox.setDisplayedText('');
        this.dialogueBox.setContinuePromptVisible(
            currentLine.mode === 'narration' ||
            currentLine.mode === 'portrait' ||
            currentLine.mode === 'phoneCall',
        );

        if (currentLine.mode === 'bubble') {
            this.dialogueBox.updateBubbleAnchor(this.getBubbleAnchor?.());
        }
        this.syncBubbleTalkAnimation(currentLine);
        this.syncMovementLock(currentLine);

        if (this.currentCharacters.length === 0) {
            this.handleTypewriterComplete();
            return;
        }

        this.typewriterEvent = this.scene.time.addEvent({
            delay: TYPEWRITER_CONFIG.charDelayMs,
            loop: true,
            callback: () => {
                this.revealNextCharacter();
            },
        });
    }

    private finish(): void {
        const callback = this.onComplete;

        this.activeDialogue = undefined;
        this.currentIndex = 0;
        this.onComplete = undefined;
        this.dialogueBox.hide();
        this.clearLineTimers();
        this.stopBubbleTalkAnimation();
        this.setMovementLocked(false);
        callback?.();
    }

    private skipDialogue(onComplete?: () => void): void {
        this.activeDialogue = undefined;
        this.currentIndex = 0;
        this.onComplete = undefined;
        this.dialogueBox.hide();
        this.clearLineTimers();
        this.stopBubbleTalkAnimation();
        this.movementLocked = false;
        this.onStateChange?.(false);
        onComplete?.();
    }

    private getCurrentLine(): DialogueLine | undefined {
        return this.activeDialogue?.[this.currentIndex];
    }

    private syncMovementLock(line: DialogueLine): void {
        const shouldLockMovement = line.lockMovement ?? line.mode !== 'bubble';

        this.setMovementLocked(shouldLockMovement);
    }

    private syncBubbleTalkAnimation(line: DialogueLine): void {
        if (line.mode === 'bubble') {
            this.startBubbleTalkAnimation();
            return;
        }

        this.stopBubbleTalkAnimation();
    }

    private setMovementLocked(locked: boolean): void {
        if (this.movementLocked === locked) {
            return;
        }

        this.movementLocked = locked;
        this.onStateChange?.(locked);
    }

    private revealNextCharacter(): void {
        if (this.lineFullyRevealed) {
            return;
        }

        this.visibleCharacterCount += 1;
        this.dialogueBox.setDisplayedText(
            this.currentCharacters.slice(0, this.visibleCharacterCount).join(''),
        );
        this.handleTypedCharacter();

        if (this.visibleCharacterCount >= this.currentCharacters.length) {
            this.handleTypewriterComplete();
        }
    }

    private revealCurrentLineImmediately(): void {
        this.visibleCharacterCount = this.currentCharacters.length;
        this.dialogueBox.setDisplayedText(this.currentCharacters.join(''));
        this.handleTypewriterComplete();
    }

    private handleTypewriterComplete(): void {
        if (this.lineFullyRevealed) {
            return;
        }

        this.clearTypewriterEvent();
        this.lineFullyRevealed = true;
        this.scheduleAutoAdvance();
    }

    private handleTypedCharacter(): void {
        // Reserved for per-character SFX hookup later.
    }

    private scheduleAutoAdvance(): void {
        const currentLine = this.getCurrentLine();

        if (!currentLine) {
            return;
        }

        this.autoAdvanceEvent?.remove(false);
        this.autoAdvanceEvent = this.scene.time.delayedCall(
            this.getAutoAdvanceDelay(currentLine.text),
            () => {
                this.advanceToNextLine();
            },
        );
    }

    private getAutoAdvanceDelay(text: string): number {
        return Phaser.Math.Clamp(
            text.length * TYPEWRITER_CONFIG.autoAdvance.perCharacterMs,
            TYPEWRITER_CONFIG.autoAdvance.minDelayMs,
            TYPEWRITER_CONFIG.autoAdvance.maxDelayMs,
        );
    }

    private advanceToNextLine(): void {
        if (!this.activeDialogue) {
            return;
        }

        if (this.currentIndex >= this.activeDialogue.length - 1) {
            this.finish();
            return;
        }

        this.currentIndex += 1;
        this.renderCurrentLine();
    }

    private startBubbleTalkAnimation(): void {
        if (this.bubbleTalkTween) {
            return;
        }

        const target = this.getBubbleAnimationTarget?.();

        if (!target) {
            return;
        }

        this.bubbleTalkBaseScale = {
            x: target.scaleX,
            y: target.scaleY,
        };
        this.bubbleTalkTween = this.scene.tweens.add({
            targets: target,
            scaleX: this.bubbleTalkBaseScale.x * BUBBLE_TALK_ANIMATION.scaleMultiplier,
            scaleY: this.bubbleTalkBaseScale.y * BUBBLE_TALK_ANIMATION.scaleMultiplier,
            duration: BUBBLE_TALK_ANIMATION.durationMs,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private stopBubbleTalkAnimation(): void {
        const target = this.getBubbleAnimationTarget?.();

        this.bubbleTalkTween?.stop();
        this.bubbleTalkTween = undefined;

        if (target && this.bubbleTalkBaseScale) {
            target.setScale(this.bubbleTalkBaseScale.x, this.bubbleTalkBaseScale.y);
        }

        this.bubbleTalkBaseScale = undefined;
    }

    private clearLineTimers(): void {
        this.clearTypewriterEvent();
        this.autoAdvanceEvent?.remove(false);
        this.autoAdvanceEvent = undefined;
    }

    private clearTypewriterEvent(): void {
        this.typewriterEvent?.remove(false);
        this.typewriterEvent = undefined;
    }

}
