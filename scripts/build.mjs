// Builds the static site: assets/app.js, assets/style.css and index.html
// (Arabic copy rendered from src/strings.js).
import { build, transform } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { T, keepClubName } from '../src/strings.js';

const ENDPOINT = 'https://wwzxwettsuwtakwwbfly.supabase.co/functions/v1/club-join';

const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const js = await build({
  entryPoints: ['src/app.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2019', 'safari13'],
  define: { __ENDPOINT__: JSON.stringify(ENDPOINT) },
  write: false,
});
const jsCode = js.outputFiles[0].text;
await writeFile('assets/app.js', jsCode);

const css = await transform(await readFile('src/style.css', 'utf8'), { loader: 'css', minify: true });
await writeFile('assets/style.css', css.code);

const vars = {
  ...T.ar,
  title: keepClubName(T.ar.title),
  doneTitle: keepClubName(T.ar.doneTitle),
  endpointOrigin: new URL(ENDPOINT).origin,
  cssHash: hash(css.code),
  jsHash: hash(jsCode),
};
const tpl = await readFile('src/index.template.html', 'utf8');
const html = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
  if (!(k in vars)) throw new Error(`Missing template value: ${k}`);
  return esc(vars[k]);
});
await writeFile('index.html', html);

console.log(`app.js ${(jsCode.length / 1024).toFixed(1)} KB, style.css ${(css.code.length / 1024).toFixed(1)} KB`);
