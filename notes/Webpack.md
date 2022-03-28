# 为什么需要Webpack

## 模块化

- 没有模块化时
  - 需要手动维护<script>导入的顺序，因为脚本间可能存在依赖
  - 每一个<script>标签都需要请求一次网络
  - 对于每个<script>，顶层作用域就是全局作用域，容易造成全局作用域污染
- 有模块化后
  - 导入导出语句使得依赖关系更为鲜明
  - 模块可以借助工具来打包，在页面中只需要加载合并后的资源文件，减少了网络开销
  - 多个模块的作用域是隔离的，避免了作用域污染

## 模块打包工具（module bundler)

- 主要任务就是解决模块间的依赖
- 工作方式
  - 合并为单个js文件，一次性全加载
  - 页面初始时，加载一个入口模块，异步加载其他模块
- 除webpack外，还有rollup、parcel等

## Webpack的优势

1. 默认支持多种模块标准，包括AMD、commonJS、ES6，其他的大多只支持1、2种
2. 完备的代码分割方案。可以分割打包后的资源，首屏只加载必要的部分，可以提高首页渲染速度
3. 可以处理各种类型的资源，包括css、PNG（通过loader）
4. 社区生态较好。

## webpack-dev-server

> __dirname：Node.js内置全局变量，为当前文件所在的绝对路径

### 两大职能

- 令Webpack进行打包，并处理打包结果的资源请求（服务启动时，会先让Webpack进行模块打包）
- 作为普通的Web Server，处理静态资源文件请求（读取dist文件夹的文件运行）

### 注意点

- 直接用Webpack开发，每次都会生成bundle.js
- webpack-dev-server只是将打包结果放在内存中，并不会写入实际的bundle.js（删除dist也能运行）

# Webpack如何进行模块打包

## 不同的模块标准

### CommonJS

- 每个文件是一个模块

- 导出语法

  ```js
  // CommonJS 内部会有一个初始的module对象，可以理解为默认定义了 var module = {}
  module.exports = {
  	default: '',
  	name: ''
  }
  ```

  简化版

  ```js
  exports.name = ''      // 直接使用exports
  exports.default = ''   // 实际exports指向了module.exports
  /* 相当于以下代码
  var module = {
  	exports: {}
  }
  var exports = module.exports
  
  所以不要直接对exports赋值，否则会失效，如
  exports = {
  	name: ''
  }
  */
  ```

- 导入语法

  ```js
  require('path.js')
  /*
  1、模块第一次被加载，会执行模块代码，然后导出
  2、模块曾被加载过，代码不会再次执行，而是直接导出上次执行后的结果
  * 模块中默认有一个loaded属性记录是否加载过，初始值为false
  */
  ```

### ES6

- 也是一个文件一个模块

- 导出语法

  ```js
  // 第一种写法
  export const name = ''
  
  // 第二种写法
  const age = ''
  export { age as ageAttr }
  
  // 第三种写法
  export default {
    age: age
  }
  ```

- 导入语法

  ```js
  import xxx, { name as nameAttr } from 'xxx.js'
  import * as xxx from 'xxx.js' // 包括default和其他单独的导出
  ```

### CommonJS  vs  ES6

- 动态与静态
  - 指对模块依赖关系的解决
  - 动态（CommonJS）：依赖关系的建立发生在**【代码运行阶段】**
  - 静态（ES6）：依赖关系的建立发生在**【代码编译阶段】**
    - 优点
      1. 死代码检测和排除，即可以用静态分析工具检测未被调用的模块代码，在打包阶段去除，减少资源体积
      2. 模块变量类型检查。？没有看懂
      3. 编译器优化。CommonJS需要直接导入整个对象，而ES6支持直接导入变量，减少引用层级，可以提高程序效率

- 值拷贝与动态映射
  - CommonJS 导出的是对值的拷贝，无法读取到改变后的值
  - ES6 导出的是值的动态映射，可以读取到改变后的值

### 循环依赖

<details>
<summary>示例代码</summary>
</details>

```js
// CommonJS
// foo.js
const bar = require('./bar.js')
console.log('bar: ', bar)
module.exports = 'This is foo.js'
// bar.js
const foo = require('./foo.js')
console.log('foo: ', foo)
module.exports = 'This is bar.js'

// index.js
require('./foo.js')

// 结果
'foo'：{}  // ES6则是undefined
'bar'：'This is bar.js'
/* 
1、foo.js 执行，读取bar.js
2、bar.js 执行，读取foo.js
3、foo.js此时未执行，module为空，因此是{}
*/

```

