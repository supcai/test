<template>
  <simple-layout>
    <div class="content">
      <img src="../assets/images/401.png" alt="">
      <p>无权访问该页面，</p>
      <p>如需权限请联系管理员</p>
      <el-button type="primary" @click="goIndex">返回首页</el-button>
    </div>
  </simple-layout>
</template>
<script>
export default {
  data () {
    return {}
  },
  components: {
  },
  created () {},
  methods: {
    goIndex () {
      this.$router.replace('/')
    }
  }
}
</script>
<style scoped lang="less">
.content {
  padding-top: 120px;
  text-align: center;
  color: #666;
  img {
    width: 200px;
    height: 111px;
  }
  .el-button {
    margin-top: 20px;
  }
}
</style>
