<script setup>
import { ref } from 'vue'
// import { UploadFilled, Plus, Delete, Download, ZoomIn } from '@element-plus/icons-vue'
import JSZip from 'jszip'
import uploadIcon from '@/assets/img/upload2.png'
import zipIcon from '@/assets/img/zip.png'
import plusIcon from '@/assets/img/plus.png'
// import testCover from '@/assets/img/appID-100.jpg'
import { uploadAppRequest, uploadCoverRequest, uploadFormRequest } from '@/api/exec.js'
import SparkMD5 from 'spark-md5' // 使用 SparkMD5 库来计算 MD5 值

// 父传子的数据
const modelValue = defineModel()
// ------------------------ 选择应用 ------------------------
// 进度条
const uploadPercentage = ref(0)
// 上传的表单
const submitForm = ref({
  app_name: '',
  app_type: '',
  app_execPath: '',
  app_execDefaultParams: '-AudioMixer -Unattended -RenderOffScreen -ResX=1280 -ResY=720 -ForceRes',
  app_maxChannel: 100
})
const isUploadPrepare = ref(false)
const selectAppPath = ref('')

// 选择应用
const upLoadAppFile = ref(null)
const appFile = ref(null) // 上传的app文件
// 当选择app文件时
const handleAppFileChange = () => {
  if (upLoadAppFile.value.files[0]) {
    selectAppPath.value = upLoadAppFile.value.files[0].name
    isUploadPrepare.value = true
    appFile.value = upLoadAppFile.value.files[0] // 上传的文件

    // 解析zip文件, 查找exe文件路径
    try {
      if (appFile.value) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const zip = await JSZip.loadAsync(e.target.result) // 使用JSZip异步加载ZIP文件
          const files = [] // 创建一个数组用于存储找到的exe文件路径
          zip.forEach((relativePath, zipEntry) => {
            // 遍历ZIP文件中的每个条目
            if (zipEntry.name.endsWith('.exe')) {
              files.push(zipEntry.name)
            }
          })
          exeFiles.value = files // 将找到的exe文件路径数组赋值给响应式变量
        }
        reader.readAsArrayBuffer(appFile.value) // 将选择的文件读取为ArrayBuffer，以便可以用JSZip进行解析
      }
    } catch (error) {
      // 错误消息提示
      ElMessageBox.alert(error, '错误', {
        confirmButtonText: '知道了',
        type: 'error'
      })
    }
  }
}

// ------------------------ 选择封面图 ------------------------
const coverImg = ref('')
const upLoadCoverFile = ref(null)
const coverFile = ref(null) // 上传的cover文件

// 当选择封面图片时
const handleCoverFileChange = () => {
  if (upLoadCoverFile.value.files[0]) {
    coverFile.value = upLoadCoverFile.value.files[0] // 上传的文件
    coverImg.value = URL.createObjectURL(coverFile.value)
    console.log(coverImg.value)
  }
}
// 蒙版
const isReSelectCover = ref(false)
const showReSelectCover = () => {
  if (coverImg.value) {
    // 有封面图片在显示蒙版
    isReSelectCover.value = true
  }
}

