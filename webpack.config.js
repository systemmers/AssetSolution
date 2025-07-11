const path = require('path');

module.exports = {
  entry: {
    // JavaScript 번들
    bundle: './app/static/js/index.js',
    // CSS 번들 (Sass 엔트리 포인트)
    style: './app/static/css/src/main.scss'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'app', 'static', 'dist'),
    clean: true, // 빌드할 때마다 dist 폴더 정리
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // CSS를 별도 파일로 추출
          'style-loader',
          // CSS를 CommonJS로 변환
          'css-loader',
          // Sass를 CSS로 컴파일
          {
            loader: 'sass-loader',
            options: {
              // Bootstrap 및 기타 패키지의 Sass 파일을 찾을 수 있도록 설정
              sassOptions: {
                includePaths: [
                  path.resolve(__dirname, 'node_modules'),
                  path.resolve(__dirname, 'app/static/css/src')
                ]
              }
            }
          }
        ],
      },
    ]
  },
  resolve: {
    // Sass import에서 확장자 생략 허용
    extensions: ['.js', '.scss', '.css'],
    // alias 설정으로 import 경로 단축
    alias: {
      '@': path.resolve(__dirname, 'app/static/css/src'),
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap')
    }
  },
  devtool: 'source-map'
}; 