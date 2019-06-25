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
        },
        {
          path: '/productClass',
          name: 'productClass',
          component: resolve => require(['@/components/product/productClass'], resolve)
        },
        {
          path: '/addProduct',
          name: 'addProduct',
          component: resolve => require(['@/components/product/addProduct'], resolve)
        },
        {
          path: '/orderList',
          name: 'orderList',
          component: resolve => require(['@/components/order/orderList'], resolve)
        },
        {
          path: '/userList',
          name: 'userList',
          component: resolve => require(['@/components/user/userList'], resolve)
        },
        {
          path: '/menuList',
          name: 'menuList',
          component: resolve => require(['@/components/user/menuList'], resolve)
        },
        {
          path: '/roleList',
          name: 'roleList',
          component: resolve => require(['@/components/user/roleList'], resolve)
        },
        {
          path: '/supplierList',
          name: 'supplierList',
          component: resolve => require(['@/components/supplier/supplierList'], resolve)
        },
        {
          path: '/addSupplier',
          name: 'addSupplier',
          component: resolve => require(['@/components/supplier/addSupplier'], resolve)
        },
        {
          path: '/returnOrder',
          name: 'returnOrder',
          component: resolve => require(['@/components/order/returnOrder'], resolve)
        },
        {
          path: '/supplierAccount',
          name: 'supplierAccount',
          component: resolve => require(['@/components/supplier/supplierAccount'], resolve)
        },
        {
          path: '/supplierUser',
          name: 'supplierUser',
          component: resolve => require(['@/components/supplier/supplierUser'], resolve)
        }
      ]
    }
  ]
})
