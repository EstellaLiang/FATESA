import request from "@/utils/request";

class ExperimentAPI {
    /**
     * 创建实验
     * @param data 创建实验所需的数据
     * @returns 创建结果
     */
    static createExperiment(data: any) {
        return request<any, any>({
            url: "/experiment",
            method: "post",
            data
        });
    }

    /**
     * 获取实验列表
     * @param params 包含分页信息等查询参数的对象
     * @returns 实验列表
     */
    static getExperimentList(params: any) {
        return request<any, any>({
            url: "/experiment/list",
            method: "get",
            params
        });
    }

    /**
     * 根据ID获取实验
     * @param id 实验 ID
     * @returns 实验信息
     */
    static getExperimentById(id: number) {
        return request<any, any>({
            url: `/experiment/${id}`,
            method: "get"
        });
    }

    /**
     * 更新实验状态
     * @param id 实验 ID
     * @param data 更新实验状态所需的数据
     * @returns 更新结果
     */
    static updateExperimentStatus(id: number, data: any) {
        return request<any, any>({
            url: `/experiment/${id}`,
            method: "put",
            data
        });
    }

    /**
     * 删除实验
     * @param id 实验 ID
     * @returns 删除结果
     */
    static deleteExperiment(id: number) {
        return request<any, any>({
            url: `/experiment/${id}`,
            method: "delete"
        });
    }
}

// 导出实验管理 API 类
export { ExperimentAPI };
