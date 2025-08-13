import {defineStore} from 'pinia';
import AuthAPI from "@/api/auth";
import router, {addDynamicChildrenRoutes, dynamicRoutes, resetRouter} from '@/router';
import {TOKEN} from "@/enums/CacheEnum";

// 定义用户信息类型
interface UserInfo {
    id: number;
    username: string;
    phone: string | null;
    status: number;
    roles: string[];
    permissions: string[];
    paths: string[];
}

export interface Menu {
    name: string;
    path: string;
    title: string;
    icon: string;
    hasChildMenu?: boolean;
    children?: Menu[];
}

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: null as UserInfo | null,
        token: '' as string | null,
        menus: [] as Menu[]
    }),
    actions: {
        setUserInfo(info: UserInfo) {
            this.userInfo = info;
        },
        setToken(token: string) {
            this.token = token;
            localStorage.setItem(TOKEN, token);
        },
        clearUserInfo() {
            this.userInfo = null;
            this.token = null;
            localStorage.removeItem(TOKEN);
            localStorage.removeItem('currentMenu');
            localStorage.removeItem('userId');
            localStorage.removeItem('userInfo');
            this.menus = []; // 清除用户信息时清空菜单项
        },
        async fetchUserInfo() {
            try {
                const userInfo = await AuthAPI.getCurrentUser();
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                this.setUserInfo(userInfo);
                if (!userInfo.roles || userInfo.roles.length === 0) {
                    ElMessage.error('用户没有分配角色，请联系管理员');
                    throw new Error('用户没有分配角色');
                } else {
                    this.generateDynamicRoutes(userInfo);
                }
                return userInfo;
            } catch (error) {
                console.error('获取用户信息出错：', error);
                ElMessage.error('获取用户信息失败，请检查权限配置');
                throw error;
            }
        },
        generateDynamicRoutes(userInfo: UserInfo) {
            try {
                // TODO: 根据用户权限判断路由
                // const filteredRoutes = dynamicRoutes.filter(route => {
                //     return userInfo.paths.includes(route.name as string);
                // });
                // 添加动态路由
                addDynamicChildrenRoutes(dynamicRoutes);
                console.log('动态路由添加完成', router.getRoutes());
                // 生成菜单项
                this.menus = dynamicRoutes.map(route => ({
                    name: route.name as string,
                    path: route.path,
                    icon: route.meta?.icon as string,
                    title: route.meta?.title as string,
                    hasChildMenu: route.meta?.hasChildMenu as boolean,
                    children: route.children?.map(child => ({
                        name: child.name as string,
                        path: child.path,
                        icon: child.meta?.icon as string,
                        title: child.meta?.title as string,
                    }))
                }))
            } catch (error) {
                console.error('生成动态路由出错：', error);
                ElMessage.error('生成动态路由失败，请检查权限配置');
            }
        },
        async handleLogin(loginForm: { username: string; password: string }) {
            if (!loginForm.username.trim() || !loginForm.password.trim()) {
                ElMessage.error('请输入用户名和密码');
                return;
            }
            try {
                // 调用登录接口
                const response = await AuthAPI.login(loginForm);

                // 假设返回结果中有 access_token 字段
                if (response.access_token) {
                    // 将 token 保存到 store
                    this.setToken(response.access_token);
                }
                // 登录成功提示
                ElMessage.success('登录成功');
                console.log('登录结果：', this.token);

                // 调用获取用户信息接口
                await this.fetchUserInfo();

                // 跳转到 dashboard 主页
                await router.push('/dashboard');
            } catch (error) {
                // 登录失败提示
                // ElMessage.error('登录失败，请检查用户名和密码');
                console.error('登录出错：', error);
            }
        },
        logout() {
            try {
                // 清除本地用户信息
                this.clearUserInfo();
                resetRouter();
                console.log('路由重置完成', router.getRoutes());
                // 提示退出成功
                ElMessage.success('退出登录成功');
                // 跳转到登录页面
                router.push('/login');
            } catch (error) {
                console.error('退出登录出错：', error);
                ElMessage.error('退出登录失败，请稍后重试');
            }
        }
    },
    getters: {
        isLoggedIn: (state) => !!state.token,
        hasRole: (state) => (role: string) => {
            return state.userInfo?.roles.includes(role) || false;
        },
        hasPermission: (state) => (permission: string) => {
            return state.userInfo?.permissions.includes(permission) || false;
        },
        getMenuItems: (state) => state.menus // 新增获取菜单项的 getter
    }
});
