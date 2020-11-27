<template>
  <div id="app">
    <el-container direction="vertical">
      <page-header :layout="this.$store.state.layout"></page-header>
      <el-container class="main-container">
        <page-side :layout="this.$store.state.layout"></page-side>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import pageHeader from '@/components/header'
import pageSide from '@/components/side'
export default {
  name: 'App',
  components: {
    'page-header': pageHeader,
    'page-side': pageSide
  }
}
</script>
<style></style>
