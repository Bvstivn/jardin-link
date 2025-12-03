//VueRouter
import { createRouter, createWebHistory } from "vue-router";
//Stores
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("../views/LoginView.vue") },
    {
      path: "/profesores",
      component: () => import("../views/TeacherDashboard.vue"),
      meta: { role: "profesor" },
    },
    {
      path: "/apoderados",
      component: () => import("../views/ParentDashboard.vue"),
      meta: { role: "apoderado" },
    },
  ],
});

//Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 1. EL SEMÁFORO: Si la tienda dice "cargando", esperamos a Firebase
  // Esto congela la navegación hasta que initAuth resuelva la promesa
  if (authStore.loading) {
    console.log("⏳ Router: Esperando a Firebase...");
    await authStore.initAuth();
    console.log("✅ Router: Firebase respondió.");
  }

  const requiredRole = to.meta.role;

  // 2. Ahora sí, con los datos cargados, decidimos
  if (requiredRole) {
    // ¿Hay usuario?
    if (!authStore.user) {
      console.warn("Router: Bloqueado (No User)");
      return next("/");
    }

    // ¿Tiene el rol correcto?
    const currentRole = authStore.userProfile?.role;

    if (currentRole === requiredRole) {
      next(); // Pase usted
    } else {
      console.warn(
        `Router: Rol incorrecto. Se requiere ${requiredRole}, tienes ${currentRole}`
      );
      alert("No tienes permisos para ver esta sección");
      next("/");
    }
  } else {
    // Rutas públicas (Login)
    // Opcional: Si ya está logueado y va al Login, lo mandamos a su dashboard
    if (to.path === "/" && authStore.user) {
      if (authStore.userProfile?.role === "profesor") return next("/profesores");
      if (authStore.userProfile?.role === "apoderado") return next("/apoderados");
    }
    next();
  }
});

export default router;