### AMD

```js
// 异步加载的模块
require([xxx.js], function(xxx) {})  // 有加载完成后的回调
```

### node_modules加载方式

- Webpack在打包时，会自动去node_modules寻找模块，如lodash

## 模块打包原理

```js
// bundle结构
(function(modules) {
  // 模块缓存
  var installedModules = {}
  // 实现require
  function __webpack_require__(moduleId) {
    ...
  }
  // 执行入口模块的加载
  return __webpack_require__(xxx)
})({
  0: function (module, exports, __webpack_require__) {
    // 打包入口
    module.exports = __webpack_require__('xxx')
  }
  xxx: function (module, exports, __webpack_require__) {
  	// 第一个模块的代码
	}
 })
```

- 最外层为立即执行的匿名函数，包裹整个bundle，并构成自身的作用域
- installedModules，模块的缓存，模块只在第一次加载的时候执行，再次被加载就从这里取值
- `__webpack_require__` 对模块加载的实现。
- modules参数。工程中依赖到的模块的平铺，为**【id: 代码的形式】**。

# 资源输入输出

## 资源处理流程

- **entry**：指定从哪个文件开始打包，寻找依赖的模块
- **chunk**：被抽象和包装过的一些模块，Webpack在外面加了一层包裹，可能存在多个chunk。（就像一个装着很多文件的文件袋，里面的各个文件就是各个模块）
- **bundle**：由chunk得到的打包产物
- **vendor**：意思是供应商，一般是指工程所使用的库、框架等第三方模块集中打包产生的bundle
- 一个工程可以定义多个入口，因此可能打包出多个bundle。即使只有一个入口，有可能存在多个chunk，进而打包出多个bundle

## 资源入口

### entry

1. 字符串型入口

   直接传入路径

2. 数组类型入口

   将多个资源预先合并，取**最后一个**元素作为入口路径

   ```js
   module.exports = {
   	entry: ['babel-polyfill', './src/index.js']
   }
   
   // 等同于以下
   // webpack.config.js
   module.exports = {
   	entry: './src/index.js'
   }
   
   // index.js
   import 'babel-polyfill'
   ```

3. 对象类型入口（**多入口**）

   **多入口必须使用对象类型**

   key 是 chunk 名，value 是入口路径

4. 函数类型入口

   - 返回上面任意一种格式即可
   - 支持Promise进行异步操作，resolve(val) 即返回值

### 实际应用

#### 提取vendor

由于第三方包一般不会修改，提取vendor，热重载的时候就无需重新下载这部分资源，而只需要下载修改的部分即可

```js
module.exports = {
    entry: {
        app: './src/app.js',
        vendor: ['react', 'react-dom']
    }
}
```

#### 多页应用

入口与页面是一一对应的关系，每个 html 只要引入各自的 js 就可以加载所需要的模块

```js
module.exports = {
  entry: {
    pageA: './src/pageA.js',
    pageB: './src/pageB.js'，
    vendor: ['react']    // 对页面的公共模块进行打包
  }
}
```

## 资源出口

### 基本示例

```js
module.exports = {
	entry: {
    app: './src/app.js',
    vendor: './src/vendor_diff.js'
  },
  output: {
    filename: '[name]_[hash].js' // [name]会被替换成chunk name，即app和vendor
    path: path.join(__dirname, 'dist') // 文件输出位置，必须为绝对路径
	}
}
```

### publicPath

- 指定资源的请求位置，比如可以将图片都打包到`assert`文件夹

- 由 js 或 css 请求的间接资源路径。例如 html 中通过script标签请求的js，或者从css中请求的图片字体

- HTML相关

  <p>假设当前HTML地址为<span style="color: orange">www.baidu.com/app/index.html</span></p>

  <p>请求的资源为<span style="color: lightgreen">0.chunk.js</span></p>

  <p>publicPath: <span style="color: lightblue">'./js'</span></p>

  <p>实际路径<span style="color: orange">www.baidu.com/app/index.html</span><span style="color: lightblue">/js/</span><span style="color: lightgreen">0.chunk.js</span></p>

- Host相关

  如果publicPath的值以 "/" 开始，代表以 host name 为基础路径，即上面的`www.baidu.com`部分

- CDN相关

  以协议头开始，表明可能与当前域名路径不一致，为绝对路径

- web-dev-server 中的 publicPath

  与Webpack配置的含义不一样，指定的是资源地址，与 output 的路径一致，如 `'/dist/'`

