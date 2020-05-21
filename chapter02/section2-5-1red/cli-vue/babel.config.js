module.exports = (api) => {
  return {
    presets: api.env('test') ? [
      ['@babel/preset-env',
      {
        "targets": {
          "node": "current"
        }
      }]
    ] : [
      '@vue/app'
    ]
  }
}
