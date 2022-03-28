# 白话版

## 前置问题

- computed 也是响应式的
- computed 如何控制缓存
- 依赖的 data 改变了，computed 如何更新

## 理解 Computed 的响应式

* 首先，computed 也可以设置set，一般只写了 get
* computed的 get 和 set 会和 Object.defineProperty 关联起来
* get ：根据写的 get 返回数据，有缓存机制，数据没变化的时候直接返回缓存
* set：直接把 set 赋值给 Object.defineProperty 的 set

## 如何控制缓存

* computed 控制缓存的重要一点是 【**脏数据标志位 dirty**】，dirty 是 watcher 的一个属性
  * *当 dirty 为 true 时，读取 computed 会重新计算*
  * *当 dirty 为 false 时，读取 computed 会使用缓存*
1. 一开始每个 computed 新建自己的watcher时，会设置 watcher.dirty = true，以便于computed 被使用时，会计算得到值
2. 当 依赖的数据变化了，通知 computed 时，会设置 watcher.dirty = true，以便于其他地方重新渲染，从而重新读取 computed 时，此时 computed 重新计算
3. computed 计算完成之后，会设置 watcher.dirty = false，以便于其他地方再次读取时，使用缓存，免于计算

## 依赖的 data 改变了，computed 如何更新

> **回顾Vue响应式原理**
>
> 当 A 引用 B 的时候，B 会收集 A 的watcher
> Vue 会把数据设置响应式，既是设置他的 get 和 set
> 当 数据被读取，get 被触发，然后收集到读取他的东西，保存到依赖收集器
> 当 数据被改变，set 被触发，然后通知曾经读取他的东西进行更新

### 流程举例：假设  现在 页面A 引用了 computed B，computed B 依赖了 data C

1. C 通知 computed B 的 watcher 重置其 **脏数据标志位 dirty = true**
2. C 通知 页面 A 的 watcher 进行更新渲染，A读取 computed B，发现其 **dirty** 了，需要重新计算

![alt](D:\VueDemo\vue-project\notes\img\compuited.jpg)

 * 为什么不是 **C => B => A** ? 即 C 通知 computed B watcher，B watcher 再通知A watcher？

​	页面 A 读取 computed B 时，B 不收集 A 的 watcher，而是将 页面A 介绍给 data C，所以 C 会收集到 A 的 watcher，B 就像是个中介

# 源码版

## 前置问题

1. computed 的 月老身份的来源

2. computed 怎么计算

3. computed 的缓存是怎么做的

4. computed 什么时候初始化

5. computed 是怎么可以直接使用实例访问到的

## 初始化时机

```js
function initState(vm) {    
    var opts = vm.$options;    
    if (opts.computed) { 
        initComputed(vm, opts.computed);  // 这个方法
    }
    .....
}
```

## **initComputed**

initComputed 这段代码做了几件事

1. 每个 computed 配发 watcher

2. defineComputed 处理

3. 收集所有 computed 的 watcher

```js
function initComputed(vm, computed) {
    var watchers = vm._computedWatchers = Object.create(null);  
    for (var key in computed) { // key 就是每个 computed 属性
        var userDef = computed[key];
        var getter = typeof userDef === 'function' ? userDef: userDef.get;
        // 每个 computed 都创建一个 watcher
        // watcher 用来存储计算值，判断是否需要重新计算
        watchers[key] = new Watcher(vm, getter, { 
             lazy: true 
        });
        // 判断是否有重名的属性
        if (!(key in vm)) {
            defineComputed(vm, key, userDef);
        }
    }
}
```

### 1、每个 computed 配发 watcher

看下 Watcher 源码构造函数

```js
function Watcher(vm, expOrFn, options) {    
    this.dirty = this.lazy = options.lazy;    
    this.getter = expOrFn;    
    this.value = this.lazy ? undefined: this.get();
};
```

从这段源码中，我们再看 computed 传了什么参数

```js
new Watcher(vm, getter, { lazy: true })
```

于是，我们就知道了 Watcher 与 computed 的关系

1. 保存设置的 getter。

   把用户设置的 computed-getter，存放到 watcher.getter 中，用于后面的计算

