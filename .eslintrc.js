module.exports = {
  "env": {
    "browser": true,
    "jquery": true,
    "node": true
  },
  "globals": {
    SVG: true
  },
  "parser": "babel-eslint",
  "extends": "eslint:recommended",
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": "off",
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};