import Vue from 'vue';
import Main from './component/main.vue';
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.min.css";

// Configure vue setting
Vue.use(BootstrapVue);

Vue.config.keyCodes.f5 = 116;

console.log(document.getElementById('app'));

// Initiate vue app
var vue_app = new Vue({
    el: '#app',
    render: h => h(Main)
});
