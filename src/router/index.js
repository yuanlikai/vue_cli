import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '*',
      name: '*',
      component: resolve => require(['@/components/index'], resolve)
    },
    {
      path: '/',
      name: 'index',
      component: resolve => require(['@/components/index'], resolve)
    },
    {
      path: '/Layout',
      name: 'Layout',
      component: resolve => require(['@/components/Layout'], resolve),
      children:[
        {
          path: '/product',
          name: 'product',
          component: resolve => require(['@/components/product/product'], resolve)
        }
      ]
    }
  ]
})
