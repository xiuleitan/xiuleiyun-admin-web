module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-px-to-viewport': {
      unitToConvert: 'px', //需要转换的单位，默认为"px"
      viewportWidth: 1080, //需要重启vue视窗的宽度，对应的是我们设计稿的宽度(750 .
      // viewportHeight: 667, //视窗的高度，对应的是我们设计稿的高度. (也可以不配置)
      unitPrecision: 5, //指定 px 转换为视窗单位值的小数位数(很多时候无法整除)
      propList: ['*'], //指定可以转换的css属性，*代表全部css属性
      viewportUnit: 'vw', //指定需要转换成的视窗单位，建议使用vw
      fontViewportUnit: 'vw', //指定字体需要转换成的视窗单位，建议使用vw
      selectorBlacklist: ['ignore', 'tab-bar', 'tab-bar-item'], // 指定不需要转换的类，后面再讲.
      minPixelValue: 1, //小于或等于 1px 不转换为视窗单位.
      mediaQuery: true, //允许在媒体查询中转换px
      replace: true, //是否直接更换属性值，而不添加备用属性
      exclude: [/node_modules/] //忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
      // landscape: true, //是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
      // landscapeUnit: 'vw', //横屏时使用的单位
    }
  }
}
