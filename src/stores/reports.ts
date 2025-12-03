//Pinia
import { defineStore } from "pinia";
//Vue
import { ref } from "vue";
//Firebase
import {
    collection,
    addDoc,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { db } from "../firebase/config";
//Auth
import { useAuthStore } from "./auth";
//Interfaces
import type { Report } from "../interface/Report";

export const useReportsStore = defineStore("reports", () => {
    
    const reports = ref<Report[]>([]);
    const loading = ref(false);

    //Cear informe
    const createReport = async (reportData: Omit<Report, "id" | "authorId" | "createdAt">) => {
        const authStore = useAuthStore();
        if(!authStore.user) return;

        loading.value = true;
        try {
            const newReport: Report = {
                ...reportData,
                authorId: authStore.user.uid,
                createdAt: Date.now()
            }

            const docRef = await addDoc(collection(db, "reports"), newReport);

            return docRef.id;
        } catch (error) {
            console.log("Error al crear informe", error);
        }finally{
            loading.value = false;
        }
    };

    //Leer informes niño
    const fetchReportsByStudent = async (studentId: string) => {
        loading.value = true;
        reports.value = [];
        try {
            const q = query(collection(db, "reports"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            reports.value = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Report[];

            //Ordenarlos por fecha
            reports.value.sort((a, b) => b.createdAt - a.createdAt);
        } catch (error) {
            console.log("Error obteniendo informes", error);
        }finally{
            loading.value = false;
        }
    }

    return {
        reports,
        loading,
        createReport,        
        fetchReportsByStudent
    }
});