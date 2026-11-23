"""Question bank for science, language, colours and observation.

Pure data plus small builders (no Django imports). The seed_more command
loads everything from all_questions() into the database. Safe to re-run.
Every question is built the same way: the correct answer is placed at a
random but repeatable position, so the data never changes between runs.
"""
import random

LANGS = ("en", "hi", "bn")


def _rng(*parts):
    return random.Random("|".join(str(p) for p in parts))


def _build(rng, text, correct, others, visual=""):
    """Return a question dict with the correct answer at a random spot."""
    options = [correct]
    for o in others:
        if o not in options:
            options.append(o)
    options = options[:4]
    rng.shuffle(options)
    return {
        "text": text,
        "visual": visual,
        "options": options,
        "correct_index": options.index(correct),
    }


# ---------------------------------------------------------------------------
# SCIENCE: (level, text, [correct, wrong, wrong, wrong]) - same order in
# every language: 10 questions for each of levels 1, 2 and 3.
# ---------------------------------------------------------------------------
SCIENCE = {
    "en": [
        (1, "Which animal gives us milk?", ["Cow", "Lion", "Fish", "Bird"]),
        (1, "What do we need to breathe?", ["Air", "Stone", "Sand", "Wood"]),
        (1, "Which one is a fruit?", ["Apple", "Chair", "Shoe", "Pencil"]),
        (1, "What gives us light during the day?", ["Sun", "Moon", "Rain", "Wind"]),
        (1, "How many legs does a dog have?", ["4", "2", "6", "8"]),
        (1, "Which one can fly?", ["Bird", "Dog", "Fish", "Cow"]),
        (1, "Where do fish live?", ["Water", "Tree", "Sand", "Fire"]),
        (1, "What colour are leaves usually?", ["Green", "Blue", "Black", "Pink"]),
        (1, "What do we use to see?", ["Eyes", "Ears", "Nose", "Hands"]),
        (1, "Which one is hot?", ["Fire", "Ice", "Rain", "Moon"]),
        (2, "Which planet do we live on?", ["Earth", "Mars", "Venus", "Jupiter"]),
        (2, "What do plants need to grow?",
         ["Water and sunlight", "Plastic and stones", "Only darkness", "Sand and ice"]),
        (2, "Which animal lays eggs?", ["Hen", "Cow", "Dog", "Cat"]),
        (2, "How many days are there in a week?", ["7", "5", "6", "8"]),
        (2, "Which of these gives light?", ["Torch", "Book", "Chair", "Table"]),
        (2, "What do we call frozen water?", ["Ice", "Steam", "Cloud", "Smoke"]),
        (2, "Which body part pumps blood?", ["Heart", "Brain", "Lungs", "Stomach"]),
        (2, "Which season is usually the hottest?", ["Summer", "Winter", "Monsoon", "Spring"]),
        (2, "Which is the biggest land animal?", ["Elephant", "Cat", "Dog", "Rabbit"]),
        (2, "What do we do with our nose?", ["Smell", "See", "Hear", "Taste"]),
        (3, "Plants give us which gas that we need to breathe?",
         ["Oxygen", "Smoke", "Carbon dioxide", "Helium"]),
        (3, "Which planet is closest to the Sun?", ["Mercury", "Earth", "Mars", "Saturn"]),
        (3, "What does water become when it is heated a lot?", ["Steam", "Ice", "Stone", "Sand"]),
        (3, "How many legs does a spider have?", ["8", "4", "6", "10"]),
        (3, "Which part of a plant takes in water from the soil?",
         ["Roots", "Leaves", "Flower", "Fruit"]),
        (3, "A magnet sticks to which of these?", ["Iron nail", "Paper", "Wood", "Plastic"]),
        (3, "Day and night happen because the Earth...",
         ["Spins around", "Stops moving", "Grows bigger", "Gets smaller"]),
        (3, "Which of these is a solid?", ["Stone", "Water", "Air", "Milk"]),
        (3, "What do bees make?", ["Honey", "Milk", "Butter", "Oil"]),
        (3, "Which body part helps us hear?", ["Ears", "Eyes", "Nose", "Tongue"]),
    ],
    "hi": [
        (1, "कौन सा जानवर हमें दूध देता है?", ["गाय", "शेर", "मछली", "चिड़िया"]),
        (1, "साँस लेने के लिए हमें क्या चाहिए?", ["हवा", "पत्थर", "रेत", "लकड़ी"]),
        (1, "इनमें से कौन सा फल है?", ["सेब", "कुर्सी", "जूता", "पेंसिल"]),
        (1, "दिन में हमें रोशनी कौन देता है?", ["सूरज", "चाँद", "बारिश", "हवा"]),
        (1, "कुत्ते के कितने पैर होते हैं?", ["4", "2", "6", "8"]),
        (1, "कौन उड़ सकता है?", ["चिड़िया", "कुत्ता", "मछली", "गाय"]),
        (1, "मछली कहाँ रहती है?", ["पानी", "पेड़", "रेत", "आग"]),
        (1, "पत्तियों का रंग आमतौर पर क्या होता है?", ["हरा", "नीला", "काला", "गुलाबी"]),
        (1, "हम देखने के लिए किसका उपयोग करते हैं?", ["आँखें", "कान", "नाक", "हाथ"]),
        (1, "इनमें से कौन गरम होता है?", ["आग", "बर्फ़", "बारिश", "चाँद"]),
        (2, "हम किस ग्रह पर रहते हैं?", ["पृथ्वी", "मंगल", "शुक्र", "बृहस्पति"]),
        (2, "पौधों को बढ़ने के लिए क्या चाहिए?",
         ["पानी और धूप", "प्लास्टिक और पत्थर", "सिर्फ़ अँधेरा", "रेत और बर्फ़"]),
        (2, "कौन सा जानवर अंडे देता है?", ["मुर्गी", "गाय", "कुत्ता", "बिल्ली"]),
        (2, "एक सप्ताह में कितने दिन होते हैं?", ["7", "5", "6", "8"]),
        (2, "इनमें से कौन रोशनी देता है?", ["टॉर्च", "किताब", "कुर्सी", "मेज़"]),
        (2, "जमे हुए पानी को क्या कहते हैं?", ["बर्फ़", "भाप", "बादल", "धुआँ"]),
        (2, "शरीर का कौन सा अंग खून को पंप करता है?", ["दिल", "दिमाग़", "फेफड़े", "पेट"]),
        (2, "कौन सा मौसम सबसे गरम होता है?", ["गर्मी", "सर्दी", "बरसात", "वसंत"]),
        (2, "सबसे बड़ा ज़मीनी जानवर कौन सा है?", ["हाथी", "बिल्ली", "कुत्ता", "खरगोश"]),
        (2, "हम नाक से क्या करते हैं?", ["सूँघते हैं", "देखते हैं", "सुनते हैं", "चखते हैं"]),
        (3, "पौधे हमें कौन सी गैस देते हैं जिसकी हमें साँस लेने के लिए ज़रूरत है?",
         ["ऑक्सीजन", "धुआँ", "कार्बन डाइऑक्साइड", "हीलियम"]),
        (3, "सूरज के सबसे पास कौन सा ग्रह है?", ["बुध", "पृथ्वी", "मंगल", "शनि"]),
        (3, "पानी को बहुत गरम करने पर वह क्या बन जाता है?", ["भाप", "बर्फ़", "पत्थर", "रेत"]),
        (3, "मकड़ी के कितने पैर होते हैं?", ["8", "4", "6", "10"]),
        (3, "पौधे का कौन सा भाग मिट्टी से पानी लेता है?", ["जड़", "पत्ती", "फूल", "फल"]),
        (3, "चुंबक इनमें से किससे चिपकता है?", ["लोहे की कील", "कागज़", "लकड़ी", "प्लास्टिक"]),
        (3, "दिन और रात इसलिए होते हैं क्योंकि पृथ्वी...",
         ["घूमती है", "रुक जाती है", "बड़ी हो जाती है", "छोटी हो जाती है"]),
        (3, "इनमें से कौन ठोस है?", ["पत्थर", "पानी", "हवा", "दूध"]),
        (3, "मधुमक्खी क्या बनाती है?", ["शहद", "दूध", "मक्खन", "तेल"]),
        (3, "शरीर का कौन सा अंग हमें सुनने में मदद करता है?", ["कान", "आँखें", "नाक", "जीभ"]),
    ],
    "bn": [
        (1, "কোন প্রাণী আমাদের দুধ দেয়?", ["গরু", "সিংহ", "মাছ", "পাখি"]),
        (1, "শ্বাস নেওয়ার জন্য আমাদের কী দরকার?", ["বাতাস", "পাথর", "বালি", "কাঠ"]),
        (1, "এর মধ্যে কোনটি ফল?", ["আপেল", "চেয়ার", "জুতো", "পেন্সিল"]),
        (1, "দিনের বেলা আমাদের আলো কে দেয়?", ["সূর্য", "চাঁদ", "বৃষ্টি", "বাতাস"]),
        (1, "কুকুরের কয়টি পা থাকে?", ["4", "2", "6", "8"]),
        (1, "কে উড়তে পারে?", ["পাখি", "কুকুর", "মাছ", "গরু"]),
        (1, "মাছ কোথায় থাকে?", ["জল", "গাছ", "বালি", "আগুন"]),
        (1, "পাতার রং সাধারণত কী হয়?", ["সবুজ", "নীল", "কালো", "গোলাপি"]),
        (1, "আমরা দেখার জন্য কী ব্যবহার করি?", ["চোখ", "কান", "নাক", "হাত"]),
        (1, "এর মধ্যে কোনটি গরম?", ["আগুন", "বরফ", "বৃষ্টি", "চাঁদ"]),
        (2, "আমরা কোন গ্রহে বাস করি?", ["পৃথিবী", "মঙ্গল", "শুক্র", "বৃহস্পতি"]),
        (2, "গাছের বেড়ে উঠতে কী দরকার?",
         ["জল ও রোদ", "প্লাস্টিক ও পাথর", "শুধু অন্ধকার", "বালি ও বরফ"]),
        (2, "কোন প্রাণী ডিম পাড়ে?", ["মুরগি", "গরু", "কুকুর", "বিড়াল"]),
        (2, "এক সপ্তাহে কয়দিন থাকে?", ["7", "5", "6", "8"]),
        (2, "এর মধ্যে কোনটি আলো দেয়?", ["টর্চ", "বই", "চেয়ার", "টেবিল"]),
        (2, "জমে যাওয়া জলকে কী বলে?", ["বরফ", "বাষ্প", "মেঘ", "ধোঁয়া"]),
        (2, "শরীরের কোন অঙ্গ রক্ত পাম্প করে?", ["হৃৎপিণ্ড", "মস্তিষ্ক", "ফুসফুস", "পেট"]),
        (2, "কোন ঋতু সবচেয়ে গরম?", ["গ্রীষ্ম", "শীত", "বর্ষা", "বসন্ত"]),
        (2, "সবচেয়ে বড় স্থলের প্রাণী কোনটি?", ["হাতি", "বিড়াল", "কুকুর", "খরগোশ"]),
        (2, "আমরা নাক দিয়ে কী করি?", ["গন্ধ নিই", "দেখি", "শুনি", "স্বাদ নিই"]),
        (3, "গাছ আমাদের কোন গ্যাস দেয়, যা আমাদের শ্বাস নেওয়ার জন্য দরকার?",
         ["অক্সিজেন", "ধোঁয়া", "কার্বন ডাই-অক্সাইড", "হিলিয়াম"]),
        (3, "সূর্যের সবচেয়ে কাছের গ্রহ কোনটি?", ["বুধ", "পৃথিবী", "মঙ্গল", "শনি"]),
        (3, "জলকে খুব গরম করলে তা কী হয়?", ["বাষ্প", "বরফ", "পাথর", "বালি"]),
        (3, "মাকড়সার কয়টি পা?", ["8", "4", "6", "10"]),
        (3, "গাছের কোন অংশ মাটি থেকে জল শোষণ করে?", ["শিকড়", "পাতা", "ফুল", "ফল"]),
        (3, "চুম্বক এর মধ্যে কোনটিতে আটকে যায়?", ["লোহার পেরেক", "কাগজ", "কাঠ", "প্লাস্টিক"]),
        (3, "দিন ও রাত হয় কারণ পৃথিবী...",
         ["ঘোরে", "থেমে যায়", "বড় হয়ে যায়", "ছোট হয়ে যায়"]),
        (3, "এর মধ্যে কোনটি কঠিন?", ["পাথর", "জল", "বাতাস", "দুধ"]),
        (3, "মৌমাছি কী তৈরি করে?", ["মধু", "দুধ", "মাখন", "তেল"]),
        (3, "শরীরের কোন অংশ আমাদের শুনতে সাহায্য করে?", ["কান", "চোখ", "নাক", "জিভ"]),
    ],
}


