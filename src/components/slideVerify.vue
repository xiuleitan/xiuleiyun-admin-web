<script setup>
import { ref, watch } from 'vue'
// 局部注册组件，需要单独引用组件样式
// 只提供局部引用的方式，不再采用插件形式，方便按需加载，减少主包大小
import SlideVerify from 'vue3-slide-verify'
import 'vue3-slide-verify/dist/style.css'
import img1 from '@/assets/img/img1.jpg'
import img2 from '@/assets/img/img2.jpg'
import img3 from '@/assets/img/img3.jpg'

// 使用 ref 创建响应式引用
const msg = ref('')
const block = ref(null)
const text = '向右滑动滑块验证'
const accuracy = 5
const imgs = [img1, img2, img3]
const modelValue = defineModel() // 父亲组件传递给子组件的值

// 定义事件处理函数
const onAgain = () => {
  msg.value = '检测到非人为操作的哦！ try again'
  // 刷新
  block.value?.refresh()
}

const onSuccess = (times) => {
  msg.value = `牛逼, 耗时${(times / 1000).toFixed(1)}s`
  modelValue.value.slideOk = true
}

const onFail = () => {
  msg.value = '拖准一点好不好!'
  modelValue.value.slideOk = false
}
// 监听slideOk的值, 如果发生变化, 就刷新滑块
watch(
  () => modelValue.value.refreshSlideNum,
  (newVal) => {
    if (newVal <= 10) {
      // 刷新滑块
      block.value?.refresh()
    }
  }
)

const onRefresh = () => {
  msg.value = '好好拖'
}

// const handleClick = () => {
//   // 刷新
//   block.value?.refresh()
//   msg.value = ''
// }
</script>

<template>
  <SlideVerify
    class="slide-verify"
    ref="block"
    :l="55"
    :slider-text="text"
    :accuracy="accuracy"
    @again="onAgain"
    @success="onSuccess"
    @fail="onFail"
    @refresh="onRefresh"
    :imgs="imgs"
    :show="false"
  ></SlideVerify>
  <!--  <button class="btn" @click="handleClick">在父组件可以点我刷新哦</button>-->
  <div>{{ msg }}</div>
</template>

<style scoped>
.btn {
  margin-top: 20px;
  outline: 0;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  color: #fff;
  background-color: #1890ff;
  cursor: pointer;
}
.btn:active {
  box-shadow: 1px 5px 0 rgba(0, 0, 0, 0.1) inset;
}
.slide-verify {
  //width: 80%;
  //margin: 0 auto;
  //padding: 20px;
  //border: 1px solid #ccc;
  //border-radius: 5px;
  //background-color: #f5f5f5;
  //box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  //text-align: center;
  //font-size: 14px;
  //color: #666;
  //line-height: 1.5;
  //margin-top: 20px;
}
</style>
