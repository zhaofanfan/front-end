var webpack = require('webpack');
var path = require('path');
var publicPath = 'http://127.0.0.1:3000/';

var ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackBrowserPlugin = require('webpack-browser-plugin');
var CommonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
    //插件项
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.DefinePlugin({
            //'process.env.NODE_ENV': '"development"'
            'process.env.NODE_ENV': '"production"'
        }),
        new WebpackBrowserPlugin({
            //browser: 'Firefox',
            port: 3000,
            //url: 'http://192.168.3.1'
        }),
        new ExtractTextPlugin("css/wxbase.css"),
        new webpack.BannerPlugin("Copyright Calliance Payment co.,Ltd."),
        //new webpack.IgnorePlugin(new RegExp("^(jquery|react|react-dom)$")),
        new webpack.HotModuleReplacementPlugin() //热加载插件
    ],
    //页面入口文件配置
    entry: [
        // 写在入口文件之前
        "webpack-dev-server/client?http://127.0.0.1:3000",
        "webpack/hot/only-dev-server",
        __dirname + "/index.js"
    ],
    //入口文件输出配置
    output: {
        path: path.join(__dirname, './dist'),
        filename: "bundle.js",
        publicPath: publicPath
    },

    module: {
        loaders: [{
                test: /\.json$/,
                loader: "json"
            },
            //.css 文件使用 style-loader 和 css-loader 来处理
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            /*
                        //.js 文件使用 jsx-loader 来编译处理
                        {
                            test: [/\.js$/, /\.jsx$/],
                            loader: 'react-hot!jsx?harmony',
                            exclude: '/node_modules/'
                        },*/

            {
                test: /\.js$/,
                exclude: /node_modules/,
                //loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015']
                loader: 'babel' //在webpack的module部分的loaders里进行配置即可
            }
        ]
    },
    devServer: {
        contentBase: "./", //本地服务器所加载的页面所在的目录
        colors: true, //终端中输出结果为彩色
        historyApiFallback: true, //不跳转
        hot: true,
        inline: true //实时刷新
    },
    //其它解决方案配置
    resolve: {
        extensions: ['', '.coffee', '.js', '.jsx']
    }
};
