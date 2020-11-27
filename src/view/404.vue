<!-- 404 -->
<template>
  <simple-layout>
    <div class="default-page not-found-page">
      <h1>404</h1>
      <p>页面没有找到</p>
      <p>
        <router-link to="/">返回首页</router-link>
      </p>
    </div>
  </simple-layout>
</template>
<script>
export default {
  name: 'notFound',
  metaInfo: {
    title: '404'
  },
  created () {

  },
  data () {
    return {}
  },
  components: {},
  watch: {},
  methods: {}
}
</script>
<style lang="less">
  .not-found-page {
    h1{
      margin-top: 100px;
      font-size: 60px;
      text-align: center
    }
    p {
      font-size: 24px;
      text-align: center;
    }
    a {
      font-size: 18px;
    }
  }
</style>
