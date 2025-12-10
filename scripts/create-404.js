#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'frontend-cliente', 'browser');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

try {
  // Copiar index.html a 404.html
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✅ 404.html creado exitosamente');
  } else {
    console.error('❌ index.html no encontrado en:', indexPath);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error al crear 404.html:', error.message);
  process.exit(1);
}
