import MemoryMatch from './MemoryMatch';
import MathMagic from './MathMagic';
import WordPuzzle from './WordPuzzle';
import ScienceExplorer from './ScienceExplorer';
import ChoiceGame from './ChoiceGame';
import SequenceMemory from './SequenceMemory';
import { EXTERNAL_GAMES } from './externalGames';
import {
  buildMissingLetter,
  buildPictureToWord,
  buildCounting,
  buildBiggerSmaller,
  buildAnimalOrPlant,
  buildHabitat,
} from './questionBuilders';

const levels = (easy, medium, hard) => [
  { value: 1, label: 'Easy', emoji: '🌱', hint: easy },
  { value: 2, label: 'Medium', emoji: '🌼', hint: medium },
  { value: 3, label: 'Hard', emoji: '🌳', hint: hard },
];

const choiceSummary = (r) =>
  `You got ${r.metrics.first_try_correct} of ${r.metrics.total_questions} on the first try!`;

export const CATEGORIES = {
  'word-puzzle': {
    title: 'Word Puzzle',
    intro: 'Pick a word game to play!',
    games: [
      {
        id: 'unscramble',
        title: 'Unscramble Words',
        emoji: '🔀',
        description: 'Put the letters in the right order!',
        Component: WordPuzzle,
        levels: levels('3-letter words', '4-letter words', '5-6 letter words'),
        summary: (r) =>
          `You spelled ${r.metrics.first_try_correct} of ${r.metrics.total_words} words on the first try!`,
      },
      {
        id: 'missing-letter',
        title: 'Missing Letter',
        emoji: '✏️',
        description: 'Find the letter that is missing!',
        Component: ChoiceGame,
        props: { buildQuestions: buildMissingLetter },
        levels: levels('3-letter words', '4-letter words', '5-6 letter words'),
        summary: choiceSummary,
      },
      {
        id: 'picture-word',
        title: 'Picture to Word',
        emoji: '🖼️',
        description: 'Match the picture with its word!',
        Component: ChoiceGame,
        props: { buildQuestions: buildPictureToWord },
        levels: levels('3-letter words', '4-letter words', '5-6 letter words'),
        summary: choiceSummary,
      },
    ],
  },

  'math-magic': {
    title: 'Math Magic',
    intro: 'Pick a number game to play!',
    games: [
      {
        id: 'quick-math',
        title: 'Quick Math',
        emoji: '➕',
        description: 'Add and take away numbers!',
        Component: MathMagic,
        levels: levels('Adding up to 10', 'Add and take away', 'Bigger numbers'),
        summary: choiceSummary,
      },
      {
        id: 'counting-fun',
        title: 'Counting Fun',
        emoji: '🍎',
        description: 'Count the things you see!',
        Component: ChoiceGame,
        props: { buildQuestions: buildCounting },
        levels: levels('Count up to 5', 'Count up to 10', 'Count up to 15'),
        summary: choiceSummary,
      },
      {
        id: 'bigger-smaller',
        title: 'Bigger or Smaller',
        emoji: '⚖️',
        description: 'Which number is bigger or smaller?',
        Component: ChoiceGame,
        props: { buildQuestions: buildBiggerSmaller },
        levels: levels('Numbers up to 10', 'Numbers up to 50', 'Numbers up to 200'),
        summary: choiceSummary,
      },
    ],
  },

  'memory-match': {
    title: 'Memory Match',
    intro: 'Pick a memory game to play!',
    games: [
      {
        id: 'animal-cards',
        title: 'Animal Cards',
        emoji: '🐶',
        description: 'Find the matching animal cards!',
        Component: MemoryMatch,
        props: { theme: 'animals' },
        levels: levels('3 pairs', '6 pairs', '8 pairs'),
        summary: (r) =>
          `You finished in ${r.metrics.moves} moves and ${r.duration_seconds} seconds.`,
      },
      {
        id: 'fruit-cards',
        title: 'Fruit Cards',
        emoji: '🍎',
        description: 'Find the matching fruit cards!',
        Component: MemoryMatch,
        props: { theme: 'fruits' },
        levels: levels('3 pairs', '6 pairs', '8 pairs'),
        summary: (r) =>
          `You finished in ${r.metrics.moves} moves and ${r.duration_seconds} seconds.`,
      },
      {
        id: 'color-sequence',
        title: 'Color Sequence',
        emoji: '🌈',
        description: 'Watch the colors, then tap them in order!',
        Component: SequenceMemory,
        levels: levels('Start with 2 colors', 'Start with 3 colors', 'Start with 4 colors'),
        summary: (r) =>
          `You remembered ${r.metrics.first_try_rounds} of ${r.metrics.rounds} rounds on the first try!`,
      },
    ],
  },

  'science-explorer': {
    title: 'Science Explorer',
    intro: 'Pick a science game to play!',
    games: [
      {
        id: 'science-quiz',
        title: 'Science Quiz',
        emoji: '🔬',
        description: 'Answer fun science questions!',
        Component: ScienceExplorer,
        levels: levels('Animals, plants, sky', 'Body, space, nature', 'Bigger science ideas'),
        summary: choiceSummary,
      },
      {
        id: 'animal-or-plant',
        title: 'Animal or Plant?',
        emoji: '🌿',
        description: 'Is it an animal or a plant?',
        Component: ChoiceGame,
        props: { buildQuestions: buildAnimalOrPlant },
        levels: levels('Easy to spot', 'A little trickier', 'Surprising ones'),
        summary: choiceSummary,
      },
      {
        id: 'where-do-i-live',
        title: 'Where Do I Live?',
        emoji: '🌍',
        description: 'Water, land or sky?',
        Component: ChoiceGame,
        props: { buildQuestions: buildHabitat },
        levels: levels('Well-known animals', 'More animals', 'Special animals'),
        summary: choiceSummary,
      },
            {
        id: 'nasa-space-place',
        type: 'external',
        title: 'NASA Space Place Games',
        emoji: '🚀',
        description: 'Space games from NASA. Opens in a new tab.',
        url: 'https://spaceplace.nasa.gov/menu/play/games',
        sourceName: 'NASA Space Place',
      },
    ],
  },
};

Object.entries(EXTERNAL_GAMES).forEach(([categoryKey, list]) => {
  if (CATEGORIES[categoryKey]) {
    CATEGORIES[categoryKey].games.push(...list);
  }
});