const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('metro-config').ConfigT} */
const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};

// Prefer CJS builds to avoid ESM symbol collisions (e.g., TypeBox's Object)
// Resolve TypeBox CJS path (handle hoisted and nested under fets)
const typeboxCjsCandidates = [
  path.resolve(
    __dirname,
    'node_modules/@sinclair/typebox/build/cjs/index.js'
  ),
  path.resolve(
    __dirname,
    'node_modules/fets/node_modules/@sinclair/typebox/build/cjs/index.js'
  ),
];
const typeboxCjsPath = typeboxCjsCandidates.find((p) => fs.existsSync(p));

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  fets: path.resolve(__dirname, 'node_modules/fets/cjs/index.js'),
  ...(typeboxCjsPath ? { '@sinclair/typebox': typeboxCjsPath } : {}),
};

// Fallback for older Metro versions that ignore alias for some resolutions
const prevResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'fets') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/fets/cjs/index.js'),
    };
  }
  if (moduleName === '@sinclair/typebox' && typeboxCjsPath) {
    return { type: 'sourceFile', filePath: typeboxCjsPath };
  }
  return prevResolveRequest
    ? prevResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;


