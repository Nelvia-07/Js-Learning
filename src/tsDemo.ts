//#region 基础类型
// 1、赋值
let num = 123
// num = '0' // 会报错，已自动推断为number
let num2: number = 123
// let num3: number = '123' // 报错

// 2、bigInt
let binNum: bigint = 1n // ES2020新数据类型，需要加n才表示是bigint, 大于Number.MAX_SAFE_INTEGER

// 3、元组
// 第一种写法
let arr: [string, number, boolean];
// arr = ["a", 2, false]; // success
// arr = [2, "a", false]; // error 不能将类型“number”分配给类型“string”。 不能将类型“string”分配给类型“number”。
// arr = ["a", 2];        // error Property '2' is missing in type '[string, number]' but required in type '[string, number, boolean]'
// arr[1] = 996

// 第二种写法
// [string, number] 等同于以下
interface Tuple extends Array<number | string> { 
    0: string; // 索引为0必须为string
    1: number; // 索引为1必须为number
    length: 2; 
}

// 4、枚举
enum Enums {
    enum1 = 0,
    enum2 = 1
}

// 5、数组
let arr1: number[] = [1, 2, 3]
let arr2: Array<String> = ['1']
//#endregion

// #region 6、函数
function paramLimit (x: number) {
    console.log(x)
}
paramLimit(1)
// paramLimit('s')

function returnLimit (): Array<number> {
    return [1]
    // return 1
}

// 匿名函数可以自动推断上下文
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (s) {
    console.log(s.toUpperCase());
    // console.log(s.toUppercase());  // 拼写错误或不存在会报错
});

//                                 ↓ 参数分隔符可以为,也可以为;
function printCoord(pt: { x: number; y: number, z: boolean }) { //, z }) { // 不写会假定为any，而不是推断
    console.log("The coordinate's x value is " + pt.x);
    console.log("The coordinate's y value is " + pt.y);
}

// 可选参数，联合类型
function printName (name: string | number[], age?: number) {
    console.log(name)
    console.log(name.length)           // string和number[]都有length不会报错
    // console.log(name.toUpperCase()) // number没有该方法会报错
    // console.log(age.toString())     //可选参数可能为undefined，校验会报错：可能为未定义
}

// 可以推断进入分支的类型
function printName2 (name: string | number[]) {
    if (typeof name === 'string') {
        console.log(name.toUpperCase()) // 自动推断分支类型
    }
}
// #endregion

// #region 7、对象
// 约束对象的结构
function printCord(pt: { x: number; y: number }) {
    console.log("The coordinate's x value is " + pt.x);
    console.log("The coordinate's y value is " + pt.y);
  }
printCord({ x: 3, y: 7 });
// printCord({ x: 3 })
// printCord({ x: 3, y: 7, z: 10 }); // 多了少了都不行
// #endregion

// #region 8、类型别名
type Point1 = {
    x: number;
    y: number; // 可以用分号
}

type Point2 = {
    x: number, // 逗号也行
    y: number
}

type simple = number
type UnionType = number | string

function testTypeDef1 (x: Point1) {
    console.log('1', x.x, x.y)
}

function testTypeDef2 (x: Point2) {
    console.log('2', x.x, x.y)
}

let point1 = { x: 1, y: 2 }
testTypeDef1(point1)
testTypeDef2(point1)
// #endregion

//#region 9、接口
interface IPoint {
    x: number;
    y: number;
}

// #region (1) 都可继承（或叫扩展）
// 接口
interface I3DPoint extends IPoint {
    z: number;
}

// 类型别名
type threeDPoint = Point & {
    z: number
}
//#endregion

//#region (2) 接口可以在原来的基础上添加修改，类型别名不行

// 接口
interface MyWindow {
    title: string
}

interface MyWindow {
    ts: number[]
}

let windowObj: MyWindow = { title: '', ts: [1,2] } 
// let windowObj: MyWindow = { title: '' } // 以下都会报错
// let windowObj: MyWindow = { ts: [1] }

