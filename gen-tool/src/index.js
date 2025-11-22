import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';
import yaml from 'js-yaml';
import langs from './i18n/lang.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const args_lang = args.find(arg => arg.startsWith('--lang='));
const lang = args_lang ? args_lang.split('=')[1] : 'en';
const t = langs[lang];

// read all case files
const caseDirs = fs.readdirSync(path.join(__dirname, '../../cases'));
const numericDirs = caseDirs.filter(dir => !isNaN(dir));
let cases = numericDirs.map(dir => {
  const caseNumber = parseInt(dir);
  const casePath = path.join(__dirname, '../../cases', dir, 'case.yml');
  const caseData = yaml.load(fs.readFileSync(casePath, 'utf8'));
  const attributionPath = path.join(__dirname, '../../cases', dir, 'ATTRIBUTION.yml');
  const attributionData = yaml.load(fs.readFileSync(attributionPath, 'utf8'));
  return {
    case_no: caseNumber,
    ...caseData,
    attribution: attributionData
  };
});
// Sort cases in ascending order by case number
cases.sort((a, b) => a.case_no - b.case_no);

// render cases
const case_template = fs.readFileSync(path.join(__dirname, '../templates/case.md'), 'utf8');
let cases_contents = '';
for (const c of cases) {
    const source_links = c.source_links.length === 1
      ? `[${t.source_link_caption}](${c.source_links[0].url})`
    : c.source_links.map((link, i) => `[${t.source_link_caption}${i + 1}](${link.url})`).join(' | ');

    // Process capability types
    let capabilityTypes = [];
    if (Array.isArray(c.capability_type)) {
      capabilityTypes = c.capability_type;
    } else if (c.capability_type) {
      capabilityTypes = [c.capability_type];
    }

    const badgeMap = {
      'Physics': { color: '3b82f6', name: 'Physics', key: 'physics' },
      'Cinematic Photo': { color: '8b5cf6', name: 'Cinematic_Photo', key: 'cinematic' },
      'Typography': { color: '10b981', name: 'Typography', key: 'typography' },
      'Multi Character': { color: 'f59e0b', name: 'Multi_Character', key: 'multi_character' },
      'Stylized Characters': { color: 'ec4899', name: 'Stylized_Characters', key: 'stylized' },
      'Surreal Concepts': { color: '06b6d4', name: 'Surreal_Concepts', key: 'surreal' },
      'Maps Layout': { color: 'eab308', name: 'Maps_Layout', key: 'maps' },
      'Pattern Design': { color: 'ef4444', name: 'Pattern_Design', key: 'pattern' },
      'Image Editing': { color: '6366f1', name: 'Image_Editing', key: 'editing' }
    };

    const badges = capabilityTypes.map(type => {
      const info = badgeMap[type];
      if (!info) return null;
      return {
        name: type,
        url: `https://img.shields.io/badge/Type-${info.name}-${info.color}?style=flat-square`
      };
    }).filter(b => b !== null);

    cases_contents += Mustache.render(case_template, {
      case_no: c.case_no,
      t: t,
      title: c.title,
      author: c.author,
      author_link: c.author_link,
      source_links: source_links,
      image: c.image,
      alt_text: c.alt_text.trim(),
      capability_code: c.capability_code,
      capability_type: capabilityTypes, // Pass array for web data
      badges: badges,
      has_badges: badges.length > 0,
      attribution: c.attribution,
      prompt: c.prompt.trim(),
      reference_images: c.reference_images || [],
      has_reference_images: c.reference_images && c.reference_images.length > 0,
      submitter: c.submitter,
      submitter_link: c.submitter_link,
    }) + '\n';
}

// Data for the README template
const data = {
  't': t,
  'cases': cases.map(c => ({
    case_no: c.case_no,
    title: c.title,
    author: c.author,
  })),
  'header': fs.readFileSync(path.join(__dirname, '../templates', lang, 'header.md'), 'utf8'),
  'table-of-contents': fs.readFileSync(path.join(__dirname, '../templates', lang, 'table-of-contents.md'), 'utf8'),
  'gpt4o-intro': fs.readFileSync(path.join(__dirname, '../templates', lang, 'gpt4o-intro.md'), 'utf8'),
  'cases-contents': cases_contents,
  'how-to-contribute': fs.readFileSync(path.join(__dirname, '../templates', lang, 'how-to-contribute.md'), 'utf8'),
  'acknowledgements': fs.readFileSync(path.join(__dirname, '../templates', lang, 'acknowledgements.md'), 'utf8'),
  'star-history': fs.readFileSync(path.join(__dirname, '../templates', lang, 'star-history.md'), 'utf8')
};

// Render the README template
const readmeTemplate = fs.readFileSync(path.join(__dirname, '../templates/README.md.md'), 'utf8');
const renderedReadme = Mustache.render(readmeTemplate, data);

// Write the rendered README
const filename = 'README.md';
fs.writeFileSync(path.join(__dirname, '../..', filename), renderedReadme);
console.log(`${filename} generated successfully`);

// --- WEB GENERATION ---
console.log('Generating Website...');

const docsDir = path.join(__dirname, '../../docs');
fs.ensureDirSync(docsDir);

// 1. Copy Web Template
fs.copySync(path.join(__dirname, '../web-template'), docsDir);
console.log('Web template copied to docs/');

// 2. Generate data.json
const webData = {
  generated_at: new Date().toISOString(),
  cases: cases
};
fs.writeJsonSync(path.join(docsDir, 'data.json'), webData, { spaces: 2 });
console.log('docs/data.json generated');

// 3. Copy Images
const imagesDir = path.join(docsDir, 'images');
fs.ensureDirSync(imagesDir);

cases.forEach(c => {
  const srcDir = path.join(__dirname, '../../cases', String(c.case_no));
  const destDir = path.join(imagesDir, String(c.case_no));
  
  fs.ensureDirSync(destDir);
  
  // Copy main image
  if (c.image && fs.existsSync(path.join(srcDir, c.image))) {
    fs.copySync(path.join(srcDir, c.image), path.join(destDir, c.image));
  }
  
  // Copy reference images
  if (c.reference_images && c.reference_images.length > 0) {
    c.reference_images.forEach(ref => {
      if (fs.existsSync(path.join(srcDir, ref))) {
        fs.copySync(path.join(srcDir, ref), path.join(destDir, ref));
      }
    });
  }
});
console.log('Case images copied to docs/images/');

