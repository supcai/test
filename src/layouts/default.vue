<!-- default -->
<template>
  <el-container class="default-layout" direction="vertical">
    <page-header :logoImg="require('../assets/images/fero.png')" :emp-name="empName" :project-title="projectTitle" @logout="logout"></page-header>
    <el-container class="main-container">
      <page-side :sideMenu="this.$store.state.sideMenu" :isSide="true"></page-side>
      <el-main :class="{ 'no-title': !showPageTitle }">
        <page-title :showBackBtn="showBackBtn" v-if="showPageTitle">
          <slot name="breadcrumb" slot="breadcrumb"></slot>
          <slot name="btn-inner" slot="btn-inner"></slot>
        </page-title>
        <slot></slot>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import {cookie} from '../assets/js/config'

export default {
  name: 'default-layout',
  created () {
    if (!this.$store.state.sideMenu || this.$store.state.sideMenu.length === 0) {
      this.getMenu()
    }
  },
  props: {
    showBackBtn: {
      type: Boolean,
      default: false
    },
    showPageTitle: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      projectTitle: process.env.PROJECT_NAME,
      empName: cookie.empName(),
      sideMenu: []
    }
  },
  components: {
  },
  watch: {},
  methods: {
    logout () {
      this.api.base.logOut().then(result => {
        cookie.removeCookie()
        window.location.href = '/login'
        this.$message.success('退出成功')
      })
    },
    getMenu () {
      this.api.base.getMenu().then(result => {
        this.$store.commit('updateSideMenu', result.data.data)
        this.sideMenu = this.$store.state.sideMenu
        // console.log(this.sideMenu)
      }).catch(function (result) {
        // console.log(result)
      })
    }
  }
}
</script>
<style>
</style>