// 类型别名

type MyWindow2 = {
    title: string
  }
 
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
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
const myCanvas2 = <HTMLCanvasElement>document.getElementById("main_canvas");

// 双重
const doubleAss = ('hello' as any) as number // 有问题但是也不会报错，慎用
//#endregion

//#region 11、文字类型
// 可以使用字符串或数字约束特定的值
let xx: 'hello' = 'hello'
// let xx: 'hello' = 'world' // 报错，必须值为hello

// 结合联合类型可以约束参数取值，数字同理
function printText(s: string, alignment: "left" | "right" | "center") {
    // ...
}
printText('s', 'left')
// printText('s', 'bottom') // 报错

function binaryInput(x: 1 | 0) {
    console.log(1)
}
binaryInput(1)
// binaryInput(2) // 报错

// 可以和其他定义混用
function mixType (x: number[] | 'text') {
    console.log(x)
}
//#endregion

//#region 12、字面推理
// 对象会将内部属性推断为基本类型
const req = { url: 'www.baidu.com', method: 'GET'}
function handleRequest (url: string, method: 'GET' | 'POST') {
    //
}
// 1、断言
handleRequest(req.url, req.method as 'GET' || 'POST')
// handleRequest(req.url, req.method) // method被推断为string，所以报错

// 2、as const，整个转为了类型文字，将类型分配为具体的值，而不是通用的string
const reqConst = { url: 'www.baidu.com', method: 'GET'} as const
handleRequest(reqConst.url, reqConst.method)
//#endregion

//#region 13、空值(undefined、null)
// 最好开strictNullChecks，会检验Null

// 非空断言（!），断言该值不为null or undefined
function liveD(x?: number | null) {
    console.log(x!.toFixed())
    // console.log(x.toFixed()) // 可能为null会报错
}
//#endregion

//#region 缩小类型范围
// if分支使用typeof会自动判断类型
function narrowType (x: string | number) {
  if (typeof x === 'string') {
    x.toLocaleLowerCase()
  }
}

// 使用===时会自动推断类型
function strictEqual (x: string | number, y: string | boolean) {
  if (x === y) {
    console.log(x.toUpperCase()) // 只有类型string时，x和y才能完全相等，因此能够识别类型并调用string的方法
  }
}

// 具体的string和number
interface Circle {
  kind: 'circle', // 注意，此处不是赋值而是限定类型
  kindType: number,
  radius: number
}
interface Square {
  kind: 'square',
  kindType: string,
  length: number
}
type Shape = Circle | Square
function getArea (shape: Shape) {
  if (shape.kind === 'circle') { // kind为circle因此识别为Circle，Square的kind值限定为'suqare'
    console.log(shape.radius)
  }
  if (typeof shape.kindType === 'number') {
    // console.log(shape.radius)  // 基本类型不行
  }
}

// 使用==或!=时，undefined会识别为null，反之同理
function narrowTest (x: boolean | undefined | null | number) {
  if (x != undefined) {
    console.log(x)
  }
}
narrowTest(null)

// 自动识别为联合类型
let y = 0
let x = y < 0.5 ? 10 : 'hello' // 此处自动推断x为 number | string
x = 1       // 赋值不会报错
x = 'word'
//x = false   // 报错

type bird = { swim: () => void }
type fish = { swim: () => void, water: () => void }
type animal = { eat: () => void }

// 控制流的语句块中可以确定类型
function flowAnalysis (x: bird | fish | animal) {
  x = { eat () {} }
  let y = 1
  if (y > 1) {
    x = { swim () {} }
  } else {
    x = { 
      swim() {}, 
      water () {} 
    }
  }
  console.log(x.swim())    // 识别为 bird | fish
  // console.log(x.eat())  // 由于分支是由其他变量控制，出了分支后只能识别为 Date | string
}