# 预处理器（loader）

## 静态资源也是模块

对于Webpack来说，所有的静态资源都可以视为模块，包括css样式、图片、字体等，都可以用 import 加载

```js
import './style.css'
```

这描述的是 js 和 css 的关系。好处在于，可以将 js 和 css 作为一个整体引入，而无需另外引入css

- 举个例子

  ```js
  // 不使用webpack
  // 页面
  import Calendar from './ui/calendar/index.js'
  @import '/ui/calendar/style.scss'
  ```

  ```js
  // 使用webpack
  // calendar/index.js
  import './style.scss' // 组件自身的样式
  
  // 页面
  // 引用组件的js即可，便于维护
  import Calendar from './ui/calendar/index.js'
  ```

## loader 概述

**为什么需要 loader？**

因为Webpack本身实际上只认识Js，所以其他类型的资源必须预先定义loader进行转译

**loader 本质上是一个函数，即 `output = loader(input)`**

input 可能是源文件的代码，也可能是其他 loader 转换后的结果，可以是字符串、sourcemap、AST，output同理

**源码结构**

```js
module.exports = function loader (content, map, meta) {
	var callback = this.async()
  var result = handler(content, map, meta)
  callback(
    null,            // error
    result.content,  // 转换后的内容
    result.map,      // 转换后的source-map
    result.meta      // 转换后的AST
  )
}
```

## loader 的配置

### 基本配置

```js
module.export = {
  // ...
  module: {
    rules: [{
      test: /\.css$/,      // 匹配以css结尾的文件，两个/包裹的就是正则表达式
      use: ['css-loader']
    }]
  }
}
```

- test 可以接收一个正则表达式或全是正则表达式的数组
- use 可以接收一个数组，包含该规则使用的loader，只有一个的时候也可以简化为字符串
- css-loader：处理CSS的各种加载语法（@import和url()等函数）
- style-loader：把样式插入页面
- css-loader 和 style-loader 通常配合一起使用

### 链式loader

场景：需要使用多个loader，如 .scss 需要先使用sass-loader处理语法，编译为css，再用css-loader，最后使用 style-loader 包装成 style 标签插入页面

```js
module.export = {
  // ...
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  }
}
```

Webpack打包时按照数组**【从后往前】**的顺序交给loader处理，因此最后生效的放在最前面

### options

loader 可能会提供一些配置项，可以用 options 传入，也可能使用 query，具体看 loader 的文档

```js
module.export = {
  // ...
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', { 
        loader: 'css-loader', // 这里改成了对象，指定loader名
        options: {
          // 配置项
        }
      }]
    }]
  }
}
```

### exclude 和 include

用来排除或包含指定目录下的模块，可接收正则表达式或字符串（文件绝对路径）以及它们组成的数组

```js
module.export = {
  // ...
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      exclude: '/node_modules/' // 排除node_modules文件夹
    }]
  }
}
```

或者只想处理特定文件夹

```js
module.export = {
  // ...
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      include: '/src/' // 只处理路径中包含src的文件
    }]
  }
}
```

exclude 和 include 同时存在时，exclude 的优先级更高

```js
module.export = {
  // ...
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      exclude: '/node_modules/', // 排除node_modules文件夹
      include: '/node_modules\/awesome-ui/' // 无效，因为node_modules已经被排除了
      // 一般可以用include指定目录（src），exclude排除子目录（src/lib）
    }]
  }
}
```

### resource 与 issuer

resource 是 被加载的文件，issuer 是 加载其的文件

```js
//index.js            // js 文件是 issuer
import './style/css'  // css 文件是 resource
```

如果想要指定只处理由 js 文件导入的 css

```js
module.exports = {
	use: ['style-loader', 'css-loader'],
	resource: {
    test: /\.css$/,
    exclude: /node_modules/
  },
  issuer: {
    test: /\.js$/,
    exclude: /node_modules/
  }
}
```

### enforce

指定一个 loader 的种类，只能接收 pre、post

loader 按执行顺序可以分为 pre、post、normal（直接定义的都是normal）

- pre：在所有 loader 执行前执行
- post：在所有 loader 执行完后执行

```js
module.exports = {
	test: /\.js$/,
	enforce: 'pre',
	use: 'eslint-loader'
}
```

## 常用的loader

### babel-loader

将ES6编译为ES5

