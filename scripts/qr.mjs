// Generates the printable QR codes in qr/ (SVG + 2000 px PNG, navy on white,
// 4-module quiet zone, error correction M).
import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';

const CODES = [
  ['club-breakfast-airport', 'https://club.armadaresidence.com/?src=breakfast-airport'],
  ['club-breakfast-shafa', 'https://club.armadaresidence.com/?src=breakfast-shafa'],
  ['google-review-shafa', 'https://g.page/r/CYIstH7p1560EBM/review'],
  ['google-review-airport', 'https://g.page/r/CeN9kSN0efysEBM/review'],
];

const opts = {
  errorCorrectionLevel: 'M',
  margin: 4,
  color: { dark: '#142A3BFF', light: '#FFFFFFFF' },
};

for (const [name, url] of CODES) {
  await writeFile(`qr/${name}.svg`, await QRCode.toString(url, { ...opts, type: 'svg' }));
  await QRCode.toFile(`qr/${name}.png`, url, { ...opts, type: 'png', width: 2000 });
  console.log(`${name}: ${url}`);
}
