import request from "@/utils/request";

class AuthAPI {
    /**
     * 用户登录
     * @param data 登录所需的数据
     * @returns 登录结果
     */
    static login(data: any) {
        return request<any, any>({
            url: "/auth/login",
            method: "post",
            data
        });
    }

    /**
     * 获取当前用户信息
     * @returns 当前用户信息
     */
    static getCurrentUser() {
        return request<any, any>({
            url: "/auth/me",
            method: "get"
        });
    }

    /**
     * 获取用户列表
     * @param params 包含分页信息的对象，page 为页码，size 为每页数量
     * @returns 用户列表
     */
    static getUserList(params: UserQueryForm) {
        return request<any, any>({
            // 修正 URL 拼写错误
            url: "/auth/user/list",
            method: "get",
            // 传递查询参数
            params
        });
    }

    /**
     * 创建用户
     * @param data 创建用户所需的数据
     * @returns 创建结果
     */
    static createUser(data: any) {
        return request<any, any>({
            url: "/auth/user",
            method: "post",
            data
        });
    }

    /**
     * 更新用户信息
     * @param userId 用户 ID
     * @param data 更新用户所需的数据
     * @returns 更新结果
     */
    static updateUser(userId: number, data: any) {
        return request<any, any>({
            url: `/auth/user/${userId}`,
            method: "put",
            data
        });
    }

    /**
     * 删除用户
     * @param userId 用户 ID
     * @returns 删除结果
     */
    static deleteUser(userId: number) {
        return request<any, any>({
            url: `/auth/user/${userId}`,
            method: "delete"
        });
    }
}

export interface User {
    id: number;
    username: string;
    password?: string;
    roles: string[];
    create_time: string;
    status: number;
    phone: string;
}

export interface UserQueryForm {
    page: number;
    size: number;
    username?: string;
    role_id?: number;
}

export default AuthAPI;
