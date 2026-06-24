import type { DialogueSequence } from '../game/types';

export const homeDialogueTest: DialogueSequence = [
    {
        mode: 'narration',
        text: '29 de junho de 2026.',
        lockMovement: true,
    },
    {
        mode: 'narration',
        text: 'No aniversário de Danúbia, algo muito estranho aconteceu.',
        lockMovement: true,
    },
    {
        mode: 'narration',
        text: 'Todo mundo desapareceu.',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Gente?',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Rafa? Drogo? Alguém?',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
    {
        mode: 'bubble',
        text: 'Nove animais nessa casa e nenhum barulho.',
        lockMovement: true,
    },
    {
        mode: 'bubble',
        text: 'Ou eu ainda estou dormindo... ou aconteceu alguma coisa muito séria.',
        lockMovement: true,
    },
];