# ---------------------------------------------------------------------------
# LANGUAGE: (level, text, visual, [correct, wrong, wrong, wrong])
# Each language tests its own letters, opposites and words.
# ---------------------------------------------------------------------------
LANGUAGE = {
    "en": [
        (1, "Which letter comes after A?", "", ["B", "C", "D", "Z"]),
        (1, "Apple starts with which letter?", "🍎", ["A", "B", "C", "D"]),
        (1, "Banana starts with which letter?", "🍌", ["B", "A", "D", "M"]),
        (1, "Cat starts with which letter?", "🐱", ["C", "K", "S", "T"]),
        (1, "Dog starts with which letter?", "🐶", ["D", "B", "G", "P"]),
        (1, "House starts with which letter?", "🏠", ["H", "M", "S", "N"]),
        (1, "Sun starts with which letter?", "☀️", ["S", "C", "Z", "F"]),
        (1, "What is the opposite of big?", "", ["Small", "Red", "Fast", "Cold"]),
        (1, "What is the opposite of hot?", "", ["Cold", "Big", "Tall", "Blue"]),
        (1, "What is the opposite of up?", "", ["Down", "Hot", "Small", "Green"]),
        (1, "What is the opposite of day?", "", ["Night", "Sun", "Hot", "Fast"]),
        (2, "What is the opposite of happy?", "", ["Sad", "Big", "Fast", "Hot"]),
        (2, "What is the opposite of fast?", "", ["Slow", "Tall", "Red", "Cold"]),
        (2, "What is the opposite of open?", "", ["Close", "Jump", "Green", "Small"]),
        (2, "What is the opposite of hard?", "", ["Soft", "Loud", "Dark", "Thin"]),
        (2, "What is the opposite of full?", "", ["Empty", "Heavy", "Long", "Warm"]),
        (2, "More than one cat is...", "", ["cats", "cat", "cates", "catt"]),
        (2, "More than one box is...", "", ["boxes", "boxs", "boxies", "boxen"]),
        (2, "More than one child is...", "", ["children", "childs", "childes", "childen"]),
        (2, "She ___ a girl.", "", ["is", "am", "are", "be"]),
        (2, "They ___ playing in the park.", "", ["are", "is", "am", "be"]),
        (2, "I ___ a student.", "", ["am", "is", "are", "been"]),
        (2, "Which one is a vowel?", "", ["E", "B", "K", "T"]),
        (3, "Which is the correct spelling?", "🌸",
         ["Beautiful", "Beutiful", "Beautifull", "Butiful"]),
        (3, "Which is the correct spelling?", "👫",
         ["Friend", "Freind", "Frend", "Friand"]),
        (3, "Which is the correct spelling?", "❓",
         ["Because", "Becouse", "Becuase", "Becase"]),
        (3, "Yesterday I ___ to school.", "", ["went", "go", "gone", "going"]),
        (3, "She ___ a song yesterday.", "", ["sang", "sing", "sung", "singing"]),
        (3, "He ___ his lunch an hour ago.", "", ["ate", "eat", "eaten", "eating"]),
        (3, "Which word means the same as big?", "", ["Large", "Tiny", "Thin", "Cold"]),
        (3, "Which word means the same as happy?", "", ["Glad", "Sad", "Angry", "Tired"]),
        (3, "Which word means the same as quick?", "", ["Fast", "Slow", "Late", "Soft"]),
        (3, "What is the opposite of early?", "", ["Late", "Fast", "Soon", "Near"]),
        (3, "What is the opposite of rich?", "", ["Poor", "Tall", "Kind", "Weak"]),
        (3, "Which one is a noun?", "", ["Dog", "Run", "Quickly", "Blue"]),
    ],
    "hi": [
        (1, "'अ' के बाद कौन सा अक्षर आता है?", "", ["आ", "इ", "क", "म"]),
        (1, "सेब किस अक्षर से शुरू होता है?", "🍎", ["स", "क", "म", "र"]),
        (1, "मछली किस अक्षर से शुरू होती है?", "🐟", ["म", "क", "ग", "ज"]),
        (1, "फूल किस अक्षर से शुरू होता है?", "🌸", ["फ", "ब", "प", "भ"]),
        (1, "घर किस अक्षर से शुरू होता है?", "🏠", ["घ", "ग", "क", "ख"]),
        (1, "हाथी किस अक्षर से शुरू होता है?", "🐘", ["ह", "स", "ग", "क"]),
        (1, "बिल्ली किस अक्षर से शुरू होती है?", "🐱", ["ब", "प", "भ", "म"]),
        (1, "'बड़ा' का उल्टा क्या है?", "", ["छोटा", "लाल", "तेज़", "ठंडा"]),
        (1, "'गरम' का उल्टा क्या है?", "", ["ठंडा", "नीला", "बड़ा", "भारी"]),
        (1, "'ऊपर' का उल्टा क्या है?", "", ["नीचे", "गरम", "छोटा", "हरा"]),
        (1, "'दिन' का उल्टा क्या है?", "", ["रात", "सूरज", "गरम", "तेज़"]),
        (2, "'खुश' का उल्टा क्या है?", "", ["दुखी", "लाल", "बड़ा", "तेज़"]),
        (2, "'तेज़' का उल्टा क्या है?", "", ["धीमा", "छोटा", "नीला", "ऊँचा"]),
        (2, "'अंदर' का उल्टा क्या है?", "", ["बाहर", "ऊपर", "लाल", "छोटा"]),
        (2, "'सच' का उल्टा क्या है?", "", ["झूठ", "बड़ा", "गरम", "नया"]),
        (2, "'आगे' का उल्टा क्या है?", "", ["पीछे", "ऊपर", "दाएँ", "तेज़"]),
        (2, "'लड़का' का स्त्रीलिंग रूप क्या है?", "", ["लड़की", "लड़के", "लड़कियाँ", "लड़कों"]),
        (2, "'राजा' का स्त्रीलिंग रूप क्या है?", "", ["रानी", "राजकुमार", "सैनिक", "मंत्री"]),
        (2, "'बेटा' का स्त्रीलिंग रूप क्या है?", "", ["बेटी", "पिता", "भाई", "दादा"]),
        (2, "इनमें से कौन सा स्वर है?", "", ["इ", "क", "म", "ट"]),
        (2, "5 को हिंदी में क्या कहते हैं?", "", ["पाँच", "तीन", "सात", "नौ"]),
        (2, "10 को हिंदी में क्या कहते हैं?", "", ["दस", "आठ", "बारह", "छह"]),
        (2, "7 को हिंदी में क्या कहते हैं?", "", ["सात", "पाँच", "आठ", "नौ"]),
        (3, "'किताब' का बहुवचन क्या है?", "", ["किताबें", "किताबा", "किताबी", "किताबु"]),
        (3, "'कुर्सी' का बहुवचन क्या है?", "", ["कुर्सियाँ", "कुर्सिया", "कुर्सा", "कुर्सू"]),
        (3, "'सूरज' का दूसरा नाम क्या है?", "", ["सूर्य", "चंद्रमा", "तारा", "नदी"]),
        (3, "'पानी' का दूसरा नाम क्या है?", "", ["जल", "आग", "हवा", "मिट्टी"]),
        (3, "'चाँद' का दूसरा नाम क्या है?", "", ["चंद्रमा", "सूर्य", "तारा", "बादल"]),
        (3, "'घर' का दूसरा नाम क्या है?", "", ["मकान", "पेड़", "नदी", "तारा"]),
        (3, "सोमवार के बाद कौन सा दिन आता है?", "",
         ["मंगलवार", "बुधवार", "रविवार", "शनिवार"]),
        (3, "शुक्रवार के बाद कौन सा दिन आता है?", "",
         ["शनिवार", "गुरुवार", "सोमवार", "बुधवार"]),
        (3, "'अमीर' का उल्टा क्या है?", "", ["गरीब", "बड़ा", "तेज़", "मीठा"]),
        (3, "'दोस्त' का उल्टा क्या है?", "", ["दुश्मन", "सहेली", "साथी", "पड़ोसी"]),
        (3, "'सुबह' का उल्टा क्या है?", "", ["शाम", "सवेरा", "भोर", "प्रभात"]),
    ],
    "bn": [
        (1, "'অ' এর পরে কোন বর্ণ আসে?", "", ["আ", "ই", "ক", "ম"]),
        (1, "আপেল কোন বর্ণ দিয়ে শুরু?", "🍎", ["আ", "ক", "ম", "র"]),
        (1, "মাছ কোন বর্ণ দিয়ে শুরু?", "🐟", ["ম", "ক", "গ", "জ"]),
        (1, "ফুল কোন বর্ণ দিয়ে শুরু?", "🌸", ["ফ", "ব", "প", "ভ"]),
        (1, "বাড়ি কোন বর্ণ দিয়ে শুরু?", "🏠", ["ব", "ভ", "ক", "খ"]),
        (1, "হাতি কোন বর্ণ দিয়ে শুরু?", "🐘", ["হ", "স", "গ", "ক"]),
        (1, "কুকুর কোন বর্ণ দিয়ে শুরু?", "🐶", ["ক", "খ", "গ", "ঘ"]),
        (1, "'বড়' এর উল্টো কী?", "", ["ছোট", "লাল", "দ্রুত", "ঠান্ডা"]),
        (1, "'গরম' এর উল্টো কী?", "", ["ঠান্ডা", "নীল", "বড়", "ভারী"]),
        (1, "'উপর' এর উল্টো কী?", "", ["নিচ", "গরম", "ছোট", "সবুজ"]),
        (1, "'দিন' এর উল্টো কী?", "", ["রাত", "সূর্য", "গরম", "দ্রুত"]),
        (2, "'সুখী' এর উল্টো কী?", "", ["দুঃখী", "লাল", "বড়", "দ্রুত"]),
        (2, "'দ্রুত' এর উল্টো কী?", "", ["ধীর", "ছোট", "নীল", "উঁচু"]),
        (2, "'ভিতর' এর উল্টো কী?", "", ["বাহির", "উপর", "লাল", "ছোট"]),
        (2, "'সত্য' এর উল্টো কী?", "", ["মিথ্যা", "বড়", "গরম", "নতুন"]),
        (2, "'সামনে' এর উল্টো কী?", "", ["পিছনে", "উপরে", "ডানে", "দ্রুত"]),
        (2, "'ছেলে' এর স্ত্রীলিঙ্গ কী?", "", ["মেয়ে", "ছেলেরা", "বাবা", "দাদা"]),
        (2, "'রাজা' এর স্ত্রীলিঙ্গ কী?", "", ["রানি", "মন্ত্রী", "সৈনিক", "রাজপুত্র"]),
        (2, "'বাবা' এর স্ত্রীলিঙ্গ কী?", "", ["মা", "দাদা", "ভাই", "কাকা"]),
        (2, "এর মধ্যে কোনটি স্বরবর্ণ?", "", ["ই", "ক", "ম", "ট"]),
        (2, "৫ কে কথায় কী বলে?", "", ["পাঁচ", "তিন", "সাত", "নয়"]),
        (2, "১০ কে কথায় কী বলে?", "", ["দশ", "আট", "বারো", "ছয়"]),
        (2, "৭ কে কথায় কী বলে?", "", ["সাত", "পাঁচ", "আট", "নয়"]),
        (3, "'সূর্য' এর অন্য নাম কী?", "", ["রবি", "চাঁদ", "তারা", "নদী"]),
        (3, "'জল' এর অন্য নাম কী?", "", ["পানি", "আগুন", "মাটি", "বাতাস"]),
        (3, "'চাঁদ' এর অন্য নাম কী?", "", ["শশী", "রবি", "তারা", "মেঘ"]),
        (3, "'বাড়ি' এর অন্য নাম কী?", "", ["গৃহ", "গাছ", "নদী", "তারা"]),
        (3, "সোমবারের পরে কোন বার আসে?", "",
         ["মঙ্গলবার", "বুধবার", "রবিবার", "শনিবার"]),
        (3, "শুক্রবারের পরে কোন বার আসে?", "",
         ["শনিবার", "বৃহস্পতিবার", "সোমবার", "বুধবার"]),
        (3, "'ধনী' এর উল্টো কী?", "", ["গরিব", "বড়", "দ্রুত", "মিষ্টি"]),
        (3, "'বন্ধু' এর উল্টো কী?", "", ["শত্রু", "সঙ্গী", "সাথী", "প্রতিবেশী"]),
        (3, "'সকাল' এর উল্টো কী?", "", ["সন্ধ্যা", "ভোর", "প্রভাত", "সূর্যোদয়"]),
    ],
}


