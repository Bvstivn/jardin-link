//Pinia
import { defineStore } from "pinia";
//Vue
import { ref } from "vue";
//Firebase
import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { db } from "../firebase/config";
//Interfaces
import type { Student } from "../interface/Student";

export const useStudentsStore = defineStore("students", () => {
    const students = ref<Student[]>([]);
    const loading = ref(false);

    //Matricular al alumno
    const addStudent = async (studentData: Omit<Student, "id">) => {
        loading.value = true;
        try {
            const docRef = await addDoc(collection(db, "students"), studentData);
            students.value.push({...studentData, id: docRef.id});
            alert("Alumno registrado exitosamente");
        } catch (error) {
            console.log("Error al registrar alumno", error);
        }finally{
            loading.value = false;
        }
    };

    //Obtener alumnos
    const fetchAllStudents = async () => {
        loading.value = true;
        try {
            const q = query(collection(db, "students"));
            const querySnapshot = await getDocs(q);

            students.value = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Student[];
        } catch (error) {
            console.log("Error obteniendo alumnos", error);
        }finally{
            loading.value = false;
        }
    }

    return {
        students,
        loading,
        addStudent,
        fetchAllStudents
    }
});