import random

PROMPTS = {
    'calc': {
        'en': 'What is {expr}?',
        'hi': '{expr} का उत्तर क्या है?',
        'bn': '{expr} এর উত্তর কী?',
    },
    'missing': {
        'en': 'Find the missing number: {expr}',
        'hi': 'छूटी हुई संख्या ढूँढो: {expr}',
        'bn': 'ফাঁকা সংখ্যাটি খুঁজে বের করো: {expr}',
    },
    'pattern': {
        'en': 'What comes next? {expr}',
        'hi': 'आगे क्या आएगा? {expr}',
        'bn': 'পরের সংখ্যা কী? {expr}',
    },
    'compare': {
        'en': 'Which number is bigger?',
        'hi': 'कौन सी संख्या बड़ी है?',
        'bn': 'কোন সংখ্যাটি বড়?',
    },
    'count': {
        'en': 'How many are there?',
        'hi': 'कितने हैं?',
        'bn': 'কয়টি আছে?',
    },
}

EMOJIS = ['🍎', '⭐', '🐟', '🎈', '🐶', '🌸', '🚗', '🍪']


def _options(correct, rng, spread=5, low=0):
    """Return (options, correct_index) with 4 unique non-negative choices."""
    choices = {correct}
    attempts = 0
    while len(choices) < 4 and attempts < 100:
        attempts += 1
        wrong = correct + rng.choice([-1, 1]) * rng.randint(1, spread)
        if wrong >= low:
            choices.add(wrong)
    options = list(choices)
    rng.shuffle(options)
    return [str(o) for o in options], options.index(correct)


def _make(kind, lang, expr, correct, rng, visual='', spread=5):
    text = PROMPTS[kind][lang].format(expr=expr)
    options, idx = _options(correct, rng, spread)
    return {
        'text': text,
        'options': options,
        'correct_index': idx,
        'visual': visual,
        'subject': 'maths',
    }


def _level1(lang, rng):
    kind = rng.choice(['add', 'sub', 'count', 'compare', 'missing'])
    if kind == 'add':
        a, b = rng.randint(1, 5), rng.randint(1, 5)
        return _make('calc', lang, f'{a} + {b}', a + b, rng, spread=3)
    if kind == 'sub':
        a = rng.randint(3, 10)
        b = rng.randint(1, a)
        return _make('calc', lang, f'{a} - {b}', a - b, rng, spread=3)
    if kind == 'count':
        n = rng.randint(2, 9)
        emoji = rng.choice(EMOJIS)
        q = _make('calc', lang, '', n, rng, visual=emoji * n, spread=2)
        q['text'] = PROMPTS['count'][lang]
        return q
    if kind == 'compare':
        a, b = rng.sample(range(1, 20), 2)
        return {
            'text': PROMPTS['compare'][lang] + f' {a} / {b}',
            'options': [str(a), str(b)],
            'correct_index': 0 if a > b else 1,
            'visual': '',
            'subject': 'maths',
        }
    a, b = rng.randint(1, 5), rng.randint(1, 5)
    return _make('missing', lang, f'{a} + ? = {a + b}', b, rng, spread=3)


def _level2(lang, rng):
    kind = rng.choice(['add', 'sub', 'times', 'missing', 'pattern'])
    if kind == 'add':
        a, b = rng.randint(10, 40), rng.randint(5, 30)
        return _make('calc', lang, f'{a} + {b}', a + b, rng, spread=10)
    if kind == 'sub':
        a = rng.randint(20, 60)
        b = rng.randint(5, a - 1)
        return _make('calc', lang, f'{a} - {b}', a - b, rng, spread=10)
    if kind == 'times':
        a, b = rng.randint(2, 5), rng.randint(2, 10)
        return _make('calc', lang, f'{a} × {b}', a * b, rng, spread=6)
    if kind == 'missing':
        a, b = rng.randint(5, 30), rng.randint(5, 20)
        return _make('missing', lang, f'{a} + ? = {a + b}', b, rng, spread=6)
    start, step = rng.randint(1, 10), rng.randint(2, 5)
    seq = [start + step * i for i in range(4)]
    expr = ', '.join(str(s) for s in seq) + ', ?'
    return _make('pattern', lang, expr, start + step * 4, rng, spread=step + 2)


def _level3(lang, rng):
    kind = rng.choice(['times', 'div', 'twostep', 'pattern', 'missing'])
    if kind == 'times':
        a, b = rng.randint(3, 12), rng.randint(3, 12)
        return _make('calc', lang, f'{a} × {b}', a * b, rng, spread=12)
    if kind == 'div':
        b, ans = rng.randint(2, 9), rng.randint(2, 12)
        return _make('calc', lang, f'{b * ans} ÷ {b}', ans, rng, spread=4)
    if kind == 'twostep':
        a, b, c = rng.randint(2, 9), rng.randint(2, 9), rng.randint(1, 15)
        return _make('calc', lang, f'{a} × {b} + {c}', a * b + c, rng, spread=10)
    if kind == 'pattern':
        start, step = rng.randint(2, 20), rng.randint(3, 9)
        seq = [start + step * i for i in range(4)]
        expr = ', '.join(str(s) for s in seq) + ', ?'
        return _make('pattern', lang, expr, start + step * 4, rng, spread=step + 3)
    a, b = rng.randint(2, 9), rng.randint(2, 9)
    return _make('missing', lang, f'{a} × ? = {a * b}', b, rng, spread=4)


def generate_math_question(level, lang='en', rng=None):
    rng = rng or random
    if lang not in ('en', 'hi', 'bn'):
        lang = 'en'
    builder = {1: _level1, 2: _level2, 3: _level3}.get(level, _level1)
    return builder(lang, rng)


def generate_math_bank(level, lang='en', count=40, seed=None):
    """Return `count` unique questions (text + visual must differ)."""
    rng = random.Random(seed)
    seen, bank = set(), []
    attempts = 0
    while len(bank) < count and attempts < count * 30:
        attempts += 1
        q = generate_math_question(level, lang, rng)
        key = (q['text'], q['visual'])
        if key in seen:
            continue
        seen.add(key)
        bank.append(q)
    return bank