- babel-loader：使Babel和Webpack协同工作的模块
- @babel/core：Babel编译器的核心模块
- @babel/preset-env：Babel官方推荐的预置器，可根据用户设置的目标环境自动添加所需的插件和补丁

```js
rules: [
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
	  loader: 'babel-loader',
  	options: {
  		cacheDirectory: true, // 打开缓存机制，未改变过的模块不会二次编译，提高打包速度
  		presets: [[
  			'env', {
					module: false  // 设为false将ES6 Module的语法交给Webpack，否则会使tree-shaking失效
  			}	
			]]
  	}
  }
]
```

### ts-loader

编译TypeScript

### html-loader

将 html 文件转换为字符串

```js
import header from './header.html'
document.write(header)
```

### file-loader（没太看懂，用到的时候查吧）

```js
const path = require('path')
module.exports = {
  entry: './app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: './assets/'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: 'file-loader'
      }
    ]
  }
}

import avatarImage from './avatar.jpg'
console.log(avatarImage) // file-loader返回了publicPath + 文件名：./assets/c6f4sdsad.jpg
```

## 自定义loader

### 1. loader初始化

实现一个loader，为所有js文件开启严格模式，也就是在第一行添加 'use strict'

**关于 npm/yarn 软链功能**

npm install <path-to-loader>/force-strict-loader

使用相对路径安装，会在项目的node_modules中创建一个指向实际目录的软链，每次改动都能更新

**开始写loader**

1. 创建 force-strict-loader 文件夹
2. 在该目录下执行 npm init -y
3. 创建 index.js，也就是loader

```js
// index.js
module.exports = function(content) {
  const prefix = '\'use strict\';\n\n'
  return prefix + content
}
```

4. npm install <path-to-loader>/force-strict-loader

### 2.启用缓存

```js
// index.js
module.exports = function(content) {
  if (this.cacheable) { // Webpack可以使用this.cacheablei控制
    this.cacheable()
  }
  const prefix = '\'use strict\';\n\n'
  return prefix + content
}
```

### 3.获取options

首先安装一个 loader-utils 依赖库，封装了一些帮助函数

```js
// index.js
var loaderUtils = require('loader-utils')
module.exports = function(content) {
  if (this.cacheable) { // Webpack可以使用this.cacheablei控制
    this.cacheable()
  }
  var options = loaderUtils.getOptions(this) || {} // 获取options
  const prefix = '\'use strict\';\n\n'
  return prefix + content
}
```

### 4.实现source-map

```js
// index.js
var loaderUtils = require('loader-utils')
var SourceNode = require('source-map').SourceNode
var SourceMapConsumer = require('source-map').SourceMapConsumer
module.exports = function(content, sourceMap) { // 这里传参多了sourceMap
  const prefix = '\'use strict\';\n\n'
  if (this.cacheable) {
    this.cacheable()
  }
  var options = loaderUtils.getOptions(this) || {}
  // sourceMap
  if (options.sourceMap && sourceMap) {
    var currentRequest = loaderUtils.getCurrentRequest(this)
    var node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    )
    node.prepend(prefix)
    var result = node.toStringWithSourceMap({ file: currentRequest })
    var callback = this.async() // 获取callback函数
    callback(null, result.code, result.map.toJSON()) // 这里其实就返回了，对应源码结构的三个值
  }
  return prefix + content
}
```

# 样式处理

如何使用Webpack结合各种样式的编译器、转换器以及插件来提升开发效率

## 1、分离样式文件

Webpack中，一般通过 style-loader 将 css 通过附加 style 标签的方式引入样式，那么如何输出单独的CSS文件？

- *一般来说，在生产环境下，样式存在于css文件中更有利于客户端进行缓存*
- *且如果页面的js和css都是内联在html里面的，页面体积会增大，影响加载速度*

为此有专门的插件：extract-text-webpack-plugin 和 mini-css-extract-plugin

### extract-text-webpack-plugin （webpack4以前的版本）

```js
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: {
    foo: './src/scripts/foo.js',
    bar: './src/scripts/bar.js'
  },
  output: {
    filename: [name].js
  },
  mode: 'development',
  module: {
  	rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({ // 要用插件的extract方法包裹
          fallback: 'style-loader', // fallback：无法提取样式时采用的loader
          use: 'css-loader' // use：提取样式之前采用哪些loader进行预先处理
        })
      }
    ]  
  },
  plugins: [
    new ExtractTextPlugin('[name].css') // 使用chunk名动态生成文件名，防止存在多个入口时重名
  ]
}
```

### mini-css-extract-plugin（webpack4之后的版本）

