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

  //Esperamos a que cargue el usuario si es la primera vez
  if (authStore.loading) await authStore.initAuth();

  const requiredRole = to.meta.role;
  console.log('Required role', requiredRole);   
  console.log('Auth user', authStore.userProfile?.role);

  if (requiredRole) {
    //Si no esta logueado, redireccionamos al login
    if (!!authStore.user) return next("/");

    //Si tiene rol, redireccionamos
    if (authStore.userProfile?.role === requiredRole) {
      next();
    } else {
      //Si tiene otro rol
      alert("Sin permisos");
      next("/");
    }
  } else {
    next();
  }
});

export default router;
