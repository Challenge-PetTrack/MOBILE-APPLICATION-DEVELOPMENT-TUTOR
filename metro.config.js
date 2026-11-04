const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adiciona cjs para bibliotecas como Firebase e desativa package exports para evitar
// carregamento duplicado de ESM + CJS (@firebase/app) no React Native
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
