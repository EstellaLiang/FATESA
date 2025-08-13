import axios, {InternalAxiosRequestConfig, AxiosResponse} from "axios";
// import {useUserStoreHook} from "@/store/modules/user";
import {TOKEN} from "@/enums/CacheEnum";

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 50000,
    headers: {"Content-Type": "application/json;charset=utf-8"},
    withCredentials: true // 允许发送Cookie
});

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从 sessionStorage 中获取 token
        const accessToken = localStorage.getItem(TOKEN);
        if (accessToken) {
            // 将 token 以 Authorization: Bearer <token> 的格式添加到请求头
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (config.meta?.timeout) {
            config.timeout = config.meta.timeout;
        }

        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        // 检查配置的响应类型是否为二进制类型（'blob' 或 'arraybuffer'）, 如果是，直接返回响应对象
        if (
            response.config.responseType === "blob" ||
            response.config.responseType === "arraybuffer"
        ) {
            return response;
        }

        const {code, data, message} = response.data;
        return data;

        // if (code === 1) {
        //     return data;
        // }
        //
        // return Promise.reject(new Error(message || "请求失败"));
    },
    (error: any) => {
        ElMessage.error(error.response.data.message);
        // 其他异常处理可按需添加
        return Promise.reject(error);
    }
);

// 导出 axios 实例
export default service;