const hideReSelectCover = () => {
  if (coverImg.value) {
    isReSelectCover.value = false
  }
}
// ------------------------ 选择exe文件 ------------------------
const showDropdown = ref(false) // 是否显示下拉框
const exeFiles = ref([]) // 执行文件列表
const handleInputExeFocus = () => {
  showDropdown.value = true
}
// 当输入框失去焦点时，隐藏下拉框
const handleInputExeBlur = () => {
  // 使用 setTimeout 延迟隐藏，以便点击事件先触发
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
// 当选择一个exe路径时，将其赋值给表单， 隐藏下拉框
const handleExecFileClick = (file) => {
  submitForm.value.app_execPath = file
  showDropdown.value = false
}
// ------------------- 开始上传---------------------
const btnIsDisabled = ref(false) // 按钮是否禁用

const checkFormInput = () => {
  submitForm.value.app_name = String(submitForm.value.app_name).trim()
  submitForm.value.app_type = String(submitForm.value.app_type).trim()
  submitForm.value.app_execPath = String(submitForm.value.app_execPath).trim()
  submitForm.value.app_execDefaultParams = String(submitForm.value.app_execDefaultParams).trim()
  const form = submitForm.value
  // 检查 app_name 不能为空
  if (!form.app_name.trim()) {
    submitForm.value.app_name = ''
    return { valid: false, message: '应用名称不能为空!' }
  }
  // 检查 app_type 不能为空
  if (!form.app_type.trim()) {
    submitForm.value.app_type = ''
    return { valid: false, message: '应用类型不能为空!' }
  }

  // 检查 app_execPath 不能为空
  if (!form.app_execPath.trim()) {
    submitForm.value.app_execPath = ''
    return { valid: false, message: '应用文件执行路径不能为空!' }
  }

  // 检查 app_maxChannel 不能为空且必须是1以上的数字
  const maxChannel = parseInt(form.app_maxChannel, 10)
  if (isNaN(maxChannel) || maxChannel < 1) {
    return { valid: false, message: '应用最大并发数量必须是大于1的整数!' }
  }

  return { valid: true, message: 'Form is valid' }
}
// 计算md5的函数
const calculateMD5 = (file) => {
  return new Promise((resolve, reject) => {
    const chunkSize = 1024 * 1024 * 10 // 10M
    const chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++
      if (currentChunk < chunks) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    fileReader.onerror = () => {
      reject(new Error('md5: Error reading file'))
    }

    const loadNext = () => {
      const start = currentChunk * chunkSize
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}
const handleStartSubmitApp = async () => {
  // 先上传应用文件
  if (!appFile.value) {
    ElNotification({
      title: '错误',
      message: '请选择应用文件',
      type: 'error'
    })
    return
  }
  // 检查是否用图片
  if (!coverFile.value) {
    ElNotification({
      title: '错误',
      message: '请选择封面图像文件',
      type: 'error'
    })
    return
  }
  // 检查表单
  const result = checkFormInput()
  if (!result.valid) {
    ElNotification({
      title: '错误',
      message: result.message,
      type: 'error'
    })
    return
  }

  // 按钮禁用
  btnIsDisabled.value = true
  let isUploadSuccess = true // 上传是否成功
  // 生成appID的时间戳
  const timestamp = Date.now() // 获取当前时间戳
  const appID = 'appID-' + timestamp // 生成appID

  // 计算文件的 MD5 值
  let md5 = ''
  try {
    uploadPercentage.value = 1
    md5 = await calculateMD5(appFile.value)
    console.log('客户端MD5:', md5)
  } catch (error) {
    console.error('Error calculating MD5:', error)
    ElMessageBox({
      type: 'error',
      title: '错误',
      message: '计算文件MD5值时出错'
    })
    // 按钮启用
    btnIsDisabled.value = false
    return
  }

  // ------------------------------------- 上传app文件 -------------------------------------
  const chunkSize = 1024 * 1024 * 10 // 10M
  const totalChunks = Math.ceil(appFile.value.size / chunkSize) // 总片数

  // 一片一片的传
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize // 开始位置
    const end = Math.min(appFile.value.size, start + chunkSize) // 最后一片可能不足chunkSize
    const chunk = appFile.value.slice(start, end) // 切片

    // 上传切片
    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('filename', appFile.value.name)
    formData.append('chunkNumber', i)
    formData.append('totalChunks', totalChunks)
    formData.append('size', appFile.value.size)
    formData.append('appID', appID)
    formData.append('md5', md5)

    // 上传切片
    try {
      await uploadAppRequest(formData, i, totalChunks, uploadPercentage)
    } catch (error) {
      console.error('Error uploading chunk:', error)
      ElMessageBox({
        type: 'error',
        title: '上传错误',
        message: `上传第 ${i + 1} 片时出错`
      })
      isUploadSuccess = false
      // 按钮启用
      btnIsDisabled.value = false
      return
    }
  }

  uploadPercentage.value = 100 // 校验成功后进度条100%
  // 完成上传后执行后续操作
  ElNotification({
    title: '成功',
    message: '应用文件上传成功',
    type: 'success'
  })

  // ------------------------------------- 上传图像文件 -------------------------------------
  const coverformData = new FormData()
  coverformData.append('image', coverFile.value)
  coverformData.append('appID', appID)

  try {
    await uploadCoverRequest(coverformData)
    console.log('Image uploaded successfully')
    // 完成上传后执行后续操作
    ElNotification({
      title: '成功',
      message: '应用封面图像上传成功',
      type: 'success'
    })
  } catch (error) {
    ElMessageBox({
      type: 'error',
      title: '上传错误',
      message: `上传封面图像时出错: ${error}`
    })
    isUploadSuccess = false
    // 按钮启用
    btnIsDisabled.value = false
  }

  // ------------------------------------- 上传表单 -------------------------------------
  try {
    await uploadFormRequest(submitForm.value, appID, md5)
    // 完成上传后执行后续操作
    ElNotification({
      title: '成功',
      message: '应用信息上传成功',
      type: 'success'
    })
  } catch (error) {
    ElMessageBox({
      type: 'error',
      title: '上传错误',
      message: `上传表单时出错: ${error}`
    })
    isUploadSuccess = false
  }

  if (isUploadSuccess) {
    ElMessage({
      message: '正在切换到应用同步页面...',
      type: 'success',
      plain: true,
      offset: 200
    })
    // 上传成功后清空表单
    submitForm.value = {
      app_name: '',
      app_type: '',
      app_execPath: '',
      app_execDefaultParams: '-AudioMixer -Unattended -RenderOffScreen -ResX=1280 -ResY=720 -ForceRes',
      app_maxChannel: 100
    }
    // 清空上传的文件
    appFile.value = null
    coverFile.value = null
    coverImg.value = ''
    selectAppPath.value = ''
    isUploadPrepare.value = false
    // 延迟1s切换到应用总览
    setTimeout(() => {
      modelValue.value.tabIndex = 5 // 切换到应用同步
      modelValue.value.addAppID = appID
    }, 1500)
  }
  // 按钮启用
  btnIsDisabled.value = false
}
</script>

<template>
  <div class="root-box">
    <div class="left-box"></div>
    <div class="right-box">
      <div class="right-box2">
        <!--        上传App-->
        <div class="upload-app">
          <input type="file" class="input-app-file" ref="upLoadAppFile" @change="handleAppFileChange" accept=".zip" />

          <div class="uploadOK" v-if="isUploadPrepare">
            <img :src="zipIcon" alt="" />
            <span class="select-app-name">{{ selectAppPath }}</span>
            <div class="upload-text-tip"><span>点击修改应用(.zip)</span></div>
          </div>
          <div class="uploadOK" v-else>
            <img :src="uploadIcon" alt="" />
            <div class="upload-text-tip"><span>点击选择应用(.zip)</span></div>
          </div>

          <!--            进度条-->
          <div class="progress-box">
            <div class="uploading-text" v-show="uploadPercentage >= 1">{{ uploadPercentage }}%</div>
            <div class="pulse1" v-show="uploadPercentage >= 1"></div>
            <div class="pulse2" v-show="uploadPercentage >= 1"></div>
            <div class="progress" :style="{ width: uploadPercentage + '%' }"></div>
          </div>
        </div>
        <!--        上传封面图-->
        <div class="upload-cover" @mouseenter="showReSelectCover" @mouseleave="hideReSelectCover">
          <input
            type="file"
            class="input-cover-file"
            ref="upLoadCoverFile"
            @change="handleCoverFileChange"
            accept=".jpg"
          />
          <div class="reSelectCover" v-show="isReSelectCover">点击重新选择</div>
          <img class="coveredImg" :src="coverImg" v-if="coverImg" alt="" />
          <div class="add-cover" v-else>
            <img :src="plusIcon" alt="" />
            <h6>选择封面图(高600x宽1000)</h6>
          </div>
        </div>
        <!--        表单-->
        <div class="inputform">
          <div class="add-box">
            <div class="one-input">
              <label for="app_name">应用名称</label
              ><input type="text" id="app_name" v-model="submitForm.app_name" autocomplete="off" />
            </div>
            <div class="one-input">
              <label for="app_type">应用类型</label
              ><input type="text" id="app_type" v-model="submitForm.app_type" autocomplete="off" />
            </div>
            <div class="one-input one-input-execpath">
              <label for="app_execPath">文件执行路径</label
              ><input
                type="text"
                id="app_execPath"
                placeholder=".exe"
                v-model="submitForm.app_execPath"
                @focus="handleInputExeFocus"
                @blur="handleInputExeBlur"
                autocomplete="off"
              />
              <div v-if="showDropdown && exeFiles.length" class="drop-down-box">
                <ul>
                  <li v-for="file in exeFiles" :key="file" @click="handleExecFileClick(file)">{{ file }}</li>
                </ul>
              </div>
            </div>
            <div class="one-input">
              <label for="app_execDefaultParams">默认启动参数</label
              ><input
                type="text"
                id="app_execDefaultParams"
                v-model="submitForm.app_execDefaultParams"
                autocomplete="off"
              />
            </div>
            <div class="one-input">
              <label for="app_maxChannel">最大并发路数</label
              ><input type="text" id="app_maxChannel" v-model="submitForm.app_maxChannel" autocomplete="off" />
            </div>
          </div>
        </div>
        <button class="submit-app-btn" @click="handleStartSubmitApp" v-if="!btnIsDisabled">开始上传</button>
        <button class="submit-app-btn2" v-else>开始上传</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.root-box {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  .left-box {
    width: 200px;
    background-color: #854638;
    background: url('@/assets/img/bit3.jpg') no-repeat;
    background-size: cover;
    //filter: blur(1px);
    //z-index: -1;
  }

  .right-box {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 10px;
    .right-box2 {
      width: 100%;
      height: 200vh;
      //border: 1px solid black;
      box-shadow: 0 0 3px gray;
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      align-content: flex-start;
      .upload-app {
        position: relative;
        margin: 6px;
        width: 99%;
        //height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        box-shadow: 0 0 1px 1px #e8e7e7 inset;
        border: 1px dashed #ffffff;
        background-color: #fafafa;
        padding-bottom: 7px;
        padding-left: 10px;
        padding-right: 10px;
        border-radius: 5px;
        &:hover {
          cursor: pointer;
          background-color: #f0f0f0;
          border: 1px dashed #1890ff;
        }
        .input-app-file {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          z-index: 1;
          &:hover {
            cursor: pointer;
          }
        }
        .uploadOK {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          align-content: center;
          .select-app-name {
            margin-top: -7px;
            font-size: 8px;
            font-weight: 400;
            color: #0e1012;
          }
          img {
            height: 45px;
            width: 45px;
          }
          .upload-text-tip {
            font-size: 9px;
            margin-bottom: 5px;
            text-align: center;
            span {
              color: #1890ff;
            }
          }
        }

        .progress-box {
          position: relative;
          width: 100%;
          height: 12px;
          border-radius: 7px;
          background-color: #eeefef;
          box-shadow: 0 0 2px 1px gray inset;
          //overflow: hidden;
          padding: 1px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .progress {
            height: 8px;
            width: 0;
            background-color: #3b9b3b;
            border-radius: 5px;
            text-align: right;
            transition: all 0.3s;
            margin: 0 2px;
          }
          @keyframes blowupScale {
            from {
              transform: scale(1);
            }
            to {
              transform: scale(1.1);
            }
          }
          @keyframes blowuprotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .uploading-text {
            position: absolute;
            right: 25%;
            bottom: 25px;
            width: 40px;
            height: 40px;
            border-radius: 20px;
            //background-color: #419b41;
            color: #1c7212;
            font-size: 14px;
            line-height: 40px;
            text-align: center;
            font-weight: 700;
            //margin-top: 4px;
            z-index: 4;
            animation: blowupScale 0.6s linear 0.8s infinite alternate;
          }
          .pulse1,
          .pulse2 {
            position: absolute;
            right: 25%;
            bottom: 25px;
            width: 40px;
            height: 40px;
            border-radius: 34%;
            //background-color: darkred;
            //transform-origin: 50% 0;
            box-shadow: 0 0 3px 2px #1d823d;
          }
          .pulse1 {
            transform: rotate(30deg);
            animation: blowuprotate 2.5s linear 0s infinite;
          }
          .pulse2 {
            transform: rotate(30deg);
            animation: blowuprotate 2.5s linear 2s infinite;
          }
        }
      }

      .upload-cover {
        position: relative;
        height: 120px;
        width: 240px;
        border-radius: 3px;
        box-shadow: 0 0 2px 1px gray;
        overflow: hidden;
        &:hover {
          cursor: pointer;
          background-color: #f0f0f0;
          border: 1px dashed #1890ff;
        }
        .input-cover-file {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          z-index: 2;
          &:hover {
            cursor: pointer;
          }
        }
        .reSelectCover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 9px;
          z-index: 1;
          text-align: center;
          line-height: 120px;
          &:hover {
            cursor: pointer;
          }
        }
        .coveredImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .add-cover {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          align-content: center;
          img {
            width: 50px;
            height: 50px;
            margin-bottom: 5px;
          }
          h6 {
            font-size: 9px;
            font-weight: 400;
            color: #1890ff;
          }
        }
      }

      .inputform {
        width: 50%;
        .add-box {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          align-content: center;
          .one-input {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            align-content: flex-start;
            margin: 2px;
            label {
              font-size: 9px;
              font-weight: 400;
              color: #212121;
              margin-bottom: 2px;
              margin-left: 5px;
            }
            input {
              width: 100%;
              height: 19px;
              font-size: 10px;
              padding: 2px;
              border-radius: 3px;
              border: 1px solid #b7b5b5;
              outline: none;
              //box-shadow: 0 0 1px 1px #c0c0c0;
              // 字体为宋体
              font-family: 'SimSun';
              &:focus {
                border: 1px solid #2bb95f;
                box-shadow: 0 0 2px 1px #3a9234;
              }
            }
          }
          .one-input-execpath {
            position: relative;
            .drop-down-box {
              position: absolute;
              top: 35px;
              left: 0;
              width: 100%;
              background-color: #f8f8f8;
              border: 1px solid #2f449b;
              border-radius: 3px;
              box-shadow: 0 0 2px 1px #c1ff8f;
              transition: all 0.2s;

              ul {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                  font-size: 10px;
                  font-weight: 400;
                  padding: 2px;
                  font-family: 'SimSun';

                  &:hover {
                    background-color: #c8f4c7;
                    cursor: pointer;
                  }
                }
              }
            }
          }
        }
      }
      .submit-app-btn {
        width: 100px;
        height: 30px;
        background-color: #4db379;
        color: #ffffff;
        font-size: 12px;
        border-radius: 5px;
        border: none;
        margin: 10px;
        box-shadow: 0 0 2px 1px gray;
        transition: all 0.2s;
        &:hover {
          cursor: pointer;
          background-color: #124d28;
        }
      }
      .submit-app-btn2 {
        width: 100px;
        height: 30px;
        background-color: #dad9d9;
        color: #868383;
        font-size: 12px;
        border-radius: 5px;
        border: none;
        margin: 10px;
        box-shadow: 0 0 2px 1px gray;
        transition: all 0.2s;
      }
    }
  }
}
</style>
