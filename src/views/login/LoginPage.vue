<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores' // 引入用户仓库
import { useRouter } from 'vue-router' // 引入路由
// 导入slideVerify组件
import slideVerify from '@/components/slideVerify.vue'
// 导入视频
// import video1 from '@/assets/video/video1.mp4'
import { userLoginRequest } from '@/api/user.js'

// console.log(video1)

// ----------------------- 结构和样式 ---------------------
// const videos = ref([video1])
const showCaptcha = ref(false)
const inputNameOk = ref({
  color: 'green'
})
const inputPwdOk = ref({
  color: 'green'
})
const slideOption = ref({
  refreshSlideNum: 0, // 刷新滑块的次数
  slideOk: false // 滑块是否通过验证
})

// ------------------------ 以下是登录逻辑 ---------------------
const userStore = useUserStore()
const router = useRouter()
// 获取表单数据
const loginInfo = ref({
  username: '',
  password: '',
  repassword: '',
  captcha: '' // 验证码
})

const hint = ref({
  username: '',
  password: '',
  repassword: '请再次输入密码',
  captcha: '请输入验证码'
}) // 提示信息

// 当输入框失去焦点时触发, 用来校验用户名和密码
const handleChangeName = () => {
  // 用户名校验
  if (!/^[a-zA-Z0-9_]{3,10}$/.test(loginInfo.value.username)) {
    hint.value.username = '请输入3-10个字符(英文,数字,_或其组合)'
    //   字体颜色改为红色
    inputNameOk.value.color = 'red'
  } else {
    hint.value.username = '格式正确!'
    //   字体颜色改为绿色
    inputNameOk.value.color = 'green'
  }
}
const handleChangePwd = () => {
  // 密码校验
  // if (!/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{3,10}$/.test(loginInfo.value.password)) {
  if (!/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z!@#$%^&*()\-+_]{3,16}$/.test(loginInfo.value.password)) {
    hint.value.password = '请输入3-10个字符(至少为英文和数字的组合)'
    //   字体颜色改为红色
    inputPwdOk.value.color = 'red'
  } else {
    hint.value.password = '格式正确!'
    //   字体颜色改为绿色
    inputPwdOk.value.color = 'green'
  }
}

// 登录请求
const handleLogin = () => {
  // 登录前的校验, 通过判断字体颜色是否为绿色来判断是否通过校验
  if (inputNameOk.value.color !== 'green' || inputPwdOk.value.color !== 'green') {
    ElMessage.error('用户名或密码格式错误')
    return
  }

  // 开启滑块验证码
  showCaptcha.value = true
  requestFullScreen() // 进入全屏

  // 如果刷新次数大于10次, 则提示已经刷新5次, 请稍后再试
  if (slideOption.value.refreshSlideNum > 5) {
    ElMessage.error('刷新次数过多, 请稍后再试')
    return
  }
  slideOption.value.refreshSlideNum++ // 刷新滑块
}
const startLogin = async () => {
  // 退出全屏
  exitFullScreen()
  // 登录请求
  const res = await userLoginRequest(loginInfo.value)
  ElMessage.success('登录成功')
  // console.log(res)
  // 登录成功后将token存储到仓库中
  userStore.setToken(res.data.data.token)

  // 登录成功后跳转到下一页
  router.push('/mgmt')
}

// 监听slideOk的值, 如果为true, 则关闭滑块验证码, 并且跳转到下一页
watch(
  () => slideOption.value.slideOk,
  (newVal) => {
    if (newVal) {
      // 关闭滑块验证码
      showCaptcha.value = false
      // 重置刷新次数
      slideOption.value.refreshSlideNum = 0
      // 重置slideOk
      slideOption.value.slideOk = false
      // 开始登录
      startLogin()
    }
  }
)

//------------------------其他交互-------------------------
// const videoElement = ref(null)
// onMounted(() => {
//   // 当页面加载完成后, 尝试自动播放视频
//   videoElement.value.play()
// })

