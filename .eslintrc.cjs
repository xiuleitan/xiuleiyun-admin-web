/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-prettier/skip-formatting'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // 禁用VScode的prettier插件
    // pnpm安装的prettier更关注美化代码
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true, // 单引号
        semi: false, // 无分号
        printWidth: 120, // 每行宽度至多120字符
        trailingComma: 'none', // 不加对象|数组最后逗号
        endOfLine: 'auto' // 换行符号不限制（win mac 不一致）
      }
    ],
    // ESLint更加关注于规范
    'vue/multi-word-component-names': [
      // 要求定义组件的时候必须多个单词
      'warn',
      {
        ignores: ['index'] // vue组件名称多单词组成（忽略index.vue, 但是index.vue是可以的）
      }
    ],
    'vue/no-setup-props-destructure': ['off'], // 关闭 props 解构的校验
    // 💡 添加未定义变量错误提示
    'no-undef': 'error'
  },

  // 同时解决按需引入element-plus组件时，eslint报错问题
  // 把需要引入的组件加入到全局变量中
  globals: {
    ElMessage: 'readonly',
    ElMessageBox: 'readonly',
    ElLoading: 'readonly'
  }
}
