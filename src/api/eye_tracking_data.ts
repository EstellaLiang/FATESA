import request from "@/utils/request";

class EyeTrackingDataAPI {
    /**
     * 创建眼部追踪数据
     * @param data 创建眼部追踪数据所需的数据
     * @returns 创建结果
     */
    static createEyeTrackingData(data: any) {
        return request<any, any>({
            url: "/eye_tracking_data",
            method: "post",
            data
        });
    }

    /**
     * 获取眼部追踪数据列表
     * @param params 包含分页信息等查询参数的对象
     * @returns 眼部追踪数据列表
     */
    static getEyeTrackingDataList(params: any) {
        return request<any, any>({
            url: "/eye_tracking_data/list",
            method: "get",
            params
        });
    }

    /**
     * 根据ID获取眼部追踪数据
     * @param id 眼部追踪数据 ID
     * @returns 眼部追踪数据信息
     */
    static getEyeTrackingDataById(id: number) {
        return request<any, any>({
            url: `/eye_tracking_data/${id}`,
            method: "get"
        });
    }

    /**
     * 更新眼部追踪数据状态
     * @param id 眼部追踪数据 ID
     * @param data 更新眼部追踪数据状态所需的数据
     * @returns 更新结果
     */
    static updateEyeTrackingDataStatus(id: number, data: any) {
        return request<any, any>({
            url: `/eye_tracking_data/${id}`,
            method: "put",
            data
        });
    }

    /**
     * 删除眼部追踪数据
     * @param id 眼部追踪数据 ID
     * @returns 删除结果
     */
    static deleteEyeTrackingData(id: number) {
        return request<any, any>({
            url: `/eye_tracking_data/${id}`,
            method: "delete"
        });
    }
}

// 导出实验管理 API 类
export {EyeTrackingDataAPI};
