// vue.config.js
module.exports = {
    // options...
    outputDir : '../src/public',
    devServer: {
        proxy : {
            '^/api' : {
                target: 'http://localhost:3000/',
                changeOrigin : true
            }
        }
    }
}
