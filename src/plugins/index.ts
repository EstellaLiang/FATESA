// import { setupDirective } from "@/directive";
// import { setupI18n } from "@/lang";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";
import type { App } from "vue";
import { setupElIcons } from "./icons";
import {setupZhCn} from "@/plugins/zhch";

export default {
  install(app: App<Element>) {
    // 自定义指令(directive)
    // setupDirective(app);
    // 路由(router)
    setupRouter(app);
    // 状态管理(store)
    setupStore(app);
    // 汉化
    setupZhCn(app);
    // Element-plus图标
    setupElIcons(app);
  },
};