function example2 () {
  let x: number[] | boolean | string
  x = false
  let y = 0
  if (y > 0) {
    x = [10]
  } else {
    x = 's'
  }
  console.log(x.length) // 识别为 string | number[]
}

// 类型谓词（自定义类型声明）
// 加上 is fish 后，typeScript就知道这是个判断类型的函数，可以判断自定义的类型
function isFish (x: fish | animal ): x is fish { 
  return (x as fish).swim !== undefined
  // return 'true' // 必须返回boolean
}

function isAnimal (x: fish | animal) {
  return (x as animal).eat !== undefined
}

function customTypeNarrow (x: fish | animal) {
  if (isFish(x)) {
    x.swim()
  }

  if (isAnimal(x)) {
    // x.eat() // 无法识别类型
  }
}

// 可以用于过滤只有fish的数组并指定为fish[]
function filterType (x: (fish | animal)[]) {   // 注意不是 fish[] | animal[]
  let y: fish[] = x.filter((f): f is fish => { // 过滤后typeScript能判断是fish[]而不是(fish | animal)[]
    return (f as fish).swim !== undefined
  })
}
//#endregion

//#region 函数相关
type functionLimit = () => void // function empty () {}
type functionWithParam = (a: string) => string
// type functionWithAnyParam = (a) => string // a为any

function functionParam (fn: (a: string) => void) {
  return fn('a')
  // return fn().apply(' ') // apply、bind等不能用，可能会改变传参个数，应使用类型Function
}

function fVoid (): void {
  // return true // 会强制不允许返回
}

// 但是这么写可以任意返回，不然forEach中如果有会返回值的函数会报错
type voidFunc = () => void
const fVoid2: voidFunc = () => {
  return true
}
let fVoid2Result = fVoid2()  // 结果类型是void

// 对象中用：
type objectType = {
  (): void;
  (a: string): number;
}

interface IObjectFunc {
  (): void;
}

// 构造函数
type Vue = {
  new (option: object): object
}
function testCtor (ctor: Vue) {
  return new ctor({})
}

interface ICallOrCtor {
  new (d: number): Date;
  new (d: string): Date;
  (s: string): Date;
}

function testInf (inf: ICallOrCtor) {
  let obj1 = new inf(2)
  let obj2 = new inf('s')
  let obj = inf('s')
}

//#region 泛型相关

// 自动推断类型
function map2<T1, T2>(inArr: T1[], fn: (args: T1) => T2): T2[] {
  return inArr.map(fn);
}
let numArr = map2(['1'], s => parseInt(s)) // 自动根据函数返回的参数类型推测类别
''.repeat(numArr[0]) // 识别为number

// 约束类型种类（extends），支持访问特定的属性
function longest<Type extends { length: number }>(arr: Type) { // 类型必须为数组或字符串等有长度这个属性的类型
  console.log(arr.length) // 没有约束前不能访问length，在这里就会报错
}
longest([1,2])
longest('s')
longest({ length: 1 })
// longest(1) // 报错

//   即用了extends又规定T为返回值类型的情况下
function minLen<T extends { length: number }>(a: T, b: T) : T {
  return a
  // return { length: 1 } // 虽然这个结构符合约束，但是不是类型T，会报错
}

// 除了推断以外也可以直接指定类型
minLen<number[] | string>([], 's')

//#endregion

// 可选参数与默认值
function f (a:number = 1, n?: number[]) { // number[] || undefined
  console.log(n?.length)
  // console.log(n.length)  // 可能为undefined，会报错
}

// 两者不能同时用，且可选参数要放在最后
// function f2 (a? = 1) {
// function f3 (a?: number, b: string)
// }

// 重载（与C#不同，分为重载签名和实现签名）
function myDate(t: number): Date;
function myDate(s: string, format: string): Date; // 这两个为重载签名
function myDate(s: number | string, format?: string): Date { // 这个为实现签名
// function myDate(s: string | number): any { // 少了个参数不会报错
// function myDate(s: string | number, format: string) { // format不是可选参数会导致实现签名不兼容第一个重载签名
  return new Date(s)
}