// 切换全屏
const toggleFullScreen = () => {
  var elem = document.documentElement // 修改这里，使用 document.documentElement

  if (
    !document.fullscreenElement &&
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
}
// 进入全屏
const requestFullScreen = () => {
  var de = document.documentElement
  if (de.requestFullscreen) {
    de.requestFullscreen()
  } else if (de.mozRequestFullScreen) {
    de.mozRequestFullScreen()
  } else if (de.webkitRequestFullScreen) {
    de.webkitRequestFullScreen()
  }
}

// 退出全屏
const exitFullScreen = () => {
  var de = document
  if (de.exitFullscreen) {
    de.exitFullscreen()
  } else if (de.mozCancelFullScreen) {
    de.mozCancelFullScreen()
  } else if (de.webkitCancelFullScreen) {
    de.webkitCancelFullScreen()
  }
}
</script>

<template>
  <div class="root-box">
    <!--  背景为一个video视频, 循环播放-->
    <div class="video-box">
      <!--      <video ref="videoElement" class="video-bg" :src="videos[0]" autoplay loop preload="auto" muted></video>-->
    </div>

    <!--  登录div-->
    <div class="login-box">
      <h2>嗅垒云管理系统</h2>
      <!--    一个input标签, 用来输入用户名, -->
      <div class="login-input">
        <input type="text" v-model="loginInfo.username" placeholder="请输入用户名" @input="handleChangeName" />
        <div class="login-input-hint" :style="inputNameOk">&nbsp;{{ hint.username }}</div>
      </div>

      <div class="login-input">
        <input
          type="password"
          v-model="loginInfo.password"
          placeholder="请输入密码"
          @input="handleChangePwd"
          @keyup.enter="handleLogin"
        />
        <div class="login-input-hint" :style="inputPwdOk">&nbsp;{{ hint.password }}</div>
      </div>

      <!--    一个登录按钮-->
      <button class="btn-login" @click="handleLogin">进入管理</button>
    </div>

    <!--    一个滑块验证码的地方-->
    <div class="login-captcha" v-show="showCaptcha">
      <div class="captcha">
        <slideVerify v-model="slideOption" ref="slideblock"></slideVerify>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
//.root-box {
//  //width: 1080px;
//  //height: 1920px;
//  @media screen and (orientation: portrait) {
//    position: absolute;
//    top: 0;
//    left: 0;
//    width: 100vw;
//    height: 100vh;
//    //width: 100vh;
//    //height: 100vw;
//    //top: 0;
//    //left: 100vw;
//    //-webkit-transform: rotate(90deg);
//    //-moz-transform: rotate(90deg);
//    //-ms-transform: rotate(90deg);
//    //transform: rotate(90deg);
//    //transform-origin: 0% 0%;
//  }
//
//  @media screen and (orientation: landscape) {
//    position: absolute;
//    top: 0;
//    left: 0;
//    width: 100vw;
//    height: 100vh;
//  }
//}

// 竖屏
@media screen and (orientation: portrait) {
  .video-box {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    //.video-bg {
    //  width: 100%;
    //  height: 100%;
    //  object-fit: cover;
    //}
    background: linear-gradient(135deg, #3790d0, #3b9b3b, #4a4ad8);
  }

  .login-box {
    position: absolute;
    top: 50%; /* 设置顶部为父元素高度的50% */
    left: 50%; /* 设置左侧为父元素宽度的50% */
    transform: translate(-50%, -50%); /* 使用 transform 移动元素，从而准确居中 */
    width: 90%;
    //margin: 200px auto;
    padding: 6%;
    border: 1px solid rgba(29, 115, 11, 0.1);
    border-radius: 50px;
    box-shadow: 0 0 50px #ccc;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.5);
    h2 {
      margin-bottom: 50px;
      font-size: 100px;
      color: #352a3d;
      text-shadow: 1px 1px 7px #706c6c;
    }
    .login-input {
      position: relative;
      margin-bottom: 4%;
      input {
        width: 100%;
        height: 140px;
        padding: 0 40px;
        border: 1px solid rgba(29, 115, 11, 0.1);
        border-radius: 30px;
        outline: none;
        font-size: 60px;
        //字符间距为1px
        letter-spacing: 3px;
        //字体为黑体
        font-weight: bold;
        // 字体为Consolas
        //font-family: 'Consolas', 'Microsoft YaHei', 'WenQuanYi Micro Hei', 'sans-serif';
        //行高为18px
        line-height: 28px;
        background-color: rgba(255, 255, 255, 0.5);
        //  内部阴影
        box-shadow: 0 0 9px #565454 inset;
      }
      input:focus {
        border-color: rgb(11, 75, 115);
        border-width: 8px;
      }
      .login-input-hint {
        text-align: left;
        padding-left: 20px;
        width: 100%;
        //color: #f00;
        font-size: 40px;
      }
    }
    .btn-login {
      width: 100%;
      height: 140px;
      margin-top: 40px;
      border: none;
      border-radius: 50px;
      background-color: rgba(11, 79, 115, 0.8);
      color: #fff;
      cursor: pointer;
      font-size: 60px;
      letter-spacing: 6px;
      font-weight: 500;
    }
  }

  .login-captcha {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
    .captcha {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -75%);
      padding: 40px;
      background-color: white;
      border-radius: 24px;
      font-size: 40px;
      box-shadow: 0 0 15px #ccc;
      //  字体为黑体
      font-weight: 600;
    }
  }
}

// 横屏
@media screen and (orientation: landscape) {
  .video-box {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    //.video-bg {
    //  width: 100%;
    //  height: 100%;
    //  object-fit: cover;
    //}
    background: linear-gradient(135deg, #3790d0, #3b9b3b, #4a4ad8);
  }

  .login-box {
    position: absolute;
    top: 50%; /* 设置顶部为父元素高度的50% */
    left: 50%; /* 设置左侧为父元素宽度的50% */
    transform: translate(-50%, -50%); /* 使用 transform 移动元素，从而准确居中 */
    width: 300px;
    //margin: 200px auto;
    padding: 25px;
    border: 1px solid rgba(29, 115, 11, 0.1);
    border-radius: 10px;
    //box-shadow: 0 0 20px #ccc;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.5);
    h2 {
      margin-bottom: 15px;
      font-size: 25px;
      color: #352a3d;
      text-shadow: 1px 1px 7px #706c6c;
    }
    .login-input {
      position: relative;
      margin-bottom: 2px;
      input {
        width: 100%;
        height: 30px;
        padding: 0 12px;
        border: 1px solid rgba(29, 115, 11, 0.1);
        border-radius: 6px;
        outline: none;
        font-size: 14px;
        //字符间距为1px
        letter-spacing: 1px;
        //字体为黑体
        font-weight: bold;
        // 字体为Consolas
        //font-family: 'Hiragino Sans GB', system-ui;
        //行高为18px
        line-height: 28px;
        background-color: rgba(255, 255, 255, 0.5);
        //  内部阴影
        box-shadow: 0 0 2px #565454 inset;
      }
      input:focus {
        border-color: rgb(29, 115, 11);
        border-width: 1px;
      }
      .login-input-hint {
        text-align: left;
        padding-left: 10px;
        width: 100%;
        //color: #f00;
        font-size: 10px;
      }
    }
    .btn-login {
      width: 100%;
      height: 30px;
      margin-top: 2px;
      border: none;
      border-radius: 10px;
      background-color: rgba(14, 60, 160, 0.53);
      color: #fff;
      cursor: pointer;
      font-size: 16px;
      letter-spacing: 6px;
      font-weight: 500;
    }
  }

  .login-captcha {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
    .captcha {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -75%);
      padding: 12px;
      background-color: white;
      border-radius: 8px;
      font-size: 9px;
      box-shadow: 0 0 15px #ccc;
      //  字体为黑体
      font-weight: 600;
    }
  }
}
</style>
