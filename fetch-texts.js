const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TEXTS = [
  {
    name: 'zohar',
    refs: [
      'Zohar,_Genesis', 'Zohar,_Exodus', 'Zohar,_Leviticus',
      'Zohar,_Numbers', 'Zohar,_Deuteronomy'
    ]
  },
  {
    name: 'tehilim',
    refs: Array.from({length: 150}, (_, i) => `Psalms.${i+1}`)
  },
  {
    name: 'etz-chaim',
    refs: Array.from({length: 50}, (_, i) => `Etz_Chaim.${i+1}`)
  },
  {
    name: 'sefer-yetzirah',
    refs: Array.from({length: 6}, (_, i) => `Sefer_Yetzirah.${i+1}`)
  }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchRef(ref) {
  const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}?lang=he&commentary=0&context=0`;
  const res = await axios.get(url, { timeout: 15000 });
  return res.data;
}

async function fetchText(text) {
  console.log(`\nFetching ${text.name}...`);
  const dir = path.join(__dirname, 'texts', text.name);
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < text.refs.length; i++) {
    const ref = text.refs[i];
    const filename = ref.replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      console.log(`  [${i+1}/${text.refs.length}] ${ref}`);
      const data = await fetchRef(ref);
      fs.writeFileSync(
        path.join(dir, `${filename}.json`),
        JSON.stringify(data, null, 2)
      );
      await sleep(400);
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
    }
  }
}

async function main() {
  fs.mkdirSync(path.join(__dirname, 'texts'), { recursive: true });
  for (const text of TEXTS) {
    await fetchText(text);
  }
  console.log('\nDone! Texts saved to ./texts/');
}

main().catch(console.error);
