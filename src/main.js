// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import 'babel-polyfill'//兼容

import yl from 'ylcookie'
Vue.prototype.Yl=yl;

import qs from 'qs'
Vue.prototype.Qs=qs;

import axios from 'axios'
Vue.prototype.Axios=axios;

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  if(error.response.status===401){
    sessionStorage.removeItem('Menu');
    router.push({path:'/'});
    Vue.prototype.$Message.error('请重新登录！')
  }else if(error.response.status===403) {
    Vue.prototype.$Message.error('权限不足！')
  }
  return Promise.reject(error);
});

import iView from 'iview';
import { $Message } from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView);

Vue.prototype.GetLocalTime = (nS) => {
  return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
};

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
