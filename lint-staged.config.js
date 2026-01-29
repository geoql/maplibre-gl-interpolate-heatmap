const config = {
  '*.{js,ts}': ['oxlint --fix', 'oxfmt --write'],
  '*.{json,jsonc,md,yml,yaml,css}': ['oxfmt --write'],
};

export default config;
