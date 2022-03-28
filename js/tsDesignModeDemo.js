"use strict";
class FlyWay1 {
    fly() {
        console.log('fly1');
    }
}
class FlyWay2 {
    fly() {
        console.log('fly2');
    }
}
// #endregion
// #region Bird
class Bird {
    constructor() {
        this.wing = 'wing';
    }
}
class CanFlyBirds extends Bird {
    constructor(flyWay) {
        super();
        this.flyWay = flyWay;
    }
    setFlyWay(flyWay) {
        this.flyWay = flyWay;
    }
    peformFly() {
        this.flyWay.fly();
    }
}
let bird1 = new CanFlyBirds(new FlyWay1());
let bird2 = new CanFlyBirds(new FlyWay2());
class Subject {
    constructor() {
        this.observerList = [];
        this._value = '';
    }
    set value(v) {
        this._value = v;
        this.notify();
    }
    get value() {
        return this._value;
    }
    notify() {
        console.log('notify');
        for (let observer of this.observerList) {
            observer.update(this);
        }
    }
    observe(obj) {
        this.observerList.push(obj);
    }
    unObserve(obj) {
        let target = this.observerList.findIndex(o => o === obj);
        this.observerList.splice(target, 1);
    }
}
class AObserver {
    update(sub) {
        console.log('a', sub.value);
    }
}
class BObserver {
    update(sub) {
        console.log('b', sub.value);
    }
}
// #endregion
// 3、装饰者模式
// #region 
class BaseCom {
    cost() {
        return 10;
    }
}
class Decoration extends BaseCom {
    constructor(base) {
        super();
        this._baseCom = base;
    }
    cost() {
        return 0 + this._baseCom.cost();
    }
}
class Decoration1 extends Decoration {
    cost() {
        return 0.3 + this._baseCom.cost();
    }
}
class Decoration2 extends Decoration {
    cost() {
        return 5 + this._baseCom.cost();
    }
}
// #endregion
function test() {
    // #region 1、策略模式  
    // bird1.peformFly()
    // bird2.peformFly()
    // bird1.setFlyWay(new FlyWay2())
    // bird1.peformFly()
    // #endregion
    // #region 2、观察者模式
    // let sub = new Subject()
    // sub.observe(new AObserver())
    // sub.observe(new BObserver())
    // sub.value = 'test observer'
    // #endregion
    // #region 3、装饰者模式
    // let baseCoffee = new BaseCom()
    // let white = new Decoration1(baseCoffee)
    // let black = new Decoration2(white)
    // console.log(white.cost())
    // #endregion
}
test();
