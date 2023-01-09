import { ObjStorage } from "../src/main.js";

let objStorage = new ObjStorage("./test/test.jsob");
let proxyObj = objStorage.bindObjProxy({
    a: 0,
    set: new Set()
});


console.log(" - 操作前 - ");
console.log(`a = ${proxyObj.a}`);
console.log(`set.size = ${proxyObj.set.size}`);

proxyObj.a++;
proxyObj.set.add(proxyObj.set.size);

console.log(" - 操作后 - ");
console.log(`a = ${proxyObj.a}`);
console.log(`set.size = ${proxyObj.set.size}`);

objStorage.enableWatch();
global.objStorage = objStorage;
global.proxyObj = proxyObj;


setTimeout(() =>
{
    console.log(" - 延长关闭时间以便保存数据 - ");
}, 1000);

setInterval(() =>
{
    console.log(`a = ${proxyObj.a}`);
}, 1500);