module.exports = {
    publicPath: '.',
    transpileDependencies: ['vue-mapbox'],
    chainWebpack: (config) => {
        const svgRule = config.module.rule('svg');

        svgRule.uses.clear();

        svgRule
                .use('babel-loader')
                .loader('babel-loader')
                .end()
                .use('vue-svg-loader')
                .loader('vue-svg-loader');
    },
    devServer: {                // this allows the use of Localtunnel to view your development environment on a mobile device or another computer
        disableHostCheck: true
    }
};
