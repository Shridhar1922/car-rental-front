const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

const ENV = process.env.npm_lifecycle_event;
const isProd = ENV === "build";

const lanIP = "localhost";
const lanPORT = 5001;

const appPath = path.join(__dirname, "./src/app");
const distPath = path.join(__dirname, "./dist");
const publicPath = path.join(__dirname, "./src/public");
module.exports = (function makeWebpackConfig() {
  const config = {
    mode: ENV === "build" ? "development" : "production"
  };

  config.entry = {
    app: path.join(appPath, "app.js")
  };

  config.output = {
    path: distPath,
    publicPath: isProd ? "/" : "http://" + lanIP + ":" + lanPORT + "/",
    filename: isProd ? "[name].[hash].js" : "[name].bundle.js",
    chunkFilename: isProd ? "[name].[hash].js" : "[name].bundle.js"
  };

  if (isProd) {
    config.devtool = "source-map";
  } else {
    config.devtool = "eval";
  }

  config.resolve = {
    modules: [path.resolve(__dirname, "node_modules"), "node_modules", appPath],
    alias: {
      root: appPath,
      components: path.join(appPath, "components"),
      libs: path.join(appPath, "libs"),
      services: path.join(appPath, "services"),
      styles: path.join(appPath, "styles"),
      tags: path.join(appPath, "tags"),
      views: path.join(appPath, "views"),
      constants: path.join(appPath, "constants"),
      forms: path.join(appPath, "forms")
    }
  };

  config.module = {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        include: [appPath]
      },
      {
        test: /\.(png|jpg|jpeg)$/,
        use: "url-loader?limit=10000"
      },
      {
        test: /\.svg$/,
        use: "url-loader?limit=10000&mimetype=image/svg+xml"
      },
      {
        test: /\.woff$/,
        use: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.woff2$/,
        use: "url-loader?limit=10000&mimetype=application/font-woff2"
      },
      {
        test: /\.ttf$/,
        use: "url-loader?limit=10000&mimetype=application/x-font-truetype"
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
    ]
  };

  config.plugins = [];

  config.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),

    new HtmlWebpackPlugin({
      template: path.join(publicPath, "index.html"),
      inject: "body"
    }),

    /*new PreloadWebpackPlugin({
            rel: 'preload',
            include: ['vendor']
        }),*/

    /* new webpack.optimize.CommonsChunkPlugin({
             name: 'vendor',
             filename: isProd ? '[name].[hash].js' : '[name].bundle.js',
             minChunks(module, count) {
                 var context = module.context;
                 return context && context.indexOf('node_modules') >= 0;
             }
         }),*/

    new ExtractTextPlugin({
      filename: "[name].[hash].css",
      disable: !isProd
    })
  );

  if (isProd) {
    config.plugins.push(
      new webpack.NoEmitOnErrorsPlugin(),

      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.ennv.BASE_URL": JSON.stringify("/api"),
        "process.ennv.IMAGE_BASE_URL": JSON.stringify("/static/")
      }),

      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),

      new UglifyJSPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            drop_console: false
          }
        }
      }),

      new CopyWebpackPlugin(
        [
          {
            from: path.resolve(__dirname, "./src/public")
          }
        ],
        {
          ignore: ["*.html", "service-worker.js"]
        }
      )
    );
  } else {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("development")
      })
    );
  }

  config.devServer = {
    contentBase: "./src/public",
    stats: "minimal",
    host: lanIP,
    port: lanPORT
  };

  return config;
})();
