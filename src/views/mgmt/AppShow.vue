<script setup>
import { onMounted, ref } from 'vue'
import {
  deleteAppRequest,
  getAppList,
  uploadAppModifyRequest,
  uploadCoverModifyRequest,
  uploadFormModifyRequest
} from '@/api/exec.js'
import { baseURL } from '@/utils/request.js'
import zipIcon from '@/assets/img/zip.png'
// import uploadIcon from '@/assets/img/upload2.png'
// import plusIcon from '@/assets/img/plus.png'
import JSZip from 'jszip'
import SparkMD5 from 'spark-md5' // 使用 SparkMD5 库来计算 MD5 值

const img_baseURL = baseURL + '/api/txl/imgs/'
// 父传子的数据
const modelValue = defineModel()
// 函数: 按照创建时间降序排序
function sortAppListByCreateDate(applist) {
  return applist.sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
}
let applist = ref([])
// 刷新数据的函数
const refreshAppList = async () => {
  try {
    const res = await getAppList()
    // 消息提示
    ElMessage({
      message: '获取应用列表成功',
      type: 'success',
      plain: true
    })

    applist.value = res.data.data.applications_list
    // console.log(applist.value)
    // 遍历列表中的每个对象, 将每个对象中的执行路径更换为字符串, 使用/分隔
    applist.value.forEach((item) => {
      item.execPath = item.execPath.slice(2).join('/')
    })

    // 按照创建时间降序排序
    applist.value = sortAppListByCreateDate(applist.value)
  } catch (error) {
    // 错误消息提示
    ElMessageBox.alert(error, '错误', {
      confirmButtonText: '知道了',
      type: 'error'
    })
  }
}
// 当元素被挂载到页面上时, 发起请求, 获取应用列表
onMounted(() => {
  refreshAppList()
  // console.log(applist.value)
})

// 上传的表单
const submitForm = ref({
  app_name: '',
  app_type: '',
  app_execPath: [],
  app_execDefaultParams: '-AudioMixer -Unattended -RenderOffScreen -ForceRes',
  app_maxChannel: 100,
  appID: ''
})
// 用来备份表单数据, 验证是否修改
const submitFormBak = ref({
  app_name: '',
  app_type: '',
  app_execPath: [],
  app_execDefaultParams: '-AudioMixer -Unattended -RenderOffScreen -ForceRes',
  app_maxChannel: 100,
  appID: ''
})
const drawer2 = ref(false)
const search_list = ref([])

// 编辑
const handleEdit = async (index, row) => {
  drawer2.value = true // 打开抽屉

  // 刷新数据
  refreshAppList()

  // 将zip文件展示在选择框中
  selectAppPath.value = row.appID + '.zip'
  // 将封面图片展示在选择框中
  coverImg.value = img_baseURL + row.appID + '.jpg'
  // 将表单数据展示在输入框中
  submitForm.value.app_name = row.name
  submitForm.value.app_type = row.type
  submitForm.value.app_execPath = row.execPath
  submitForm.value.app_execDefaultParams = row.execDefaultParams
  submitForm.value.app_maxChannel = row.maxChannel
  submitForm.value.appID = row.appID
  // 备份表单数据(深拷贝)
  submitFormBak.value = JSON.parse(JSON.stringify(submitForm.value))
  // 进度条为100%, 强调一下
  uploadPercentage.value = 100
}

