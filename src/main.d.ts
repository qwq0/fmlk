/**
 * 对象储存封装
 */
export class ObjStorage {
    /**
     * @param {string} fileName
     * @param {JSOBin} [jsob]
     */
    constructor(fileName: string, jsob?: JSOBin);
    /**
     * 文件名(路径)
     * @type {string}
     */
    fileName: string;
    /**
     * 当前对象
     * @type {Object}
     */
    obj: any;
    /**
     * jsob上下文
     * @type {JSOBin}
     */
    jsob: JSOBin;
    /**
     * 二进制缓存
     * @type {Uint8Array}
     */
    binaryCache: Uint8Array;
    /**
     * 重新读取
     * @returns {Promise<boolean>} 返回是否成功
     */
    reread(): Promise<boolean>;
    /**
     * 同步重新读取
     * @returns {boolean} 返回是否成功
     */
    rereadSync(): boolean;
    /**
     * 保存到文件
     */
    save(): Promise<void>;
    /**
     * 同步保存到文件
     */
    saveSync(): void;
    /**
     * 启用监测文件变化
     * 对于每个对象储存类应当仅调用一次
     */
    enableWatch(): void;
    /**
     * 绑定对象
     * 将传入对象的属性读写绑定为储存对象的读写
     * 对于每个对象储存类应当仅调用一次
     * 注: 传入的对象可能被修改
     * @template {Object} T
     * @param {T} srcObj
     * @returns {T}
     */
    bindObjProxy<T extends unknown>(srcObj: T): T;
}
import { JSOBin } from "jsobin";
