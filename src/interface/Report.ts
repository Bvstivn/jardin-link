export interface Report {
    id?: string;
    studentId: string;
    authorId: string;
    title: string;
    content: string;
    type: 'Diario' | 'Incidente' | 'Evaluacion';
    createdAt: number; //Timestamp
}