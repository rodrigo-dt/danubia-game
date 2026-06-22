import Phaser from 'phaser';
import {
    DANUBIA_BASE_SCALE,
    DANUBIA_MAX_SCALE,
    DANUBIA_MIN_SCALE,
    PLAYER_JUMP_VELOCITY,
    PLAYER_SPEED,
    PLAYER_VERTICAL_SPEED,
} from '../game/constants';
import type { CharacterShadowConfig, RectArea, RoomBlocker, WalkArea } from '../game/types';

const DANUBIA_ASSET_KEYS = {
    idle: 'danubia-idle',
    jump: 'danubia-jump',
    walk01: 'danubia-walk-01',
    walk02: 'danubia-walk-02',
    walk03: 'danubia-walk-03',
    walk04: 'danubia-walk-04',
    walkAnimation: 'danubia-walk',
} as const;

const GAMEPAD_DEADZONE = 0.25;
const JUMP_HEIGHT = 72;
const JUMP_DURATION_MS = 420;
const FOOT_WIDTH = 42;
const FOOT_HEIGHT = 20;
const FOOT_OFFSET_FROM_BOTTOM = 8;

const DEFAULT_SHADOW_CONFIG: Required<CharacterShadowConfig> = {
    enabled: true,
    offsetX: 0,
    offsetY: 10,
    width: 34,
    height: 12,
    alpha: 0.24,
    color: 0x000000,
    scaleWithDepth: true,
    minScaleMultiplier: 0.94,
    maxScaleMultiplier: 1.06,
    shrinkOnJump: true,
    jumpShrinkFactor: 0.86,
    fadeOnJump: true,
    jumpFadeFactor: 0.8,
};

type DanubiaMovementMode =
    | { type: 'platform' }
    | {
          type: 'walk-plane';
          walkArea: WalkArea;
          blockers: RoomBlocker[];
      };

