import type { App } from "vue";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import ElementPlus from "element-plus";
// 注册所有图标
export function setupZhCn(app: App<Element>) {
        app.use(ElementPlus, {locale: zhCn});
}