- 支持按需加载css（extract-text-webpack-plugin做不到）

  *比如 a.js **异步**加载 b.js，b.js 引用了 0.css，extract-text-webpack-plugin 只能同步，也就是一开始就将0.css以link的形式加载到a.js中，而不是等b.js加载。mini-css-extract-plugin则可以动态插入该css的link，也就是等待b.js加载再引入css文件*

具体用法看官网

## 2、样式预处理

主要是处理SCSS、Less

### SCSS

SCSS是Sass对CSS3的扩充版本，现在一般使用SCSS，所以sass-loader编译的对象实际是.scss的文件

除了 sass-loader 以外还要安装 node-sass，node-sass相当于@babel/core，是真正用来编译SCSS的，sass-loader只是起粘合作用

### Less

Less类似，需要安装 less-loader和 less

## 3、PostCSS

编译插件的容器，可以结合 stylelint、CSSNext 等插件使用

## 4、CSS Modules

每个样式拥有单独的作用域

# 代码分片

提高性能重要的一点就是尽可能让用户每次只加载必要的资源，优先级不高的资源则通过延迟加载等渐进式地获取，保证页面的首屏速度

## 通过入口划分代码

每个entry都会生成一个对应的资源文件，通过入口的配置可以进行一些有效的拆分，**将一些不常变动库和工具放在单独的入口**，如vendor。这样可以利用客户端缓存，不必每次请求都加载

## CommonsChunkPlugin

### 基本用法

CommonsChunkPlugin 是 webpack4 之前内部自带的插件，4之后替换为splitChunk

**它可以将多个Chunk中的公共部分提取出来**

- 开发过程中减少了重复模块打包，可以提升开发速度
- 减小整体资源体积
- 合理分片后的代码可以更有效地利用客户端缓存

比如，foo.js 和 bar.js 都引用了 Vue，通过以下配置可以将Vue单独提取到 common.js，也就是会打出3个chunk

```js
const webpack = require('webpack')
module.exports = {
  entry: {
    foo: './foo.js',
    bar: './bar.js'
  },
  output: {
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({  // webpack 自带
      name: 'commons',
      filename: 'common.js',
      chunks: ['foo', 'bar'] // 规定从哪些入口提取公共模块
    })
  ]
}
```

### 设置提取规则

CommonsChunkPlugin 默认是一个模块被两个入口引用就会提取出来，但有时候项目存在一些公共模块可能会经常修改，但又被很多入口引用，与 react 这种不会变动的库打包在一起反而不利于利用客户端缓存

可以通过 minChunks 配置项来设置提取的规则

（1）数字

当 minChunks 设置为 n 时，代表只有被 n 个入口引用了才会提取出来

```js
const webpack = require('webpack')
module.exports = {
  entry: {
    foo: './foo.js',
    bar: './bar.js',
    vendor: ['react'] // 注意，这里的react也算作引用，因此react会被提取
  },
  output: {
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      minChunks: 3
    })
  ]
}
```

（2）Infinity

代表所有模块都不会被提取，意义有两个

- 只想让Webpack提取特定的几个模块，这样可以使提取哪些模块是完全可控的
- 为了生成一个没有任何模块而仅仅包含Webpack初始环境的文件，这个文件通常称为manifest

（3）函数

webpack打包过程中每个模块都会经过这个函数处理，当函数返回值是true时进行提取

```js
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  filename: 'vendor.js',
  minChunks: function(module, count) {
    if (count > 5) { // 模块被引用次数大于5则提取
      return true
    }
    // 也可以通过模块名、模块路径筛选
  }
})
```

### hash 与长效缓存

- hash

  hash 模块识别码，用来处理模块之间的依赖关系。hash 是跟每一次 webpack 打包的过程有关，任意增添或删减一个模块的依赖，hash 值都会更改，并且全部文件都共用相同的 hash 值。

- chunkhash

  根据不同的入口文件进行依赖文件解析、构建对应的 chunk，生成对应的哈希值。只要我们不改动代码，就可以保证其哈希值不会受影响。

- Webpack 的运行时

  Webpack 的运行时指的是初始化环境的代码，比如创建模块缓存对象，声明模块加载函数等

默认情况下，每个分离出来的 chunk 会包含 webpack 的 runtime 代码（用来解析和加载模块之类的运行时代码），所以即使该 chunk 没有改变，其他 chunk 改变了，`chunkhash` 值也会改变，所以需要提取这部分代码

