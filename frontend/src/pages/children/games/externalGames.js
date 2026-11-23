const URLS = {
  
  digipuzzleMemory:
    'https://www.digipuzzle.net/digipuzzle/kids/puzzles/puzzle_memory.htm?language=english&linkback=../../../main/kids/index.htm',
  digipuzzleWordsearch:
    'https://www.digipuzzle.net/digipuzzle/kids/puzzles/puzzle_wordsearch.htm?language=english&linkback=../../../main/kids/index.htm',
  digipuzzleTicTacToe:
    'https://www.digipuzzle.net/minigames/tictactoe/tictactoe.htm?language=english&linkback=../../main/logicpuzzles/index.htm',
  digipuzzlePattern:
    'https://www.digipuzzle.net/kids/space/puzzles/patterns.htm?language=english&linkback=../../../main/logicpuzzles/index.htm',
  digipuzzleSudoku:
    'https://www.digipuzzle.net/digipuzzle/sport/puzzles/sudoku.htm?language=english&linkback=../../../main/logicpuzzles/index.htm',
  digipuzzleBlocks:
    'https://www.digipuzzle.net/digipuzzle/kids/puzzles/puzzle_blockpuzzle.htm?language=english&linkback=../../../main/kids/index.htm',

 
  playpuzzleWords: '',
  playpuzzleNumbers: '',
  playpuzzleMemory: '',
  playpuzzleSequence: '',
  happyLearningWords: '',
  happyLearningScience: '',
  skidoshMath: '',
  skidoshMemory: '',
};

const ADS_NOTICE = 'This website may show ads. Please play with a grown-up nearby.';

const isSafeUrl = (url) => typeof url === 'string' && url.startsWith('https://');

const make = (id, title, emoji, description, sourceName, url, notice = '') => ({
  id,
  type: 'external',
  title,
  emoji,
  description,
  sourceName,
  url,
  notice,
});

const RAW = {
  'word-puzzle': [
    make(
      'digipuzzle-wordsearch',
      'Word Search',
      '🔎',
      'Find the hidden words. Opens in a new tab.',
      'Digipuzzle',
      URLS.digipuzzleWordsearch,
      ADS_NOTICE
    ),
    make(
      'playpuzzle-words',
      'Word Scramble',
      '🔤',
      'A word game from PlayPuzzle Kids. Opens in a new tab.',
      'PlayPuzzle Kids',
      URLS.playpuzzleWords
    ),
    make(
      'happylearning-words',
      'Word Hunt',
      '📖',
      'A word game from Happy Learning TV. Opens in a new tab.',
      'Happy Learning TV',
      URLS.happyLearningWords
    ),
  ],

  'math-magic': [
    make(
      'digipuzzle-sudoku',
      'Sport Sudoku',
      '🏅',
      'A picture Sudoku puzzle. Opens in a new tab.',
      'Digipuzzle',
      URLS.digipuzzleSudoku,
      ADS_NOTICE
    ),
    make(
      'digipuzzle-blocks',
      'Block Puzzle',
      '🧱',
      'Fit the blocks together. Opens in a new tab.',
      'Digipuzzle',
      URLS.digipuzzleBlocks,
      ADS_NOTICE
    ),
    make(
      'digipuzzle-tictactoe',
      'Tic-Tac-Toe',
      '⭕',
      'Plan your moves and get three in a row. Opens in a new tab.',
      'Digipuzzle',
      URLS.digipuzzleTicTacToe,
      ADS_NOTICE
    ),
    make(
      'playpuzzle-numbers',
      'Number Puzzle',
      '🔢',
      'A number game from PlayPuzzle Kids. Opens in a new tab.',
      'PlayPuzzle Kids',
      URLS.playpuzzleNumbers
    ),
    make(
      'skidosh-math',
      'Speed Math',
      '⚡',
      'A quick math game from Skidosh. Opens in a new tab.',
      'Skidosh',
      URLS.skidoshMath
    ),
  ],

  'memory-match': [
    make(
      'digipuzzle-memory',
      'Memory Game',
      '🃏',
      'Flip cards and find the pairs. Opens in a new tab.',
      'Digipuzzle',
      URLS.digipuzzleMemory,
      ADS_NOTICE
    ),
    make(
      'digipuzzle-pattern',
      'Pattern Puzzle',
      '🔷',
      'Spot the pattern and finish it. Opens in a new tab.',
      'Digipuzzle',
      URLS.digipuzzlePattern,
      ADS_NOTICE
    ),
    make(
      'playpuzzle-memory',
      'Memory Match Online',
      '🧠',
      'A memory game from PlayPuzzle Kids. Opens in a new tab.',
      'PlayPuzzle Kids',
      URLS.playpuzzleMemory
    ),
    make(
      'skidosh-memory',
      'Memory Matrix',
      '🧩',
      'A memory puzzle from Skidosh. Opens in a new tab.',
      'Skidosh',
      URLS.skidoshMemory
    ),
  ],

  'science-explorer': [
    make(
      'playpuzzle-sequence',
      'Sequence Fixer',
      '🧬',
      'A science sequence game from PlayPuzzle Kids. Opens in a new tab.',
      'PlayPuzzle Kids',
      URLS.playpuzzleSequence
    ),
    make(
      'happylearning-science',
      'Science Quiz Online',
      '🧪',
      'A science quiz from Happy Learning TV. Opens in a new tab.',
      'Happy Learning TV',
      URLS.happyLearningScience
    ),
  ],
};


export const EXTERNAL_GAMES = Object.fromEntries(
  Object.entries(RAW).map(([key, list]) => [key, list.filter((game) => isSafeUrl(game.url))])
);