import Vue from '../notes/vue'

// var app = new Vue({
//   el: '#app',
//   data: {
//     message: 'Hello Vue!',
//     arr: [1, { arrSubObj: { c: 1 }}]
//   }
// })

// setTimeout(() => {
//   console.log('setttime')
//   app.arr[1].arrSubObj = {}
// }, 3000);

var subComponent = {
    template: '<div>{{ obj.message }}</div>',
    props: {
      obj: {
        type: Object,
        default: () => {}
      }
    }
}

var app = new Vue({
    el: '#app',
    template: '<subComponents :obj="obj"></subComponents>',
    components: { subComponents: subComponent },
    data: {
        obj: {
            message: 'Hello Vue！'
        }
    },
    mounted () {
        setTimeout(() => {
            this.obj.message = 'ss'
        }, 5000)
    }
})