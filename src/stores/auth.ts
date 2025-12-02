//Pinia
import { defineStore } from 'pinia';
//Vue
import { ref } from 'vue';
//Firebase
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
//Interfaces
import type { UserProfile } from '../interface/UserProfile';
//VueRouter
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const userProfile = ref<UserProfile | null>(null);
    const router = useRouter();
    const loading = ref(false);

    //Login
    const login = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            user.value = result.user;
            await fetchUserProfile(result.user);
        } catch (error) {
            console.log(error);
        }finally{
            loading.value = false;
        }
    }

    //Obtener prfil de firestore
    const fetchUserProfile = async (firebabaseUser: any) => {
        const userRef = doc(db, 'users', firebabaseUser.uid);
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            //Guardamos perfil y rol
            userProfile.value = userSnap.data() as UserProfile;            
        }else{
            //Si es nuevo, lo creamos con un rol por defecto
            const newUser: UserProfile = {
                uid: firebabaseUser.uid,
                email: firebabaseUser.email,
                displayName: firebabaseUser.displayName,
                role: 'apoderado', // Rol por defecto
            }
            await setDoc(userRef, newUser);
            userProfile.value = newUser;
        }
    }

    //Logout
    const logout = async () => {
        await signOut(auth);
        user.value = null;
        userProfile.value = null;
        router.push('/');
    }

    //Redireccionar por rol
    const redirectBasedOnRole = () => {
        if(!userProfile.value) return router.push('/');
        if(userProfile.value.role === 'profesor'){
            router.push('/profesores');
        }else if(userProfile.value.role === 'apoderado'){
            router.push('/apoderados');
        }else{
            router.push('/');
        }
    }

    //Inicializar
    const initAuth = () => {
        return new Promise<void>((resolve)  =>{
            onAuthStateChanged(auth, async (firebaseUser) => {
                if(firebaseUser){
                    user.value = firebaseUser;
                    await fetchUserProfile(firebaseUser);
                }else{
                    user.value = null;
                    userProfile.value = null;
                }
                loading.value = false;
                resolve();
            });
        });
    }

    return {
        user, 
        userProfile,
        loading,
        login,
        logout,
        initAuth
    }
});