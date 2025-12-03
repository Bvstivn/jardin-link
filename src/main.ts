import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from './stores/auth' // Importamos el store

let app: any;

// 🛑 ESCUCHAMOS A FIREBASE ANTES DE CREAR LA APP
onAuthStateChanged(auth, async (firebaseUser) => {
    
    // Solo inicializamos la app la primera vez
    if (!app) {
        app = createApp(App)
        
        // 1. Activamos Pinia primero
        const pinia = createPinia()
        app.use(pinia)

        // 2. Sincronizamos el usuario manualmente ANTES de cargar el Router
        if (firebaseUser) {
            const authStore = useAuthStore()
            authStore.user = firebaseUser
            // Esperamos a traer el Rol (Profesor/Apoderado)
            console.log("⏳ Main: Cargando perfil de usuario...")
            await authStore.fetchUserProfile(firebaseUser)
            console.log("✅ Main: Perfil cargado:", authStore.userProfile?.role)
        }

        // 3. Ahora que tenemos los datos, activamos el Router y Montamos
        app.use(router)
        app.mount('#app')
    }
})