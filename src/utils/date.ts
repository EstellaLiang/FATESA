/**
 * 格式化包含 'T' 的日期字符串，去除 'T' 并截取掉毫秒部分
 * @param dateString - 包含 'T' 的日期字符串，例如 '2025-05-12T10:41:54.123'
 * @returns 格式化后的日期字符串，格式为 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDate = (dateString: string) => {
    return dateString.replace('T', ' ').split('.')[0];
};

/**
 * 将 Date 对象格式化为 'YYYY-MM-DD HH:mm:ss' 格式的字符串
 * @param date - 要格式化的 Date 对象
 * @returns 格式化后的日期字符串，格式为 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default {
    formatDate,
    formatDateTime
};
