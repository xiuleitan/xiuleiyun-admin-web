<script setup>
// import { onMounted } from 'vue'
import { onMounted, ref, nextTick, onUnmounted } from 'vue'
import { getNodesRequest } from '@/api/mgmt.js'
import { getAppList, syncAppRequest } from '@/api/exec.js'

const nodeList = ref([])
let applist = ref([]) // 用来刷新table的列表

const applistOften = ref([]) // 用来刷新同步状态的列表
// 父传子的数据
const modelValue = defineModel()

const whichAppID = ref('') // 要显示哪个appID的同步状态
// 刷新节点数据的函数
const refreshData = async () => {
  try {
    const res = await getNodesRequest()
    ElNotification({
      title: '成功',
      type: 'success',
      message: '获取节点信息成功',
      duration: 2000
    })

    nodeList.value = res.data.data.nodes_list
    // console.log('nodeList是:', nodeList.value)
  } catch (error) {
    // 错误消息提示
    ElMessageBox.alert(error, '错误', {
      confirmButtonText: '知道了',
      type: 'error'
    })
  }
}
// 函数: 按照创建时间降序排序
function sortAppListByCreateDate(applist) {
  return applist.sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
}
// 刷新applist数据的函数
const refreshAppList = async () => {
  try {
    const res = await getAppList()
    // 消息提示
    ElNotification({
      title: '成功',
      type: 'success',
      message: '获取应用列表成功',
      duration: 2000
    })

    applist.value = res.data.data.applications_list

    // 遍历列表中的每个对象, 将每个对象中的执行路径更换为字符串, 使用/分隔
    // applist.value.forEach((item) => {
    //   item.execPath = item.execPath.slice(2).join('/')
    // })

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
// 刷新applist数据的函数
const refreshAppListOften = async () => {
  try {
    const res = await getAppList()
    // 消息提示
    ElNotification({
      title: '成功',
      type: 'success',
      message: '获取应用列表成功',
      duration: 2000
    })

    applistOften.value = res.data.data.applications_list

    // 遍历列表中的每个对象, 将每个对象中的执行路径更换为字符串, 使用/分隔
    // applist.value.forEach((item) => {
    //   item.execPath = item.execPath.slice(2).join('/')
    // })

    // 按照创建时间降序排序
    applistOften.value = sortAppListByCreateDate(applistOften.value)
  } catch (error) {
    // 错误消息提示
    ElMessageBox.alert(error, '错误', {
      confirmButtonText: '知道了',
      type: 'error'
    })
  }
}

const appTable = ref(null)
onMounted(async () => {
  await refreshData()
  await refreshAppList()
  console.log('applist.value是什么:', applist.value)
  if (modelValue.value.addAppID) {
    whichAppID.value = modelValue.value.addAppID // 从父组件传递过来的appID
  } else {
    whichAppID.value = applist.value[0].appID // 默认显示第一个appID的同步状态
  }
  applistOften.value = applist.value
  getPercentageAppOfNodeList()

  // 自动定位到appID对应的行
  await nextTick() // 等待table渲染完成
  if (appTable.value) {
    // 根据appID找到对应的行
    const rowIndex = applist.value.findIndex((item) => item.appID === whichAppID.value)
    appTable.value.setCurrentRow(applist.value[rowIndex])
  }
})

// const syncValue = ref(2) // -2: 未同步, 1: 同步中, 2: 同步成功, -1: 同步失败
// const syncPercentage = ref(0) // 同步百分比

// 找到对应appID的syncNodeStatus
function getAppSyncNodeStatus() {
  let syncNodeStatus = {}
  for (let app of applistOften.value) {
    if (app.appID === whichAppID.value) {
      syncNodeStatus = app.syncNodeStatus
    }
  }
  if (syncNodeStatus === {}) {
    console.error('对应appID的syncNodeStatus值为空', whichAppID)
    return
  }
  return syncNodeStatus
}

const appIDOfNodeList = ref([]) // appID中每个节点所对应的同步状态的列表, 每个元素{nodeID:'10.1.112.59',nickname: node1, percentageValue:2}
const getPercentageAppOfNodeList = () => {
  // 初始化列表
  appIDOfNodeList.value = []

  // 获取syncNodeStatus的值
  let syncNodeStatus = getAppSyncNodeStatus()
  // console.log('syncNodeStatus是这个:', syncNodeStatus)

  // 先遍历每个node节点
  for (let node of nodeList.value) {
    // 判断node[nodeIP]这个值有没有在node节点的属性中
    let percentageValue = 0
    if (Object.prototype.hasOwnProperty.call(syncNodeStatus, node.nodeID)) {
      percentageValue = syncNodeStatus[node.nodeID]
    } else {
      percentageValue = -2 // 没有该节点的同步信息,表示未同步
    }

    appIDOfNodeList.value.push({
      nodeID: node.nodeID,
      nickname: node.nodeData.nickname,
      percentageValue: percentageValue
    })
  }

  console.log('appIDOfNodeList是:', appIDOfNodeList.value)
}

const showAppinfo = ref('') // 展示当前appID的信息
// 当点击某一行的时候, 显示对应的appID的同步状态
const handleCurrentChange = (row) => {
  console.log('Current row changed:', row)
  // console.log('当前行的row是:', row)
  // console.log('当前行的appID是:', val.appID)
  whichAppID.value = row.appID
  showAppinfo.value = `${row.appID}-v${row.version} - ${row.name}`
  refreshAppListOften()
  getPercentageAppOfNodeList()
}
const handleLookSyncStatus = (index, row) => {
  // console.log('查看同步状态:', index, row)
  whichAppID.value = row.appID
  refreshAppListOften()
  getPercentageAppOfNodeList()
}
// 手动同步的请求
const handleManualSync = async (index, row) => {
  console.log('手动同步:', index, row)
  await syncAppRequest(row.appID)
}

// 阻塞式获取指定appID的同步状态
function getAppSyncStatusPromise() {
  return new Promise((resolve, reject) => {
    getAppList()
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
// 每隔8s中获取最新状态
let timer = null
async function getAppSyncStatusInterval() {
  let res = await getAppSyncStatusPromise()
  applistOften.value = res.data.data.applications_list
  // 按照创建时间降序排序
  applistOften.value = sortAppListByCreateDate(applistOften.value)
  getPercentageAppOfNodeList()
  // 继续下一次请求
  console.log('继续下一次请求')
  timer = setTimeout(getAppSyncStatusInterval, 1000)
}

// 启动定时获取状态的函数
getAppSyncStatusInterval()

// 在组件卸载时清理定时器
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    console.log('清理定时器')
  }
})
</script>
<template>
  <div class="root-box">
    <div class="left-box"></div>
    <div class="right-box">
      <div class="box-node">
        <div class="node" v-for="item in appIDOfNodeList" :key="item.nodeID">
          <div class="nickname-ip">
            <div class="nickname">{{ item.nickname }}</div>
            <div class="ip">{{ item.nodeID }}</div>
          </div>
          <div class="sync-status">
            <div class="sync-public sync-unsync" v-show="item.percentageValue === -2">未同步</div>
            <div class="sync-public sync-syncing" v-show="item.percentageValue >= 0 && item.percentageValue <= 99">
              {{ item.percentageValue }}%
              <div class="pulse1"></div>
              <div class="pulse2"></div>
            </div>
            <div class="sync-public sync-success" v-show="item.percentageValue === 100">100%</div>
            <div class="sync-public sync-fail" v-show="item.percentageValue === -1">同步错误</div>
          </div>
        </div>
      </div>

      <div class="showAppinfo">{{ showAppinfo }}</div>

      <!--      表格-->
      <div class="app-list">
        <el-table
          :data="applist"
          size="large"
          height="stretch"
          style="width: 100%"
          highlight-current-row
          @current-change="handleCurrentChange"
          ref="appTable"
        >
          <el-table-column type="index" width="40" />
          <el-table-column label="创建日期" prop="createDate" width="130" />
          <el-table-column label="应用ID" prop="appID" width="200" />
          <el-table-column label="版本号" prop="version" width="100" />
          <el-table-column label="应用名称" prop="name" width="200" />
          <el-table-column label="应用类型" prop="type" width="140" />
          <el-table-column label="同步状态" prop="syncNode" width="150" />
          <!--          <el-table-column label="默认启动参数" prop="execDefaultParams" width="350" />-->
          <!--          <el-table-column label="最大并发数" prop="maxChannel" width="100" />-->
          <el-table-column align="left">
            <template #header>
              <el-input v-model="search_list" placeholder="搜索" />
            </template>
            <template #default="scope">
              <el-button color="#34691f" type="primary" round @click="handleLookSyncStatus(scope.$index, scope.row)">
                查看同步状态
              </el-button>
              <el-button color="#0564c2" type="danger" round @click="handleManualSync(scope.$index, scope.row)">
                手动同步
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
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
    background: url('@/assets/img/bit5.jpg') no-repeat;
    background-size: cover;
    //filter: blur(1px);
    //z-index: -1;
  }
  .right-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .box-node {
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
      .node {
        width: 80px;
        height: 75px;
        margin: 7px;
        background-color: #f0f0f0;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow: hidden;
        box-shadow: 0 0 2px 1px rgba(163, 169, 162, 0.8);
        .nickname-ip {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .nickname {
            text-align: center;
            width: 100%;
            font-size: 12px;
            font-weight: 400;
            color: #fff;
            background-color: #197819;
          }
          .ip {
            font-size: 9px;
            color: #000;
          }
        }
        .sync-status {
          width: 100%;
          height: 40px;
          background-color: #f0f0f0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          transition: all 0.2s;
          .sync-public {
            width: 35px;
            height: 35px;
            //margin: 2px;
            border-radius: 50%;
            //background-color: #e13939;
            //font-size: 8px;
            text-align: center;
            line-height: 35px;
          }
          .sync-unsync {
            background-color: #c3c3c3;
            font-size: 8px;
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
          .sync-syncing {
            position: relative;
            width: 30px;
            height: 30px;
            line-height: 30px;
            //background-color: #238944;
            font-size: 10px;
            color: #17511a;
            font-weight: 600;
            z-index: 4;
            //animation: blowupScale 0.6s linear 0.8s infinite alternate;
            .pulse1,
            .pulse2 {
              position: absolute;
              right: 2%;
              bottom: 2%;
              width: 30px;
              height: 30px;
              border-radius: 40%;
              //background-color: darkred;
              //transform-origin: 50% 0;
              box-shadow: 0 0 2px 2px #1d823d;
            }
            .pulse1 {
              transform: rotate(30deg);
              //box-shadow: 0 0 3px 2px #a21fd8;
              animation: blowuprotate 2s linear 0s infinite;
            }
            .pulse2 {
              transform: rotate(30deg);
              animation: blowuprotate 2s linear 1.5s infinite;
            }
          }
          .sync-success {
            background-color: #2d8449;
            font-size: 10px;
            color: white;
            //box-shadow: 0 0 2px 2px #1d823d;
          }
          .sync-fail {
            background-color: #f8a2a2;
            font-size: 8px;
            color: #000000;
          }
        }
      }
    }

    .showAppinfo {
      width: 100%;
      height: 15px;
      background-color: #8e3030;
      text-align: center;
      //text-align: left;
      //padding-left: 100px;
      color: #e5e4e4;
      font-size: 9px;

      line-height: 15px;
      //padding-left: 10%;
    }

    .app-list {
      margin-top: 5px;
      //border-top: 2px solid #9d3838;
      width: 100%;
      height: 100vh;
      //background-color: #d3dce6;
    }
  }
}
</style>
