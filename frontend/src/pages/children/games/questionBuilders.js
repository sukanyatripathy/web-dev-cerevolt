const QUESTION_COUNT = 6;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const pickN = (list, n) => shuffle(list).slice(0, n);

/* ---------- Word games ---------- */

const WORD_LIST = {
  1: [
    ['🐱', 'CAT'], ['🐶', 'DOG'], ['☀️', 'SUN'], ['🐷', 'PIG'],
    ['🚌', 'BUS'], ['🎩', 'HAT'], ['🐝', 'BEE'], ['🦊', 'FOX'],
    ['🐮', 'COW'], ['🦇', 'BAT'], ['🥚', 'EGG'], ['🚗', 'CAR'],
  ],
  2: [
    ['🐸', 'FROG'], ['🌙', 'MOON'], ['⭐', 'STAR'], ['🐟', 'FISH'],
    ['🦆', 'DUCK'], ['🌳', 'TREE'], ['🍰', 'CAKE'], ['🐦', 'BIRD'],
    ['🐻', 'BEAR'], ['🥛', 'MILK'], ['⚽', 'BALL'], ['🚢', 'SHIP'],
  ],
  3: [
    ['🍎', 'APPLE'], ['🐴', 'HORSE'], ['🐯', 'TIGER'], ['🍕', 'PIZZA'],
    ['🚆', 'TRAIN'], ['🐭', 'MOUSE'], ['🐍', 'SNAKE'], ['🦓', 'ZEBRA'],
    ['🍋', 'LEMON'], ['🤖', 'ROBOT'], ['🍌', 'BANANA'], ['🍊', 'ORANGE'],
  ],
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function letterOptions(answer) {
  const others = shuffle(ALPHABET.filter((l) => l !== answer)).slice(0, 2);
  return shuffle([answer, ...others]);
}

export function buildMissingLetter(level) {
  const list = WORD_LIST[level] || WORD_LIST[1];
  return pickN(list, QUESTION_COUNT).map(([emoji, word]) => {
    const pos = randInt(0, word.length - 1);
    const answer = word[pos];
    const masked = word
      .split('')
      .map((ch, i) => (i === pos ? '_' : ch))
      .join(' ');
    return {
      visual: emoji,
      prompt: masked,
      bigPrompt: true,
      options: letterOptions(answer),
      answer,
    };
  });
}

export function buildPictureToWord(level) {
  const list = WORD_LIST[level] || WORD_LIST[1];
  return pickN(list, QUESTION_COUNT).map(([emoji, word]) => {
    const others = shuffle(list.filter(([, w]) => w !== word))
      .slice(0, 2)
      .map(([, w]) => w);
    return {
      visual: emoji,
      prompt: 'What is this?',
      options: shuffle([word, ...others]),
      answer: word,
    };
  });
}

/* ---------- Math games ---------- */

const COUNT_RANGE = { 1: [1, 5], 2: [3, 10], 3: [6, 15] };
const COUNT_EMOJIS = ['🍎', '⭐', '🐟', '🎈', '🚗', '🌸'];

function numberOptions(answer) {
  const set = new Set([answer]);
  while (set.size < 4) {
    const delta = randInt(1, 4) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = answer + delta;
    if (candidate >= 1) set.add(candidate);
  }
  return shuffle([...set]);
}

export function buildCounting(level) {
  const [min, max] = COUNT_RANGE[level] || COUNT_RANGE[1];
  return Array.from({ length: QUESTION_COUNT }, () => {
    const count = randInt(min, max);
    const emoji = COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
    return {
      visual: emoji.repeat(count),
      compact: count > 5,
      prompt: 'How many can you count?',
      options: numberOptions(count),
      answer: count,
    };
  });
}

const COMPARE_RANGE = { 1: [1, 10], 2: [1, 50], 3: [10, 200] };

export function buildBiggerSmaller(level) {
  const [min, max] = COMPARE_RANGE[level] || COMPARE_RANGE[1];
  return Array.from({ length: QUESTION_COUNT }, () => {
    const a = randInt(min, max);
    let b = randInt(min, max);
    while (b === a) b = randInt(min, max);
    const wantBigger = level === 1 || Math.random() < 0.5;
    return {
      visual: '⚖️',
      prompt: `Which number is ${wantBigger ? 'bigger' : 'smaller'}?`,
      options: shuffle([a, b]),
      answer: wantBigger ? Math.max(a, b) : Math.min(a, b),
    };
  });
}

/* ---------- Science games ---------- */

const ANIMAL_PLANT = {
  1: [
    ['🐶', 'Animal', 'Dogs are animals. They can run and bark.'],
    ['🌹', 'Plant', 'Roses are plants. They grow from the soil.'],
    ['🐱', 'Animal', 'Cats are animals. They love to jump and play.'],
    ['🌳', 'Plant', 'Trees are plants. They give us shade and fruit.'],
    ['🐘', 'Animal', 'Elephants are the biggest land animals.'],
    ['🌻', 'Plant', 'Sunflowers are plants that turn toward the sun.'],
    ['🦋', 'Animal', 'Butterflies are insects, and insects are animals.'],
    ['🌵', 'Plant', 'Cactus plants can store water in their stems.'],
  ],
  2: [
    ['🥕', 'Plant', 'Carrots are the roots of a plant.'],
    ['🐙', 'Animal', 'An octopus is an animal with eight arms.'],
    ['🌽', 'Plant', 'Corn grows on a tall plant.'],
    ['🐝', 'Animal', 'Bees are animals. They help plants make fruit.'],
    ['🍎', 'Plant', 'Apples grow on trees, so they come from a plant.'],
    ['🐢', 'Animal', 'Turtles are animals with a hard shell.'],
    ['🌴', 'Plant', 'Palm trees are plants that grow in warm places.'],
    ['🦀', 'Animal', 'Crabs are animals that walk sideways.'],
  ],
  3: [
    ['🐋', 'Animal', 'Whales are animals called mammals, not fish.'],
    ['🌾', 'Plant', 'Wheat and rice are grass plants we use as food.'],
    ['🐍', 'Animal', 'Snakes are animals that have no legs.'],
    ['🥦', 'Plant', 'Broccoli is a plant. We eat its flowers.'],
    ['🕷️', 'Animal', 'Spiders are animals with eight legs.'],
    ['🍇', 'Plant', 'Grapes grow on a climbing plant called a vine.'],
    ['🦈', 'Animal', 'Sharks are animals that live in the sea.'],
    ['🌶️', 'Plant', 'Chilli is a fruit that grows on a plant.'],
  ],
};

export function buildAnimalOrPlant(level) {
  const list = ANIMAL_PLANT[level] || ANIMAL_PLANT[1];
  return pickN(list, QUESTION_COUNT).map(([visual, answer, fact]) => ({
    visual,
    prompt: 'Is it an animal or a plant?',
    options: ['Animal', 'Plant'],
    answer,
    fact,
  }));
}

const HABITAT = {
  1: [
    ['🐟', 'Water', 'Fish live in water and breathe with gills.'],
    ['🐦', 'Sky', 'Birds use their wings to fly in the sky.'],
    ['🐄', 'Land', 'Cows live on land, on farms and in fields.'],
    ['🐬', 'Water', 'Dolphins live in the sea and are very clever.'],
    ['🦅', 'Sky', 'Eagles can fly very high in the sky.'],
    ['🐘', 'Land', 'Elephants live on land and love water for a bath.'],
  ],
  2: [
    ['🐙', 'Water', 'Octopuses live in the sea.'],
    ['🦋', 'Sky', 'Butterflies fly from flower to flower.'],
    ['🦁', 'Land', 'Lions live on land in warm grasslands.'],
    ['🦈', 'Water', 'Sharks live in the sea.'],
    ['🦉', 'Sky', 'Owls fly at night to find food.'],
    ['🐯', 'Land', 'Tigers live on land in forests.'],
  ],
  3: [
    ['🐋', 'Water', 'Whales live in the ocean, but breathe air.'],
    ['🦇', 'Sky', 'Bats are the only mammals that can really fly.'],
    ['🐪', 'Land', 'Camels live on land in hot, dry deserts.'],
    ['🐡', 'Water', 'Pufferfish live in the sea.'],
    ['🦜', 'Sky', 'Parrots are colourful birds that fly in forests.'],
    ['🦒', 'Land', 'Giraffes are the tallest animals on land.'],
  ],
};

export function buildHabitat(level) {
  const list = HABITAT[level] || HABITAT[1];
  return pickN(list, QUESTION_COUNT).map(([visual, answer, fact]) => ({
    visual,
    prompt: 'Where does it live?',
    options: ['Water', 'Land', 'Sky'],
    answer,
    fact,
  }));
}