module.exports = {
  devServer: {
    open: true
  },
  chainWebpack: config => {
    // 更改发布模式时的入口文件
    config.when(process.env.NODE_ENV === 'production', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')
// 发布模式的时候，三方的插件这样标注的话，就不会被打包，这样体积就会小很多
        config.set('externals', {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            axios: 'axios',
            lodash: '_',
            echarts: 'echarts',
            nprogress: 'NProgress',
            'vue-quill-editor': 'VueQuillEditor'
          })
          config.plugin('html').tap(args => {
            args[0].isProd = true
            return args
          })
    })

    // 更改开发模式时的入口文件
    config.when(process.env.NODE_ENV === 'development', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')
        config.plugin('html').tap(args => {
            args[0].isProd = false
            return args
          })
    })
  }
}
