## 问题

1. methods 是怎么使用 实例 访问的？

2. methods 是如何固定作用域的？

## 是怎么使用 实例 访问的

遍历 methods 这个对象，然后逐个复制到 实例上

```js
// 简化版源码
function initMethods(vm, methods) {    
    for (var key in methods) {
        vm[key] = 
            type of methods[key] !== 'function' ? 
            noop :                  // noop是个空函数
            bind(methods[key], vm); // 绑定了this为vm
    }
}
```

## 如何固定作用域

bind大法好

Vue 使用了 bind 去绑定 methods 方法，显然是为了避免有些刁民会错误调用而报错，索性直接固定作用域，而且考虑到 bind 有的浏览器不支持

于是写了一个兼容方法，意思大概是这样

1. bind 函数需要传入作用域 **context** 和 **函数 A**

2. 然后 **闭包保存** 这个 context，返回一个新函数 B

3. B 执行的时候，使用 **call** 方法 直接绑定 函数A 的作用域为 闭包保存的 context

```js
// 这个是兼容方法
function polyfillBind(fn, ctx) {    
    function boundFn(a) {        
        var l = arguments.length;        
        return l ?
            (
                l > 1 ?
                fn.apply(ctx, arguments) :  // apply(thisObj, [args]);
                fn.call(ctx, a)             // call(thisObj, arg1, arg2, arg3, arg4)
            ):                              // 除了参数写法以外没有不同
            fn.call(ctx)
    }
    boundFn._length = fn.length;    
    return boundFn
}

function nativeBind(fn, ctx) {    
    return fn.bind(ctx)

}

var bind = Function.prototype.bind ?
    nativeBind :
    polyfillBind;
```

