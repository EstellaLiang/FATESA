import './styles/main.css'
import './styles/index.scss'
import setupPlugins from "@/plugins";
import './utils/permission'

import {createApp} from 'vue'
import App from './App.vue'

const app = createApp(App);
app.use(setupPlugins);
app.mount("#app");