```js
plugins: [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor'
  )},
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest' // 提取Webpack的运行时，必须出现在最后
  )}
]
```

### 缺点

（1）一个CommonsChunkPlugin只能提取一个vendor，如果要提取多个vendor会增加很多重复代码

（2）manifest 实际上会使浏览器多加载一个资源，对页面渲染速度不友好

（3）提取公共模块时，会破坏原有Chunk中模块的依赖关系，比如这个例子中，react就不会被提取出来？

```js
const webpack = require('webpack')
module.exports = {
  entry: './foo.js',
  output: {
    filename: 'foo.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'common.js
    })
  ]
}

// foo.js
import React from 'react'
import('./bar.js') // 异步加载另一个模块？
document.write('foo.js', React.version)

//bar.js
import React from 'react'
document.write('bar.js', React.version)
```

## SplitChunks

默认情况下，SplitChunks 只对异步 chunks 生效，并且不需要配置

### 资源异步加载

异步加载也叫按需加载。当模块数量过多，资源体积过大时，可以把一些暂时使用不到的模块延迟加载。这样页面初次渲染的时候用户下载的资源尽可能小，后续的模块等到恰当的时机再去触发加载。

Webpack中给有两种异步加载方式：import 和 require.ensure（基本弃用）

#### import()

和正常的ES6的import语法不同，通过import函数加载的模块及其依赖会被异步地进行加载，并返回一个Promise对象

```js
// foo.js\
console.log('foo')
import('./bar.js').then(({ add }) => { // 不需要出现在顶层，需要的时候调用即可
  console.log(add(2, 3))
})

// bar.js
export function add(a, b) {
  return a + b
}
```

实现原理很简单，就是通过动态在 head 插入 script 请求目标资源

#### 异步chunk的配置

可以用output.chunkFilename指定异步chunk的文件名，默认为[id].js，因此可能会在Network面板看到请求0.js

### 从命令式到声明式

以下是 SplitChunks 默认情形下的提取条件：

- 提取后的 chunk 可被共享或者来自 node_modules 目录（也就是更可能是公共模块，适合被提取）
- 提取后的 javascript chunk 体积大于 30 kb（压缩和 gzip）之前，CSS chunk 体积大于50kb。因为提取后的资源体积太小的话，带来的优化效果也比较一般
- 在按需加载过程中，并行请求的资源最大值小于等于5。按需加载指通过动态插入 script 标签加载脚本。同时加载过多的资源都要花费建立链接和释放链接的成本，因此提取的规则只在并行请求不多的时候生效。
- 在首次加载时，并行请求的资源数最大值小于等于3。

### 默认的异步提取

SplitChunk默认针对异步资源提取，如果想提取非异步的公共模块，可以加上chunks: all

```js
module.exports = {
  entry: '/foo.js',
  output: {
    filename: 'foo.js',
    publicPath: '/dist/'
  },
  mode: 'development',
  optimization: {
    splitChunks: {
      chunks: 'all' // 对所有chunks生效
    }
  }
}
```

SplitChunks 是默认生效的插件，因此这个工程尽管没有配置，还是能打出异步的chunk：`src_bar_js.foo.js`

[例子]: ../../simpleWebpack	"用VS打开"

# 生产环境配置

## 环境配置的封装

## sourceMap

```js
module.exports = {
	// ...
  devtool: 'source-map', // 设置该项就开启了sourceMap（不包含css等）
  module: {
    rules: [
      {
        test: /.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader', // css等需要写在loader的配置里
            options: {
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
}
```

解析后的源码放在`Sources`面板的`webpack://`下

生成mapping文件的同时，会在bundle.js的最后一行追加注释来标识 map 文件的位置

```js
// bundle.js
(function() {
  // bundle 的内容
}) ();
// # sourceMappingURL=bundle.js.map
```



### sourceMap安全问题

由于生产环境不能暴露源码给用户，Webpack提供了 hidden-source-map 及 nosource-source-map 两种策略

- hidden-source-map

  仍会产出完整的map文件，但不会在bundle文件中添加对于map文件的引用，因此浏览器也无法解析bundle，若要追朔源码得上传到三方服务，如Sentry

- nosource-source-map

  可以看到源码的目录结构普，但是文件的具体内容被隐藏了

- 白名单

  通过服务器的nginx设置等将.map文件只对固定的白名单（如公司内网）开放，白名单能看到源码，一般的用户则无法在浏览器中获取到

## 资源压缩

