<template>
  <div id="app">
    <MyClient/>   <!-- ★★ここで指定★★ -->
  </div>
</template>

<script>
import MyClient from './components/MyClient'   // ★★ここで指定★★

export default {
  name: 'App',
  components: {
    MyClient   // ★★ここで指定★★
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
