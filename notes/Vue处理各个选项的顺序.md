# init
```js
Vue.prototype._init = function (options) {
  var vm = this;
  ...
  /* istanbul ignore else */
  {
    initProxy(vm);
  }
  // expose real self
  vm._self = vm;
  initLifecycle(vm);             // 初始化设置一些生命周期的标志位
  initEvents(vm);
  initRender(vm);                // 绑定createElement的上下文为这个vue实例
  callHook(vm, 'beforeCreate');
  initInjections(vm);            // resolve injections before data/props
  initState(vm);
  initProvide(vm); // resolve provide after data/props
  callHook(vm, 'created');
	...
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
};
```

# initState

```flow
st=>start: 开始initState
op1=>operation: props：遍历属性，添加响应式处理。如果是对象继续遍历子属性并给子属性添加响应式处理。
op2=>operation: methods：直接复制到Vue实例上，绑定方法的this为Vue实例
op3=>operation: data
op4=>operation: computed
op5=>operation: watcher
e=>end
st->op1->op2->op3->op4->op5->e
```

```js
function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

