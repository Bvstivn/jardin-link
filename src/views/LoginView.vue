<template>
  <div
    class="min-h-creen flex flex-col items-center justify-center bg-gray-100 gap-6"
  >
    <h1 class="text-4xl font-bold tect-gray-800">KinderLink</h1>
    <button
      v-if="!authStore.user"
      @click="authStore.login"
      class="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700"
    >
      Iniciar Sesion con Google
    </button>
    <div v-else class="text-center space-y-4">
      <p class="text-xl">Hola, {{ authStore.userProfile?.displayName }}</p>
      <p class="text-gray-600">
        <span class="font-bold uppercase text-purple-600">
          Tu Rol Actual es: {{ authStore.userProfile?.role }}
        </span>
      </p>

      <div
        class="p-6 bg-white rounded shadow space-y-2 border border-orange-200"
      >
        <h3 class="font-bold text-orange-600 mb-2">
          🛠️ Zona de Desarrollo (Seed)
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Elige qué quieres ser para probar:
        </p>

        <div class="flex gap-4 justify-center">
          <button
            @click="setMyRole('profesor')"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Convertirme en Profe 🍎
          </button>
          <button
            @click="setMyRole('apoderado')"
            class="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Convertirme en Apoderado 🏡
          </button>
        </div>
      </div>

      <button
        @click="authStore.logout"
        class="text-red-500 underline text-sm mt-4"
      >
        Salir
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
//Stores
import { useAuthStore } from "../stores/auth";
//Firebase
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
//VueRouter
import { useRouter } from "vue-router";

//Router
const router = useRouter();

//Stores
const authStore = useAuthStore();

//Cambiar rol manualmente para probar
const setMyRole = async (role: "profesor" | "apoderado") => {
  if (!authStore.user) return "inicia sesion primero";

  await updateDoc(doc(db, "users", authStore.user.uid), { role });

  if (authStore.userProfile) {
    authStore.userProfile.role = role;
  }

  if (role === "profesor") {
    router.push("/profesores");
  } else {
    router.push("/apoderados");
  }
};
</script>