// 约定this的类型以调用相应的属性
interface DB {
  filterFish: (func: (this: fish) => boolean) => fish[]
}
function thisTest (db: DB) {
  return db.filterFish(function () {
    this.swim()
    return true
  })
}

// ...剩余参数
function multy (n: number, ...rest: (number | string)[]) {}
const args = [8, 5];
// const angle = Math.atan2(...args); // 要求要有两个传参，但是这里只当作number[]，因此可能认为没有参数导致报错
const args2 = [8, 5] as const
const angle2 = Math.atan2(...args2);

// 参数解构
function disParam({a, b}:{ a: number[] | string; b: number}) {
  a.length
}
// disParam({1, 2}) // 报错

//#endregion

//#region 比较不常用的类型

// 1、object
// 在ts中，null不是object，但是函数是object（因为函数可以有属性，也有Object.prototype的原型链

// 2、unknown
// 类似于any，但不被允许做任何操作
function anyType(a: any) {
  a.length
}

function unknownType(a: unknown) {
  // a.length // 报错
}

// 3、never
// 未观察到的值，一般是抛出了错误或程序终止执行，也可能出现在不可能进入的类型分支
function neverFunc (a: number | string) {
  if (typeof a === 'number' || typeof a === 'string') {
    a.toString()
  } else {
    a // 这时候a是never
  }
}

// 4、Function
// 可以使用bind、apply等，基本等于原来的function
function doSomething (f: Function) {
  f.apply('')
}
//#endregion

//#region 对象相关
// 对象解构时可能会出现类型与变量名声明冲突问题（用映射类型解决）
// ts中这么写可能是想约束该解构出来的属性必须为string
// js语法中认为以下↓这么写，是取对象的shape属性并命名为string，所以会报错
// function draw ({ shape: string, xPos: number = 100 }) {
//   console.log(shape)
// }

//#region readonly
// 限制对属性的修改，但如果属性为object等，无法限制修改属性的属性值
interface IReadOnly {
  readonly age: number;
  readonly stru: { name: string }
}

function readonlyFunc (readVal: IReadOnly) {
  // readVal.age++                // 无法修改只读，报错
  // readVal.stru = { name: 's' } // 同理
  readVal.stru.name = 's' // 不报错
}

// 类型有别名时，readonly限制会失效
interface Person1 {
  name: string;
  age: number;
}
 
interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}
 
let writablePerson: Person1 = {
  name: "Person McPersonface",
  age: 42,
};
 
let readonlyPerson: ReadonlyPerson = writablePerson;
// 实际和readonlyperson是一个对象并有相同的属性，但是类别识别不同，识别为可修改的Person
writablePerson.age++;
// readonlyPerson.age++; // 这个就会报错
//#endregion

//#region 索引签名
// Array等可以限制索引（key）的类型
interface IArray {
  [index: number]: string;
}

let stringArr: IArray = ['1', '2']
let stringArr2: IArray = { 1: 's', 2: '3'}
// let stringArr3: IArray = [1, 2] // 具体数值不符合
// let stringArr4: IArray = { 'ds': 's'} // 索引不符合

// 索引签名同时会约束整个对象的返回值类型
interface INumberDict {
  [index: string]: number;
  age: number;
  // name: string;   // 索引签名已规定该对象为obj[string] = number的形式，不可再约定非number类型的属性值
}

// 索引签名设置为readonly的情况
interface ReadonlyArr {
  readonly [index: number]: string
}
let readonlyStrArr: ReadonlyArr = ['s']
// readonlyStrArr[0] = '2'  // 对象无法赋值
// readonlyStrArr.push('s') // 识别为对象而不是数组，无法push
//#endregion