// --------------------------------- 抽屉页 -------------------------------------
function compareObjectsIsEqual(obj1, obj2) {
  // 获取两个对象的属性名数组
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  // 如果属性数量不相等，返回false
  if (keys1.length !== keys2.length) {
    return false
  }

  // 逐一比较属性值
  for (let key of keys1) {
    // 如果属性值不相等，返回false
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  // 所有属性值相等，返回true
  return true
}
const direction = 'rtl'
// 选择应用
const isModifyApp = ref(false) // 是否修改应用
const isModifyCover = ref(false) // 是否修改封面
const isModifyForm = ref(false) // 是否修改表单

const selectAppPath = ref('') // 选择的app路径
const upLoadAppFile = ref(null)
const appFile = ref(null) // 上传的app文件
// 当选择app文件时
const handleAppFileChange = () => {
  if (upLoadAppFile.value.files[0]) {
    selectAppPath.value = upLoadAppFile.value.files[0].name
    appFile.value = upLoadAppFile.value.files[0] // 上传的文件
    submitForm.value.app_execPath = ''
    isModifyApp.value = true // 标记: 修改了app文件
    // 进度条为0%, 强调一下
    uploadPercentage.value = 0
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
// 进度条
const uploadPercentage = ref(0)

// ------------------------ 选择封面图 ------------------------
const coverImg = ref('')
const upLoadCoverFile = ref(null)
const coverFile = ref(null) // 上传的cover文件

// 当选择封面图片时
const handleCoverFileChange = () => {
  if (upLoadCoverFile.value.files[0]) {
    coverFile.value = upLoadCoverFile.value.files[0] // 上传的文件
    coverImg.value = URL.createObjectURL(coverFile.value)
    // console.log(coverImg.value)
    isModifyCover.value = true // 标记: 修改了封面图
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

// ------------------------ 选择exe文件执行路径 ------------------------
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
const checkFormInput = () => {
  submitForm.value.app_name = String(submitForm.value.app_name).trim()
  submitForm.value.app_type = String(submitForm.value.app_type).trim()
  submitForm.value.app_execPath = String(submitForm.value.app_execPath).trim()
  submitForm.value.app_execDefaultParams = String(submitForm.value.app_execDefaultParams).trim()
  const form = submitForm.value
  // 检查 app_name 不能为空
  if (!form.app_name) {
    submitForm.value.app_name = ''
    return { valid: false, message: '应用名称不能为空!' }
  }
  // 检查 app_type 不能为空
  if (!form.app_type) {
    submitForm.value.app_type = ''
    return { valid: false, message: '应用类型不能为空!' }
  }

  // 检查 app_execPath 不能为空
  if (!form.app_execPath) {
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
// 上传app文件的函数
const uploadAppFn = async () => {
  // 获取当前需要修改的应用的appID
  const appID = submitForm.value.appID

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
    // btnIsDisabled.value = false
    return
  }
  // ------------------------------------- 上传app文件 -------------------------------------
  const chunkSize = 1024 * 1024 * 10 // 10M
  const totalChunks = Math.ceil(appFile.value.size / chunkSize) // 总片数
  // const timestamp = Date.now() // 获取当前时间戳, 作为服务器将旧的文件重命名的新标记

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
    // formData.append('backTimestamp', timestamp)

    // 上传切片
    try {
      await uploadAppModifyRequest(formData, i, totalChunks, uploadPercentage)
    } catch (error) {
      console.error('Error uploading chunk:', error)
      ElMessageBox({
        type: 'error',
        title: '上传错误',
        message: `上传第 ${i + 1} 片时出错`
      })
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
  return md5
}
// 上传封面图像的函数
const uploadCoverFn = async () => {
  // 获取当前需要修改的应用的appID
  const appID = submitForm.value.appID
  const coverformData = new FormData()
  coverformData.append('image', coverFile.value)
  coverformData.append('appID', appID)

  try {
    await uploadCoverModifyRequest(coverformData)
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
  }
}
// 上传表单的函数
const uploadFormFn = async (md5) => {
  // 获取当前需要修改的应用的appID
  const appID = submitForm.value.appID
  try {
    await uploadFormModifyRequest(submitForm.value, appID, md5)
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
  }
}
const handleStartSubmitApp = async () => {
  let md5 = '' // 用于存储app文件的md5值
  // 如果修改了app文件必然修改了表单
  if (isModifyApp.value) {
    if (!appFile.value) {
      ElNotification({
        title: '错误',
        message: '请选择应用文件',
        type: 'error'
      })
      return
    }
    // 检查表单输入
    const result = checkFormInput()
    if (!result.valid) {
      ElNotification({
        title: '错误',
        message: result.message,
        type: 'error'
      })
      return
    }
    try {
      md5 = await uploadAppFn() // 上传app文件
    } catch (error) {
      console.error('Error uploading app:', error)
      ElMessageBox({
        type: 'error',
        title: '上传错误',
        message: '上传应用文件时出错'
      })
      return
    }
  }

  // 如果修改了图像
  if (isModifyCover.value) {
    if (!coverFile.value) {
      ElNotification({
        title: '错误',
        message: '请选择封面图像文件',
        type: 'error'
      })
      return
    }
    try {
      await uploadCoverFn() // 上传封面图像
    } catch (error) {
      console.error('Error uploading cover:', error)
      ElMessageBox({
        type: 'error',
        title: '上传错误',
        message: '上传封面图像时出错'
      })
      return
    }
  }

  // 如果修改了表单
  if (isModifyForm.value) {
    // 检查表单输入
    const result = checkFormInput()
    if (!result.valid) {
      ElNotification({
        title: '错误',
        message: result.message,
        type: 'error'
      })
      return
    }
    try {
      await uploadFormFn(md5) // 上传表单
    } catch (error) {
      console.error('Error uploading form:', error)
      ElMessageBox({
        type: 'error',
        title: '上传错误',
        message: '上传表单时出错'
      })
      return
    }
  }

  ElMessage({
    type: 'success',
    message: '修改成功'
  })
  drawer2.value = false // 抽屉关闭

  // 刷新数据
  refreshAppList()
  // 如果修改了app文件, 切换到应用同步页面
  if (isModifyApp.value) {
    // 延迟1s切换到应用同步页面
    ElMessage({
      message: '正在切换到应用同步页面...',
      type: 'success',
      plain: true,
      offset: 200
    })
    setTimeout(() => {
      modelValue.value.tabIndex = 5 // 切换到应用同步页面
      modelValue.value.addAppID = submitForm.value.appID // 传递appID
    }, 1500)
  }

  // 重置标记
  isModifyApp.value = false // 标记: 没有修改app文件
  isModifyCover.value = false // 标记: 没有修改封面图
  isModifyForm.value = false // 标记: 没有修改表单
}

// ------------------------------------------
// 取消编辑
const cancelEditClick = () => {
  drawer2.value = false
}
// 确认编辑
const confirmEditClick = () => {
  // 如果没有修改任何内容
  if (!compareObjectsIsEqual(submitForm.value, submitFormBak.value)) {
    isModifyForm.value = true // 标记: 修改了表单
  } else {
    isModifyForm.value = false // 标记: 没有修改表单
  }

  if (!isModifyApp.value && !isModifyCover.value && !isModifyForm.value) {
    ElNotification({
      title: '错误',
      message: '没有修改任何内容',
      type: 'error'
    })
    return
  }

  ElMessageBox.confirm('确认提交编辑数据', '消息', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      // 开始上传
      handleStartSubmitApp()
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消提交'
      })
    })
}

// ------------------- 删除 ---------------------
const needDeleteApp = ref({
  appID: '',
  name: ''
})
const centerDialogVisible = ref(false)
// 删除
const handleDelete = (index, row) => {
  centerDialogVisible.value = true // 打开对话框
  needDeleteApp.value.appID = row.appID
  needDeleteApp.value.name = row.name
}

const confirmDeleteApp = async () => {
  if (!needDeleteApp.value.appID) {
    ElNotification({
      title: '错误',
      message: '没有选择要删除的应用',
      type: 'error'
    })
    return
  }
  const appID = needDeleteApp.value.appID
  try {
    await deleteAppRequest(appID)
    ElNotification({
      title: '成功',
      message: '删除应用成功',
      type: 'success'
    })
    centerDialogVisible.value = false
    // 刷新数据
    refreshAppList()
    needDeleteApp.value.appID = ''
    needDeleteApp.value.name = ''
  } catch (error) {
    ElNotification({
      title: '错误',
      message: '删除应用失败',
      type: 'error'
    })
    needDeleteApp.value.appID = ''
    needDeleteApp.value.name = ''
  }
}
</script>

<template>
  <div class="root-box">
    <div class="left-box"></div>
    <div class="right-box">
      <div class="box-bg">
        <div class="box-app" v-for="(item, index) in applist" :key="item.appID" @click="handleEdit(index, item)">
          <img :src="img_baseURL + item.appID + '.jpg' + '?timestamp=' + Date.now()" alt="" />
          <div class="app-info">
            <h3>类型: {{ item.type }}</h3>
            <h3>名称: {{ item.name }}</h3>
            <h3>创建日期: {{ item.createDate }}</h3>
            <!--            <button @click="handleUE(item.appID, item.type)">进入应用</button>-->
          </div>
        </div>
      </div>
      <!--      表格-->
      <div class="app-list">
        <el-table :data="applist" height="stretch" style="width: 100%" highlight-current-row>
          <el-table-column type="index" width="40" />
          <el-table-column label="创建日期" prop="createDate" width="130" />
          <el-table-column label="应用ID" prop="appID" width="180" />
          <el-table-column label="版本号" prop="version" width="100" />
          <el-table-column label="应用名称" prop="name" width="200" />
          <el-table-column label="应用类型" prop="type" width="100" />
          <el-table-column label="同步状态" prop="syncNode" width="120" />
          <el-table-column label="默认启动参数" prop="execDefaultParams" width="350" />
          <el-table-column label="最大并发数" prop="maxChannel" width="100" />
          <el-table-column align="left">
            <template #header>
              <el-input v-model="search_list" placeholder="搜索" />
            </template>
            <template #default="scope">
              <el-button color="#34691f" type="primary" round @click="handleEdit(scope.$index, scope.row)">
                编辑
              </el-button>
              <el-button color="#a40606" type="danger" round @click="handleDelete(scope.$index, scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!--   ----------------------------   抽屉页 ---------------------------------------->
      <el-drawer v-model="drawer2" :direction="direction" size="45%" :with-header="false">
        <template #default>
          <h4>编辑应用信息</h4>
          <div class="editPage">
            <!--        上传App-->
            <div class="upload-app">
              <input
                type="file"
                class="input-app-file"
                ref="upLoadAppFile"
                @change="handleAppFileChange"
                accept=".zip"
              />

              <div class="uploadOK">
                <img :src="zipIcon" alt="" />
                <span class="select-app-name">{{ selectAppPath }}</span>
                <div class="upload-text-tip"><span>点击修改应用(.zip)</span></div>
              </div>
              <!--              <div class="uploadOK" v-else>-->
              <!--                <img :src="uploadIcon" alt="" />-->
              <!--                <div class="upload-text-tip"><span>点击选择应用(.zip)</span></div>-->
              <!--              </div>-->

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
              <div class="reSelectCover" v-show="isReSelectCover">修改封面图(高600x宽1000)</div>
              <img class="coveredImg" :src="coverImg" v-if="coverImg" alt="" />
              <!--              <div class="add-cover" v-else>-->
              <!--                <img :src="plusIcon" alt="" />-->
              <!--                <h6>选择封面图(高600x宽1000)</h6>-->
              <!--              </div>-->
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
          </div>
        </template>
        <template #footer>
          <div style="flex: auto">
            <el-button round size="large" color="#e1eddf" @click="cancelEditClick">取消</el-button>
            <el-button round size="large" color="#34691f" type="primary" @click="confirmEditClick">确认</el-button>
          </div>
        </template>
      </el-drawer>
      <!--      删除对话框-->
      <el-dialog v-model="centerDialogVisible" title="警告!" width="500" align-center>
        <h3>确认是否删除应用:{{ ` ${needDeleteApp.appID} (${needDeleteApp.name})` }}</h3>
        <template #footer>
          <div class="dialog-footer">
            <el-button round size="large" color="#34691f" @click="centerDialogVisible = false">取消</el-button>
            <el-button round size="large" color="#f8babb" type="primary" @click="confirmDeleteApp"> 确认 </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.root-box {
  width: 100vw;
  height: 93vh;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  .left-box {
    width: 150px;
    background-color: #854638;
    background: url('@/assets/img/bit2.jpg') no-repeat;
    background-size: cover;
    //filter: blur(1px);
    //z-index: -1;
  }
  .right-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .box-bg {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: flex-start;
      //margin-top: 2px;
      //margin-left: 2px;
      //margin-right: 20px;
      //border-radius: 20px;
      background-color: #fff;
      //border: 2px solid #5d1c1c;
      padding: 4px;
      //box-shadow: 0px 0px 2px #482f2e inset;

      .box-app {
        width: 120px;
        height: 110px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 5px 2px rgba(74, 143, 60, 0.3);
        margin: 5px;
        transition: all 0.1s;

        &:hover {
          box-shadow: 0 0 5px 3px rgba(74, 143, 60, 0.6);
          transform: scale(1.02);
          cursor: pointer;
        }

        overflow: hidden;

        img {
          width: 100%;
          height: 70px;
          //border: 1px solid #000;
        }

        .app-info {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;

          h3 {
            font-size: 7px;
            font-weight: 400;
            //margin-bottom: 1px;
            padding-left: 5px;
            //border: 1px solid #000;
            // 字体阴影
            //text-shadow: 1px 1px 1px rgba(24, 23, 23, 0.2);
          }
        }
      }
    }
  }
  .app-list {
    width: 100%;
    //padding-left: 20px;
    //background-color: #4a4ad8;
    border-top: 2px solid #1b9f34;
  }

  //  编辑页
  .editPage {
    width: 100%;
    height: 150vh;
    //border: 1px solid black;
    //box-shadow: 0 0 3px gray;
    //border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    align-content: flex-start;
    .upload-app {
      position: relative;
      margin-top: 6px;
      margin-bottom: 6px;
      width: 99%;
      //height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      box-shadow: 0 0 1px 1px #e8e7e7 inset;
      border: 1px dashed #ffffff;
      background-color: #fafafa;
      padding-bottom: 5px;
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
          right: 10%;
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
          right: 10%;
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
      height: 80px;
      width: 160px;
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
        line-height: 80px;
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
      width: 90%;
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
              box-shadow: 0 0 2px 1px #1c6b41;
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
  }
}
</style>