# ---------------------------------------------------------------------------
# COLOURS: swatches (hex) at levels 1-2, colour emojis and mixing at level 3
# ---------------------------------------------------------------------------
COLOURS = {
    "red": {"name": {"en": "Red", "hi": "लाल", "bn": "লাল"},
            "hex": ["#e53935", "#d32f2f", "#ef5350", "#c62828"],
            "dot": "🔴", "square": "🟥"},
    "blue": {"name": {"en": "Blue", "hi": "नीला", "bn": "নীল"},
             "hex": ["#1e88e5", "#1565c0", "#42a5f5", "#0d47a1"],
             "dot": "🔵", "square": "🟦"},
    "green": {"name": {"en": "Green", "hi": "हरा", "bn": "সবুজ"},
              "hex": ["#43a047", "#2e7d32", "#66bb6a", "#1b5e20"],
              "dot": "🟢", "square": "🟩"},
    "yellow": {"name": {"en": "Yellow", "hi": "पीला", "bn": "হলুদ"},
               "hex": ["#fdd835", "#fbc02d", "#ffee58", "#ffeb3b"],
               "dot": "🟡", "square": "🟨"},
    "orange": {"name": {"en": "Orange", "hi": "नारंगी", "bn": "কমলা"},
               "hex": ["#fb8c00", "#ef6c00", "#ffa726", "#f57c00"],
               "dot": "🟠", "square": "🟧"},
    "purple": {"name": {"en": "Purple", "hi": "बैंगनी", "bn": "বেগুনি"},
               "hex": ["#8e24aa", "#6a1b9a", "#ab47bc", "#7b1fa2"],
               "dot": "🟣", "square": "🟪"},
    "pink": {"name": {"en": "Pink", "hi": "गुलाबी", "bn": "গোলাপি"},
             "hex": ["#ec407a", "#d81b60", "#f06292", "#e91e63"],
             "dot": None, "square": None},
    "brown": {"name": {"en": "Brown", "hi": "भूरा", "bn": "বাদামি"},
              "hex": ["#6d4c41", "#5d4037", "#795548", "#4e342e"],
              "dot": "🟤", "square": "🟫"},
    "black": {"name": {"en": "Black", "hi": "काला", "bn": "কালো"},
              "hex": ["#212121", "#000000", "#263238", "#111111"],
              "dot": "⚫", "square": "⬛"},
    "white": {"name": {"en": "White", "hi": "सफ़ेद", "bn": "সাদা"},
              "hex": ["#ffffff", "#fafafa", "#f5f5f5", "#fefefe"],
              "dot": "⚪", "square": "⬜"},
    "grey": {"name": {"en": "Grey", "hi": "स्लेटी", "bn": "ধূসর"},
             "hex": ["#9e9e9e", "#757575", "#bdbdbd", "#616161"],
             "dot": None, "square": None},
}

