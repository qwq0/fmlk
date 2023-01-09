import * as fs from "fs/promises";
import * as fsSync from "fs";
import { JSOBin } from "jsobin";
import { throttleCall } from "./throttleCall.js";
import { uint8Equal } from "./bufferEqual.js";


/**
 * 对象储存封装
 */
export class ObjStorage
{
    /**
     * 文件名(路径)
     * @type {string}
     */
    fileName = "";

    /**
     * 当前对象
     * @type {Object}
     */
    obj = {};

    /**
     * jsob上下文
     * @type {JSOBin}
     */
    jsob = null;

    /**
     * 二进制缓存
     * @type {Uint8Array}
     */
    binaryCache = null;

    /**
     * @param {string} fileName
     * @param {JSOBin} [jsob]
     */
    constructor(fileName, jsob)
    {
        this.jsob = (jsob ? jsob : new JSOBin());
        if (fileName)
        {
            this.fileName = fileName;
            this.rereadSync();
        }
    }

    /**
     * 重新读取
     * @returns {Promise<boolean>} 返回是否成功
     */
    async reread()
    {
        try
        {
            let storageData = new Uint8Array(await fs.readFile(this.fileName));
            if (storageData.byteLength != 0 && !uint8Equal(storageData, this.binaryCache))
            {
                this.obj = this.jsob.decode(storageData);
                this.binaryCache = storageData;
            }
            return true;
        }
        catch (err)
        {
            console.log("rereadError", err);
            return false;
        }
    }

    /**
     * 同步重新读取
     * @returns {boolean} 返回是否成功
     */
    rereadSync()
    {
        try
        {
            let storageData = new Uint8Array(fsSync.readFileSync(this.fileName));
            if (!uint8Equal(storageData, this.binaryCache))
            {
                this.obj = this.jsob.decode(storageData);
                this.binaryCache = storageData;
            }
            return true;
        }
        catch (err)
        {
            return false;
        }
    }


    /**
     * 保存到文件
     */
    async save()
    {
        let storageData = this.jsob.encode(this.obj);
        if (!uint8Equal(storageData, this.binaryCache))
        {
            this.binaryCache = storageData;
            await fs.writeFile(this.fileName, storageData);
        }
    }

    /**
     * 同步保存到文件
     */
    saveSync()
    {
        let storageData = this.jsob.encode(this.obj);
        if (!uint8Equal(storageData, this.binaryCache))
        {
            this.binaryCache = storageData;
            fsSync.writeFileSync(this.fileName, storageData);
        }
    }

    /**
     * 启用监测文件变化
     * 对于每个对象储存类应当仅调用一次
     */
    enableWatch()
    {
        fsSync.watch(this.fileName, undefined, eventType =>
        {
            if (eventType == "change")
                this.reread();
        });
    }

    /**
     * 绑定对象
     * 将传入对象的属性读写绑定为储存对象的读写
     * 对于每个对象储存类应当仅调用一次
     * 注: 传入的对象可能被修改
     * @template {Object} T
     * @param {T} srcObj
     * @returns {T}
     */
    bindObjProxy(srcObj)
    {
        /**
         * 绑定对象(单层)
         * @param {Object} srcObj 被代理的对象(源对象)
         * @param {Object} toObj 储存的对象
         * @param {boolean} [isRoot] 是根节点
         * @returns {Object}
         */
        const bindObj = (srcObj, toObj, isRoot = false) =>
        {
            return (new Proxy(srcObj, {
                set: (_target, property, value, _receiver) =>
                {
                    if(isRoot)
                        toObj = this.obj;
                    switch (typeof (value))
                    {
                        case "number":
                        case "string":
                        case "object":
                        case "bigint":
                        case "boolean":
                        case "undefined":
                            Reflect.set(toObj, property, value);
                            break;
                        default:
                            throw "ObjStorage(ProxyObj-set): An unwritable type was written";
                    }
                    throttleCall(this, () => { this.save(); });
                    return true;
                },
                get: (_target, property, receiver) =>
                {
                    if(isRoot)
                        toObj = this.obj;
                    let ret = Reflect.get(toObj, property);
                    if (ret == undefined)
                        ret = Reflect.get(srcObj, property);
                    switch (typeof (ret))
                    {
                        case "object": {
                            if (!toObj[property])
                                Reflect.set(toObj, property, ret);
                            if (Array.isArray(ret))
                                return bindObj(toObj[property], toObj[property]);
                            return bindObj(srcObj[property], toObj[property]);
                        }
                        case "function": {
                            let isMap = (toObj instanceof Map);
                            let isSet = (toObj instanceof Set);
                            if (isMap)
                            {
                                if (property == "set" || property == "delete" || property == "clear")
                                    return ((/** @type {any} */ key, /** @type {any} */ value) =>
                                    {
                                        (/** @type {Function} */(ret)).call(toObj, key, value);
                                        throttleCall(this, () => { this.save(); });
                                    });
                                else
                                    return (/** @type {Function} */(ret)).bind(toObj);
                            }
                            else if (isSet)
                            {
                                if (property == "add" || property == "delete" || property == "clear")
                                    return ((/** @type {any} */ key, /** @type {any} */ value) =>
                                    {
                                        (/** @type {Function} */(ret)).call(toObj, key, value);
                                        throttleCall(this, () => { this.save(); });
                                    });
                                else
                                    return (/** @type {Function} */(ret)).bind(toObj);
                            }
                            else
                                return (/** @type {Function} */(ret)).bind(receiver);
                        }
                        default:
                            return ret;
                    }
                }
            }));
        };

        if (this.obj == null)
            this.obj = srcObj;
        return bindObj(srcObj, this.obj, true);
    }
}