import request from "@/utils/request";
import type {UserQueryForm} from "@/api/auth";

class RoleAPI {
    /**
     * 获取角色列表
     * @param params 包含分页信息的对象，page 为页码，size 为每页数量
     * @returns 角色列表
     */
    static getRoleList(params: RoleQueryForm) {
        return request<any, any>({
            url: "/rbac/role/list",
            method: "get"
        });
    }

    /**
     * 获取角色详情
     * @param roleId 角色 ID
     * @returns 角色详情
     */
    static getRoleDetail(roleId: number) {
        return request<any, any>({
            url: `/rbac/role/${roleId}`,
            method: "get"
        });
    }

    /**
     * 更新角色
     * @param roleId 角色 ID
     * @param data 更新角色所需的数据
     * @returns 更新结果
     */
    static updateRole(roleId: number, data: any) {
        return request<any, any>({
            url: `/rbac/role/${roleId}`,
            method: "put",
            data
        });
    }

    /**
     * 删除角色
     * @param roleId 角色 ID
     * @returns 删除结果
     */
    static deleteRole(roleId: number) {
        return request<any, any>({
            url: `/rbac/role/${roleId}`,
            method: "delete"
        });
    }

    /**
     * 创建角色
     * @param data 创建角色所需的数据
     * @returns 创建结果
     */
    static createRole(data: any) {
        return request<any, any>({
            url: "/rbac/role",
            method: "post",
            data
        });
    }

    /**
     * 分配角色权限
     * @param roleId 角色 ID
     * @param data 分配权限所需的数据
     * @returns 分配结果
     */
    static assignRolePermissions(roleId: number, data: any) {
        return request<any, any>({
            url: `/rbac/role/${roleId}/permissions`,
            method: "post",
            data: {
                permission_ids: data
            }
        });
    }
}

class PermissionAPI {
    /**
     * 获取权限列表
     * @param params 包含分页信息的对象，page 为页码，size 为每页数量
     * @returns 权限列表
     */
    static getPermissionList(params: PermissionQueryForm) {
        return request<any, any>({
            url: "/rbac/permission/list",
            method: "get",
            params
        });
    }

    /**
     * 获取权限树
     * @returns 权限树
     */
    static getPermissionTree() {
        return request<any, any>({
            url: "/rbac/permission/tree",
            method: "get"
        });
    }

    /**
     * 获取权限详情
     * @param permissionId 权限 ID
     * @returns 权限详情
     */
    static getPermissionDetail(permissionId: number) {
        return request<any, any>({
            url: `/rbac/permission/${permissionId}`,
            method: "get"
        });
    }

    /**
     * 更新权限
     * @param permissionId 权限 ID
     * @param data 更新权限所需的数据
     * @returns 更新结果
     */
    static updatePermission(permissionId: number, data: any) {
        return request<any, any>({
            url: `/rbac/permission/${permissionId}`,
            method: "put",
            data
        });
    }

    /**
     * 删除权限
     * @param permissionId 权限 ID
     * @returns 删除结果
     */
    static deletePermission(permissionId: number) {
        return request<any, any>({
            url: `/rbac/permission/${permissionId}`,
            method: "delete"
        });
    }

    /**
     * 创建权限
     * @param data 创建权限所需的数据
     * @returns 创建结果
     */
    static createPermission(data: any) {
        return request<any, any>({
            url: "/rbac/permission",
            method: "post",
            data
        });
    }
}

class UserRoleAPI {
    /**
     * 分配用户角色
     * @param userId 用户 ID
     * @param data 分配角色所需的数据
     * @returns 分配结果
     */
    static assignUserRoles(userId: number, data: any) {
        return request<any, any>({
            url: `/rbac/user/${userId}/roles`,
            method: "post",
            data:{
                role_ids: data
            }
        });
    }

    /**
     * 获取用户角色
     * @param userId 用户 ID
     * @returns 用户角色列表
     */
    static getUserRoles(userId: number) {
        return request<any, any>({
            url: `/rbac/user/${userId}/roles`,
            method: "get"
        });
    }
}

export interface Role {
    id: number;
    name: string;
    code: string;
    description: string;
    status: number;
    permissions: string[];
    create_time: string;
}

export interface RoleQueryForm {
    page: number;
    size: number;
}

// ... 已有代码 ...

export interface Permission {
    id: number;
    name: string;
    parent_id: number;
    code: string;
    type: number;
    order_num: number;
    path: string;
    route_name: string;
    status: number;
    remark: string;
    create_time: string;
}

export interface PermissionNodes {
    id: number;
    name: string;
    code: string;
    type: number;
    path: string;
    children?: PermissionNodes[];
}

export interface PermissionQueryForm {
    page: number;
    size: number;
    parent_id?: number;
}

export {RoleAPI, PermissionAPI, UserRoleAPI};
