import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { Grid, GridItem } from 'vant'
import 'vant/lib/index.css' // 引入 Vant 样式

createApp(App)
  .use(router)
  .use(Grid)
  .use(GridItem)
  .mount('#app')