const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  outputDir: 'assets',
  iconSizes: {
    ico: [16, 32, 48, 64, 128, 256],
    png: [16, 32, 48, 64, 128, 256, 512, 1024],
    icns: [16, 32, 48, 64, 128, 256, 512, 1024]
  }
};

// Créer une icône de placeholder
async function createPlaceholderIcon(size) {
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 74, g: 144, b: 226, alpha: 1 } // #4A90E2
    }
  });

  // Créer un cercle avec un "R" au centre
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="url(#grad)" stroke="#2E5A8A" stroke-width="2"/>
      <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial, sans-serif" font-size="${size/3}" 
            font-weight="bold" text-anchor="middle" fill="white">R</text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

// Générer l'icône ICO pour Windows
async function generateIco() {
  console.log('Génération de l\'icône Windows (.ico)...');
  
  const iconBuffers = [];
  for (const size of config.iconSizes.ico) {
    const buffer = await createPlaceholderIcon(size);
    iconBuffers.push({ size, buffer });
  }

  // Pour simplifier, on utilise juste la plus grande taille
  // En production, vous devriez utiliser un vrai générateur ICO
  const largestIcon = iconBuffers[iconBuffers.length - 1];
  fs.writeFileSync(path.join(config.outputDir, 'icon.ico'), largestIcon.buffer);
  
  console.log('✅ Icône Windows générée: assets/icon.ico');
}

// Générer l'icône PNG pour Linux
async function generatePng() {
  console.log('Génération de l\'icône Linux (.png)...');
  
  const buffer = await createPlaceholderIcon(512);
  fs.writeFileSync(path.join(config.outputDir, 'icon.png'), buffer);
  
  console.log('✅ Icône Linux générée: assets/icon.png');
}

// Générer l'icône ICNS pour macOS
async function generateIcns() {
  console.log('Génération de l\'icône macOS (.icns)...');
  
  // Pour simplifier, on utilise juste la plus grande taille
  // En production, vous devriez utiliser un vrai générateur ICNS
  const buffer = await createPlaceholderIcon(1024);
  fs.writeFileSync(path.join(config.outputDir, 'icon.icns'), buffer);
  
  console.log('✅ Icône macOS générée: assets/icon.icns');
}

// Générer l'arrière-plan DMG pour macOS
async function generateDmgBackground() {
  console.log('Génération de l\'arrière-plan DMG...');
  
  const width = 540;
  const height = 380;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F5F5F5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E0E0E0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="24" 
            text-anchor="middle" fill="#666">Retroizer</text>
      <text x="${width/2}" y="${height/2 + 30}" font-family="Arial, sans-serif" font-size="14" 
            text-anchor="middle" fill="#999">Glissez l\'application ici pour l\'installer</text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
    
  fs.writeFileSync(path.join(config.outputDir, 'dmg-background.png'), buffer);
  
  console.log('✅ Arrière-plan DMG généré: assets/dmg-background.png');
}

// Fonction principale
async function main() {
  console.log('🎨 Génération des icônes pour Retroizer');
  console.log('=======================================\n');
  
  // Créer le dossier assets s'il n'existe pas
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  try {
    await generateIco();
    await generatePng();
    await generateIcns();
    await generateDmgBackground();
    
    console.log('\n✅ Toutes les icônes ont été générées avec succès !');
    console.log('\n📁 Fichiers créés dans le dossier assets/:');
    console.log('  - icon.ico (Windows)');
    console.log('  - icon.png (Linux)');
    console.log('  - icon.icns (macOS)');
    console.log('  - dmg-background.png (macOS DMG)');
    
    console.log('\n⚠️  Note: Ces sont des icônes de placeholder.');
    console.log('   Remplacez-les par vos vraies icônes avant la release finale.');
    console.log('   Consultez assets/README.md pour plus d\'informations.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error.message);
    process.exit(1);
  }
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = { createPlaceholderIcon, generateIco, generatePng, generateIcns, generateDmgBackground };
