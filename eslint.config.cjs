'use strict';

// Conservative baseline rules; expand after clearing existing warnings.
module.exports = [
  {
    files: ['src/**/*.js', 'tests/playwright/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-constant-condition': 'error',
    },
  },
];