COLOUR_PROMPTS = {
    "what": {"en": "What colour is this?", "hi": "यह कौन सा रंग है?",
             "bn": "এটি কোন রং?"},
    "which": {"en": "Which one is {c}?", "hi": "{c} रंग कौन सा है?",
              "bn": "কোনটি {c} রং?"},
    "tap": {"en": "Tap the {c} one!", "hi": "{c} रंग चुनो!",
            "bn": "{c} রংটি বেছে নাও!"},
    "mix": {"en": "Mix these colours. What do you get?",
            "hi": "इन रंगों को मिलाओ। कौन सा रंग बनेगा?",
            "bn": "এই রংগুলো মিশিয়ে কোন রং পাওয়া যায়?"},
}

MIXES = [
    ("blue", "yellow", "green"),
    ("red", "yellow", "orange"),
    ("red", "blue", "purple"),
    ("red", "white", "pink"),
    ("black", "white", "grey"),
]

BASIC = ["red", "blue", "green", "yellow", "orange"]
POOL_1 = ["red", "blue", "green", "yellow", "orange", "purple"]


def colour_questions(lang):
    out = []
    nm = {k: v["name"][lang] for k, v in COLOURS.items()}
    pool_all = list(COLOURS)

    def phrase(k):
        return nm[k].lower() if lang == "en" else nm[k]

    plans = [
        (1, BASIC, (0, 1), POOL_1),
        (2, BASIC, (2, 3), pool_all),
        (2, ["purple", "pink", "brown", "black", "white", "grey"], (0, 1), pool_all),
    ]
    for level, targets, idxs, pool in plans:
        for k in targets:
            for i in idxs:
                rng = _rng("colour", lang, k, i)
                others = rng.sample([p for p in pool if p != k], 3)
                out.append((level, _build(
                    rng, COLOUR_PROMPTS["what"][lang], nm[k],
                    [nm[o] for o in others], COLOURS[k]["hex"][i])))

    for k, info in COLOURS.items():
        if not info["square"]:
            continue
        for key, fam in (("which", "square"), ("tap", "dot")):
            emojis = {kk: vv[fam] for kk, vv in COLOURS.items() if vv[fam]}
            rng = _rng("colour3", lang, k, fam)
            others = rng.sample([e for kk, e in emojis.items() if kk != k], 3)
            text = COLOUR_PROMPTS[key][lang].format(c=phrase(k))
            out.append((3, _build(rng, text, emojis[k], others)))

    for a, b, result in MIXES:
        visual = f"{COLOURS[a]['dot']} + {COLOURS[b]['dot']}"
        rng = _rng("mix", lang, a, b)
        others = rng.sample([k for k in COLOURS if k != result], 3)
        out.append((3, _build(
            rng, COLOUR_PROMPTS["mix"][lang], nm[result],
            [nm[o] for o in others], visual)))
    return out


