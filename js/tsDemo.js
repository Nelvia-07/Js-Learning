"use strict";
//#region 基础类型
// 1、赋值
let num = 123;
// num = '0' // 会报错，已自动推断为number
let num2 = 123;
// let num3: number = '123' // 报错
// 2、bigInt
let binNum = 1n; // ES2020新数据类型，需要加n才表示是bigint, 大于Number.MAX_SAFE_INTEGER
// 3、元组
let arr;
// 4、枚举
var Enums;
(function (Enums) {
    Enums[Enums["enum1"] = 0] = "enum1";
    Enums[Enums["enum2"] = 1] = "enum2";
})(Enums || (Enums = {}));
// 5、数组
let arr1 = [1, 2, 3];
let arr2 = ['1'];
//#endregion
// #region 6、函数
function paramLimit(x) {
    console.log(x);
}
paramLimit(1);
// paramLimit('s')
function returnLimit() {
    return [1];
    // return 1
}
// 匿名函数可以自动推断上下文
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (s) {
    console.log(s.toUpperCase());
    // console.log(s.toUppercase());  // 拼写错误或不存在会报错
});
//                                 ↓ 参数分隔符可以为,也可以为;
function printCoord(pt) {
    console.log("The coordinate's x value is " + pt.x);
    console.log("The coordinate's y value is " + pt.y);
}
// 可选参数，联合类型
function printName(name, age) {
    console.log(name);
    console.log(name.length); // string和number[]都有length不会报错
    // console.log(name.toUpperCase()) // number没有该方法会报错
    // console.log(age.toString())     //可选参数可能为undefined，校验会报错：可能为未定义
}
// 可以推断进入分支的类型
function printName2(name) {
    if (typeof name === 'string') {
        console.log(name.toUpperCase()); // 自动推断分支类型
    }
}
// #endregion
// #region 7、对象
// 约束对象的结构
function printCord(pt) {
    console.log("The coordinate's x value is " + pt.x);
    console.log("The coordinate's y value is " + pt.y);
}
printCord({ x: 3, y: 7 });
function testTypeDef1(x) {
    console.log('1', x.x, x.y);
}
function testTypeDef2(x) {
    console.log('2', x.x, x.y);
}
let point1 = { x: 1, y: 2 };
testTypeDef1(point1);
testTypeDef2(point1);
let windowObj = { title: '', ts: [1, 2] };
// 会报错（重复定义）
// type MyWindow2 = {
//     ts: number[]
// }
//#endregion
// 不能定义联合类型与基本类型
// 不能extends 基本类型，如extends string
// interface IArray extends number[] {}
//#endregion
//#region 10、类型断言
// 非强制转换类型，而是主动告诉typeScript变量是什么类型
// 可断言更具体的或更不具体的，如any -> number，number -> any，但不能number -> string
// as or <>
const myCanvas = document.getElementById("main_canvas");
const myCanvas2 = document.getElementById("main_canvas");
// 双重
const doubleAss = 'hello'; // 有问题但是也不会报错，慎用
//#endregion
//#region 11、文字类型
// 可以使用字符串或数字约束特定的值
let xx = 'hello';
// let xx: 'hello' = 'world' // 报错，必须值为hello
// 结合联合类型可以约束参数取值，数字同理
function printText(s, alignment) {
    // ...
}
printText('s', 'left');
// printText('s', 'bottom') // 报错
function binaryInput(x) {
    console.log(1);
}
binaryInput(1);
// binaryInput(2) // 报错
// 可以和其他定义混用
function mixType(x) {
    console.log(x);
}
//#endregion
//#region 12、字面推理
// 对象会将内部属性推断为基本类型
const req = { url: 'www.baidu.com', method: 'GET' };
function handleRequest(url, method) {
    //
}
// 1、断言
handleRequest(req.url, req.method || 'POST');
// handleRequest(req.url, req.method) // method被推断为string，所以报错
// 2、as const，整个转为了类型文字，将类型分配为具体的值，而不是通用的string
const reqConst = { url: 'www.baidu.com', method: 'GET' };
handleRequest(reqConst.url, reqConst.method);
//#endregion
//#region 13、空值(undefined、null)
// 最好开strictNullChecks，会检验Null
// 非空断言（!），断言该值不为null or undefined
function liveD(x) {
    console.log(x.toFixed());
    // console.log(x.toFixed()) // 可能为null会报错
}
//#endregion
//#region 缩小类型范围
// if分支使用typeof会自动判断类型
function narrowType(x) {
    if (typeof x === 'string') {
        x.toLocaleLowerCase();
    }
}
// 使用===时会自动推断类型
function strictEqual(x, y) {
    if (x === y) {
        console.log(x.toUpperCase()); // 只有类型string时，x和y才能完全相等，因此能够识别类型并调用string的方法
    }
}
function getArea(shape) {
    if (shape.kind === 'circle') { // kind为circle因此识别为Circle，Square的kind值限定为'suqare'
        console.log(shape.radius);
    }
    if (typeof shape.kindType === 'number') {
        // console.log(shape.radius)  // 基本类型不行
    }
}
// 使用==或!=时，undefined会识别为null，反之同理
function narrowTest(x) {
    if (x != undefined) {
        console.log(x);
    }
}
narrowTest(null);
// 自动识别为联合类型
let y = 0;
let x = y < 0.5 ? 10 : 'hello'; // 此处自动推断x为 number | string
x = 1; // 赋值不会报错
x = 'word';
// 控制流的语句块中可以确定类型
function flowAnalysis(x) {
    x = { eat() { } };
    let y = 1;
    if (y > 1) {
        x = { swim() { } };
    }
    else {
        x = {
            swim() { },
            water() { }
        };
    }
    console.log(x.swim()); // 识别为 bird | fish
    // console.log(x.eat())  // 由于分支是由其他变量控制，出了分支后只能识别为 Date | string
}
function example2() {
    let x;
    x = false;
    let y = 0;
    if (y > 0) {
        x = [10];
    }
    else {
        x = 's';
    }
    console.log(x.length); // 识别为 string | number[]
}
// 类型谓词（自定义类型声明）
// 加上 is fish 后，typeScript就知道这是个判断类型的函数，可以判断自定义的类型
function isFish(x) {
    return x.swim !== undefined;
    // return 'true' // 必须返回boolean
}
function isAnimal(x) {
    return x.eat !== undefined;
}
function customTypeNarrow(x) {
    if (isFish(x)) {
        x.swim();
    }
    if (isAnimal(x)) {
        // x.eat() // 无法识别类型
    }
}
// 可以用于过滤只有fish的数组并指定为fish[]
function filterType(x) {
    let y = x.filter((f) => {
        return f.swim !== undefined;
    });
}
// type functionWithAnyParam = (a) => string // a为any
function functionParam(fn) {
    return fn('a');
    // return fn().apply(' ') // apply、bind等不能用，可能会改变传参个数，应使用类型Function
}
function fVoid() {
    // return true // 会强制不允许返回
}
const fVoid2 = () => {
    return true;
};
let fVoid2Result = fVoid2(); // 结果类型是void
function testCtor(ctor) {
    return new ctor({});
}
function testInf(inf) {
    let obj1 = new inf(2);
    let obj2 = new inf('s');
    let obj = inf('s');
}
//#region 泛型相关
// 自动推断类型
function map2(inArr, fn) {
    return inArr.map(fn);
}
let numArr = map2(['1'], s => parseInt(s)); // 自动根据函数返回的参数类型推测类别
''.repeat(numArr[0]); // 识别为number
// 约束类型种类（extends），支持访问特定的属性
function longest(arr) {
    console.log(arr.length); // 没有约束前不能访问length，在这里就会报错
}
longest([1, 2]);
longest('s');
longest({ length: 1 });
// longest(1) // 报错
//   即用了extends又规定T为返回值类型的情况下
function minLen(a, b) {
    return a;
    // return { length: 1 } // 虽然这个结构符合约束，但是不是类型T，会报错
}
// 除了推断以外也可以直接指定类型
minLen([], 's');
//#endregion
// 可选参数与默认值
function f(a = 1, n) {
    console.log(n?.length);
    // console.log(n.length)  // 可能为undefined，会报错
}
function myDate(s, format) {
    // function myDate(s: string | number): any { // 少了个参数不会报错
    // function myDate(s: string | number, format: string) { // format不是可选参数会导致实现签名不兼容第一个重载签名
    return new Date(s);
}
function thisTest(db) {
    return db.filterFish(function () {
        this.swim();
        return true;
    });
}
// ...剩余参数
function multy(n, ...rest) { }
const args = [8, 5];
// const angle = Math.atan2(...args); // 要求要有两个传参，但是这里只当作number[]，因此可能认为没有参数导致报错
const args2 = [8, 5];
const angle2 = Math.atan2(...args2);
// 参数解构
function disParam({ a, b }) {
    a.length;
}
// disParam({1, 2}) // 报错
//#endregion
//#region 比较不常用的类型
// 1、object
// 在ts中，null不是object，但是函数是object（因为函数可以有属性，也有Object.prototype的原型链
// 2、unknown
// 类似于any，但不被允许做任何操作
function anyType(a) {
    a.length;
}
function unknownType(a) {
    // a.length // 报错
}
// 3、never
// 未观察到的值，一般是抛出了错误或程序终止执行，也可能出现在不可能进入的类型分支
function neverFunc(a) {
    if (typeof a === 'number' || typeof a === 'string') {
        a.toString();
    }
    else {
        a; // 这时候a是never
    }
}
// 4、Function
// 可以使用bind、apply等，基本等于原来的function
function doSomething(f) {
    f.apply('');
}
function readonlyFunc(readVal) {
    // readVal.age++                // 无法修改只读，报错
    // readVal.stru = { name: 's' } // 同理
    readVal.stru.name = 's'; // 不报错
}
let writablePerson = {
    name: "Person McPersonface",
    age: 42,
};
let readonlyPerson = writablePerson;
// 实际和readonlyperson是一个对象并有相同的属性，但是类别识别不同，识别为可修改的Person
writablePerson.age++;
let stringArr = ['1', '2'];
let stringArr2 = { 1: 's', 2: '3' };
let readonlyStrArr = ['s'];
function draw(ele) {
    console.log(ele.color, ele.radius);
}
draw({ color: 'blue', radius: 22 });
function crossFunc(ele) {
    ele.radius; // radius为never类型
}
//#endregion
//#region Array、Promise、Map等存在泛型的类型
// Array<Type>
// Map<K, T>
// Promise<T>
let np = new Promise((resolve, reject) => {
    // resolve('d') //  只能resolve number或Promise<number>
    reject('s'); // reject不受限制
});
//#endregion
//#region ReadonlyArray（不可修改的数组）
function doStuff(values, values2) {
    const copy = values.slice(2, 2); // 可以读取
    // values.push(2) // 不能改变
    // values2.push('2') //同上
}
// ReadonlyArray没有new，只能通过以下形式约束
let readonlyArr = [1, 2, 3];
let readonlyArr2 = [1, 2, 3];
let pairTupple = ['1', 1];
// 可以在函数参数中这么使用
function paramTest(...args) { }
// 基本上相当于
function paramTest2(a, b, ...rest) { }
// 结合readonly
function paramTest3(a) { }
// as const 后，该数组被认为是不可改变的元组，并转换为文字类型（string或number），即readonly [3, 4]
let point = [3, 4];
function distanceFromOrigin([x, y]) {
    return Math.sqrt(x ** 2 + y ** 2);
}
function BTest(b) { }
BTest('1'); // 任意字符串貌似都行
function identity(arg) {
    return arg;
}
let myIdentity = identity;
// 但是这个时候必须声明泛型的类型
let myIdentity2 = identity;
// class使用泛型，静态变量不能使用泛型
class GenericNumber {
}
let myNum = new GenericNumber();
myNum.zeroValue = 0;
myNum.add = (x, y) => { return x; };
// 结合keyof限制取值范围为对象中的key值
function getProperty(obj, key) {
    return obj[key];
}
let x1 = { a: 1, b: 2 };
getProperty(x1, "a");
// getProperty(x1, 'm') // 只能取存在于obj中的属性
//#endregion
//#region extends约束泛型的一个示例（extends基类）
class BeeKeeper {
    constructor() {
        this.hasMask = true;
    }
}
class ZooKeeper {
    constructor() {
        this.nametag = "Mikle";
    }
}
class Animal {
    constructor() {
        this.numLegs = 4;
    }
}
class Bee extends Animal {
    constructor() {
        super(...arguments);
        this.keeper = new BeeKeeper();
    }
}
class Lion extends Animal {
    constructor() {
        super(...arguments);
        this.keeper = new ZooKeeper();
    }
}
function createInstance(c) {
    return new c();
}
createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
//#endregion
//#region typeof获取类型变量（ts支持的运算符，而不是js中的）
let s = 'hello';
let n; // js中这里会返回'string'，ts中直接返回string类型
n = 'world'; // 所以这里可以赋值
function ff(x) { return ''; }
// type I3 = Person['add'] // 找不存在的key会报错
// 注意，这里的Person['age']中的'age'实际上是一个类型变量，而不是一个数值，所以以下代码会报错
const key = 'age';
function createLabel(x) {
    return x;
}
let b = createLabel(1); // b为 IdLabel
const person = makeWatchedObject({
    firstName: "Saoirse",
    lastName: "Ronan",
    age: 26,
    1: 2
});
person.on("firstNameChanged", () => { });
//#endregion
