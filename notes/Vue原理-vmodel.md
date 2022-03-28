# 白话版

## 先说结论

以 **input text** 类型讲解，对于其他的表单元素，流程都差不多，只是中间涉及的内容不同。所以就先讲个例子，然后具体在源码版全部一起说

**1、怎么赋值？**v-model 绑定的数据赋值给表单元素的 value 属性

**2、怎么绑定事件？**解析不同表单元素，配置相应的事件名和事件回调，在插入dom之前，addEventListener 绑定上事件

**3、怎么双绑？**外部变化，触发事件回调，event.target.value 赋值给model绑定的数据；内部变化，修改表单元素属性 value

## 例子

```vue
<template>
	<div>
    <input type="text" v-model="name" />
  </div>
</template>

<script>
  export default({
    data () {
      return {
        name: '1111'
      }
    }
  })
</script>
```

## 怎么赋值？

###  **v-model 怎么给表单绑定数据**

#### 获取值流程

首先，上面例子解析后的渲染函数是下面这样（已简化，只保留表单值相关）

```js
(function(){    
    with(this){  
        return _c('div',[
            _c('input',
                domProps:{ "value": name } // 这里的 name 在 with 作用域里，就是this.name
            )
        ])
    }
})
```

**1、**这个渲染函数是没有执行的 匿名函数。执行的时候，会绑定上下文对象为 **组件实例**

**2、**于是 with(this) 中的 this 就能取到 组件实例本身，with 的代码块 **顶层作用域** 就绑定为了 **组件实例**

**3、**于是 with 内部变量的访问，就会首先访问到 **组件实例上**。其中 name 的 获取，就会先从 组件实例上获取，相当于 vm.name。赋值完成后，domProps 就是下面这样

```js
{ domProps: { value: 111 } }
```

**4、**上面的 **value** 是 v-model 解析成的原生属性，保存在属于该节点 input 的 domProps 对象存储器中

#### 绑定值流程

创建dom input 之后，插入dom input 之前，遍历该 input 的 domProps ，逐个添加给 input dom

简化后的代码像下面这样进行赋值

```js
for(var i in domProps){
    input[i] = domProps[i]
}
```

其中给节点赋值就是这样

```js
input.value = 111
```

## 怎么绑定事件

> 不同的表单元素使用v-model，会绑定不同的 事件
> **change 事件**
> select，checkbox，radio
> **input 事件**
> 这是默认事件，当不是上面三种表单元素时，会解析成 input 事件
> 比如 text、number 等 input 元素和 textarea

上面例子解析成下面的渲染函数（已简化，只保留事件相关）

```js
with(this) {    
    return _c('div', [
        _c('input', {        
            on: {            
              "input": function($event) {
                  name = $event.target.value
              }
            }
        }
    )])
}
```

#### 解析事件流程

**1、**解析不同表单元素，配置不同的事件

**2、**拼装 事件回调函数，不同表单元素，回调不一样

**3、**把 事件名和拼装回调 配套 保存给相应的表单元素的 **on 事件存储器**

#### 什么时候绑定事件

生成 input dom 之后，插入input dom 之前

#### 怎么绑

使用之前保存的 事件名和事件回调（on 事件存储器） ，给 input dom 像下面这样绑定上事件

```js
input.addEventListener("input",function($event) {    
    name = $event.target.value 
})
```

## **如何进行双向更新**

双向，指的是 外部和内部

外部变化：用户手动改变表单值，输入或者选择

内部变化：从内部修改绑定值

#### 内部变化

**1、**v-model 绑定了 name ，name 会收集到 本组件的 watcher

​	a. 下面渲染函数执行时，会绑定本身组件实例为上下文对象

​	b. name 访问的是 组件实例的 name

​	c. name 此时便收集到了 当前正在渲染的组件实例，当前渲染的实例是自己，于是收集到了自身的 watcher

```js
(function(){    
  with(this){  
    return _c('div',[_c('input',
        domProps:{ "value":(name) }
			)
    ])
  }
})
```

**2、**内部修改 name 变化，通知收集器内的 watcher 更新，所以本组件会更新，上面的渲染函数重新执行，便 重新从实例读取 name

![img](https://pic2.zhimg.com/80/v2-1d9733133998e0325862d720f7b9bdd5_1440w.jpg)

**3、**重新给 input dom 的 value 赋值，于是 页面就更新了

怎么赋值？那是回到第一个问题了，兄弟

**外部变化**

手动改变表单，事件触发，执行事件回调（下面这个），更新组件数据 name

```js
function($event) {    
    name = $event.target.value 
}
```

**更新内部数据流程**

**1、**当事件触发的时候，会把 表单的值 赋值给 name

**2、**name 是从 组件实例上访问的

**3、**所以这次赋值会 直接改变组件实例的 name

**回调怎么赋值给组件实例的name**

一开始不懂，所以不理解，也没查到，写了个例子，大概理解了意思

**1、**因为事件回调 在 with 里面声明

**2、**于是事件回调的 作用域链最顶层 就加上了一层 with 绑定的作用域

**3、**就算事件回调不在 with 中执行，事件回调中的 变量访问，也会先访问之前 with 绑定过的作用域，因为作用域链的最顶层

**with举栗子**

```js
var name=22
var a={name:"a"}
with(a){    
    var fn=function(){        
        console.log(name)
    }
}
fn()
```

你认为 fn 执行的时候，会打印出什么呢？行了，给你看结果了

![img](https://pic1.zhimg.com/80/v2-660c1cbae5feff7a5cf3f9a01dcdb684_1440w.jpg)

好吧，再一次深刻认识到一个知识点，with 绑定作用域原来这么强，离开with执行，还是先访问他的作用域，脱离不出魔爪啊，强盗作用域

# 源码版

