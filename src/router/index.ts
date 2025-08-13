import type { App } from "vue";
import {
    createRouter,
    createWebHashHistory,
    RouteRecordRaw
} from "vue-router";

export const Layout = () => import("@/layout/index.vue");


// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "root",
        redirect: "/login"
    },
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/login/index.vue"),
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/default/404.vue')
    },
    // {
    //     path: "/",
    //     name: "dashboard",
    //     component: Layout,
    //     children: [
    //         {
    //             path: "/dashboard",
    //             component: () => import("@/views/dashboard/index.vue"),
    //             name: "dashboard",
    //             meta: {
    //                 title: "首页",
    //                 // icon: "",
    //                 // keepAlive: true,
    //             },
    //         },
    //     ],
    // },
];

export const dynamicRoutes: RouteRecordRaw[] = [
    {
        path: "/dashboard",
        component: Layout,
        name: "dashboard",
        meta: {
            title: "数据大屏",
            isMenu: true,
            // icon: "",
            // isExpand: true
        },
        children: [
            {
                path: "",
                component: () => import("@/views/dashboard/index.vue"),
                name: "dashboard",
                meta: { title: "页面1" },
            }
        ],
    },
    {
        path: "/online",
        component: Layout,
        name: "online",
        meta: {
            title: "实时检测",
            isMenu: true,
            // icon: "",
            // isExpand: true
        },
        redirect: "/online/page1",
        children: [
            {
                path: "page1",
                component: () => import("@/views/online/index.vue"),
                name: "online-page1",
                meta: { title: "页面1" },
            }
        ],
    },
    {
        path: "/offline",
        component: Layout,
        name: "offline",
        meta: {
            title: "离线检测",
            isMenu: true,
            // icon: "",
            // isExpand: true
        },
        redirect: "/offline/index",
        children: [
            {
                path: "index",
                component: () => import("@/views/offline/index.vue"),
                name: "offline-page1",
                meta: { title: "离线检测" },
            }
        ],
    },
    {
        path: "/experiment",
        component: Layout,
        name: "experiment",
        meta: {
            title: "实验管理",
            isMenu: true,
            // icon: "",
            // isExpand: true
        },
        redirect: "/experiment/page1",
        children: [
            {
                path: "page1",
                component: () => import("@/views/experiment/Page1.vue"),
                name: "experiment-page1",
                meta: { title: "页面1" },
            }
        ],
    },
    {
        path: "/data",
        component: Layout,
        name: "data",
        meta: {
            title: "数据管理",
            isMenu: true,
            hasChildMenu: true,
            // icon: "",
            // isExpand: true
        },
        redirect: "/data/page2",
        children: [
            {
                path: "page2",
                component: () => import("@/views/data/DataSummary.vue"),
                name: "data-page2",
                meta: { title: "数据统计" },
            }, {
                path: "page1",
                component: () => import("@/views/data/DataManage.vue"),
                name: "data-page1",
                meta: { title: "数据管理" },
            },
            {
                path: "page3",
                component: () => import("@/views/data/DataExport.vue"),
                name: "data-page3",
                meta: { title: "数据导出" },
            }
        ],
    },
    {
        path: "/user",
        component: Layout,
        name: "user",
        meta: {
            title: "用户管理",
            isMenu: true,
            hasChildMenu: true,
            // icon: "",
            // isExpand: true
        },
        redirect: "/user/user",
        children: [
            {
                path: "user",
                component: () => import("@/views/user/UserManage.vue"),
                name: "user",
                meta: { title: "用户管理" },
            },
            {
                path: "role",
                component: () => import("@/views/user/RoleManage.vue"),
                name: "role",
                meta: { title: "角色管理" },
            },
            {
                path: "permission",
                component: () => import("@/views/user/PermissionManage.vue"),
                name: "permission",
                meta: { title: "权限管理" },
            },
            {
                path: "apply",
                component: () => import("@/views/user/index.vue"),
                name: "apply",
                meta: { title: "申请与审计" },
            }
        ],
    },
]


/**
 * 创建路由
 */
const router = createRouter({
    history: createWebHashHistory(),
    routes: constantRoutes,
    // 刷新时，滚动条位置还原
    scrollBehavior: () => ({ left: 0, top: 0 }),
});

/**
 * 注册路由
 */
export function setupRouter(app: App<Element>) {
    app.use(router);
}

/**
 * 重置路由
 */
export function resetRouter() {
    // 移除所有现有路由
    const currentRoutes = router.getRoutes();
    currentRoutes.forEach(route => {
        if (route.name) {
            router.removeRoute(route.name);
        }
    });

    console.log(router.getRoutes())

    // 重新添加静态路由
    constantRoutes.forEach(route => {
        router.addRoute(route);
    });

    router.replace({ path: "/login" });
}

/**
 * 添加动态路由
 */
export function addDynamicChildrenRoutes(routes: RouteRecordRaw[]) {
    console.log(routes)
    routes.forEach(route => {
        router.addRoute(route);
    })
}

export default router;
