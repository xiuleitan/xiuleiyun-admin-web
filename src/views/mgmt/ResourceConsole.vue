<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getNodesRequest } from '@/api/mgmt.js'
// import { Refresh } from '@element-plus/icons-vue'

const nodeList = ref([])
const gpuBGColor = ref(['#f3f1f1', '#afda98', '#e8b77f', '#f66969'])
const getGpuBGColor = (usage) => {
  if (usage < 10) {
    return gpuBGColor.value[0]
  } else if (usage < 40) {
    return gpuBGColor.value[1]
  } else if (usage < 80) {
    return gpuBGColor.value[2]
  } else {
    return gpuBGColor.value[3]
  }
}
// 刷新数据的函数
const refreshData = async () => {
  try {
    const res = await getNodesRequest()

    // console.log(res)
    nodeList.value = res.data.data.nodes_list
  } catch (error) {
    // 错误消息提示
    ElMessageBox.alert(error, '错误', {
      confirmButtonText: '知道了',
      type: 'error'
    })
  }
}
onMounted(async () => {
  refreshData()
})

const rotationDegrees = ref(0)
const handleRefresh = async () => {
  rotationDegrees.value += 360
  try {
    refreshData()
    // 消息提示
    ElMessage({
      message: '获取节点信息成功',
      type: 'success',
      plain: true
    })
    // console.log('nodelist:', nodeList.value[0].nodeData)
  } catch (error) {
    // 错误消息提示
    ElMessageBox.alert(error, '错误', {
      confirmButtonText: '知道了',
      type: 'error'
    })
  }
}
// 阻塞式获取节点状态
function getNodeStatusPromise() {
  return new Promise((resolve, reject) => {
    getNodesRequest()
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
async function getNodeStatusInterval() {
  let res = await getNodeStatusPromise()
  nodeList.value = res.data.data.nodes_list
  // 继续下一次请求
  timer = setTimeout(getNodeStatusInterval, 2000)
}

// 启动定时获取状态的函数
getNodeStatusInterval()

// 在组件卸载时清理定时器
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<template>
  <div class="root-box">
    <div class="left-box"></div>
    <div class="node-box">
      <div class="node-box2">
        <div class="data-refresh" :style="{ transform: `rotate(${rotationDegrees}deg)` }" @click="handleRefresh">
          <div class="refreshIcon">
            <!--                      <el-icon :size="35" color="#ffffff"><Refresh /></el-icon>-->
          </div>
        </div>
        <div class="node" v-for="item in nodeList" :key="item.nodeID">
          <div class="nickname-ip">
            <span class="nickname">{{ item.nodeData.nickname }}</span>
            <span class="ip">{{ item.nodeData.ip }}</span>
            <button class="freeze">冻结</button>
            <button class="reboot">重启</button>
          </div>
          <div class="cpu-memory-disk-network">
            <div class="cpu">
              <h4>CPU</h4>
              型号:{{ item.nodeData.cpu.brand }}<br />
              频率:{{ item.nodeData.cpu.speed.toFixed(2) }}GHz <br />
              核数: {{ item.nodeData.cpu.cores }} <br />
              物理核数: {{ item.nodeData.cpu.physicalCores }} <br />
              处理器数量: {{ item.nodeData.cpu.processors }} <br />
              使用率: {{ item.nodeData.cpu.usage.toFixed(2) }}%
            </div>
            <div class="memory">
              <h4>内存</h4>
              总量: {{ Math.floor(item.nodeData.memory.total / 1e9) }}G <br />
              已使用: {{ Math.floor(item.nodeData.memory.used / 1e9) }}G <br />
              使用率: {{ (item.nodeData.memory.usage * 100).toFixed(2) }}%
            </div>
            <div class="disk">
              <h4>硬盘</h4>
              类型: {{ item.nodeData.disk.type }} <br />
              名称: {{ item.nodeData.disk.name }} <br />
              总量: {{ Math.floor(item.nodeData.disk.size / 1e9) }}G <br />
              使用率: {{ Math.floor(item.nodeData.disk.usage) }}%
            </div>
            <div class="network">
              <h4>网卡</h4>
              额定速率:{{ item.nodeData.network.speed }}M
            </div>
          </div>
          <div class="gpus">
            <div class="gpu-box" v-for="(gpuItem, index) in item.nodeData.gpu" :key="index">
              <div class="gpu">{{ gpuItem.model }}</div>
              <span class="info1">
                风扇速度: {{ gpuItem.fanSpeed }} <br />
                显存总量: {{ Math.floor(gpuItem.memoryTotal / 1e3) }}GB
              </span>
              <span class="info2" :style="{ backgroundColor: getGpuBGColor(gpuItem.utilizationGpu) }">
                显存使用: {{ Math.floor(gpuItem.memoryUsed / 1e3) }}GB <br />
                GPU使用率: {{ gpuItem.utilizationGpu }}%
              </span>
              <span class="info3">
                温度: {{ gpuItem.temperatureGpu }}°C <br />
                功率: {{ Math.floor(gpuItem.powerDraw) }} W
              </span>
            </div>
          </div>
          <div class="other-info">
            gpu running : {{ JSON.stringify(item.fastNodeData.gpu.map((item1) => item1.runningPrograms)) }} <br />
          </div>
          <div class="distro">{{ item.nodeData.distro }}</div>
          <div class="node-footer1"></div>
          <div class="node-footer2"></div>
        </div>
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
    width: 120px;
    background-color: #854638;
    background: url('@/assets/img/bit1.jpg') no-repeat;
    background-size: cover;
    //filter: blur(1px);
    //z-index: -1;
  }

  .node-box {
    flex: 1;
    background-color: #a23e0a;
    background: url('@/assets/img/red-bg.jpg') no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    align-content: center;
    padding-bottom: 20px;
    .node-box2 {
      background-color: white;
      border-radius: 10px;
      width: 100%;
      height: 100%;
      margin: 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: flex-start;

      .data-refresh {
        position: fixed;
        top: 50%;
        right: 10px;
        width: 40px;
        height: 40px;
        transform: translateY(-50%);
        border-radius: 20px;
        border: none;
        background-color: rgba(233, 234, 233, 0.8);
        box-shadow: 0 0 3px #949292;
        transition: all 0.2s;
        transition: transform 0.3s ease-in-out;
        text-align: center;
        //border: 1px solid green;
        z-index: 1000;
        transition: all 0.3s;

        //transform-origin: 50% 50%;
        &:hover {
          cursor: pointer;
          box-shadow: 0 0 3px #8c1827;
          width: 42px;
          height: 42px;
          //transform: rotate(-370deg);
          //background-color: rgba(174, 215, 186, 0.8);
        }
        .refreshIcon {
          width: 100%;
          height: 100%;
          background: url('@/assets/img/refresh.png') no-repeat;
          background-size: cover;
        }
      }

      .node {
        width: 260px;
        //min-width: 250px;
        min-height: 170px;
        background-color: #ebeceb;
        //background-color: #67e16d;
        border-radius: 10px;
        margin: 20px;
        position: relative;
        color: black;
        font-size: 12px;
        font-weight: 400;
        box-shadow: 1px 1px 4px gray;
        //border: 1px solid #b69292;
        //overflow: hidden;
        transition: all 0.2s;
        &:hover {
          box-shadow: 1px 1px 10px #31812b;
          //transform: scale(1.03);
          //border: 1px solid red;
        }

        .nickname-ip {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          padding-left: 20px;
          padding-right: 10px;
          border-bottom: 1px solid #983333;
          text-shadow: 0 0 2px gray;
          .freeze {
            font-size: 9px;
            width: 30px;
            border: 1px solid #e3e1e1;
            background-color: #578eff;
            color: white;
            transition: all 0.1s;
            border-radius: 3px;
            &:hover {
              cursor: pointer;
              font-size: 10px;
              width: 35px;
            }
          }
          .reboot {
            font-size: 9px;
            width: 30px;
            border: 1px solid #e3e1e1;
            background-color: #d74242;
            color: white;
            transition: all 0.1s;
            border-radius: 3px;
            &:hover {
              cursor: pointer;
              font-size: 10px;
              width: 35px;
            }
          }
        }
        .cpu-memory-disk-network {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          font-size: 7px;
          padding: 2px;
          color: white;
          h4 {
            text-align: center;
            background-color: #3f3d64;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
          }
          .cpu {
            width: 84px;
            height: 86px;
            background-color: #448344;
            border-radius: 5px;
            padding: 1px;
          }
          .memory {
            width: 55px;
            height: 86px;
            background-color: #5477ab;
            border-radius: 5px;
            padding: 1px;
          }
          .disk {
            width: 65px;
            height: 86px;
            background-color: #a98366;
            border-radius: 5px;
            padding: 1px;
          }
          .network {
            width: 40px;
            height: 86px;
            background-color: #538681;
            border-radius: 5px;
            padding: 1px;
          }
        }
        .gpus {
          color: white;
          font-size: 9px;
          padding: 2px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          .gpu-box {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            .gpu {
              position: relative;
              width: 120px;
              height: 20px;
              background-color: #3b9b3b;
              line-height: 20px;
              padding-left: 3px;
              margin-top: 1px;
              border: 1px solid #b4b2b2;
            }
            span {
              color: #352a3d;
              font-size: 6px;
              padding-left: 2px;
              border: 1px solid #939191;
              margin-top: 1px;
            }
            .info1 {
              background-color: #ccccce;
            }
            .info2 {
              background-color: #f3f1f1;
            }
            .info3 {
              background-color: #d6d6d9;
            }
          }
        }
        .other-info {
          background-color: #d0d0d0;
          width: 100%;
          //height: 30px;
          font-size: 9px;
          padding-left: 5px;
          //margin-left: 2px;
          //margin-right: 2px;
        }
        .distro {
          background-color: #818080;
          width: 100%;
          font-size: 10px;
          height: 20px;
          color: white;
          text-align: center;
          line-height: 20px;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }
        .node-footer1 {
          position: absolute;
          left: 25px;
          bottom: -10px;
          width: 20px;
          height: 10px;
          //background-color: #3b9b3b;
          background: linear-gradient(135deg, #212323, #b0acac, #48484d);
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
          box-shadow: 1px 1px 2px gray;
        }
        .node-footer2 {
          position: absolute;
          right: 25px;
          bottom: -10px;
          width: 20px;
          height: 10px;
          //background-color: #3b9b3b;
          background: linear-gradient(135deg, #212323, #b0acac, #48484d);
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
          box-shadow: 1px 1px 2px gray;
        }
      }
    }
  }
}
</style>
