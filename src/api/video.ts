import request from "@/utils/request";

class VideoAPI {
    /**
     * 创建视频
     * @param data 视频数据
     * @returns 创建结果
     */
    static createVideo(data: any, timeout?: number) {
        return request<any, any>({
            url: "/video",
            method: "post",
            data,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            meta: {
                timeout
            }
        });
    }

    /**
     * 获取视频列表
     * @param params 查询参数
     * @returns 视频列表
     */
    static getVideoList(params?: any) {
        return request<any, any>({
            url: "/video/list",
            method: "get",
            params
        });
    }

    /**
     * 根据ID获取视频
     * @param id 视频ID
     * @returns 视频信息
     */
    static getVideoById(id: string) {
        return request<any, any>({
            url: `/video/${id}`,
            method: "get"
        });
    }

    /**
     * 更新视频状态
     * @param id 视频ID
     * @param data 更新数据
     * @returns 更新结果
     */
    static updateVideo(id: string, data: any) {
        return request<any, any>({
            url: `/video/${id}`,
            method: "put",
            data
        });
    }

    /**
     * 删除视频
     * @param id 视频ID
     * @returns 删除结果
     */
    static deleteVideo(id: string) {
        return request<any, any>({
            url: `/video/${id}`,
            method: "delete"
        });
    }

    /**
     * 获取视频流
     * @param id 视频ID
     * @returns 视频流
     */
    static getVideoStream(id: string) {
        return request<any, any>({
            url: `/video/stream/${id}`,
            method: "get",
            responseType: "arraybuffer",
        });
    }
}

export default VideoAPI;