//#region 扩展类型
// 1、extends继承已存在的interface,扩展对应的属性,可继承多个
interface I2DShape {
  x: number | string;
  y: number;
}

interface I3DShape extends I2DShape {
  z: number;
}
// let tdShape: I3DShape = { z: 1 } // 就会需要x和y

interface I4DShape extends I2DShape {
  x: string;      // 继承时可以缩小属性值的类型范围
  // y: string;   // 但是不能不同
  j: number
}

//2、使用&以交集的方式结合两个类型
interface HasColor {
  color: string
}
interface HasRadius {
  radius: number
}

type ColorCircle = HasColor & HasRadius
function draw(ele: ColorCircle) {
  console.log(ele.color, ele.radius)
}

draw({ color: 'blue', radius: 22 })
// draw({ color: 'red' }) // 必须要有radius

// 由于是取交集，有相同名称，类型不同的话，不会union，该元素会变成never，即不会存在的类型
interface HasStrRadius {
  radius: string;
}
type crossTest = HasRadius & HasStrRadius
function crossFunc (ele: crossTest) {
  ele.radius // radius为never类型
}
//#endregion

//#region 使用泛型定义通用对象类型
interface commonObj<Type> {
  name: Type
}

type CanBeUndefined<Type> = Type | undefined
//#endregion

//#region Array、Promise、Map等存在泛型的类型
// Array<Type>
// Map<K, T>
// Promise<T>
let np = new Promise<number>((resolve, reject) => {
  // resolve('d') //  只能resolve number或Promise<number>
  reject('s') // reject不受限制
})
//#endregion

//#region ReadonlyArray（不可修改的数组）
function doStuff(values: ReadonlyArray<number>, values2: readonly string[]) {
  const copy = values.slice(2, 2) // 可以读取
  // values.push(2) // 不能改变
  // values2.push('2') //同上
}

// ReadonlyArray没有new，只能通过以下形式约束
let readonlyArr: ReadonlyArray<number> = [1, 2, 3]
let readonlyArr2: readonly number[] = [1, 2, 3]
//#endregion

//#region 元组
// 相当于规定了数组长度以及各个位置的数据类型的数据
type stringNumPair = [string, number];
let pairTupple: stringNumPair = ['1', 1] 
// let pairTupple: stringNumPair = [1, 1] 
// let pairTupple: stringNumPair = ['1', 1, 2] 

// 近似以下写法
interface LikeTupple {
  0: string;
  1: number;
  length: 2; // 长度只能为2
  slice: () => {} // 可读方法
}

// 支持可选
type LengthChangable = [string, number, number?] // 长度会变成2|3

// 支持剩余元素
type StringNumberBooleans = [string, number, ...boolean[]]; // 以一堆boolean结尾
type StringBooleansNumber = [string, ...boolean[], number]; // 中间是一堆boolean，以number结尾
type BooleansStringNumber = [...boolean[], string, number]; // 开头是一堆boolean，结尾为string和number
// 可以在函数参数中这么使用
function paramTest (...args: StringNumberBooleans) {}
// 基本上相当于
function paramTest2 (a: string, b: number, ...rest: boolean[]) {}

// 结合readonly
function paramTest3 (a: readonly [string, number]) {}

// as const 后，该数组被认为是不可改变的元组，并转换为文字类型（string或number），即readonly [3, 4]
let point = [3, 4] as const;
function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}
// distanceFromOrigin(point); // 不能分配给支持可变的[number, number]
//#endregion

//#endregion

//#region 理解interface创建函数类型声明
//#endregion

//#region keyof 取得对象所有key，转为具体的值范围
type Point = {x: number, y: number}
type K = keyof Point // 即 'x' | 'y'，只能取值x或y

// 如果是索引签名，返回索引对应的基本类型
type Arrayish = { [n:number]: unknown }
type A = keyof Arrayish // 即 number

type Mapish = { [k: string]: boolean }
type M = keyof Mapish // 这里是 string | number，因为js中所有键值都会被强制转为string

