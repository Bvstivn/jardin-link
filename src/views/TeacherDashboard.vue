<template>
  <div class="min-h-screen bg-gray-50 p-6 relative">
    <header
      class="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-bold text-blue-800">🍎 Sala de Profesores</h1>
        <p class="text-gray-500 text-sm">
          Profesor: {{ authStore.user?.displayName }}
        </p>
      </div>
      <button
        @click="authStore.logout"
        class="text-red-500 border border-red-200 px-4 py-2 rounded hover:bg-red-50"
      >
        Cerrar Sesión
      </button>
    </header>

    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-1 bg-white p-6 rounded-lg shadow h-fit">
        <h2 class="text-lg font-bold mb-4 text-gray-700">
          📝 Matricular Alumno
        </h2>
        <form @submit.prevent="handleAddStudent" class="space-y-4">
          <input
            v-model="newName"
            class="w-full p-2 border rounded"
            placeholder="Nombre"
            required
          />
          <input
            v-model="newLastName"
            class="w-full p-2 border rounded"
            placeholder="Apellido"
            required
          />
          <select v-model="newLevel" class="w-full p-2 border rounded">
            <option>Sala Cuna</option>
            <option>Nivel Medio</option>
            <option>Pre-Kinder</option>
          </select>
          <button
            type="submit"
            :disabled="studentStore.loading"
            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold disabled:opacity-50"
          >
            {{ studentStore.loading ? "Guardando..." : "Matricular" }}
          </button>
        </form>
      </div>

      <div class="md:col-span-2">
        <h2 class="text-lg font-bold mb-4 text-gray-700">🏫 Lista del Curso</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="student in studentStore.students"
            :key="student.id"
            class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500"
          >
            <div class="flex justify-between">
              <h3 class="font-bold text-lg">
                {{ student.firstName }} {{ student.lastName }}
              </h3>
              <span
                class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full h-fit"
                >{{ student.level }}</span
              >
            </div>
            <button
              @click="openReportModal(student)"
              class="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium text-sm transition"
            >
              + Redactar Informe
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
      >
        <div
          class="bg-blue-600 p-4 flex justify-between items-center text-white"
        >
          <h3 class="font-bold">
            Informe para {{ selectedStudent?.firstName }}
          </h3>
          <button
            @click="showModal = false"
            class="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1"
              >Tipo de Informe</label
            >
            <div class="flex gap-2">
              <button
                type="button"
                @click="reportType = 'Diario'"
                :class="
                  reportType === 'Diario'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'border-gray-200'
                "
                class="flex-1 py-1 border rounded text-sm text-center"
              >
                Diario
              </button>
              <button
                type="button"
                @click="reportType = 'Evaluacion'"
                :class="
                  reportType === 'Evaluacion'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'border-gray-200'
                "
                class="flex-1 py-1 border rounded text-sm text-center"
              >
                Evaluación
              </button>
              <button
                type="button"
                @click="reportType = 'Incidente'"
                :class="
                  reportType === 'Incidente'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'border-gray-200'
                "
                class="flex-1 py-1 border rounded text-sm text-center"
              >
                Incidente
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-600">Título</label>
            <input
              v-model="reportTitle"
              type="text"
              class="w-full p-2 border rounded"
              placeholder="Ej: Comió toda su comida"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-600">Detalle</label>
            <textarea
              v-model="reportContent"
              rows="4"
              class="w-full p-2 border rounded"
              placeholder="Escribe aquí los detalles..."
            ></textarea>
          </div>
        </div>

        <div class="p-4 bg-gray-50 flex justify-end gap-2">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmitReport"
            :disabled="reportStore.loading"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
          >
            {{ reportStore.loading ? "Enviando..." : "Enviar Informe" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useStudentsStore } from "../stores/students";
import { useReportsStore } from "../stores/reports"; // Importamos el nuevo store
import type { Student } from "../interface/Student";

const authStore = useAuthStore();
const studentStore = useStudentsStore();
const reportStore = useReportsStore();

// Estado para matricular alumno
const newName = ref("");
const newLastName = ref("");
const newLevel = ref("Nivel Medio");

// Estado para el MODAL de informe
const showModal = ref(false);
const selectedStudent = ref<Student | null>(null);
const reportTitle = ref("");
const reportContent = ref("");
const reportType = ref<"Diario" | "Incidente" | "Evaluacion">("Diario");

onMounted(() => {
  studentStore.fetchAllStudents();
});

// Matricular
const handleAddStudent = async () => {
  if (!newName.value || !newLastName.value) return;
  await studentStore.addStudent({
    firstName: newName.value,
    lastName: newLastName.value,
    level: newLevel.value,
    apoderadoId: "ID_DEL_PADRE_PENDIENTE",
  });
  newName.value = "";
  newLastName.value = "";
};

// Abrir Modal
const openReportModal = (student: Student) => {
  selectedStudent.value = student;
  showModal.value = true;
  // Limpiamos campos
  reportTitle.value = "";
  reportContent.value = "";
};

// Enviar Informe
const handleSubmitReport = async () => {
  if (!selectedStudent.value || !reportTitle.value) return;

  await reportStore.createReport({
    studentId: selectedStudent.value.id!,
    title: reportTitle.value,
    content: reportContent.value,
    type: reportType.value,
  });

  showModal.value = false; // Cerrar modal
};
</script>
