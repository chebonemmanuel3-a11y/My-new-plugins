const { Module } = require('../main');

const FLIRT_LINES = [
  "Are you a lighthouse? Because you guide me through the dark.",
  "Do you like rainbows? Because you’re the treasure at the end of mine.",
  "Are you a sunrise? Because you brighten my day from the start.",
  "Do you like roller coasters? Because my heart races when I see you.",
  "Are you a candle? Because you light up my world.",
  "Do you like chocolate? Because you’re sweeter than any dessert.",
  "Are you a compass? Because you always point me in the right direction.",
  "Do you like dancing? Because you make my heart skip a beat.",
  "Are you a diamond? Because you shine brighter than anyone else.",
  "Do you like beaches? Because I’m swept away by you.",
  "Are you a poem? Because every word about you is beautiful.",
  "Do you like stars? Because you’re the brightest in my sky.",
  "Are you a rainbow? Because you color my world.",
  "Do you like fireflies? Because you light up my night.",
  "Are you a melody? Because you’re stuck in my head all day.",
  "Do you like puzzles? Because you’re the missing piece I’ve been looking for.",
  "Are you a galaxy? Because my world revolves around you.",
  "Do you like roses? Because you’re blooming with beauty.",
  "Are you a spark? Because you ignite my soul.",
  "Do you like adventures? Because life with you is the greatest journey.",
  "Are you Wi‑Fi? Because I'm feeling a strong connection.",
  "Do you have a map? I keep getting lost in your eyes.",
  "If beauty were time, you’d be eternity.",
  "Is your name Google? Because you have everything I’m searching for.",
  "I must be a snowflake, because I’ve fallen for you.",
  "Your smile should come with a warning: highly addictive.",
  "Are you a magician? Every time I look at you, everyone else disappears.",
  "Do you believe in love at first sight, or should I send another message?",
  "You light up rooms you’re not even in yet.",
  "Are you French? Because *Eiffel* for you.",
  "Do you like Star Wars? Because Yoda one for me.",
  "Are you a bank loan? Because you’ve got my interest.",
  "If kisses were snowflakes, I’d send you a blizzard.",
  "You must be tired, because you’ve been running through my mind all day.",
  "Are you a campfire? Because you’re hot and I want s’more.",
  "Do you have a Band‑Aid? Because I just scraped my knee falling for you.",
  "Are you Australian? Because when I look at you, I feel like I’m down under.",
  "You must be made of copper and tellurium, because you’re Cu‑Te.",
  "Are you a parking ticket? Because you’ve got ‘Fine’ written all over you.",
  "If you were a vegetable, you’d be a cute‑cumber.",
  "Are you a keyboard? Because you’re just my type.",
  "Do you have a pencil? Because I want to erase your past and write our future.",
  "Are you a time traveler? Because I see you in my future.",
  "Do you like coffee? Because you’re brewing up feelings in me.",
  "Are you a charger? Because without you, I’d die.",
  "Do you believe in fate? Because I think we were meant to meet.",
  "Are you a camera? Every time I look at you, I smile.",
  "Do you like science? Because you’ve got me in my element.",
  "Are you a dictionary? Because you add meaning to my life.",
  "Do you like puzzles? Because you complete me.",
  "Are you gravity? Because you’ve got me falling for you.",
  "Do you like music? Because you’re the melody to my heart.",
  "Are you a painter? Because you’ve colored my world.",
  "Do you like math? Because you make all my problems disappear.",
  "Are you a star? Because your beauty lights up the night.",
  "Do you like adventures? Because I want to explore life with you.",
  "Are you a chef? Because you spice up my life.",
  "Do you like books? Because you’re a story I never want to end.",
  "Are you a dream? Because I don’t want to wake up.",
  "Are you made of quarks and leptons? Because you’re elementary to my happiness.",
  "Are you a black hole? Because you just sucked me right in.",
  "Are you a quantum particle? Because whenever I look, you change my state.",
  "Are you a neural network? Because you’ve learned all the patterns of my heart.",
  "Are you dark matter? Because you make up most of my universe.",
  "Are you a supernova? Because you light up my world explosively.",
  "Are you a coding bug? Because you’ve crashed my defenses.",
  "Are you a 3D printer? Because you just made my heart in perfect layers.",
  "Are you a rocket? Because my heart takes off when you’re near.",
  "Are you a periodic table? Because you’ve got all the right elements.",
  "Are you a telescope? Because you bring my dreams into focus.",
  "Are you a binary star? Because together we shine brighter.",
  "Are you a CPU? Because you process all my thoughts.",
  "Are you a fractal? Because the closer I look, the more beautiful you get.",
  "Are you a magnet? Because you attract me irresistibly.",
  "Are you a photon? Because you make everything brighter.",
  "Are you a hacker? Because you’ve broken into my heart.",
  "Are you a DNA strand? Because you’re the blueprint of my love.",
  "Are you a math equation? Because you complete my function perfectly."
];

Module({
  pattern: 'flirt',
  fromMe: false,
  desc: 'Sends a random flirt line, optionally mentioning the replied user',
  type: 'fun',
}, async (message) => {
  try {
    const flirt = FLIRT_LINES[Math.floor(Math.random() * FLIRT_LINES.length)];

    if (message.reply_message) {
      const targetName = message.reply_message.sender || message.reply_message.pushName || 'there';
      const targetJid = message.reply_message.jid;
      await message.reply(`😍 @${targetName} ${flirt}`, { mentions: [targetJid] });
    } else {
      await message.reply(`😍 ${flirt}`);
    }
  } catch {
    await message.reply('⚠️ Something went wrong. Try again.');
  }
});