2. watcher.value 存放计算结果，但是这里有个条件，

   因为 lazy 的原因，不会新建实例并马上读取值。这里可以算是 Vue 的一个优化，只有你读取 computed，才开始计算，而不是初始化就开始计算值了

   计算 value 通过 watcher.get 这个方法，其实就是执行 保存的 getter 函数，从而得到计算值

```js
Watcher.prototype.get = function() {    
    // getter 就是 watcher 回调
    var value = this.getter.call(vm, vm);    
    return value
};
```

3. computed 新建 watcher 的时候，传入 **lazy**

​	没错，作用是把计算结果缓存起来，而不是每次使用都要重新计算

​	而这里呢，还把 lazy 赋值给了 dirty，为什么呢？

​	lazy 表示一种固定描述，不可改变，表示这个 watcher 需要缓存

​	dirty 表示缓存是否可用，如果为 true，表示缓存脏了，需要重新计算，否则不用

​	dirty 默认是 false 的，而 lazy 赋值给 dirty，就是给一个初始值，表示 你控制缓存的任务开始了

​	所以记住，【dirty】 是真正的控制缓存的关键，而 lazy 只是起到一个开启的作用

### **2、defineComputed 处理**

精简后的源码：

```js
function defineComputed(target, key, userDef) {    
    // 设置 set 为默认值，避免 computed 并没有设置 set
    var set = function(){}      
    //  如果用户设置了set，就使用用户的set
    if (userDef.set) set = userDef.set   
    Object.defineProperty(target, key, {        
        get:createComputedGetter(key), // 重点在这里，主要用于判断计算缓存结果是否有效
        set:set
    });
}
```

1. 使用 Object.defineProperty 在 实例上computed 属性，所以可以直接访问

2. set 函数默认是空函数，如果用户设置，则使用用户设置

3. **createComputedGetter 包装返回 get 函数**

​	两大问题都在这里得到解决，【月老牵线问题+缓存控制问题】

​	createComputedGetter 源码

```js
function createComputedGetter(key) {    
    return function() {        
        // 获取到相应 key 的 computed-watcher
        var watcher = this._computedWatchers[key];

        // 如果 computed 依赖的数据变化，dirty 会变成true，从而重新计算，然后更新缓存值 watcher.value
        if (watcher.dirty) {
            watcher.evaluate();
        }

        // 这里是 月老computed 牵线的重点，让双方建立关系
        if (Dep.target) {
            watcher.depend();
        }        
        return watcher.value
    }
}
```

**缓存控制**

1、watcher.evaluate 用来重新计算，更新缓存值，并重置 dirty 为false，表示缓存已更新

下面是源码

```js
Watcher.prototype.evaluate = function() {    
    this.value = this.get();    
    // 执行完更新函数之后，立即重置标志位
    this.dirty = false;
};
```

2、只有 dirty 为 true 的时候，才会执行 evaluate

所有说通过 控制 dirty 从而控制缓存，但是怎么控制dirty 呢？

简单的说，computed 依赖的数据更新后，通知到 computed Watcher ，在 update 时设置 dirty 为true

先说一个设定，computed数据A 引用了 data数据B，即A 依赖 B，所以B 会收集到 A 的 watcher

当 B 改变的时候，会通知 A 进行更新，即调用 A-watcher.update，看下源码

```js
Watcher.prototype.update = function() {    
    if (this.lazy) {
      this.dirty = true;
    }
    ....还有其他无关操作，已被省略
};
```

当通知 computed 更新的时候，就只是 把 dirty 设置为 true，从而 读取 comptued 时，便会调用 evalute 重新计算

那么数据更新后，什么时候会再读取 computed 呢？看下面

**月老牵线**

月老牵线的意思，在白话版中也说清楚了，这里简单说一下

现有 页面-P，computed- C，data- D

1. P 引用了 C，C 引用了 D

2. 理论上 D 改变时， C 就会改变，C 则通知 P 更新。

3. 实际上 C 让 **D 和 P 建立联系**，让 D 改变时直接通知 P。因此 P 更新时会重新执行渲染函数，再次读取computed