代码压缩，或者叫uglify，意思是移除多余的空格，换行，执行不到的代码，缩短变量名等，以缩小代码体积，且使基本上不可读，提升了代码的安全性

### 压缩JavaScript

- UglifyJS（Webpack3 已集成）
- terser（Webpack4 已集成）：由于支持ES6+的代码压缩，因此4默认继承了 terser-webpack-plugin

```js
// Webpack3
mosule.exports = {
  // ...
  plugins: [new webpack.optimize.UglifyJsPlugin()]
}

//Webpack4
module.exports = {
  optimization: {
    minimize: true, // 开生产模式的话就不需要配置，默认会配
    minimize: new TerserPlugin({ // 如果要输入配置项的话用这种形式
    	/* 各种配置 */
	  })
  }
}
```

### 压缩css

前提是使用 extra-text-webpack-plugin 或 mini-css-extract-plugin 将样式提取出来，接着使用 optimize-css-assets-webpack-plugin 来进行压缩

## 缓存

指重复利用浏览器已经获取过的资源。具体的缓存策略（如指定缓存时间等）由服务器确定（应该是指发请求的时候会带一些使不使用缓存的配置在 request headers 里），过期前浏览器会一直使用本地缓存。

如果想要所有客户端都使用新资源，不要使用缓存，简单粗暴的就是改变URL，迫使客户端下载新资源

### 资源hash

常用方法：每次打包生成hash版本号，将版本号放在文件名中，如bundle@[hash].js

### 动态Html

js文件名变化后，html中的引用地址也要改变，使用 html-webpack-plugin 可以自动同步最新的资源名

### chunk id

webpack3 及以下由于模块 id 是按数字递增，如果有模块顺序变动，会导致 vendor.js 等 chunk hash 发生变化，影响缓存的使用。Webpack3使用HashedModuleIdsPlugin，Webpack3以下则可以使用 webpack-hashed-module-id-plugin

## bundle体积监控和分析

- vscode 插件：Import Cost
- **webpack-bundle-analyzer**
- bundlesize

# 打包速度优化

## HappyPack

一个通过多线程提升打包速度的工具

### 工作原理

对一些转译比较耗时的loader通过多线程并行转译，如babel-loader，但sass-loader这种转译较快的效果不明显

其他配置要用再查

## 缩小打包作用域

- exclude和include

  缩小打包范围

- noParse

  指定完全不进行解析的模块，但仍会打包

- IgnorePlugin

  完全排除一些模块，即使被引用了也不会打包进资源文件

- Cache

  有些loader会有cache的配置项，编译后会保存一份缓存，源文件没变化就采用缓存

  Webpack5新增了 cache: { type: 'filesystem'} 的配置项，但还无法自动检测缓存是否过期，具体还是得看官方文档

## 动态链接库思想与DllPlugin

也就是vendor，将不常变化的库抽取为一份。

- DllPlugin 和 代码分片的区别

  代码分片是设置特定规则提取公共模块

  dllPlugin 是完全拆出 vendor，独立打包，打包速度快，增加了配置和管理成本
  
  其实看起来，`splitChunks` 就是 `DllPlugin` 的自动版本。

### vendor 配置

为vendor单独创建一个Webpack配置文件，比如`webpack.vendor.config.js`，用来区分工程本身的配置文件

```js
const webpack = require('webpack'),
      path = require('path');
const resolvePath = path.join(__dirname, "../lib");

module.exports = {
    mode: "production",
    resolve: {
        extensions: [".js", ".jsx"]
    },
    entry: {
        react: ['react', 'react-dom'], // 指定把哪些包打为vendor
    },
    output: {
        path: resolvePath, // 打到这个文件夹下面
        filename: "[name].[chunkhash:8].js",
        library: "lib_[name]"
    },
    plugins: [
        new webpack.DllPlugin({
            name: 'lib_[name]', // 导出的 dll library 的名字，需要与 output.library 对应
            path: path.resolve(resolvePath, "[name]-manifest.json") // 资源清单的绝对路径，打包时根据这个清单进行模块索引
        })
    ]
};
```

### vendor打包

```js
// 常用dll做打包命令
"scripts": {
  "dll": "webpack --config webpack.vendor.config.js"
}
```

运行后，在`output.path`的路径下会有vendor.js文件和manifest.json（资源清单）

### 链接到业务代码

在`webpack.config.js`文件里 通过DllReferencePlugin来获取刚刚打包好的资源清单，然后页面添加vendor.js的引用就可以了