export class Danubia extends Phaser.Physics.Arcade.Sprite {
    private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private readonly wasdKeys: {
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        jump: Phaser.Input.Keyboard.Key;
    };
    private readonly shadow: Phaser.GameObjects.Ellipse;
    private movementBlocked = false;
    private wasGamepadJumpPressed = false;
    private lastFacingDirection: 'left' | 'right' = 'right';
    private movementMode: DanubiaMovementMode = { type: 'platform' };
    private logicalX: number;
    private logicalY: number;
    private jumpOffsetY = 0;
    private isJumping = false;
    private jumpElapsedMs = 0;
    private currentScale = DANUBIA_BASE_SCALE;
    private shadowConfig: Required<CharacterShadowConfig> = DEFAULT_SHADOW_CONFIG;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, DANUBIA_ASSET_KEYS.idle);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.shadow = scene.add.ellipse(
            x,
            y,
            DEFAULT_SHADOW_CONFIG.width,
            DEFAULT_SHADOW_CONFIG.height,
            DEFAULT_SHADOW_CONFIG.color,
            DEFAULT_SHADOW_CONFIG.alpha,
        );
        this.shadow.setVisible(true);
        this.shadow.setDepth(1);

        this.logicalX = x;
        this.logicalY = y;

        this.cursors =
            scene.input.keyboard?.createCursorKeys() ?? Danubia.createFallbackCursorKeys(scene);
        this.wasdKeys = scene.input.keyboard?.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
        }) as Danubia['wasdKeys'];

        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDepth(2);
        this.setScale(DANUBIA_BASE_SCALE);
        this.setBodySize(44, 96);
        this.setOffset(42, 32);
        this.applyIdleState();
        this.updateShadowVisual();
    }

    update(_time?: number, delta = this.scene.game.loop.delta): void {
        const body = this.body;

        if (!(body instanceof Phaser.Physics.Arcade.Body)) {
            return;
        }

        if (this.movementBlocked) {
            body.setVelocity(0, 0);
            this.updateJumpState(delta);
            this.applyVisualState(false);
            this.updateShadowVisual();
            return;
        }

        if (this.movementMode.type === 'walk-plane') {
            this.updateWalkPlane(body, delta);
            return;
        }

        this.updatePlatform(body);
        this.updateShadowVisual();
    }

    destroy(fromScene?: boolean): void {
        this.shadow.destroy();
        super.destroy(fromScene);
    }

    setMovementBlocked(blocked: boolean): void {
        this.movementBlocked = blocked;

        if (blocked) {
            const body = this.body;
            if (body instanceof Phaser.Physics.Arcade.Body) {
                body.setVelocity(0, 0);
            }
            this.applyIdleState();
        }
    }

    setPlatformMode(): void {
        const body = this.body;

        this.movementMode = { type: 'platform' };
        this.currentScale = DANUBIA_BASE_SCALE;
        this.setScale(this.currentScale);
        this.jumpOffsetY = 0;
        this.isJumping = false;
        this.logicalX = this.x;
        this.logicalY = this.y;

        if (body instanceof Phaser.Physics.Arcade.Body) {
            body.setAllowGravity(true);
            body.moves = true;
            body.updateFromGameObject();
        }

        this.updateShadowVisual();
    }

    setWalkPlaneMode(
        walkArea: WalkArea,
        blockers: RoomBlocker[],
        shadowConfig?: CharacterShadowConfig,
    ): void {
        const body = this.body;

        this.movementMode = {
            type: 'walk-plane',
            walkArea,
            blockers,
        };

        this.shadowConfig = {
            ...DEFAULT_SHADOW_CONFIG,
            ...shadowConfig,
        };

        this.logicalX = this.x;
        this.logicalY = this.y;
        this.jumpOffsetY = 0;
        this.isJumping = false;

        this.clampToWalkArea();

        if (body instanceof Phaser.Physics.Arcade.Body) {
            body.setAllowGravity(false);
            body.moves = false;
            body.setVelocity(0, 0);
        }

        this.applyScaleForDepth();
        this.applyRenderedPosition();
        this.updateShadowVisual();
    }

    getFootBounds(): RectArea {
        return this.createFootRect(this.logicalX, this.logicalY);
    }

    getShadowBounds(): RectArea {
        return {
            x: this.shadow.x - this.shadow.displayWidth * 0.5,
            y: this.shadow.y - this.shadow.displayHeight * 0.5,
            width: this.shadow.displayWidth,
            height: this.shadow.displayHeight,
        };
    }

    getShadowAlpha(): number {
        return this.shadow.alpha;
    }

    private updatePlatform(body: Phaser.Physics.Arcade.Body): void {
        const horizontalInput = this.getHorizontalInput();
        const wantsJump = this.isJumpPressed();
        const isGrounded = body.blocked.down || body.touching.down;

        body.setVelocityX(horizontalInput * PLAYER_SPEED);

        if (horizontalInput < 0) {
            this.setFacingDirection('left');
        } else if (horizontalInput > 0) {
            this.setFacingDirection('right');
        }

        if (wantsJump && isGrounded) {
            body.setVelocityY(PLAYER_JUMP_VELOCITY);
        }

        this.applyPlatformAnimationState(body, horizontalInput !== 0);
    }

    private updateWalkPlane(body: Phaser.Physics.Arcade.Body, delta: number): void {
        const horizontalInput = this.getHorizontalInput();
        const verticalInput = this.getVerticalInput();
        const wantsJump = this.isJumpPressed();
        const movementVector = new Phaser.Math.Vector2(horizontalInput, verticalInput);

        if (movementVector.lengthSq() > 1) {
            movementVector.normalize();
        }

        if (horizontalInput < 0) {
            this.setFacingDirection('left');
        } else if (horizontalInput > 0) {
            this.setFacingDirection('right');
        }

        if (wantsJump && !this.isJumping) {
            this.isJumping = true;
            this.jumpElapsedMs = 0;
        }

        const deltaSeconds = delta / 1000;
        const nextX = this.logicalX + movementVector.x * PLAYER_SPEED * deltaSeconds;
        const nextY = this.logicalY + movementVector.y * PLAYER_VERTICAL_SPEED * deltaSeconds;
        const resolvedPosition = this.resolveWalkPlaneMovement(nextX, nextY);

        this.logicalX = resolvedPosition.x;
        this.logicalY = resolvedPosition.y;

        this.updateJumpState(delta);
        this.applyScaleForDepth();
        this.applyRenderedPosition();
        body.updateFromGameObject();
        this.applyVisualState(movementVector.lengthSq() > 0);
        this.updateShadowVisual();
    }

    private resolveWalkPlaneMovement(nextX: number, nextY: number): Phaser.Math.Vector2 {
        const current = new Phaser.Math.Vector2(this.logicalX, this.logicalY);
        const diagonal = this.tryMoveTo(nextX, nextY);

        if (diagonal) {
            return diagonal;
        }

        const horizontalOnly = this.tryMoveTo(nextX, current.y);
        if (horizontalOnly) {
            return horizontalOnly;
        }

        const verticalOnly = this.tryMoveTo(current.x, nextY);
        if (verticalOnly) {
            return verticalOnly;
        }

        return current;
    }

    private tryMoveTo(nextX: number, nextY: number): Phaser.Math.Vector2 | null {
        const walkArea = this.getWalkArea();
        const footRect = this.createFootRect(nextX, nextY);

        if (!this.rectContainsRect(walkArea, footRect)) {
            return null;
        }

        for (const blocker of this.getBlockers()) {
            if (this.rectsIntersect(footRect, blocker)) {
                return null;
            }
        }

        return new Phaser.Math.Vector2(nextX, nextY);
    }

    private clampToWalkArea(): void {
        const walkArea = this.getWalkArea();
        const minX = walkArea.x + FOOT_WIDTH * 0.5;
        const maxX = walkArea.x + walkArea.width - FOOT_WIDTH * 0.5;
        const minY = walkArea.y + FOOT_HEIGHT;
        const maxY = walkArea.y + walkArea.height;

        this.logicalX = Phaser.Math.Clamp(this.logicalX, minX, maxX);
        this.logicalY = Phaser.Math.Clamp(this.logicalY, minY, maxY);
    }

    private updateJumpState(delta: number): void {
        if (!this.isJumping) {
            this.jumpOffsetY = 0;
            return;
        }

        this.jumpElapsedMs += delta;
        const progress = Phaser.Math.Clamp(this.jumpElapsedMs / JUMP_DURATION_MS, 0, 1);

        this.jumpOffsetY = -Math.sin(progress * Math.PI) * JUMP_HEIGHT;

        if (progress >= 1) {
            this.isJumping = false;
            this.jumpElapsedMs = 0;
            this.jumpOffsetY = 0;
        }
    }

    private applyRenderedPosition(): void {
        this.setPosition(this.logicalX, this.logicalY + this.jumpOffsetY);
    }

    private updateShadowVisual(): void {
        if (!this.shadowConfig.enabled) {
            this.shadow.setVisible(false);
            return;
        }

        this.shadow.setVisible(true);

        const foot = this.getFootBounds();
        const jumpProgress = this.getJumpProgress();
        const depthMultiplier = this.getShadowDepthScaleMultiplier();
        const jumpScaleMultiplier =
            this.shadowConfig.shrinkOnJump
                ? Phaser.Math.Linear(1, this.shadowConfig.jumpShrinkFactor, jumpProgress)
                : 1;
        const width =
            this.shadowConfig.width * depthMultiplier * jumpScaleMultiplier;
        const height =
            this.shadowConfig.height * depthMultiplier * jumpScaleMultiplier;
        const alpha =
            this.shadowConfig.fadeOnJump
                ? Phaser.Math.Linear(this.shadowConfig.alpha, this.shadowConfig.alpha * this.shadowConfig.jumpFadeFactor, jumpProgress)
                : this.shadowConfig.alpha;

        this.shadow.setPosition(
            foot.x + foot.width * 0.5 + this.shadowConfig.offsetX,
            foot.y + foot.height + this.shadowConfig.offsetY,
        );
        this.shadow.setDisplaySize(width, height);
        this.shadow.setFillStyle(this.shadowConfig.color, alpha);
        this.shadow.setVisible(true);
        this.shadow.setDepth(Math.max(1, this.depth - 1));
    }

    private getJumpProgress(): number {
        if (!this.isJumping || JUMP_HEIGHT <= 0) {
            return 0;
        }

        return Phaser.Math.Clamp(Math.abs(this.jumpOffsetY) / JUMP_HEIGHT, 0, 1);
    }

    private getShadowDepthScaleMultiplier(): number {
        if (!this.shadowConfig.scaleWithDepth || this.movementMode.type !== 'walk-plane') {
            return 1;
        }

        const walkArea = this.movementMode.walkArea;
        const farY = walkArea.y + FOOT_HEIGHT;
        const nearY = walkArea.y + walkArea.height;
        const t = Phaser.Math.Clamp((this.logicalY - farY) / Math.max(nearY - farY, 1), 0, 1);

        return Phaser.Math.Linear(
            this.shadowConfig.minScaleMultiplier,
            this.shadowConfig.maxScaleMultiplier,
            t,
        );
    }

    private applyVisualState(isMoving: boolean): void {
        if (this.isJumping) {
            this.anims.stop();
            this.setTexture(DANUBIA_ASSET_KEYS.jump);
            this.setFlipX(this.lastFacingDirection === 'left');
            return;
        }

        if (isMoving) {
            this.anims.play(DANUBIA_ASSET_KEYS.walkAnimation, true);
            return;
        }

        this.applyIdleState();
    }

    private getHorizontalInput(): -1 | 0 | 1 {
        const leftPressed = this.cursors.left.isDown || this.wasdKeys.left.isDown;
        const rightPressed = this.cursors.right.isDown || this.wasdKeys.right.isDown;
        const gamepadAxis = this.getGamepadHorizontalAxis();

        if (leftPressed && !rightPressed) {
            return -1;
        }

        if (rightPressed && !leftPressed) {
            return 1;
        }

        if (gamepadAxis <= -GAMEPAD_DEADZONE) {
            return -1;
        }

        if (gamepadAxis >= GAMEPAD_DEADZONE) {
            return 1;
        }

        return 0;
    }

    private getVerticalInput(): -1 | 0 | 1 {
        const upPressed = this.cursors.up.isDown || this.wasdKeys.up.isDown;
        const downPressed = this.cursors.down.isDown || this.wasdKeys.down.isDown;
        const gamepadAxis = this.getGamepadVerticalAxis();

        if (upPressed && !downPressed) {
            return -1;
        }

        if (downPressed && !upPressed) {
            return 1;
        }

        if (gamepadAxis <= -GAMEPAD_DEADZONE) {
            return -1;
        }

        if (gamepadAxis >= GAMEPAD_DEADZONE) {
            return 1;
        }

        return 0;
    }

    private isJumpPressed(): boolean {
        const keyboardJumpPressed =
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.wasdKeys.jump);

        if (keyboardJumpPressed) {
            return true;
        }

        const pad = this.scene.input.gamepad?.getPad(0);

        if (!pad) {
            this.wasGamepadJumpPressed = false;
            return false;
        }

        const isPressed = pad.buttons[0]?.pressed ?? false;
        const justPressed = isPressed && !this.wasGamepadJumpPressed;

        this.wasGamepadJumpPressed = isPressed;

        return justPressed;
    }

    private getGamepadHorizontalAxis(): number {
        const pad = this.scene.input.gamepad?.getPad(0);

        if (!pad) {
            return 0;
        }

        const axisValue = pad.leftStick.x;

        if (Math.abs(axisValue) >= GAMEPAD_DEADZONE) {
            return Phaser.Math.Clamp(axisValue, -1, 1);
        }

        if (pad.left || pad.right) {
            return pad.left ? -1 : 1;
        }

        return 0;
    }

    private getGamepadVerticalAxis(): number {
        const pad = this.scene.input.gamepad?.getPad(0);

        if (!pad) {
            return 0;
        }

        const axisValue = pad.leftStick.y;

        if (Math.abs(axisValue) >= GAMEPAD_DEADZONE) {
            return Phaser.Math.Clamp(axisValue, -1, 1);
        }

        if (pad.up || pad.down) {
            return pad.up ? -1 : 1;
        }

        return 0;
    }

    private applyPlatformAnimationState(
        body: Phaser.Physics.Arcade.Body,
        isMovingHorizontally: boolean,
    ): void {
        const isGrounded = body.blocked.down || body.touching.down;

        if (!isGrounded) {
            this.anims.stop();
            this.setTexture(DANUBIA_ASSET_KEYS.jump);
            this.setFlipX(this.lastFacingDirection === 'left');
            return;
        }

        if (isMovingHorizontally) {
            this.anims.play(DANUBIA_ASSET_KEYS.walkAnimation, true);
            return;
        }

        this.applyIdleState();
    }

    private applyIdleState(): void {
        this.anims.stop();
        this.setTexture(DANUBIA_ASSET_KEYS.idle);
        this.setFlipX(this.lastFacingDirection === 'left');
    }

    private setFacingDirection(direction: 'left' | 'right'): void {
        this.lastFacingDirection = direction;
        this.setFlipX(direction === 'left');
    }

    private applyScaleForDepth(): void {
        const walkSettings = this.movementMode;

        if (walkSettings.type !== 'walk-plane') {
            this.currentScale = DANUBIA_BASE_SCALE;
            this.setScale(this.currentScale);
            return;
        }

        const clampedY = Phaser.Math.Clamp(
            this.logicalY,
            walkSettings.walkArea.y + FOOT_HEIGHT,
            walkSettings.walkArea.y + walkSettings.walkArea.height,
        );
        let scale = DANUBIA_BASE_SCALE;

        if (clampedY < walkSettings.walkArea.baseScaleY) {
            const t = Phaser.Math.Clamp(
                (walkSettings.walkArea.baseScaleY - clampedY) /
                    Math.max(walkSettings.walkArea.baseScaleY - (walkSettings.walkArea.y + FOOT_HEIGHT), 1),
                0,
                1,
            );
            scale = Phaser.Math.Linear(DANUBIA_BASE_SCALE, DANUBIA_MIN_SCALE, t);
        } else if (clampedY > walkSettings.walkArea.baseScaleY) {
            const t = Phaser.Math.Clamp(
                (clampedY - walkSettings.walkArea.baseScaleY) /
                    Math.max(walkSettings.walkArea.y + walkSettings.walkArea.height - walkSettings.walkArea.baseScaleY, 1),
                0,
                1,
            );
            scale = Phaser.Math.Linear(DANUBIA_BASE_SCALE, DANUBIA_MAX_SCALE, t);
        }

        this.currentScale = Phaser.Math.Clamp(scale, DANUBIA_MIN_SCALE, DANUBIA_MAX_SCALE);
        this.setScale(this.currentScale);
    }

    private createFootRect(x: number, y: number): RectArea {
        const bottomY = y + this.displayHeight * 0.5 - FOOT_OFFSET_FROM_BOTTOM;

        return {
            x: x - FOOT_WIDTH * 0.5,
            y: bottomY - FOOT_HEIGHT,
            width: FOOT_WIDTH,
            height: FOOT_HEIGHT,
        };
    }

    private getWalkArea(): WalkArea {
        if (this.movementMode.type !== 'walk-plane') {
            throw new Error('Walk area is only available in walk-plane mode.');
        }

        return this.movementMode.walkArea;
    }

    private getBlockers(): RoomBlocker[] {
        if (this.movementMode.type !== 'walk-plane') {
            return [];
        }

        return this.movementMode.blockers;
    }

    private rectContainsRect(outer: RectArea, inner: RectArea): boolean {
        return (
            inner.x >= outer.x &&
            inner.y >= outer.y &&
            inner.x + inner.width <= outer.x + outer.width &&
            inner.y + inner.height <= outer.y + outer.height
        );
    }

    private rectsIntersect(a: RectArea, b: RectArea): boolean {
        return !(
            a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y
        );
    }

    private static createFallbackCursorKeys(scene: Phaser.Scene): Phaser.Types.Input.Keyboard.CursorKeys {
        const keyboard = scene.input.keyboard;

        if (!keyboard) {
            throw new Error('Keyboard input is required to control Danubia.');
        }

        return keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        }) as Phaser.Types.Input.Keyboard.CursorKeys;
    }
}

export { DANUBIA_ASSET_KEYS };
