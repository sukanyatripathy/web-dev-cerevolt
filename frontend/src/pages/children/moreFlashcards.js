const moreFlashcards = [
  // ===== Nature =====
  { id: 'nat-1', category: 'Nature', emoji: '🌿', question: 'Which part of a plant makes food using sunlight?', answer: 'Leaves', fact: 'Leaves use sunlight, water and air to make food for the plant.' },
  { id: 'nat-2', category: 'Nature', emoji: '🐋', question: 'What is the biggest animal in the world?', answer: 'Blue whale', fact: 'The blue whale is the biggest animal that has ever lived on Earth.' },
  { id: 'nat-3', category: 'Nature', emoji: '🐛', question: 'What does a caterpillar turn into?', answer: 'A butterfly', fact: 'A caterpillar rests inside a chrysalis and changes into a butterfly or moth.' },
  { id: 'nat-4', category: 'Nature', emoji: '🦒', question: 'Which is the tallest animal on land?', answer: 'Giraffe', fact: 'A giraffe\'s long neck helps it eat leaves from tall trees.' },
  { id: 'nat-5', category: 'Nature', emoji: '🦘', question: 'What is a baby kangaroo called?', answer: 'Joey', fact: 'A baby kangaroo grows safely in its mother\'s pouch.' },
  { id: 'nat-6', category: 'Nature', emoji: '🐆', question: 'Which is the fastest animal on land?', answer: 'Cheetah', fact: 'A cheetah can sprint very fast, but only for a short time.' },
  { id: 'nat-7', category: 'Nature', emoji: '🌈', question: 'How many colours are there in a rainbow?', answer: '7', fact: 'Rainbows appear when sunlight passes through tiny raindrops. Remember VIBGYOR!' },
  { id: 'nat-8', category: 'Nature', emoji: '🐯', question: 'What is the national animal of India?', answer: 'Tiger', fact: 'Royal Bengal tigers live in the Sundarbans, near Kolkata.' },
  { id: 'nat-9', category: 'Nature', emoji: '🦚', question: 'What is the national bird of India?', answer: 'Peacock', fact: 'Only male peacocks have the big, colourful tail feathers.' },

  // ===== Universe =====
  { id: 'uni-1', category: 'Universe', emoji: '☀️', question: 'What is at the centre of our solar system?', answer: 'The Sun', fact: 'The Sun is a star. It gives us light and warmth.' },
  { id: 'uni-2', category: 'Universe', emoji: '🪐', question: 'Which is the biggest planet in our solar system?', answer: 'Jupiter', fact: 'More than 1,000 Earths could fit inside Jupiter.' },
  { id: 'uni-3', category: 'Universe', emoji: '🌙', question: 'What goes around the Earth and shines at night?', answer: 'The Moon', fact: 'The Moon takes about a month to go around the Earth.' },
  { id: 'uni-4', category: 'Universe', emoji: '💍', question: 'Which planet is famous for its beautiful rings?', answer: 'Saturn', fact: 'Saturn\'s rings are made of pieces of ice and rock.' },
  { id: 'uni-5', category: 'Universe', emoji: '🔥', question: 'Which planet is closest to the Sun?', answer: 'Mercury', fact: 'Mercury is the smallest planet and zooms around the Sun very fast.' },
  { id: 'uni-6', category: 'Universe', emoji: '🌌', question: 'What is the name of the galaxy we live in?', answer: 'The Milky Way', fact: 'Our galaxy has billions of stars. The Sun is one of them.' },
  { id: 'uni-7', category: 'Universe', emoji: '👨‍🚀', question: 'Who was the first person to walk on the Moon?', answer: 'Neil Armstrong', fact: 'He stepped onto the Moon in the year 1969.' },
  { id: 'uni-8', category: 'Universe', emoji: '🚀', question: 'Which country\'s Chandrayaan-3 landed near the Moon\'s south pole in 2023?', answer: 'India', fact: 'Chandrayaan-3 was a big success for Indian scientists.' },

  // ===== Cricket =====
  { id: 'cri-1', category: 'Cricket', emoji: '🏏', question: 'How many players of one team play on the field in cricket?', answer: '11', fact: 'One team bats while the other team fields.' },
  { id: 'cri-2', category: 'Cricket', emoji: '🔢', question: 'How many balls are there in one over?', answer: '6', fact: 'After one over, a different bowler bowls from the other end.' },
  { id: 'cri-3', category: 'Cricket', emoji: '🪵', question: 'What are the three wooden sticks behind the batter called?', answer: 'Stumps', fact: 'Three stumps with two bails on top make the wicket.' },
  { id: 'cri-4', category: 'Cricket', emoji: '🎯', question: 'How many runs do you get if the ball crosses the boundary without bouncing?', answer: '6 runs (a six)', fact: 'If the ball bounces first and then crosses the boundary, it is a four.' },
  { id: 'cri-5', category: 'Cricket', emoji: '🦆', question: 'What do we call it when a batter is out for zero runs?', answer: 'A duck', fact: 'It is called a duck because a zero looks like a duck\'s egg.' },
  { id: 'cri-6', category: 'Cricket', emoji: '🎩', question: 'What is it called when a bowler takes three wickets with three balls in a row?', answer: 'A hat-trick', fact: 'A hat-trick is very hard to do and very exciting to watch.' },
  { id: 'cri-7', category: 'Cricket', emoji: '🏆', question: 'Which team did India beat in the 1983 World Cup final?', answer: 'West Indies', fact: 'Kapil Dev was India\'s captain when India won in 1983.' },

  // ===== Football =====
  { id: 'foo-1', category: 'Football', emoji: '⚽', question: 'How many players of one team play on the pitch in football?', answer: '11', fact: 'Ten players and one goalkeeper make a team of eleven.' },
  { id: 'foo-2', category: 'Football', emoji: '🧤', question: 'Which player is allowed to use hands inside their own penalty area?', answer: 'The goalkeeper', fact: 'The goalkeeper wears different coloured gloves and shirt.' },
  { id: 'foo-3', category: 'Football', emoji: '🟨', question: 'What does a yellow card mean in football?', answer: 'A warning', fact: 'A red card means the player must leave the match.' },
  { id: 'foo-4', category: 'Football', emoji: '⏱️', question: 'How long is a normal football match?', answer: '90 minutes', fact: 'There are two halves of 45 minutes, plus extra time for stops.' },
  { id: 'foo-5', category: 'Football', emoji: '🌍', question: 'How often is the FIFA World Cup held?', answer: 'Every 4 years', fact: 'Many countries play matches to qualify for the World Cup.' },
  { id: 'foo-6', category: 'Football', emoji: '🇧🇷', question: 'Which country has won the most FIFA World Cup titles?', answer: 'Brazil', fact: 'Brazil is famous for its skilful and joyful football.' },

  // ===== Music =====
  { id: 'mus-1', category: 'Music', emoji: '🎼', question: 'How many main notes are there in Sa Re Ga Ma?', answer: '7', fact: 'Sa, Re, Ga, Ma, Pa, Dha, Ni are the seven notes.' },
  { id: 'mus-2', category: 'Music', emoji: '🎹', question: 'Which instrument has black and white keys?', answer: 'Piano', fact: 'A piano has 88 keys.' },
  { id: 'mus-3', category: 'Music', emoji: '🥁', question: 'Which Indian instrument is a pair of drums played with the hands?', answer: 'Tabla', fact: 'The two drums of the tabla are called dayan and bayan.' },
  { id: 'mus-4', category: 'Music', emoji: '🎻', question: 'Which instrument is played with a bow and held under the chin?', answer: 'Violin', fact: 'A violin has four strings.' },
  { id: 'mus-5', category: 'Music', emoji: '🎤', question: 'What do we call a group of people who sing together?', answer: 'A choir', fact: 'A choir sings in parts, like high voices and low voices.' },
  { id: 'mus-6', category: 'Music', emoji: '🇮🇳', question: 'Who wrote India\'s national anthem, Jana Gana Mana?', answer: 'Rabindranath Tagore', fact: 'Tagore, a poet from Bengal, also won the Nobel Prize in 1913.' },

  // ===== Games =====
  { id: 'gam-1', category: 'Games', emoji: '♟️', question: 'How many squares are there on a chess board?', answer: '64', fact: 'A chess board has 8 rows and 8 columns of squares.' },
  { id: 'gam-2', category: 'Games', emoji: '🏸', question: 'Which sport is played with a shuttlecock?', answer: 'Badminton', fact: 'A shuttlecock is also called a birdie.' },
  { id: 'gam-3', category: 'Games', emoji: '🤼', question: 'How many players of one team play on the court in kabaddi?', answer: '7', fact: 'A raider keeps chanting "kabaddi, kabaddi" in one breath.' },
  { id: 'gam-4', category: 'Games', emoji: '🎾', question: 'In tennis, what is a score of zero called?', answer: 'Love', fact: 'Tennis scores go love, 15, 30, 40.' },

  // ===== Science =====
  { id: 'sci-1', category: 'Science', emoji: '🧊', question: 'What are the three states of matter?', answer: 'Solid, liquid and gas', fact: 'Ice is a solid, water is a liquid and steam is a gas.' },
  { id: 'sci-2', category: 'Science', emoji: '♨️', question: 'What do we call it when the Sun heats water and it turns into water vapour?', answer: 'Evaporation', fact: 'Puddles dry up on a sunny day because of evaporation.' },
  { id: 'sci-3', category: 'Science', emoji: '🌧️', question: 'What is the name of water\'s journey from the sea to the clouds, then rain, and back again?', answer: 'The water cycle', fact: 'The same water has been going around the Earth for millions of years.' },
  { id: 'sci-4', category: 'Science', emoji: '🫁', question: 'Which body part helps us breathe?', answer: 'Lungs', fact: 'We have two lungs, and they work all day and night.' },
  { id: 'sci-5', category: 'Science', emoji: '🦴', question: 'What is the group of all the bones in our body called?', answer: 'The skeleton', fact: 'An adult has 206 bones.' },
  { id: 'sci-6', category: 'Science', emoji: '👀', question: 'What are our five senses?', answer: 'Sight, hearing, smell, taste and touch', fact: 'Our eyes, ears, nose, tongue and skin help us sense the world.' },
  { id: 'sci-7', category: 'Science', emoji: '🧲', question: 'What are the two ends of a magnet called?', answer: 'North pole and south pole', fact: 'Opposite poles attract each other. Same poles push each other away.' },
  { id: 'sci-8', category: 'Science', emoji: '🍎', question: 'What force pulls things down towards the Earth?', answer: 'Gravity', fact: 'Gravity is why an apple falls down from a tree.' },
  { id: 'sci-9', category: 'Science', emoji: '🪞', question: 'What do we call it when light bounces off a mirror?', answer: 'Reflection', fact: 'Reflection is how you can see yourself in a mirror.' },
  { id: 'sci-10', category: 'Science', emoji: '🌡️', question: 'Which tool do we use to measure temperature?', answer: 'A thermometer', fact: 'Water freezes at 0 degrees Celsius and boils at 100 degrees Celsius.' },
  { id: 'sci-11', category: 'Science', emoji: '⚡', question: 'Which travels faster, light or sound?', answer: 'Light', fact: 'We see lightning before we hear the thunder.' },
  { id: 'sci-12', category: 'Science', emoji: '💨', question: 'Which gas do we breathe out?', answer: 'Carbon dioxide', fact: 'Plants take in carbon dioxide and give out oxygen.' },

  // ===== Mathematics =====
  { id: 'mat-1', category: 'Mathematics', emoji: '🔺', question: 'How many sides does a triangle have?', answer: '3', fact: 'A triangle also has 3 corners.' },
  { id: 'mat-2', category: 'Mathematics', emoji: '⬜', question: 'Which shape has 4 equal sides and 4 square corners?', answer: 'A square', fact: 'A square has four equal sides and four right angles.' },
  { id: 'mat-3', category: 'Mathematics', emoji: '⭕', question: 'What is the line that goes across a circle through its centre called?', answer: 'Diameter', fact: 'The radius is half of the diameter.' },
  { id: 'mat-4', category: 'Mathematics', emoji: '🐝', question: 'How many sides does a hexagon have?', answer: '6', fact: 'The cells of a honeycomb made by bees are hexagons.' },
  { id: 'mat-5', category: 'Mathematics', emoji: '🕐', question: 'How many minutes are there in one hour?', answer: '60 minutes', fact: 'There are also 60 seconds in one minute.' },
  { id: 'mat-6', category: 'Mathematics', emoji: '📅', question: 'How many months of the year have 31 days?', answer: '7 months', fact: 'January, March, May, July, August, October and December have 31 days.' },
  { id: 'mat-7', category: 'Mathematics', emoji: '2️⃣', question: 'What do we call numbers like 2, 4, 6 and 8?', answer: 'Even numbers', fact: 'Even numbers can be shared equally between two people.' },
  { id: 'mat-8', category: 'Mathematics', emoji: '🍕', question: 'A pizza is cut into 4 equal pieces. What is one piece called?', answer: 'A quarter (one-fourth)', fact: 'Two quarters make one half.' },
  { id: 'mat-9', category: 'Mathematics', emoji: '📏', question: 'How many centimetres are there in one metre?', answer: '100 centimetres', fact: 'The word "centi" means one hundredth.' },
  { id: 'mat-10', category: 'Mathematics', emoji: '📐', question: 'How many degrees is a right angle?', answer: '90 degrees', fact: 'The corner of a book makes a right angle.' },
  { id: 'mat-11', category: 'Mathematics', emoji: '🦋', question: 'What do we call a shape that looks the same on both sides when folded in half?', answer: 'Symmetrical', fact: 'A butterfly\'s wings are symmetrical.' },
  { id: 'mat-12', category: 'Mathematics', emoji: '🔢', question: 'In the number 352, what is the value of the digit 5?', answer: '50 (fifty)', fact: 'The digit 5 is in the tens place, so it means 5 tens.' },

  // ===== English Grammar =====
  { id: 'eng-1', category: 'English', emoji: '🐶', question: 'What do we call a naming word, like "dog" or "Kolkata"?', answer: 'A noun', fact: 'Nouns name people, animals, places and things.' },
  { id: 'eng-2', category: 'English', emoji: '🏃', question: 'What do we call a doing word, like "run" or "jump"?', answer: 'A verb', fact: 'Every sentence needs a verb.' },
  { id: 'eng-3', category: 'English', emoji: '🎨', question: 'What do we call a describing word, like "red" or "tall"?', answer: 'An adjective', fact: 'Adjectives tell us more about a noun, like a "big" dog.' },
  { id: 'eng-4', category: 'English', emoji: '🙋', question: 'What do we call words like "he", "she" and "they"?', answer: 'Pronouns', fact: 'A pronoun takes the place of a noun.' },
  { id: 'eng-5', category: 'English', emoji: '🔤', question: 'How many vowels are there in the English alphabet?', answer: '5 (a, e, i, o, u)', fact: 'All the other 21 letters are consonants.' },
  { id: 'eng-6', category: 'English', emoji: '❓', question: 'Which punctuation mark do we put at the end of a question?', answer: 'A question mark (?)', fact: 'A full stop (.) ends a normal sentence.' },
  { id: 'eng-7', category: 'English', emoji: '🔠', question: 'What kind of letter do we use at the start of a sentence?', answer: 'A capital letter', fact: 'We also use capital letters for names, like Rohan or India.' },
  { id: 'eng-8', category: 'English', emoji: '🧒', question: 'What is the plural of "child"?', answer: 'Children', fact: 'Some plurals are special. We do not say "childs".' },
  { id: 'eng-9', category: 'English', emoji: '🚶', question: 'What is the past tense of "go"?', answer: 'Went', fact: 'We say "I went to school yesterday".' },
  { id: 'eng-10', category: 'English', emoji: '🐢', question: 'What do we call a word that tells us how something is done, like "quickly" or "slowly"?', answer: 'An adverb', fact: 'Many adverbs end with "-ly".' },
  { id: 'eng-11', category: 'English', emoji: '🐕', question: 'Choose the correct word: "___ dog is very cute." (there / their)', answer: 'Their', fact: '"Their" shows that something belongs to them. "There" is a place.' },
  { id: 'eng-12', category: 'English', emoji: '🍎', question: 'Which is correct: "a apple" or "an apple"?', answer: 'An apple', fact: 'We use "an" before words that start with a vowel sound.' },

];

export default moreFlashcards;