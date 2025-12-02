export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'profesor' | 'apoderado';
    //Ids de los hijos
    childIds?: string[];
}