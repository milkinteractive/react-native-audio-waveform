const path = require('path');
const pak = require('../package.json');

module.exports = {
  dependencies: {
    '@milkinteractive/react-native-audio-waveform': {
      root: path.join(__dirname, '..'),
    },
  },
};
