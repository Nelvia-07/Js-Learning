// 1、策略模式
// #region IFlyBehavior
interface IFlyBehavior {
  fly: () => void
}

class FlyWay1 implements IFlyBehavior {
  fly () {
    console.log('fly1')
  }
}

class FlyWay2 implements IFlyBehavior {
  fly () {
    console.log('fly2')
  }
}
// #endregion
// #region Bird
abstract class Bird {
  wing: string
  constructor () {
    this.wing = 'wing'
  }
}

class CanFlyBirds extends Bird {
  private flyWay: IFlyBehavior
  constructor (flyWay: IFlyBehavior) {
    super()
    this.flyWay = flyWay
  }

  setFlyWay (flyWay: IFlyBehavior) {
    this.flyWay = flyWay
  }

  peformFly () {
    this.flyWay.fly()
  }
}

let bird1 = new CanFlyBirds(new FlyWay1())
let bird2 = new CanFlyBirds(new FlyWay2())
// #endregion

// 2、观察者模式
// #region
interface IObserver {
  update (obj?: any): void
}

class Subject {
  private observerList: IObserver[] = []
  private _value: string = ''
  constructor () { }
  set value (v: string) {
    this._value = v
    this.notify()
  }

  get value () {
    return this._value
  }

  notify () {
    console.log('notify')
    for(let observer of this.observerList) {
      observer.update(this)
    }
  }

  observe (obj: IObserver) {
    this.observerList.push(obj)
  }

  unObserve (obj: IObserver) {
    let target = this.observerList.findIndex(o => o === obj)
    this.observerList.splice(target, 1)
  }
}

class AObserver implements IObserver {
  update (sub: Subject) {
    console.log('a', sub.value)
  }
}

class BObserver implements IObserver {
  update (sub: Subject) {
    console.log('b', sub.value)
  }
}
// #endregion

// 3、装饰者模式
// #region 
class BaseCom {
  cost (): number {
    return 10
  }
}

class Decoration extends BaseCom {
  protected _baseCom: BaseCom
  constructor (base: BaseCom) {
    super()
    this._baseCom = base
  }
  cost (): number {
    return 0 + this._baseCom.cost()
  }
}

class Decoration1 extends Decoration {
  cost () {
    return 0.3 + this._baseCom.cost()
  }
}

class Decoration2 extends Decoration {
  cost () {
    return 5 + this._baseCom.cost()
  }
}
// #endregion

function test () {
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
test()