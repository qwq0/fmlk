# File and Memory Linker

链接内存中的对象和文件   
(序列化对象使用jsobin)   

+ 功能
    + 自动序列化对象到文件
    + 自动读取文件反序列化到对象
    + 支持Map和Set

## 使用fmlk

```javascript
import { ObjStorage } from "fmlk";

let objStorage = new ObjStorage("./test/test.jsob"); // 创建一个对象储存器
let proxyObj = objStorage.bindObjProxy({ // 绑定一个源对象 并生成代理对象
    a: 0 // 此对象为源对象 即当文件不存在时应使用的对象
});

proxyObj.a = 1; // 直接对代理对象进行操作

objStorage.enableWatch(); // 调用此方法将开启文件监视 文件修改后自动反序列化到代理对象

```