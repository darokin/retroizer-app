const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  releaseDir: 'release',
  platforms: {
    win: {
      files: ['Retroizer-Setup-*.exe', 'Retroizer-*-win.zip'],
      description: 'Windows Installer'
    },
    mac: {
      files: ['Retroizer-*.dmg', 'Retroizer-*-mac.zip'],
      description: 'macOS DMG'
    },
    linux: {
      files: ['Retroizer-*.AppImage', 'retroizer_*.deb', 'Retroizer-*-linux.zip'],
      description: 'Linux Packages'
    }
  }
};

// Fonctions utilitaires
function findFiles(pattern, directory = config.releaseDir) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  
  const files = fs.readdirSync(directory);
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return files.filter(file => regex.test(file));
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function checkFileIntegrity(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      readable: true,
      modified: stats.mtime
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

function validateBuilds() {
  console.log('🔍 Validation des builds...\n');
  
  let allValid = true;
  const results = {};
  
  for (const [platform, platformConfig] of Object.entries(config.platforms)) {
    console.log(`=== ${platformConfig.description} ===`);
    results[platform] = [];
    
    for (const pattern of platformConfig.files) {
      const files = findFiles(pattern);
      
      if (files.length === 0) {
        console.log(`❌ Aucun fichier trouvé pour le pattern: ${pattern}`);
        allValid = false;
        results[platform].push({
          pattern,
          found: false,
          error: 'Aucun fichier trouvé'
        });
      } else {
        for (const file of files) {
          const filePath = path.join(config.releaseDir, file);
          const integrity = checkFileIntegrity(filePath);
          
          if (integrity.exists) {
            console.log(`✅ ${file} (${getFileSize(filePath)})`);
            results[platform].push({
              file,
              found: true,
              size: integrity.size,
              sizeFormatted: getFileSize(filePath)
            });
          } else {
            console.log(`❌ ${file} - ${integrity.error}`);
            allValid = false;
            results[platform].push({
              file,
              found: false,
              error: integrity.error
            });
          }
        }
      }
    }
    console.log('');
  }
  
  return { allValid, results };
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0
    },
    platforms: results
  };
  
  // Calculer les statistiques
  for (const platform of Object.values(results)) {
    for (const file of platform) {
      report.summary.totalFiles++;
      if (file.found) {
        report.summary.validFiles++;
      } else {
        report.summary.invalidFiles++;
      }
    }
  }
  
  return report;
}

function saveReport(report) {
  const reportPath = `build-report-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Rapport sauvegardé: ${reportPath}`);
  return reportPath;
}

function displaySummary(report) {
  console.log('📋 Résumé de la validation');
  console.log('==========================');
  console.log(`Total de fichiers: ${report.summary.totalFiles}`);
  console.log(`Fichiers valides: ${report.summary.validFiles}`);
  console.log(`Fichiers invalides: ${report.summary.invalidFiles}`);
  
  if (report.summary.totalFiles > 0) {
    console.log(`Taux de succès: ${((report.summary.validFiles / report.summary.totalFiles) * 100).toFixed(1)}%`);
  }
  
  if (report.summary.invalidFiles > 0) {
    console.log('\n⚠️  Problèmes détectés:');
    for (const [platform, files] of Object.entries(report.platforms)) {
      const invalidFiles = files.filter(f => !f.found);
      if (invalidFiles.length > 0) {
        console.log(`  ${platform}:`);
        invalidFiles.forEach(f => {
          console.log(`    - ${f.pattern || f.file}: ${f.error}`);
        });
      }
    }
  }
}

function checkDependencies() {
  console.log('🔍 Vérification des dépendances...');
  
  const requiredDirs = ['assets', 'src', 'dist'];
  const missingDirs = [];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      missingDirs.push(dir);
    }
  }
  
  if (missingDirs.length > 0) {
    console.log(`❌ Dossiers manquants: ${missingDirs.join(', ')}`);
    return false;
  }
  
  // Vérifier les icônes
  const requiredIcons = {
    'assets/icon.ico': 'Windows',
    'assets/icon.icns': 'macOS',
    'assets/icon.png': 'Linux'
  };
  
  const missingIcons = [];
  for (const [iconPath, platform] of Object.entries(requiredIcons)) {
    if (!fs.existsSync(iconPath)) {
      missingIcons.push(`${iconPath} (${platform})`);
    }
  }
  
  if (missingIcons.length > 0) {
    console.log(`⚠️  Icônes manquantes: ${missingIcons.join(', ')}`);
    console.log('   Consultez assets/README.md pour plus d\'informations');
  }
  
  console.log('✅ Vérification terminée\n');
  return true;
}

// Script principal
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'validate';
  
  console.log('🧪 Test des Builds Retroizer');
  console.log('============================\n');
  
  switch (command) {
    case 'validate':
      if (!checkDependencies()) {
        process.exit(1);
      }
      
      const { allValid, results } = validateBuilds();
      const report = generateReport(results);
      const reportPath = saveReport(report);
      displaySummary(report);
      
      if (!allValid) {
        console.log('\n❌ Certains builds ont échoué. Vérifiez les erreurs ci-dessus.');
        process.exit(1);
      } else {
        console.log('\n✅ Tous les builds sont valides !');
      }
      break;
      
    case 'clean':
      console.log('🧹 Nettoyage des rapports...');
      const reports = fs.readdirSync('.').filter(f => f.startsWith('build-report-'));
      for (const report of reports) {
        fs.unlinkSync(report);
        console.log(`Supprimé: ${report}`);
      }
      console.log('✅ Nettoyage terminé');
      break;
      
    default:
      console.log('Usage: node scripts/test-builds.js <command>');
      console.log('\nCommandes disponibles:');
      console.log('  validate  - Valider les builds (par défaut)');
      console.log('  clean     - Nettoyer les rapports');
  }
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = { validateBuilds, generateReport, checkDependencies };
