import {useUserStore} from "@/store";
import router from "@/router";
import type {NavigationGuardNext, RouteLocationNormalized} from "vue-router";
import {TOKEN} from "@/enums/CacheEnum";

// 定义白名单，这些路由不需要登录即可访问
const whiteList = ['/login'];

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const userStore = useUserStore();
    const hasToken = localStorage.getItem(TOKEN);

    if (hasToken) {
        if (to.path === '/login') {
            // 如果已经登录，访问登录页则重定向到首页
            next({path: '/dashboard'});
        } else {
            const hasUserInfo = userStore.userInfo;
            if (hasUserInfo) {
                next();
            } else {
                try {
                    await userStore.fetchUserInfo();
                    // 关键：重新导航以确保路由依赖就绪
                    next({ ...to, replace: true });
                } catch (error) {
                    let errorMessage = '获取用户信息失败，请重新登录';
                    if (error instanceof Error) {
                        errorMessage = error.message || errorMessage;
                    }
                    // 获取用户信息失败，清除 token 并重定向到登录页
                    userStore.logout();
                    ElMessage.error("请先登录！" + errorMessage);
                    next(`/login?redirect=${to.path}`);
                }
            }
        }
    } else {
        if (whiteList.includes(to.path)) {
            // 在白名单内，直接放行
            next();
        } else {
            ElMessage.error("请先登录！");
            // 不在白名单内，重定向到登录页
            next(`/login?redirect=${to.path}`);
        }
    }
});
