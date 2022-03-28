## 初始化

Line 4977

```js
Vue.prototype._init = function (options) {
      var vm = this;
      ... (略)
      // expose real self
      vm._self = vm;
      initLifecycle(vm);          // 初始化一些生命周期的标志位变量
      initEvents(vm);
      initRender(vm);             // 绑定createElement的上下文为这个vue实例
      callHook(vm, 'beforeCreate');
      initInjections(vm); // resolve injections before data/props
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook(vm, 'created');
      ...(略)
      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
```

## initState

Line 

```js
function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }
```

