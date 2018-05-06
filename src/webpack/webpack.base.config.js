const path = require('path');
const SmartBannerPlugin = require('smart-banner-webpack-plugin');
const banner = require('../license');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [{
    name: "jsstore",
    entry: "./code/index.ts",
    module: {
        rules: [{
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                    }
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        // global data for all components
                        // this can be read from a scss file
                    }
                ]
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            indentedSyntax: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                oneOf: [
                    // this applies to <style module>
                    {
                        resourceQuery: /module/,
                        use: [
                            'vue-style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: true,
                                    localIdentName: '[local]_[hash:base64:8]'
                                }
                            }
                        ]
                    },
                    // this applies to <style> or <style scoped>
                    {
                        use: [
                            'vue-style-loader',
                            'css-loader'
                        ]
                    }
                ]
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=image/svg+xml'
            }
        ]
    },
    mode: 'none',
    resolve: {
        extensions: ['.js', '.ts', '.vue']
    },
    // resolveLoader: {
    //     alias: {
    //         'vue-loader': require.resolve('vue-loader/lib/plugin')
    //     }
    // },
    plugins: [
        new SmartBannerPlugin(banner),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            cache: true,
            hash: true,
            template: './code/index.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            }
        })
    ]
}];