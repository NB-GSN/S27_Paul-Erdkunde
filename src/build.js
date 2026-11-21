// Baut index.html aus shell.html, land.txt (Weltkarte), data.js (Aufgaben) und app.js (Spiel).
// Aufruf im Hauptordner: node src/build.js
const fs = require('fs'), p = f => __dirname + '/' + f;
const h = fs.readFileSync(p('shell.html'), 'utf8')
  .replace('__LAND__', () => fs.readFileSync(p('land.txt'), 'utf8'))
  .replace('__DATA__', () => fs.readFileSync(p('data.js'), 'utf8'))
  .replace('__APP__', () => fs.readFileSync(p('app.js'), 'utf8'));
fs.writeFileSync(__dirname + '/../index.html', '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + h.replace('<main id="app">', '</head>\n<body>\n<main id="app">') + '\n</body>\n</html>\n');
console.log('index.html gebaut');
