<template>
  <div id="app" class="normal">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo () {
    return {
      title: this.$route.meta.title,
      titleTemplate: (titleChunk) => {
        return titleChunk ? `${titleChunk} - ${process.env.PROJECT_NAME}` : process.env.PROJECT_NAME
      }
    }
  },
  data () {
    return {
      title: '首页'
    }
  },
  components: {
  },
  created () {
  }
}
</script>
<style></style>
