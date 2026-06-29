import Phaser from 'phaser';

type MusicSound = Phaser.Sound.BaseSound & {
    volume?: number;
    setVolume?: (volume: number) => MusicSound;
};

let currentMusic: MusicSound | undefined;
let currentKey: string | undefined;
let currentFadeTween: Phaser.Tweens.Tween | undefined;

function setVolume(sound: MusicSound, volume: number): void {
    if (typeof sound.setVolume === 'function') {
        sound.setVolume(volume);
        return;
    }

    sound.volume = volume;
}

function getVolume(sound: MusicSound): number {
    return typeof sound.volume === 'number' ? sound.volume : 1;
}

export function playMusic(
    scene: Phaser.Scene,
    key: string,
    options?: {
        volume?: number;
        fadeInMs?: number;
        fadeOutMs?: number;
    },
): void {
    const targetVolume = options?.volume ?? 0.45;
    const fadeInMs = options?.fadeInMs ?? 900;
    const fadeOutMs = options?.fadeOutMs ?? 700;

    if (currentKey === key && currentMusic?.isPlaying) {
        return;
    }

    currentFadeTween?.stop();
    currentFadeTween = undefined;

    const previousMusic = currentMusic;

    if (previousMusic?.isPlaying) {
        const proxy = { volume: getVolume(previousMusic) };

        scene.tweens.add({
            targets: proxy,
            volume: 0,
            duration: fadeOutMs,
            ease: 'Sine.Out',
            onUpdate: () => {
                setVolume(previousMusic, proxy.volume);
            },
            onComplete: () => {
                previousMusic.stop();
                previousMusic.destroy();
            },
        });
    }

    const nextMusic = scene.sound.add(key, {
        loop: true,
        volume: 0,
    }) as MusicSound;

    currentMusic = nextMusic;
    currentKey = key;

    nextMusic.play();

    const proxy = { volume: 0 };

    currentFadeTween = scene.tweens.add({
        targets: proxy,
        volume: targetVolume,
        duration: fadeInMs,
        ease: 'Sine.Out',
        onUpdate: () => {
            setVolume(nextMusic, proxy.volume);
        },
        onComplete: () => {
            currentFadeTween = undefined;
            setVolume(nextMusic, targetVolume);
        },
    });
}

export function stopMusic(
    scene: Phaser.Scene,
    options?: {
        fadeOutMs?: number;
    },
): void {
    if (!currentMusic) {
        return;
    }

    currentFadeTween?.stop();
    currentFadeTween = undefined;

    const musicToStop = currentMusic;
    const fadeOutMs = options?.fadeOutMs ?? 800;
    const proxy = { volume: getVolume(musicToStop) };

    currentMusic = undefined;
    currentKey = undefined;

    scene.tweens.add({
        targets: proxy,
        volume: 0,
        duration: fadeOutMs,
        ease: 'Sine.Out',
        onUpdate: () => {
            setVolume(musicToStop, proxy.volume);
        },
        onComplete: () => {
            musicToStop.stop();
            musicToStop.destroy();
        },
    });
}