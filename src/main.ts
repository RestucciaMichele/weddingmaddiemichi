import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initializeNavbarVisibility } from './stores/navbarVisibility'

initializeNavbarVisibility()

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').catch(() => {
			// Sw registration is best-effort only.
		})
	})
}

createApp(App).use(router).mount('#app')