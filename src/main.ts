import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initializeNavbarVisibility } from './stores/navbarVisibility'

initializeNavbarVisibility()

createApp(App).use(router).mount('#app')