```js
if (Dep.target) { // Dep.target 是页面的 watcher
   watcher.depend();
}
```

来看看 watcher.depend 的源码

```js
Watcher.prototype.depend = function() {    
    var i = this.deps.length;    
    while (i--) {        
        this.deps[i].depend(); // 实际效果：dep.addSub(Dep.target)
    }
};
```

**这段的作用就是！**

让 D 的依赖收集器收集到 Dep.target，而 Dep.target 当前是什么？

没错，就是 页面 的 watcher！

所以这里，D 就会收集到 页面的 watcher 了，所以就会直接通知 页面 watcher

**注解几个词**

1、页面 watcher.getter 保存 页面更新函数，computed watcher.getter 保存 计算getter

2、watcher.get 用于执行 watcher.getter 并 设置 Dep.target

3、Dep.target 会有缓存

**下面开始 月老牵线的 详细流程**

**1、**页面更新，读取 computed 的时候，Dep.target 会设置为 页面 watcher。

**2、**computed 被读取，createComputedGetter 包装的函数触发，第一次会进行计算

​	computed-watcher.evalute 被调用，进而 computed-watcher.get 被调用

```js
Watcher.prototype.evaluate = function() {    
    this.value = this.get();    
    // 执行完更新函数之后，立即重置标志位
    this.dirty = false;
};
```

​	Dep.target 被设置为 computed-watcher，旧值 页面 watcher 被缓存起来。（在 this.get 里，通过栈）

**3、**computed 计算会读取 data，此时 data 就收集到 computed-watcher

​	同时 computed-watcher 也会保存到 data 的依赖收集器 dep（用于下一步）。

​	computed 计算完毕，释放Dep.target （在 computed-watcher.get 被调用时）

​	并且Dep.target 恢复上一个watcher（页面watcher）

**4、**手动 watcher.depend， 让 data 再收集一次 Dep.target，于是 data 又收集到 恢复了的页面watcher

```js
{ ...
	// 如果 computed 依赖的数据变化，dirty 会变成true，从而重新计算，然后更新缓存值 watcher.value
  if (watcher.dirty) {
    watcher.evaluate();
  }

  // 这里是 月老computed 牵线的重点，让双方建立关系
  if (Dep.target) { // Dep.target 是 页面的Watcher
    watcher.depend();
  }
 ...
}

Watcher.prototype.depend = function() {    
    var i = this.deps.length;    
    while (i--) {        
        this.deps[i].depend(); // 实际效果：dep.addSub(Dep.target)
    }
};
```

**watcher的缓存与释放**

```js
Watcher.prototype.get = function() {    
    // 改变 Dep.target
    pushTarget()
  
    // getter 就是 watcher 回调
    var value = this.getter.call(this.vm, this.vm);    
  
    // 恢复前一个 watcher
    popTarget()    
    return value
};

Dep.target = null;
var targetStack = [];
function pushTarget(_target) {    
    // 把上一个 Dep.target 缓存起来，便于后面恢复
    if (Dep.target) {
        targetStack.push(Dep.target);
    }
    Dep.target = _target;
}

function popTarget() {
    Dep.target = targetStack.pop();
}
```

**再额外记一个data改变后续流程**

综上，此时 data 的依赖收集器=【computed-watcher，页面watcher】

但是 computed-watcher 的 lazy 为 true，因此 update 的时候不会直接计算，只会设置标志位

```js
Watcher.prototype.update = function update () {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
}
```

data 改变，正序遍历通知，computed 先更新，页面再更新，所以，页面才能读取到最新的 computed 值

![img](https://pic1.zhimg.com/80/v2-2d531fc070a16d4369846f74e9070bd0_1440w.jpg)

![img](https://pic3.zhimg.com/80/v2-e490b3d404a2067ae26e0b58cc2d91c2_1440w.jpg)

### **3、收集所有 computed 的 watcher**

从源码中，你可以看出为每个computed 新建watcher 之后，会全部收集到一个对象中，并挂到实例上

为什么收集起来，我暂时的想法是

为了在 createComputedGetter 获取到对应的 watcher

其实可以通过传递 watcher ，但是这里的做法是传递 key，然后使用key 去找到对应 watcher