# ---------------------------------------------------------------------------
# OBSERVATION: what is this, counting, odd one out, patterns, shapes
# ---------------------------------------------------------------------------
# (emoji, English, Hindi, Bengali) - the first 12 are level 1, the rest level 2
OBJECTS = [
    ("🍎", "Apple", "सेब", "আপেল"),
    ("🍌", "Banana", "केला", "কলা"),
    ("🐶", "Dog", "कुत्ता", "কুকুর"),
    ("🐱", "Cat", "बिल्ली", "বিড়াল"),
    ("🐘", "Elephant", "हाथी", "হাতি"),
    ("🐟", "Fish", "मछली", "মাছ"),
    ("🚗", "Car", "कार", "গাড়ি"),
    ("🚌", "Bus", "बस", "বাস"),
    ("☀️", "Sun", "सूरज", "সূর্য"),
    ("🌙", "Moon", "चाँद", "চাঁদ"),
    ("⭐", "Star", "तारा", "তারা"),
    ("🏠", "House", "घर", "বাড়ি"),
    ("🦁", "Lion", "शेर", "সিংহ"),
    ("🐦", "Bird", "चिड़िया", "পাখি"),
    ("✈️", "Aeroplane", "हवाई जहाज़", "বিমান"),
    ("🚲", "Bicycle", "साइकिल", "সাইকেল"),
    ("🌳", "Tree", "पेड़", "গাছ"),
    ("🌸", "Flower", "फूल", "ফুল"),
    ("⚽", "Ball", "गेंद", "বল"),
    ("🎈", "Balloon", "गुब्बारा", "বেলুন"),
    ("🍇", "Grapes", "अंगूर", "আঙুর"),
    ("🍊", "Orange", "संतरा", "কমলালেবু"),
    ("🥕", "Carrot", "गाजर", "গাজর"),
    ("🐄", "Cow", "गाय", "গরু"),
    ("🐢", "Turtle", "कछुआ", "কচ্ছপ"),
    ("🐒", "Monkey", "बंदर", "বানর"),
    ("⏰", "Clock", "घड़ी", "ঘড়ি"),
    ("📖", "Book", "किताब", "বই"),
]