type BothInxAndAttr = { [n: string]: number, 's': number }
type B = keyof BothInxAndAttr // 可能是 string | 's'，这里没有具体显示
function BTest (b: B) {}
BTest('1') // 任意字符串貌似都行
//#endregion

//#region 泛型相关Part2（一部分在函数相关里）
// 可以将函数理解为特殊的对象类型，只有方法声明？
interface GenericIdentityFn {
  <Type>(arg: Type): Type;
} 
function identity<Type>(arg: Type): Type {
  return arg;
}
let myIdentity: GenericIdentityFn = identity;

// 泛型也可以移动到整个接口
interface GenericIdentityFn2<Type> {
  (arg: Type): Type;
}
// 但是这个时候必须声明泛型的类型
let myIdentity2: GenericIdentityFn2<number> = identity;

// class使用泛型，静态变量不能使用泛型
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}
let myNum = new GenericNumber<number>()
myNum.zeroValue = 0
myNum.add = (x, y) => { return x }

// 结合keyof限制取值范围为对象中的key值
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key]
}

let x1 = { a: 1, b: 2 }
getProperty(x1, "a")
// getProperty(x1, 'm') // 只能取存在于obj中的属性
//#endregion

//#region extends约束泛型的一个示例（extends基类）
class BeeKeeper {
  hasMask: boolean = true;
}
 
class ZooKeeper {
  nametag: string = "Mikle";
}
 
class Animal {
  numLegs: number = 4;
}
 
class Bee extends Animal {
  keeper: BeeKeeper = new BeeKeeper();
}
 
class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}
 
function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}
 
createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
//#endregion

//#region typeof获取类型变量（ts支持的运算符，而不是js中的）
let s = 'hello'
let n: typeof s // js中这里会返回'string'，ts中直接返回string类型
n = 'world'     // 所以这里可以赋值

// ReturnType<T> 获取函数类型的返回类型
type Predicate = (x: unknown) => boolean
type R = ReturnType<Predicate>  // R为Boolean

function ff (x: number): string { return '' }
// type R2 = ReturnType<ff> // ff 不是类型，而是属于该类型的值，所以无法作为参数传进去
type R3 = ReturnType<typeof ff> //使用 typeof 就可以获取到函数的类型
//#endregion

//#region 获取索引访问类型的类型
type Person = { age: number, name: string } // 可能相当于索引类型是 ['age', 'name']: number | string
type Age = Person['age'] // Age 是 number，这种写法可能就是取Person类型的索引类型
type I1 = Person['age' | 'name'] // number | string
type I2 = Person[keyof Person]   // number | string，功能同上
// type I3 = Person['add'] // 找不存在的key会报错

// 注意，这里的Person['age']中的'age'实际上是一个类型变量，而不是一个数值，所以以下代码会报错
const key = 'age'
// Person[key] // key 是一个数值，而不是类型变量
//#endregion

//#region 条件类型
interface BaseAnimal { }
interface Dog extends BaseAnimal {}
type Result = Dog extends BaseAnimal ? number : string

// 应用场景，函数重载，根据入参决定出参类型
interface IdLabel {}
interface NameLabel {}

// 可以理解为一个判断泛型属于什么类型后，返回相应类型的类型表达式
type NameOrId<T extends number | string> = T extends number ? IdLabel : NameLabel
function createLabel<T extends number | string>(x: T): NameOrId<T> {
  return x
}
let b = createLabel(1) // b为 IdLabel

// 应用场景2，缩小类型范围
// 如果将T extends写在等号左边，那就不能接收所有类型
// 但通过在右边增加条件表达式，可以接收所有类型，仅在有目标属性时返回该属性的值，而其他时候为never
type MessageOf<T> = T extends { "message": number} ? T["message"] : never

