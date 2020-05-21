import Vue from 'vue'
import App from './App.vue'

// fontawesomeの利用設定
// 本プロジェクトでは、index.htmlでCDNを読み込むスタイル。簡易さを優先する。


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
