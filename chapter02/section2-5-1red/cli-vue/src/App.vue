<template>
  <div id="app">
    <!-- ★★ここを変更★★ -->
    <MyClient v-bind:windowLocationHref="locationHrefStr"></MyClient>
  </div>
</template>

<script>
import MyClient from './components/MyClient'   // ★★ここで指定★★

export default {
  name: 'app',
  data: function () { // ★追加
    // URL情報を欲しい且つDI(=Dependency Injection)するために、ここで注入する。
    return {
      locationHrefStr : window.location.href
    };
  },
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
</style>
