<script setup>
import { ref } from 'vue'
import ResourceConsole from '@/views/mgmt/ResourceConsole.vue'
import AppShow from '@/views/mgmt/AppShow.vue'
import AddApp from '@/views/mgmt/AddApp.vue'
import AppSync from '@/views/mgmt/AppSync.vue'
import PixelMgmt from '@/views/mgmt/PixelMgmt.vue'
import { Monitor, Film, Plus, RefreshLeft, Switch } from '@element-plus/icons-vue'

// let tabIndex = ref(1)
let sendSonData = ref({
  tabIndex: 1,
  addAppID: ''
})
// let sendSonData = ref({
//   isGetNodeRequest: true
// })

// 监视tabIndex的变化, 当为1时, isGetNodeRequest为true, 否则为false
// watch(tabIndex, (newValue) => {
//   console.log(newValue)
//   if (newValue === 1) {
//     sendSonData.value.isGetNodeRequest = true
//   } else {
//     if (sendSonData.value.isGetNodeRequest === true) {
//       sendSonData.value.isGetNodeRequest = false
//     }
//   }
// })
</script>

<template>
  <div class="root-box">
    <div class="header">
      <h2>嗅垒云后台管理系统</h2>
    </div>
    <div class="left-nav">
      <div
        class="public-div resource-console"
        @click="sendSonData.tabIndex = 1"
        :class="{ selectTab: sendSonData.tabIndex === 1 }"
      >
        <el-icon :size="23" style="vertical-align: middle"> <Monitor /> </el-icon>&nbsp;资源监控
      </div>
      <div
        class="public-div app-show"
        @click="sendSonData.tabIndex = 2"
        :class="{ selectTab: sendSonData.tabIndex === 2 }"
      >
        <el-icon :size="23" style="vertical-align: middle"> <Film /> </el-icon>&nbsp;应用总览
      </div>
      <div
        class="public-div add-app"
        @click="sendSonData.tabIndex = 3"
        :class="{ selectTab: sendSonData.tabIndex === 3 }"
      >
        <el-icon :size="23" style="vertical-align: middle"> <Plus /> </el-icon>&nbsp;添加应用
      </div>
      <!--      <div class="public-div delete-app" @click="tabIndex = 4" :class="{ selectTab: tabIndex === 4 }">
      <el-icon :size="23" style="vertical-align: middle"> <Cpu /> </el-icon>&nbsp;删除应用</div>-->
      <div
        class="public-div app-sync"
        @click="sendSonData.tabIndex = 5"
        :class="{ selectTab: sendSonData.tabIndex === 5 }"
      >
        <el-icon :size="23" style="vertical-align: middle"> <RefreshLeft /> </el-icon>&nbsp;应用同步
      </div>
      <div
        class="public-div pixel-mgmt"
        @click="sendSonData.tabIndex = 6"
        :class="{ selectTab: sendSonData.tabIndex === 6 }"
      >
        <el-icon :size="23" style="vertical-align: middle"> <Switch /></el-icon>&nbsp;进程流管理
      </div>
    </div>
    <div class="box">
      <resource-console v-if="sendSonData.tabIndex === 1"></resource-console>
      <app-show v-else-if="sendSonData.tabIndex === 2" v-model="sendSonData"></app-show>
      <add-app v-else-if="sendSonData.tabIndex === 3" v-model="sendSonData"></add-app>
      <!--      <delete-app v-else-if="tabIndex === 4"></delete-app>-->
      <app-sync v-else-if="sendSonData.tabIndex === 5" v-model="sendSonData"></app-sync>
      <pixel-mgmt v-else-if="sendSonData.tabIndex === 6"></pixel-mgmt>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.selectTab {
  width: 100px;
  //height: 45px;
  background-color: #3c742c;
  color: #ffffff;
}

.header {
  width: 100vw;
  height: 32px;
  //background: #b79562;
  background: url('@/assets/img/red-bg.jpg') no-repeat;
  background-color: #04813c;
  background-size: cover;
  color: #ffffff;
  text-align: center;
  border-bottom: 1px solid #ffffff;

  h2 {
    font-size: 20px;
    text-shadow: 1px 1px 3px #424040;
    letter-spacing: 2px;
  }
}

.left-nav {
  position: fixed;
  top: 45%;
  left: 0;
  width: 80px;
  background-color: rgba(216, 222, 217, 1);
  color: #0e0e0e;
  transform: translateY(-50%);
  box-shadow: 2px 2px 4px #64a74f;
  font-size: 12px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  //overflow: hidden;
  .public-div {
    height: 35px;
    text-align: center;
    line-height: 35px;
    //border-top: 1px solid #fbfcfb;
    transition: all 0.2s;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    &:hover {
      background-color: #417648;
      cursor: pointer;
      color: white;
      //width: 110px;
      //border: 2px solid #672626;
    }
  }
}

.box {
  //flex: 1;
  //display: flex;
  //flex-direction: row;
  //align-items: stretch;
}
</style>
