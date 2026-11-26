/* 把 index.html + styles.css + app.js 合并成一个独立 HTML 文件 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const html = read('index.html');
const css = read('styles.css');
const js = read('app.js');

/* 内联的 JS 里如果出现 </script 会提前结束标签，转义掉 */
const safeJs = js.replace(/<\/script/gi, '<\\/script');

let out = html.replace(
  /<link[^>]*href="styles\.css"[^>]*>/i,
  () => '<style>\n' + css + '\n</style>'
);

out = out.replace(
  /<script[^>]*src="app\.js"[^>]*><\/script>/i,
  () => '<script>\n' + safeJs + '\n</script>'
);

if (out.indexOf('<style>') < 0 || out.indexOf('<script>\n') < 0) {
  console.error('替换失败：没找到 css/js 的引用');
  process.exit(1);
}

const target = path.join(ROOT, '一天-生活记录.html');
fs.writeFileSync(target, out, 'utf8');

const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(0);
console.log('✓ 已生成：' + target);
console.log('  大小：' + kb + ' KB');
console.log('  校验：style ' + (out.match(/<style>/g) || []).length +
            ' 处, script ' + (out.match(/<script>/g) || []).length + ' 处');