// 加方括号解决联合类型分布问题
type ToArray1<T> = T extends any ? T[] : never
type ToArray2<T> = [T] extends [any] ? T[] : never

type StringOrNum1 = ToArray1<string | number> // string[] | number[]，[1,2]或者['1', '2']
type StringOrNum2 = ToArray2<string | number> // (string | number)[]，可以为[1, '1']
//#endregion

//#region infer 关键字

// 正常T2应该是需要传入的，也就是<T, T2>，但是加上infer可以自动推断类型
type Flatten<T> = T extends Array<infer T2> ? T2 : T
// type Flatten<T> = T extends Array<T2> ? T2 : T
type N = Flatten<number[]>
type S = Flatten<string>

// 推断函数返回类型
type GetReturnType<T> = T extends (...args: any[]) => infer ReturnT ? ReturnT : never

type ReturnType1 = GetReturnType<(x: string) => number> // number
type ReturnType2 = GetReturnType<number>                    // never

//#endregion

//#region 映射类型
type GetAllPropertys<T> = {
  [property in keyof T]: number // 也可以是具体值，换成true就是将所有数值置为true
}

interface OnlyBoolean {
  del: true,
  add: false,
  readonly read: true,
  optionable?: false
}

type Ps = GetAllPropertys<OnlyBoolean> // 将同样的key转为了number类型

// + 、 - 符号用于添加或删除可选属性和只读属性，默认使用了 +
type RemoveReadOnly<T> = {
  -readonly [property in keyof T] -? : T[property] // readonly放在前面，?放在后面， T[property]为索引，取对应类型
}
type Ps2 = RemoveReadOnly<OnlyBoolean> // 只读和可选属性都变成了普通的属性

type AddReadOnly<T> = {
  readonly [property in keyof T]: T[property]
}
type Ps3 = AddReadOnly<OnlyBoolean> // 全改为了readonly

// 使用as修改键
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}
type OnlyBooleanGetters = Getters<OnlyBoolean>

// 排除特性属性
// Exclude<T, U> 将符合U类型的置为never，通过将不需要的属性设置为never就可以排除该属性
type FilterAttr<T> = {
  [P in keyof T as Exclude<P, 'del'>]: T[P]
}
type DisableDel = FilterAttr<OnlyBoolean>

// 除了映射键值以外，也可以映射联合类型
type EventConfig<Events extends { kind: string }> = {
  [E in Events as E["kind"]]: (event: E) => void;   // 这里的Events是联合类型的集合
}

type SquareEvent = { kind: "square", x: number, y: number };
type CircleEvent = { kind: "circle", radius: number };

type Config = EventConfig<SquareEvent | CircleEvent>
//#endregion

//#region 模板文字类型
// 1、组合
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;

// 2、交叉相乘
type Lang = "en" | "ja" | "pt";
type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;

// 3、根据属性生成改变事件名类型约束
type PropEventSource<Type> = {
  // 这里的 & 应该是条件约束，必须为string 且是Type的key，因为数字属性1就没有映射的changed事件
  on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};
declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>; // Type & PropEventSource<Type> 表示组合，合为了一个有属性以及其变化事件的类型

const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
  1: 2
});

person.on("firstNameChanged", () => {});
// person.on("firstName", () => {});      // on函数的取值范围为 firstNameChanged | lastNameChanged | ageChanged

type PropEventSourceWithType<Type> = {
  // 这里的 keyof 也是一个条件约束
  on<K extends string & keyof Type>
  (eventName: `${string & keyof Type}Changed`, 
  callback: (newValue: Type[K]) => void): void;
};

// 几个内置的方法
// Uppercase 转为大写
// Lowercase 转为小写
// Capitalize 首字母大写
// Uncapitalize 首字母小写
type LowercaseGreeting = "hello, world";
type Greeting = Capitalize<LowercaseGreeting>;
//#endregion

interface numArr extends Array<Array<number>> {
  0: [number, number],
  1: [number, number],
  length: 2
}