OBS_PROMPTS = {
    "what": {"en": "What is this?", "hi": "यह क्या है?", "bn": "এটি কী?"},
    "count": {"en": "How many are there?", "hi": "कितने हैं?", "bn": "কয়টি আছে?"},
    "odd": {"en": "Which one is different?", "hi": "कौन सा अलग है?",
            "bn": "কোনটি আলাদা?"},
    "next": {"en": "What comes next?", "hi": "आगे क्या आएगा?", "bn": "পরে কী আসবে?"},
    "sides": {"en": "How many sides does this shape have?",
              "hi": "इस आकृति की कितनी भुजाएँ हैं?",
              "bn": "এই আকৃতির কয়টি বাহু আছে?"},
}

COUNT_EMOJIS = ["🍎", "⭐", "🐟", "🎈", "🐶", "🌸", "🚗", "🍪"]

ODD_PAIRS_2 = [("🍎", "🍌"), ("🐶", "🐱"), ("🚗", "🚌"),
               ("⭐", "🌙"), ("🌸", "🌳"), ("🐟", "🐦")]
ODD_PAIRS_3 = [("🟥", "🟧"), ("🟦", "🟪"), ("⬆️", "⬇️"),
               ("◀️", "▶️"), ("🔺", "🔻"), ("🌕", "🌑")]

