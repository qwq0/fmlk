/**
 * 标志 到 计时器id 映射
 * @type {WeakMap<Object, number>}
 */
let throttleCallTimeoutIdMap = new WeakMap();

/**
 * 节流调用
 * @param {Object} symbolObj
 * @param {Function} callback
 */
export function throttleCall(symbolObj, callback)
{
    let timeoutId = throttleCallTimeoutIdMap.get(symbolObj);
    if (timeoutId != undefined)
        clearTimeout(timeoutId);
    throttleCallTimeoutIdMap.set(symbolObj, setTimeout(callback, 100));
}