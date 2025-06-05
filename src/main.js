import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import Lara from '@primeuix/themes/lara';
import 'primeicons/primeicons.css'



const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
});
app.use(ToastService)
app.component('Toast', Toast)
app.use(createPinia())
app.use(router)
app.mount('#app')