```js
// webpack.config.js
module.export = {
  ...
  plugins: [
    ...
    new webpack.DllReferencePlugin({
        manifest: require(path.join(__dirname, '../lib/react-manifest.json'))
      }),
	]
}
```

```html
//index.html
<scritp src="../lib/vendor.js"></script> // 指向生成文件的地址
```

### 常见问题

1. 模块顺序变化导致vendor变化（manifest中，模块id也是递增数字），需要重新下载
2. 模块内容变了，但chunk hash没变，导致用户因为没有更新缓存还在使用旧的模块代码

以上问题可以加上 HashedModulesPlugin 解决

## tree shaking

因为ES6模块的依赖关系实在代码编译时而非运行时构建的，因此打包过程中可以检测死代码，Webpack会对这些代码进行标记，并在资源压缩时将他们从最终的bundle中去掉，也就是正常开发模式下还是存在的，只会在生产环境压缩的时候去掉。

实现tree shaking需要以下前提条件：

1. **ES6 Module**

   有时候会发现只引用了库的一个接口，却把整个库引进来了，可能因为是commonJS的模块

2. **使用Webpack进行依赖关系构建**

   如果使用了 babel-loader 进行依赖关系构建，会把代码转为 CommonJS 再交给webpack，就无法利用tree shaking。禁用babel-loader的依赖关系构建，将modules设为false即可（loader那里应该有示例）

3. **使用压缩工具去除死代码**

   tree shaking 本身只是添加标记，真正去除死代码要使用压缩工具，例如 terser-webpack-plugin，或再webpack4 之后的版本将 mode 设为生产环境

# 开发环境调优

## 提高开发效率的一些插件

### webpack-dashboard

提高打包信息的可视化程度

[例子]: ../../simpleWebpack	"用VS打开"

![image-20220311234141639](D:\VueDemo\webpackDemo\notes\img\webpackdashboard.png)

### webpack-merge

用于合并基础配置与开发/生产环境的配置

- **与object.assign的区别**

  ```js
  // webpack.common.config.js
  module.exports = {
    ...
    modules: {
      rules: [{
        test: /css$/,
        ...
      }, {
        test: /js$/
        ...
      }]
    }
  }
  
  // webpack.dev.config.js
  module.exports = {
    ...
    modules: {
      rules: [{
        test: /vue$/
        ...
      }]
    }
  }
  ```

  如果是`Object.assign`，这里`modules`整个都会被替换，等于还是要写`common`的配置。但`webpack-merge`做了优化，会根据`test`的条件作为`key`去替换，此外还有其他一些优化，使用起来更方便

### speed-measure-webpack-plugin

可以分析出Webpack整个打包过程中在各个loader和plugin上耗费的时间

### size-plugin

监听资源打包体积，每次打包都会显示与上次打包相比，体积变化了多少

## 模块热替换

- 非热替换：改代码后刷新浏览器
- 热替换：不刷新页面，只替换部分模块

需要手动开启，具体看各个版本的配置

### 原理

`webpack-dev-server`（WDS） 相当于是服务端，浏览器是客户端，HMR的核心就是从服务端拉取更新后的资源，即拉取了`chunk`需要更新的部分（chunk diff）

1. 什么时候拉取更新

   WDS和浏览器之间维护了一个**websocket**，当发生变化时，服务端会推送更新通知，带上本次构建的hash，以供客户端进行比对

2. 拉取什么

   客户端收到更新通知后，会向服务端发起一个请求，获取更改文件的列表，即哪些模块发生了变动。一般这个文件名是`[hash].hot-update.json`，然后浏览器根据这个文件的信息，继续向WDS请求更新的模块，一般发出的请求可能是`hot-update.js`后缀的

# 其他打包工具

## Rollup

- 附加代码少且体积小

  Rollup 专注于 javascript 的打包，如果项目只包含 js ，使用 rollup 是不错的选择，不会像 webpack 增加一些额外的代码，打出来的比较干净且体积可能更小

- 可以指定输出的模块格式，如输出AMD，CommonJS

## parcel

- 打包速度快

  1. 利用 worker 并行执行任务

  2. 文件系统缓存

  3. 资源编译处理流程优化

     webpack 中，loader 接收的是字符串，如果有多个loader可能要经历N次 string -> AST 和 AST -> string，而parcel的编译处理流程间可以用AST作为输入和输出，节约了转换的时间

- 零配置

  1. 采用 .babelrc 等直接作为配置
  2. 提供了不同类型的快速配置方法，安装 parcel-bundle 即可
