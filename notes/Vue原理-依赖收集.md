# 基础数据类型

## 数据初始化流程

**1、**实例初始化中，调用 initState 处理部分选项数据，initData 用于处理选项 data

```js
Vue.prototype._init = function(){
    ...
    initState(this)
    ...
}

function initState(vm) {    
    var opts = vm.$options;
    ... props，computed，watch 等选项处理
    if (opts.data) {
        initData(vm);
    }
};
```

2、initData 遍历 data，definedReactive 处理每个属性

```js
function initData(vm) {  
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm, vm) : data || {};
    // ... 遍历 data 数据对象的key，重名检测，合规检测等代码
    new Observer(data);
}

function Observer(value) {    
    var keys = Object.keys(value);
    // ...被省略的代码
    for (var i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i]);
    }
};
```

**3、**definedReactive 给对象的属性 通过 Object.defineProperty 设置响应式

```js
function defineReactive(obj, key) {    

    // dep 用于中收集所有 依赖我的 东西
    var dep = new Dep();    
    var val  = obj[key]    

    Object.defineProperty(obj, key, {        
        enumerable: true,        
        configurable: true,
        get() { ...依赖收集，详细源码下个流程放出 },
        set() { ....依赖更新，源码下篇文章放出 }
    });
}
```

## 依赖收集流程

> **例子**
>
> ```vue
> <template>
> <div>{{name}}</div>
> </template>
> new Vue({    
>   el: document.getElementsByTagName("div")[0],
>   data(){        
>       return  {            
>           name:11
>     	}
> 	}
> })
> ```
> 收集流程大概是这样
1、页面的渲染函数执行， name 被读取
2、触发 name的 Object.defineProperty.get 方法
3、于是，页面的 watcher 就会被收集到 name 专属的闭包 dep 的 subs 中

name 被读取，走到 Object.defineProperty.get 方法上，从这里开始收集 watcher
先来观察下 defineReactive 中省略的 get 的源码

```js
function defineReactive(obj, key) {    
    var dep = new Dep();    
    var val  = obj[key]    
    Object.defineProperty(obj, key, {
        get() {            
            if (Dep.target) {                
                // 收集依赖
                dep.addSub(Dep.target)
            }            
            return val
        }
    });
}
```

### Dep

**1、Dep.target**

Dep.target 指向的是各种 watcher，watch的watcher，页面的watcher 等等
Dep.target 是变化的，根据当前解析流程，不停地指向不同的 watcher （指向，其实就是直接赋值 ，如下）
```js
Dep.target = 具体watcher
```
简单想，指向哪个watcher，那么就是那个 watcher 正在使用数据，数据就要收集这个watcher
可以先不用管 Dep.target 到底是怎么指向，只用记住 在当前页面开始渲染时，Dep.target 会提前指向当前页面的 watcher。
于是页面渲染函数执行，并引用了数据 name 后，name 直接收集 Dep.target，就会收集到当前页面的 watcher。watcher 有负责实例更新的功能，所以会被收集起来，数据变化时通知 watcher，就可以调用 watcher 去更新了

**2、Dep**
Dep 是一个构造函数，用于创建实例，并带有很多方法
实例会包含一个属性 subs 数组，用于存储不同数据 【**收集的依赖**】
以下是Dep的构造函数

```js
var Dep = function Dep() {    
    // 保存watcher 的数组
    this.subs = [];
};
```

**3、dep.addSub**
原型上的方法，作用是往 dep.subs 存储器中 中直接添加 watcher
```js
Dep.prototype.addSub = function(sub) {    
    this.subs.push(sub);
};
```
所以，**【dep.addSub(Dep.target) 】**就会直接添加当前 watcher

# 引用数据类型

