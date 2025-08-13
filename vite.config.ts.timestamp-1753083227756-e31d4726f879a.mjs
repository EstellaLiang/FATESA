// vite.config.ts
import vue from "file:///D:/Projects/eye-tracking-system/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///D:/Projects/eye-tracking-system/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { loadEnv, defineConfig } from "file:///D:/Projects/eye-tracking-system/node_modules/vite/dist/node/index.js";
import AutoImport from "file:///D:/Projects/eye-tracking-system/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/Projects/eye-tracking-system/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/Projects/eye-tracking-system/node_modules/unplugin-vue-components/dist/resolvers.js";
import Icons from "file:///D:/Projects/eye-tracking-system/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///D:/Projects/eye-tracking-system/node_modules/unplugin-icons/dist/resolver.js";
import { createSvgIconsPlugin } from "file:///D:/Projects/eye-tracking-system/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import { resolve } from "path";

// package.json
var name = "eye-tracking-system";
var version = "1.0.0";
var dependencies = {
  "@element-plus/icons-vue": "^2.3.1",
  "@panzoom/panzoom": "^4.6.0",
  axios: "^1.8.4",
  canvg: "^4.0.3",
  "element-plus": "2.1",
  panzoom: "^9.4.3",
  pinia: "^2.2.2",
  "pixi.js": "^8.9.1",
  "svg-pan-zoom": "^3.6.2",
  terser: "^5.43.1",
  "unplugin-auto-import": "^0.18.2",
  "unplugin-icons": "^0.19.3",
  "unplugin-vue-components": "^0.26.0",
  "vite-plugin-svg-icons": "^2.0.1",
  vue: "^3.4.29",
  "vue-i18n": "^11.1.4",
  "vue-router": "^4.0.13",
  "vue-svg-pan-zoom": "^2.1.0",
  "vue3-pixi": "^0.9.6"
};
var devDependencies = {
  "@tsconfig/node20": "^20.1.4",
  "@types/node": "^20.14.5",
  "@vitejs/plugin-vue": "^5.0.5",
  "@vitejs/plugin-vue-jsx": "^3.1.0",
  "@vue/tsconfig": "^0.5.1",
  "npm-run-all2": "^6.2.0",
  "sass-embedded": "^1.78.0",
  typescript: "~5.4.0",
  vite: "^5.3.1",
  "vite-plugin-svg-icons": "^2.0.1",
  "vue-tsc": "^2.0.21"
};
var engines = {
  node: ">=18.0.0"
};

