export interface SubTask {
    id?: string;
    title: string;
    description?: string;
    /** currently stored as string for legacy reasons */
    date: string;
    done: boolean | string[];
    repeater?: string;
    reminder?: string;
    type?: string;
    accordion?: boolean;
    priority?: number;
    tags?: string[];
    subtasks?: SubTask[];
}