PATTERNS = [
    ("🔴🔵🔴🔵🔴", "🔵"),
    ("⭐⭐🌙⭐⭐", "🌙"),
    ("🍎🍌🍇🍎🍌", "🍇"),
    ("🐶🐱🐶🐱🐶", "🐱"),
    ("🔺🔺🟦🔺🔺", "🟦"),
    ("🌸🌳🌸🌳🌸", "🌳"),
]
PATTERN_POOL = ["🔴", "🔵", "⭐", "🌙", "🍎", "🍌", "🍇", "🐶", "🐱",
                "🔺", "🟦", "🌸", "🌳"]


def observation_questions(lang):
    out = []
    col = {"en": 1, "hi": 2, "bn": 3}[lang]
    easy, rest = OBJECTS[:12], OBJECTS[12:]

    for level, items, pool in ((1, easy, easy), (2, rest, OBJECTS)):
        for item in items:
            rng = _rng("what", lang, item[0])
            others = rng.sample([o for o in pool if o[0] != item[0]], 3)
            out.append((level, _build(
                rng, OBS_PROMPTS["what"][lang], item[col],
                [o[col] for o in others], item[0])))

    counting = (
        (1, COUNT_EMOJIS[:3], range(2, 6)),
        (2, COUNT_EMOJIS[3:6], range(6, 9)),
        (3, COUNT_EMOJIS[6:], range(9, 13)),
    )
    for level, emojis, nums in counting:
        for e in emojis:
            for n in nums:
                rng = _rng("count", lang, e, n)
                near = [x for x in range(max(1, n - 3), n + 4) if x != n]
                others = rng.sample(near, 3)
                out.append((level, _build(
                    rng, OBS_PROMPTS["count"][lang], str(n),
                    [str(x) for x in others], e * n)))

    for level, pairs, size in ((2, ODD_PAIRS_2, 4), (3, ODD_PAIRS_3, 6)):
        for common, odd in pairs:
            rng = _rng("odd", lang, common, odd)
            for pos in rng.sample(range(size), 2):
                row = [common] * size
                row[pos] = odd
                out.append((level, _build(
                    rng, OBS_PROMPTS["odd"][lang], odd, [common], "".join(row))))

    for seq, nxt in PATTERNS:
        rng = _rng("pattern", lang, seq)
        base = list(dict.fromkeys(ch for ch in seq if ch != nxt))
        extra = [e for e in PATTERN_POOL if e != nxt and e not in base]
        others = base + rng.sample(extra, 3)
        out.append((3, _build(
            rng, OBS_PROMPTS["next"][lang], nxt, others, seq)))

    for shape, sides in (("🔺", 3), ("🟦", 4)):
        rng = _rng("shape", lang, shape)
        others = [str(x) for x in (3, 4, 5, 6) if x != sides]
        out.append((3, _build(
            rng, OBS_PROMPTS["sides"][lang], str(sides), others, shape)))
    return out


# ---------------------------------------------------------------------------
def all_questions():
    """Yield (subject, language, level, question_dict) for the whole bank."""
    for lang in LANGS:
        for level, text, options in SCIENCE[lang]:
            rng = _rng("science", lang, text)
            yield "science", lang, level, _build(
                rng, text, options[0], options[1:])
        for level, text, visual, options in LANGUAGE[lang]:
            rng = _rng("language", lang, text, visual)
            yield "language", lang, level, _build(
                rng, text, options[0], options[1:], visual)
        for level, q in colour_questions(lang):
            yield "colours", lang, level, q
        for level, q in observation_questions(lang):
            yield "observation", lang, level, q