// vite.config.ts
var __vite_injected_original_dirname = "D:\\Projects\\eye-tracking-system";
var __APP_INFO__ = {
  pkg: { name, version, engines, dependencies, devDependencies },
  buildTimestamp: Date.now()
};
var pathSrc = resolve(__vite_injected_original_dirname, "src");
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    resolve: {
      alias: {
        "@": pathSrc
      }
    },
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        // 定义全局 SCSS 变量
        scss: {
          javascriptEnabled: true,
          additionalData: `@use "@/styles/variables.scss" as *;@import "@/styles/elements.scss";`
        }
      }
    },
    server: {
      // 允许IP访问
      host: "0.0.0.0",
      // 应用端口 (默认:3000)
      port: Number(env.VITE_APP_PORT),
      // 运行是否自动打开浏览器
      open: true,
      proxy: {
        /** 代理前缀为 /api/v1 的请求  */
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          // 接口地址
          target: env.VITE_APP_API_URL,
          rewrite: (path) => path.replace(new RegExp("^" + env.VITE_APP_BASE_API + env.VITE_APP_BASE_API), "")
        }
      }
    },
    plugins: [
      vue(),
      // jsx、tsx语法支持
      vueJsx(),
      // 自动导入参考： https://github.com/sxzz/element-plus-best-practices/blob/main/vite.config.ts
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ["vue", "@vueuse/core", "pinia", "vue-router"],
        resolvers: [
          // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({})
        ],
        eslintrc: {
          // 是否自动生成 eslint 规则，建议生成之后设置 false
          enabled: false,
          // 指定自动导入函数 eslint 规则的文件
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true
        },
        // 是否在 vue 模板中自动导入
        vueTemplate: true,
        // 指定自动导入函数TS类型声明文件路径 (false:关闭自动生成)
        dts: false
        // dts: "src/types/auto-imports.d.ts",
      }),
      Components({
        resolvers: [
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver({
            // element-plus图标库，其他图标库 https://icon-sets.iconify.design/
            enabledCollections: ["ep"]
          })
        ],
        // 指定自定义组件位置(默认:src/components)
        dirs: ["src/components", "src/**/components"],
        // 指定自动导入组件TS类型声明文件路径 (false:关闭自动生成)
        dts: false
        // dts: "src/types/components.d.ts",
      }),
      Icons({
        // 自动安装图标库
        autoInstall: true
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(pathSrc, "assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]"
      })
    ],
    // 预加载项目必需的组件
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "axios",
        "@vueuse/core",
        "path-to-regexp",
        "path-browserify",
        "element-plus/es/components/form/style/css",
        "element-plus/es/components/form-item/style/css",
        "element-plus/es/components/button/style/css",
        "element-plus/es/components/input/style/css",
        "element-plus/es/components/input-number/style/css",
        "element-plus/es/components/switch/style/css",
        "element-plus/es/components/upload/style/css",
        "element-plus/es/components/menu/style/css",
        "element-plus/es/components/col/style/css",
        "element-plus/es/components/icon/style/css",
        "element-plus/es/components/row/style/css",
        "element-plus/es/components/tag/style/css",
        "element-plus/es/components/dialog/style/css",
        "element-plus/es/components/loading/style/css",
        "element-plus/es/components/radio/style/css",
        "element-plus/es/components/radio-group/style/css",
        "element-plus/es/components/popover/style/css",
        "element-plus/es/components/scrollbar/style/css",
        "element-plus/es/components/tooltip/style/css",
        "element-plus/es/components/dropdown/style/css",
        "element-plus/es/components/dropdown-menu/style/css",
        "element-plus/es/components/dropdown-item/style/css",
        "element-plus/es/components/sub-menu/style/css",
        "element-plus/es/components/menu-item/style/css",
        "element-plus/es/components/divider/style/css",
        "element-plus/es/components/card/style/css",
        "element-plus/es/components/link/style/css",
        "element-plus/es/components/breadcrumb/style/css",
        "element-plus/es/components/breadcrumb-item/style/css",
        "element-plus/es/components/table/style/css",
        "element-plus/es/components/tree-select/style/css",
        "element-plus/es/components/table-column/style/css",
        "element-plus/es/components/select/style/css",
        "element-plus/es/components/option/style/css",
        "element-plus/es/components/pagination/style/css",
        "element-plus/es/components/tree/style/css",
        "element-plus/es/components/alert/style/css",
        "element-plus/es/components/radio-button/style/css",
        "element-plus/es/components/checkbox-group/style/css",
        "element-plus/es/components/checkbox/style/css",
        "element-plus/es/components/tabs/style/css",
        "element-plus/es/components/tab-pane/style/css",
        "element-plus/es/components/rate/style/css",
        "element-plus/es/components/date-picker/style/css",
        "element-plus/es/components/notification/style/css",
        "element-plus/es/components/image/style/css",
        "element-plus/es/components/statistic/style/css",
        "element-plus/es/components/watermark/style/css",
        "element-plus/es/components/config-provider/style/css",
        "element-plus/es/components/text/style/css",
        "element-plus/es/components/drawer/style/css",
        "element-plus/es/components/color-picker/style/css",
        "element-plus/es/components/backtop/style/css",
        "element-plus/es/components/message-box/style/css"
      ]
    },
    // 构建配置
    build: {
      chunkSizeWarningLimit: 2e3,
      // 消除打包大小超过500kb警告
      minify: "terser",
      // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
      terserOptions: {
        compress: {
          keep_infinity: true,
          // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          drop_console: true,
          // 生产环境去除 console
          drop_debugger: true
          // 生产环境去除 debugger
        },
        format: {
          comments: false
          // 删除注释
        }
      },
      rollupOptions: {
        output: {
          // manualChunks: {
          //   "vue-i18n": ["vue-i18n"],
          // },
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: "js/[name].[hash].js",
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: "js/[name].[hash].js",
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
            let extType = info[info.length - 1];
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "media";
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = "img";
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "fonts";
            }
            return `${extType}/[name].[hash].[ext]`;
          }
        }
      }
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcZXllLXRyYWNraW5nLXN5c3RlbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcZXllLXRyYWNraW5nLXN5c3RlbVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamVjdHMvZXllLXRyYWNraW5nLXN5c3RlbS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xyXG5pbXBvcnQgdnVlSnN4IGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI7XHJcbmltcG9ydCB7VXNlckNvbmZpZywgQ29uZmlnRW52LCBsb2FkRW52LCBkZWZpbmVDb25maWd9IGZyb20gXCJ2aXRlXCI7XHJcblxyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZVwiO1xyXG5pbXBvcnQge0VsZW1lbnRQbHVzUmVzb2x2ZXJ9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcclxuaW1wb3J0IEljb25zIGZyb20gXCJ1bnBsdWdpbi1pY29ucy92aXRlXCI7XHJcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gXCJ1bnBsdWdpbi1pY29ucy9yZXNvbHZlclwiO1xyXG5cclxuaW1wb3J0IHtjcmVhdGVTdmdJY29uc1BsdWdpbn0gZnJvbSBcInZpdGUtcGx1Z2luLXN2Zy1pY29uc1wiO1xyXG5cclxuaW1wb3J0IHtyZXNvbHZlfSBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQge1xyXG4gICAgbmFtZSxcclxuICAgIHZlcnNpb24sXHJcbiAgICBlbmdpbmVzLFxyXG4gICAgZGVwZW5kZW5jaWVzLFxyXG4gICAgZGV2RGVwZW5kZW5jaWVzLFxyXG59IGZyb20gXCIuL3BhY2thZ2UuanNvblwiO1xyXG5cclxuLyoqIFx1NUU3M1x1NTNGMFx1NzY4NFx1NTQwRFx1NzlGMFx1MzAwMVx1NzI0OFx1NjcyQ1x1MzAwMVx1OEZEMFx1ODg0Q1x1NjI0MFx1OTcwMFx1NzY4NGBub2RlYFx1NzI0OFx1NjcyQ1x1MzAwMVx1NEY5RFx1OEQ1Nlx1MzAwMVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NzY4NFx1N0M3Qlx1NTc4Qlx1NjNEMFx1NzkzQSAqL1xyXG5jb25zdCBfX0FQUF9JTkZPX18gPSB7XHJcbiAgICBwa2c6IHtuYW1lLCB2ZXJzaW9uLCBlbmdpbmVzLCBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llc30sXHJcbiAgICBidWlsZFRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxufTtcclxuXHJcbmNvbnN0IHBhdGhTcmMgPSByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIik7XHJcbi8vICBodHRwczovL2NuLnZpdGVqcy5kZXYvY29uZmlnXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoe21vZGV9OiBDb25maWdFbnYpOiBVc2VyQ29uZmlnID0+IHtcclxuICAgIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgICAgIFwiQFwiOiBwYXRoU3JjLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3NzOiB7XHJcbiAgICAgICAgICAgIC8vIENTUyBcdTk4ODRcdTU5MDRcdTc0MDZcdTU2NjhcclxuICAgICAgICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgLy8gXHU1QjlBXHU0RTQ5XHU1MTY4XHU1QzQwIFNDU1MgXHU1M0Q4XHU5MUNGXHJcbiAgICAgICAgICAgICAgICBzY3NzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAdXNlIFwiQC9zdHlsZXMvdmFyaWFibGVzLnNjc3NcIiBhcyAqO0BpbXBvcnQgXCJAL3N0eWxlcy9lbGVtZW50cy5zY3NzXCI7YCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXJ2ZXI6IHtcclxuICAgICAgICAgICAgLy8gXHU1MTQxXHU4QkI4SVBcdThCQkZcdTk1RUVcclxuICAgICAgICAgICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICAgICAgICAgIC8vIFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFMyAoXHU5RUQ4XHU4QkE0OjMwMDApXHJcbiAgICAgICAgICAgIHBvcnQ6IE51bWJlcihlbnYuVklURV9BUFBfUE9SVCksXHJcbiAgICAgICAgICAgIC8vIFx1OEZEMFx1ODg0Q1x1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxyXG4gICAgICAgICAgICBvcGVuOiB0cnVlLFxyXG4gICAgICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAgICAgLyoqIFx1NEVFM1x1NzQwNlx1NTI0RFx1N0YwMFx1NEUzQSAvYXBpL3YxIFx1NzY4NFx1OEJGN1x1NkM0MiAgKi9cclxuICAgICAgICAgICAgICAgIFtlbnYuVklURV9BUFBfQkFTRV9BUEldOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx1NjNBNVx1NTNFM1x1NTczMFx1NTc0MFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfQVBQX0FQSV9VUkwsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKFwiXlwiICsgZW52LlZJVEVfQVBQX0JBU0VfQVBJICsgZW52LlZJVEVfQVBQX0JBU0VfQVBJKSwgXCJcIiksXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgICB2dWUoKSxcclxuICAgICAgICAgICAgLy8ganN4XHUzMDAxdHN4XHU4QkVEXHU2Q0Q1XHU2NTJGXHU2MzAxXHJcbiAgICAgICAgICAgIHZ1ZUpzeCgpLFxyXG4gICAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTUzQzJcdTgwMDNcdUZGMUEgaHR0cHM6Ly9naXRodWIuY29tL3N4enovZWxlbWVudC1wbHVzLWJlc3QtcHJhY3RpY2VzL2Jsb2IvbWFpbi92aXRlLmNvbmZpZy50c1xyXG4gICAgICAgICAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgICAgICAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NSBWdWUgXHU3NkY4XHU1MTczXHU1MUZEXHU2NTcwXHVGRjBDXHU1OTgyXHVGRjFBcmVmLCByZWFjdGl2ZSwgdG9SZWYgXHU3QjQ5XHJcbiAgICAgICAgICAgICAgICBpbXBvcnRzOiBbXCJ2dWVcIiwgXCJAdnVldXNlL2NvcmVcIiwgXCJwaW5pYVwiLCBcInZ1ZS1yb3V0ZXJcIl0sXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjUgRWxlbWVudCBQbHVzIFx1NzZGOFx1NTE3M1x1NTFGRFx1NjU3MFx1RkYwQ1x1NTk4Mlx1RkYxQUVsTWVzc2FnZSwgRWxNZXNzYWdlQm94Li4uIChcdTVFMjZcdTY4MzdcdTVGMEYpXHJcbiAgICAgICAgICAgICAgICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NTZGRVx1NjgwN1x1N0VDNFx1NEVGNlxyXG4gICAgICAgICAgICAgICAgICAgIEljb25zUmVzb2x2ZXIoe30pLFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGVzbGludHJjOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIGVzbGludCBcdTg5QzRcdTUyMTlcdUZGMENcdTVFRkFcdThCQUVcdTc1MUZcdTYyMTBcdTRFNEJcdTU0MEVcdThCQkVcdTdGNkUgZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdTYzMDdcdTVCOUFcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTUxRkRcdTY1NzAgZXNsaW50IFx1ODlDNFx1NTIxOVx1NzY4NFx1NjU4N1x1NEVGNlxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVwYXRoOiBcIi4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb25cIixcclxuICAgICAgICAgICAgICAgICAgICBnbG9iYWxzUHJvcFZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIC8vIFx1NjYyRlx1NTQyNlx1NTcyOCB2dWUgXHU2QTIxXHU2NzdGXHU0RTJEXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHJcbiAgICAgICAgICAgICAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIC8vIFx1NjMwN1x1NUI5QVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NTFGRFx1NjU3MFRTXHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0IChmYWxzZTpcdTUxNzNcdTk1RURcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTApXHJcbiAgICAgICAgICAgICAgICBkdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gZHRzOiBcInNyYy90eXBlcy9hdXRvLWltcG9ydHMuZC50c1wiLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgQ29tcG9uZW50cyh7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjUgRWxlbWVudCBQbHVzIFx1N0VDNFx1NEVGNlxyXG4gICAgICAgICAgICAgICAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTZDRThcdTUxOENcdTU2RkVcdTY4MDdcdTdFQzRcdTRFRjZcclxuICAgICAgICAgICAgICAgICAgICBJY29uc1Jlc29sdmVyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxlbWVudC1wbHVzXHU1NkZFXHU2ODA3XHU1RTkzXHVGRjBDXHU1MTc2XHU0RUQ2XHU1NkZFXHU2ODA3XHU1RTkzIGh0dHBzOi8vaWNvbi1zZXRzLmljb25pZnkuZGVzaWduL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkQ29sbGVjdGlvbnM6IFtcImVwXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIC8vIFx1NjMwN1x1NUI5QVx1ODFFQVx1NUI5QVx1NEU0OVx1N0VDNFx1NEVGNlx1NEY0RFx1N0Y2RShcdTlFRDhcdThCQTQ6c3JjL2NvbXBvbmVudHMpXHJcbiAgICAgICAgICAgICAgICBkaXJzOiBbXCJzcmMvY29tcG9uZW50c1wiLCBcInNyYy8qKi9jb21wb25lbnRzXCJdLFxyXG4gICAgICAgICAgICAgICAgLy8gXHU2MzA3XHU1QjlBXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU3RUM0XHU0RUY2VFNcdTdDN0JcdTU3OEJcdTU4RjBcdTY2MEVcdTY1ODdcdTRFRjZcdThERUZcdTVGODQgKGZhbHNlOlx1NTE3M1x1OTVFRFx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMClcclxuICAgICAgICAgICAgICAgIGR0czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBkdHM6IFwic3JjL3R5cGVzL2NvbXBvbmVudHMuZC50c1wiLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgSWNvbnMoe1xyXG4gICAgICAgICAgICAgICAgLy8gXHU4MUVBXHU1MkE4XHU1Qjg5XHU4OEM1XHU1NkZFXHU2ODA3XHU1RTkzXHJcbiAgICAgICAgICAgICAgICBhdXRvSW5zdGFsbDogdHJ1ZSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcclxuICAgICAgICAgICAgICAgIC8vIFx1NjMwN1x1NUI5QVx1OTcwMFx1ODk4MVx1N0YxM1x1NUI1OFx1NzY4NFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NTkzOVxyXG4gICAgICAgICAgICAgICAgaWNvbkRpcnM6IFtyZXNvbHZlKHBhdGhTcmMsIFwiYXNzZXRzL2ljb25zXCIpXSxcclxuICAgICAgICAgICAgICAgIC8vIFx1NjMwN1x1NUI5QXN5bWJvbElkXHU2ODNDXHU1RjBGXHJcbiAgICAgICAgICAgICAgICBzeW1ib2xJZDogXCJpY29uLVtkaXJdLVtuYW1lXVwiLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgLy8gXHU5ODg0XHU1MkEwXHU4RjdEXHU5ODc5XHU3NkVFXHU1RkM1XHU5NzAwXHU3Njg0XHU3RUM0XHU0RUY2XHJcbiAgICAgICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgICAgICAgIGluY2x1ZGU6IFtcclxuICAgICAgICAgICAgICAgIFwidnVlXCIsXHJcbiAgICAgICAgICAgICAgICBcInZ1ZS1yb3V0ZXJcIixcclxuICAgICAgICAgICAgICAgIFwicGluaWFcIixcclxuICAgICAgICAgICAgICAgIFwiYXhpb3NcIixcclxuICAgICAgICAgICAgICAgIFwiQHZ1ZXVzZS9jb3JlXCIsXHJcbiAgICAgICAgICAgICAgICBcInBhdGgtdG8tcmVnZXhwXCIsXHJcbiAgICAgICAgICAgICAgICBcInBhdGgtYnJvd3NlcmlmeVwiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9mb3JtL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9mb3JtLWl0ZW0vc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2J1dHRvbi9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvaW5wdXQvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2lucHV0LW51bWJlci9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvc3dpdGNoL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy91cGxvYWQvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL21lbnUvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2NvbC9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvaWNvbi9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvcm93L3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90YWcvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2RpYWxvZy9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvbG9hZGluZy9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvcmFkaW8vc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3JhZGlvLWdyb3VwL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9wb3BvdmVyL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9zY3JvbGxiYXIvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3Rvb2x0aXAvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2Ryb3Bkb3duL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9kcm9wZG93bi1tZW51L3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9kcm9wZG93bi1pdGVtL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9zdWItbWVudS9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvbWVudS1pdGVtL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9kaXZpZGVyL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jYXJkL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9saW5rL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9icmVhZGNydW1iL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9icmVhZGNydW1iLWl0ZW0vc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3RhYmxlL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90cmVlLXNlbGVjdC9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvdGFibGUtY29sdW1uL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9zZWxlY3Qvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL29wdGlvbi9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvcGFnaW5hdGlvbi9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvdHJlZS9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvYWxlcnQvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3JhZGlvLWJ1dHRvbi9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY2hlY2tib3gtZ3JvdXAvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2NoZWNrYm94L3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90YWJzL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90YWItcGFuZS9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvcmF0ZS9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL25vdGlmaWNhdGlvbi9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvaW1hZ2Uvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3N0YXRpc3RpYy9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvd2F0ZXJtYXJrL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jb25maWctcHJvdmlkZXIvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3RleHQvc3R5bGUvY3NzXCIsXHJcbiAgICAgICAgICAgICAgICBcImVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2RyYXdlci9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgICAgIFwiZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY29sb3ItcGlja2VyL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9iYWNrdG9wL3N0eWxlL2Nzc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9tZXNzYWdlLWJveC9zdHlsZS9jc3NcIixcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIFx1Njc4NFx1NUVGQVx1OTE0RFx1N0Y2RVxyXG4gICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCwgLy8gXHU2RDg4XHU5NjY0XHU2MjUzXHU1MzA1XHU1OTI3XHU1QzBGXHU4RDg1XHU4RkM3NTAwa2JcdThCNjZcdTU0NEFcclxuICAgICAgICAgICAgbWluaWZ5OiBcInRlcnNlclwiLCAvLyBWaXRlIDIuNi54IFx1NEVFNVx1NEUwQVx1OTcwMFx1ODk4MVx1OTE0RFx1N0Y2RSBtaW5pZnk6IFwidGVyc2VyXCIsIHRlcnNlck9wdGlvbnMgXHU2MjREXHU4MEZEXHU3NTFGXHU2NTQ4XHJcbiAgICAgICAgICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAga2VlcF9pbmZpbml0eTogdHJ1ZSwgLy8gXHU5NjMyXHU2QjYyIEluZmluaXR5IFx1ODhBQlx1NTM4Qlx1N0YyOVx1NjIxMCAxLzBcdUZGMENcdThGRDlcdTUzRUZcdTgwRkRcdTRGMUFcdTVCRkNcdTgxRjQgQ2hyb21lIFx1NEUwQVx1NzY4NFx1NjAyN1x1ODBGRFx1OTVFRVx1OTg5OFxyXG4gICAgICAgICAgICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSwgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU1M0JCXHU5NjY0IGNvbnNvbGVcclxuICAgICAgICAgICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLCAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTUzQkJcdTk2NjQgZGVidWdnZXJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50czogZmFsc2UsIC8vIFx1NTIyMFx1OTY2NFx1NkNFOFx1OTFDQVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICBcInZ1ZS1pMThuXCI6IFtcInZ1ZS1pMThuXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU3NTI4XHU0RThFXHU0RUNFXHU1MTY1XHU1M0UzXHU3MEI5XHU1MjFCXHU1RUZBXHU3Njg0XHU1NzU3XHU3Njg0XHU2MjUzXHU1MzA1XHU4RjkzXHU1MUZBXHU2ODNDXHU1RjBGW25hbWVdXHU4ODY4XHU3OTNBXHU2NTg3XHU0RUY2XHU1NDBELFtoYXNoXVx1ODg2OFx1NzkzQVx1OEJFNVx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOWhhc2hcdTUwM0NcclxuICAgICAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJqcy9bbmFtZV0uW2hhc2hdLmpzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU3NTI4XHU0RThFXHU1NDdEXHU1NDBEXHU0RUUzXHU3ODAxXHU2MkM2XHU1MjA2XHU2NUY2XHU1MjFCXHU1RUZBXHU3Njg0XHU1MTcxXHU0RUFCXHU1NzU3XHU3Njg0XHU4RjkzXHU1MUZBXHU1NDdEXHU1NDBEXHJcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IFwianMvW25hbWVdLltoYXNoXS5qc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx1NzUyOFx1NEU4RVx1OEY5M1x1NTFGQVx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NzY4NFx1NTQ3RFx1NTQwRFx1RkYwQ1tleHRdXHU4ODY4XHU3OTNBXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEXHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm86IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWUuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXh0VHlwZSA9IGluZm9baW5mby5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1x1NjU4N1x1NEVGNlx1NEZFMVx1NjA2RicsIGFzc2V0SW5mby5uYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXFwuKG1wNHx3ZWJtfG9nZ3xtcDN8d2F2fGZsYWN8YWFjKShcXD8uKik/JC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0VHlwZSA9IFwibWVkaWFcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgvXFwuKHBuZ3xqcGU/Z3xnaWZ8c3ZnKShcXD8uKik/JC8udGVzdChhc3NldEluZm8ubmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dFR5cGUgPSBcImltZ1wiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC9cXC4od29mZjI/fGVvdHx0dGZ8b3RmKShcXD8uKik/JC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRUeXBlID0gXCJmb250c1wiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtleHRUeXBlfS9bbmFtZV0uW2hhc2hdLltleHRdYDtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlZmluZToge1xyXG4gICAgICAgICAgICBfX0FQUF9JTkZPX186IEpTT04uc3RyaW5naWZ5KF9fQVBQX0lORk9fXyksXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn0pO1xyXG4iLCAie1xyXG4gIFwibmFtZVwiOiBcImV5ZS10cmFja2luZy1zeXN0ZW1cIixcclxuICBcInZlcnNpb25cIjogXCIxLjAuMFwiLFxyXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxyXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcImRldlwiOiBcInZpdGVcIixcclxuICAgIFwiYnVpbGRcIjogXCJydW4tcCB0eXBlLWNoZWNrIFxcXCJidWlsZC1vbmx5IHtAfVxcXCIgLS1cIixcclxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxyXG4gICAgXCJidWlsZC1vbmx5XCI6IFwidml0ZSBidWlsZFwiLFxyXG4gICAgXCJ0eXBlLWNoZWNrXCI6IFwidnVlLXRzYyAtLWJ1aWxkIC0tZm9yY2VcIlxyXG4gIH0sXHJcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZVwiOiBcIl4yLjMuMVwiLFxyXG4gICAgXCJAcGFuem9vbS9wYW56b29tXCI6IFwiXjQuNi4wXCIsXHJcbiAgICBcImF4aW9zXCI6IFwiXjEuOC40XCIsXHJcbiAgICBcImNhbnZnXCI6IFwiXjQuMC4zXCIsXHJcbiAgICBcImVsZW1lbnQtcGx1c1wiOiBcIjIuMVwiLFxyXG4gICAgXCJwYW56b29tXCI6IFwiXjkuNC4zXCIsXHJcbiAgICBcInBpbmlhXCI6IFwiXjIuMi4yXCIsXHJcbiAgICBcInBpeGkuanNcIjogXCJeOC45LjFcIixcclxuICAgIFwic3ZnLXBhbi16b29tXCI6IFwiXjMuNi4yXCIsXHJcbiAgICBcInRlcnNlclwiOiBcIl41LjQzLjFcIixcclxuICAgIFwidW5wbHVnaW4tYXV0by1pbXBvcnRcIjogXCJeMC4xOC4yXCIsXHJcbiAgICBcInVucGx1Z2luLWljb25zXCI6IFwiXjAuMTkuM1wiLFxyXG4gICAgXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50c1wiOiBcIl4wLjI2LjBcIixcclxuICAgIFwidml0ZS1wbHVnaW4tc3ZnLWljb25zXCI6IFwiXjIuMC4xXCIsXHJcbiAgICBcInZ1ZVwiOiBcIl4zLjQuMjlcIixcclxuICAgIFwidnVlLWkxOG5cIjogXCJeMTEuMS40XCIsXHJcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCJeNC4wLjEzXCIsXHJcbiAgICBcInZ1ZS1zdmctcGFuLXpvb21cIjogXCJeMi4xLjBcIixcclxuICAgIFwidnVlMy1waXhpXCI6IFwiXjAuOS42XCJcclxuICB9LFxyXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQHRzY29uZmlnL25vZGUyMFwiOiBcIl4yMC4xLjRcIixcclxuICAgIFwiQHR5cGVzL25vZGVcIjogXCJeMjAuMTQuNVwiLFxyXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWVcIjogXCJeNS4wLjVcIixcclxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiOiBcIl4zLjEuMFwiLFxyXG4gICAgXCJAdnVlL3RzY29uZmlnXCI6IFwiXjAuNS4xXCIsXHJcbiAgICBcIm5wbS1ydW4tYWxsMlwiOiBcIl42LjIuMFwiLFxyXG4gICAgXCJzYXNzLWVtYmVkZGVkXCI6IFwiXjEuNzguMFwiLFxyXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwifjUuNC4wXCIsXHJcbiAgICBcInZpdGVcIjogXCJeNS4zLjFcIixcclxuICAgIFwidml0ZS1wbHVnaW4tc3ZnLWljb25zXCI6IFwiXjIuMC4xXCIsXHJcbiAgICBcInZ1ZS10c2NcIjogXCJeMi4wLjIxXCJcclxuICB9LFxyXG4gIFwiZW5naW5lc1wiOiB7XHJcbiAgICBcIm5vZGVcIjogXCI+PTE4LjAuMFwiXHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVIsT0FBTyxTQUFTO0FBQ3JTLE9BQU8sWUFBWTtBQUNuQixTQUErQixTQUFTLG9CQUFtQjtBQUUzRCxPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFRLDJCQUEwQjtBQUNsQyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFFMUIsU0FBUSw0QkFBMkI7QUFFbkMsU0FBUSxlQUFjOzs7QUNYcEIsV0FBUTtBQUNSLGNBQVc7QUFVWCxtQkFBZ0I7QUFBQSxFQUNkLDJCQUEyQjtBQUFBLEVBQzNCLG9CQUFvQjtBQUFBLEVBQ3BCLE9BQVM7QUFBQSxFQUNULE9BQVM7QUFBQSxFQUNULGdCQUFnQjtBQUFBLEVBQ2hCLFNBQVc7QUFBQSxFQUNYLE9BQVM7QUFBQSxFQUNULFdBQVc7QUFBQSxFQUNYLGdCQUFnQjtBQUFBLEVBQ2hCLFFBQVU7QUFBQSxFQUNWLHdCQUF3QjtBQUFBLEVBQ3hCLGtCQUFrQjtBQUFBLEVBQ2xCLDJCQUEyQjtBQUFBLEVBQzNCLHlCQUF5QjtBQUFBLEVBQ3pCLEtBQU87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
