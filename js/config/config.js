var config = {};

if (__DEV__) {
  config.apiEndpoint = 'https://radiowitness.io/api';
} else {
  config.apiEndpoint = '/api';
}

module.exports = config;
