/* 把上一层的网页文件同步到 native/www，并注入原生专用脚本 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..');
const DST = path.join(__dirname, 'www');

fs.mkdirSync(DST, { recursive: true });

['styles.css', 'app.js'].forEach(f => {
  fs.copyFileSync(path.join(SRC, f), path.join(DST, f));
  console.log('copied ' + f);
});

/* index.html 需要注入 native.js */
let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
if (html.indexOf('native.js') < 0) {
  html = html.replace('</body>', '<script src="native.js"></script>\n</body>');
}
fs.writeFileSync(path.join(DST, 'index.html'), html, 'utf8');
console.log('copied index.html (+ native.js)');

fs.copyFileSync(path.join(__dirname, 'native.js'), path.join(DST, 'native.js'));
console.log('copied native.js');

/* Health Connect 要求的隐私政策页 */
fs.copyFileSync(path.join(__dirname, 'privacypolicy.html'), path.join(DST, 'privacypolicy.html'));
console.log('copied privacypolicy.html');

console.log('\n✓ www/ 已就绪，接着跑：npx cap sync android');
