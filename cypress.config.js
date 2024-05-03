const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4040',
    video: true,
    supportFile: false,
  },
})
