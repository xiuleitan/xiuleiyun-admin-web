<script setup>
// import { onMounted } from 'vue'

import { ref, onMounted, onUnmounted } from 'vue'
import { deleteAppRequest, disconnectStreamerRequest, getStreamerList } from '@/api/exec.js'

let streamerList = ref([])

// 函数: 按照创建时间降序排序
function sortListByCreateDateTime(list) {
  return list.sort((a, b) => new Date(b.createDateTime) - new Date(a.createDateTime))
}
// 刷新数据的函数
const refreshStreamerList = async () => {
  try {
    const res = await getStreamerList()
    // 消息提示
    ElMessage({
      message: '获取应用列表成功',
      type: 'success',
      plain: true
    })

    streamerList.value = res.data.data.streamers_list

    // 按照创建时间降序排序
    streamerList.value = sortListByCreateDateTime(streamerList.value)
    // console.log(streamerList.value)
  } catch (error) {
    // 错误消息提示
    ElMessageBox.alert(error, '错误', {
      confirmButtonText: '知道了',
      type: 'error'
    })
  }
}

const formatPlayerIPs = (playerIPs) => {
  return Object.entries(playerIPs)
    .map(([key, value]) => `${key}-${value.split(':').pop()}`)
    .join('<br>')
}

// 当元素被挂载到页面上时, 发起请求, 获取应用列表
onMounted(() => {
  refreshStreamerList()
  // console.log(applist.value)
})

// 阻塞式获取列表
function getStreamerSyncStatusPromise() {
  return new Promise((resolve, reject) => {
    getStreamerList()
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// 断开连接
const needDeleteStreamer = ref({
  streamerID: '',
  execType: '',
  playerCount: ''
})
const centerDialogVisible = ref(false)
const handleDisconnect = (index, row) => {
  centerDialogVisible.value = true // 打开对话框
  needDeleteStreamer.value.streamerID = row.streamerID
  needDeleteStreamer.value.execType = row.execType
  needDeleteStreamer.value.playerCount = row.playerCount
}
const confirmDeleteApp = async () => {
  if (!needDeleteStreamer.value.streamerID) {
    ElNotification({
      title: '错误',
      message: '没有选择要删除的流连接',
      type: 'error'
    })
    return
  }
  const streamerID = needDeleteStreamer.value.streamerID
  try {
    await disconnectStreamerRequest(streamerID)
    ElNotification({
      title: '成功',
      message: '删除应用成功',
      type: 'success'
    })
    centerDialogVisible.value = false
    // 刷新数据
    refreshStreamerList()
    needDeleteStreamer.value.appID = ''
    needDeleteStreamer.value.execType = ''
    needDeleteStreamer.value.playerCount = ''
  } catch (error) {
    ElNotification({
      title: '错误',
      message: '断开流连接失败',
      type: 'error'
    })
    needDeleteStreamer.value.appID = ''
    needDeleteStreamer.value.execType = ''
    needDeleteStreamer.value.playerCount = ''
  }
}

// 每隔8s中获取最新状态
let timer = null
async function getStreamerSyncStatusInterval() {
  let res = await getStreamerSyncStatusPromise()
  streamerList.value = res.data.data.streamers_list
  // 按照创建时间降序排序
  streamerList.value = sortListByCreateDateTime(streamerList.value)
  // 继续下一次请求
  // console.log('继续下一次请求')
  timer = setTimeout(getStreamerSyncStatusInterval, 1000)
}

// 启动定时获取状态的函数
getStreamerSyncStatusInterval()

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
      <!--      表格-->
      <div class="streamer-list">
        <el-table
          :data="streamerList"
          size="large"
          height="stretch"
          style="width: 100%"
          highlight-current-row
          @current-change="handleCurrentChange"
          ref="appTable"
          stripe
        >
          <!--          <el-table-column type="index" width="40" align="center" />-->
          <el-table-column label="创建时间" prop="createDateTime" width="180" />
          <el-table-column label="进程流ID" prop="streamerID" width="150" />
          <el-table-column label="节点IP" prop="nodeIP" width="130" />
          <el-table-column label="gpu索引" prop="gpuIndex" width="100" />
          <el-table-column label="流端口索引" prop="signalPortIndex" width="110" />
          <el-table-column label="pid" prop="pid" width="80" />
          <el-table-column label="应用类型" prop="execType" width="90" />
          <el-table-column label="应用ID" prop="execId" width="200" />
          <el-table-column label="用户名" prop="username" width="80" />
          <el-table-column label="用户ID" prop="userid" width="80" />
          <el-table-column label="玩家数" prop="playerCount" width="90" />
          <el-table-column label="玩家IPs" prop="playerIPs" width="200">
            <template v-slot="scope">
              <div v-html="formatPlayerIPs(scope.row.playerIPs)"></div>
            </template>
          </el-table-column>
          <!--          <el-table-column label="默认启动参数" prop="execDefaultParams" width="350" />-->
          <!--          <el-table-column label="最大并发数" prop="maxChannel" width="100" />-->
          <el-table-column align="left">
            <template #header>
              <el-input v-model="search_list" placeholder="搜索" />
            </template>
            <template #default="scope">
              <el-button color="#a40606" type="danger" round @click="handleDisconnect(scope.$index, scope.row)">
                断开
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!--      删除对话框-->
      <el-dialog v-model="centerDialogVisible" title="警告!" width="500" align-center>
        <h3>
          确认断开连接:{{ ` ${needDeleteStreamer.streamerID} (${needDeleteStreamer.execType})` }} <br />
          当前连接玩家数:{{ needDeleteStreamer.playerCount }}
        </h3>
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
    background: url('@/assets/img/bit6.jpg') no-repeat;
    background-size: cover;
    //filter: blur(1px);
    //z-index: -1;
  }

  .right-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}
</style>
