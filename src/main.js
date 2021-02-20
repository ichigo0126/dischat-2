import Vue from 'vue'
import App from './App.vue'
import firebase from 'firebase'
import BootstrapVue from 'bootstrap-vue' // add
import 'bootstrap/dist/css/bootstrap.css' // add
import 'bootstrap-vue/dist/bootstrap-vue.css' // add
const firebaseConfig = {
  apiKey: "AIzaSyBwE4dv3ARTUxLekv3XKie-piPMKOkdwYQ",
  authDomain: "chatap-ae7c4.firebaseapp.com",
  projectId: "chatap-ae7c4",
  storageBucket: "chatap-ae7c4.appspot.com",
  messagingSenderId: "155599445274",
  appId: "1:155599445274:web:6806a6548daf78d61b60a3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
Vue.use(BootstrapVue) // add
Vue.config.productionTip = false

new Vue({
  el: '#app',
  components: {App},
  template: '<App>',
  render: h => h(App),
}).$mount('#app')
