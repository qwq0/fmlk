/**
 * 比较两个Uint8Array是否相等
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
export function uint8Equal(a, b)
{
    if (a == b)
        return true;
    if (a == null || b == null || a.byteLength != b.byteLength)
        return false;
    for (let i = 0, l_i = a.byteLength; i < l_i; i++)
        if (a[i] != b[i])
            return false;
    return true;
}