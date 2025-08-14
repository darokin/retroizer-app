const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  platforms: ['win', 'mac', 'linux'],
  architectures: ['x64'],
  releaseTypes: ['latest', 'beta', 'alpha']
};

// Fonctions utilitaires
function runCommand(command, options = {}) {
  try {
    console.log(`Exécution: ${command}`);
    return execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function updateVersion(type = 'patch') {
  console.log(`Mise à jour de la version (${type})...`);
  runCommand(`npm version ${type} --no-git-tag-version`);
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`Version mise à jour: ${packageJson.version}`);
  return packageJson.version;
}

function buildForPlatform(platform) {
  console.log(`\n=== Build pour ${platform.toUpperCase()} ===`);
  
  switch (platform) {
    case 'win':
      runCommand('npm run dist:win');
      break;
    case 'mac':
      runCommand('npm run dist:mac');
      break;
    case 'linux':
      runCommand('npm run dist:linux');
      break;
    default:
      console.error(`Plateforme non supportée: ${platform}`);
      process.exit(1);
  }
}

function createReleaseNotes(version) {
  const template = `# Retroizer v${version}

## 🎉 Nouvelle version disponible !

### Fonctionnalités
- [ ] Ajoutez vos nouvelles fonctionnalités ici

### Corrections
- [ ] Ajoutez vos corrections ici

### Améliorations
- [ ] Ajoutez vos améliorations ici

### Téléchargements
- **Windows**: [Retroizer-Setup-${version}.exe](https://github.com/darokin/retroizer-app/releases/download/v${version}/Retroizer-Setup-${version}.exe)
- **macOS**: [Retroizer-${version}.dmg](https://github.com/darokin/retroizer-app/releases/download/v${version}/Retroizer-${version}.dmg)
- **Linux**: [Retroizer-${version}.AppImage](https://github.com/darokin/retroizer-app/releases/download/v${version}/Retroizer-${version}.AppImage)

### Installation
1. Téléchargez le fichier correspondant à votre système d'exploitation
2. Exécutez l'installateur
3. Lancez Retroizer depuis le menu ou le raccourci créé

### Support
Si vous rencontrez des problèmes, veuillez créer une issue sur GitHub.
`;

  const releaseNotesPath = `RELEASE_NOTES_v${version}.md`;
  fs.writeFileSync(releaseNotesPath, template);
  console.log(`Notes de release créées: ${releaseNotesPath}`);
  return releaseNotesPath;
}

// Script principal
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🚀 Script de Release Retroizer');
  console.log('==============================\n');
  
  switch (command) {
    case 'build':
      const platform = args[1] || 'all';
      if (platform === 'all') {
        config.platforms.forEach(buildForPlatform);
      } else {
        buildForPlatform(platform);
      }
      break;
      
    case 'version':
      const versionType = args[1] || 'patch';
      const newVersion = updateVersion(versionType);
      console.log(`Version mise à jour: ${newVersion}`);
      break;
      
    case 'release':
      const releaseType = args[1] || 'patch';
      const version = updateVersion(releaseType);
      
      console.log(`\n=== Création de la release v${version} ===`);
      
      // Build pour toutes les plateformes
      config.platforms.forEach(buildForPlatform);
      
      // Créer les notes de release
      const releaseNotes = createReleaseNotes(version);
      
      console.log('\n✅ Release créée avec succès !');
      console.log(`📝 Notes de release: ${releaseNotes}`);
      console.log('📦 Fichiers de build dans le dossier: release/');
      console.log('\nProchaines étapes:');
      console.log('1. Vérifiez les builds dans le dossier release/');
      console.log('2. Testez les installateurs');
      console.log('3. Créez un tag Git: git tag v' + version);
      console.log('4. Poussez le tag: git push origin v' + version);
      console.log('5. Créez une release sur GitHub avec les fichiers du dossier release/');
      break;
      
    case 'clean':
      console.log('🧹 Nettoyage des builds...');
      if (fs.existsSync('release')) {
        runCommand('rm -rf release');
      }
      if (fs.existsSync('dist')) {
        runCommand('rm -rf dist');
      }
      console.log('✅ Nettoyage terminé');
      break;
      
    default:
      console.log('Usage: node scripts/release.js <command> [options]');
      console.log('\nCommandes disponibles:');
      console.log('  build [platform]     - Build pour une plateforme (win/mac/linux/all)');
      console.log('  version [type]       - Mettre à jour la version (patch/minor/major)');
      console.log('  release [type]       - Créer une release complète');
      console.log('  clean                - Nettoyer les builds');
      console.log('\nExemples:');
      console.log('  node scripts/release.js build win');
      console.log('  node scripts/release.js version minor');
      console.log('  node scripts/release.js release patch');
  }
}

// Vérifications préliminaires
function checkPrerequisites() {
  console.log('🔍 Vérification des prérequis...');
  
  // Vérifier que nous sommes dans le bon dossier
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json non trouvé. Exécutez ce script depuis la racine du projet.');
    process.exit(1);
  }
  
  // Vérifier que electron-builder est installé
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.devDependencies['electron-builder']) {
    console.error('❌ electron-builder n\'est pas installé. Exécutez: npm install --save-dev electron-builder');
    process.exit(1);
  }
  
  console.log('✅ Prérequis vérifiés');
}

// Exécution
if (require.main === module) {
  checkPrerequisites();
  main();
}

module.exports = { main, updateVersion, buildForPlatform };
