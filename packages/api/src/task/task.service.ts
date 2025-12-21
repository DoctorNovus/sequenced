import { Injectable } from "@outwalk/firefly";
import { Task } from "./task.entity";
import { User } from "@/user/user.entity";
import { UpdateQuery } from "mongoose";
import mongoose from "mongoose";

@Injectable()
export class TaskService {

    normalizeTags(tags?: string[] | Array<{ title?: string }>): string[] | undefined {
        if (!Array.isArray(tags)) return undefined;

        const normalized = tags
            .map((tag) => {
                if (typeof tag === "string") return tag.trim().toLowerCase();
                if (tag && typeof tag.title === "string") return tag.title.trim().toLowerCase();
                return "";
            })
            .filter((tag) => tag.length > 0);

        return Array.from(new Set(normalized));
    }

    async addTask(data: Partial<Task>): Promise<Task> {
        const tags = this.normalizeTags(data.tags);
        return Task.create({
            ...data,
            ...(tags ? { tags } : {}),
        });
    }

    async addTasks(data: Partial<Task>[]): Promise<Task[]> {
        const withTags = data.map((task) => {
            const tags = this.normalizeTags(task.tags);
            return { ...task, ...(tags ? { tags } : {}) };
        });

        return Task.insertMany(withTags);
    }

    async updateTask(id: string, data: Partial<Task> | UpdateQuery<Task>): Promise<Task | null> {
        const tags = this.normalizeTags((data as Partial<Task>)?.tags);

        const update: Partial<Task> | UpdateQuery<Task> = {
            ...(data as Partial<Task>),
            ...(tags ? { tags } : {}),
        };

        // Explicitly drop any subtasks payloads
        (update as any).subtasks = undefined;

        return Task.findByIdAndUpdate(id, update).lean<Task>().exec();
    }

    async getTasksByUserId(userId: string, tags: string[] = []): Promise<Task[]> {
        const normalizedTags = this.normalizeTags(tags) ?? [];
        const query: Record<string, unknown> = { users: userId };

        if (normalizedTags.length > 0) {
            query.tags = { $all: normalizedTags };
        }

        return Task.find(query)
            .populate({ path: "users", select: "first last email id" })
            .lean<Task[]>()
            .exec();
    }

    getTaskDateFormat(date: Date): RegExp {
        const year = `${date.getFullYear()}`;
        const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        const day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate();

        return new RegExp(`${year}-${month}-${day}`);
    }

    getTaskDateWeekFormat(date: Date): RegExp {
        let dates = `^(?:`;

        for (let i = 0; i < 7; i++) {
            const year = `${date.getFullYear()}`;
            const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
            const day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate();

            dates += `${year}-${month}-${day}`;
            if (i != 6) dates += "|";

            date.setDate(date.getDate() + 1);
        }

        dates += ")";

        return new RegExp(dates);
    }

    async getTasksToday(userId: string): Promise<Task[]> {
        const todayFormat = this.getTaskDateFormat(new Date());

        return Task.find({ users: userId, date: { $regex: todayFormat }, done: false })
            .populate({ path: "users", select: "first last email id" })
            .lean<Task[]>()
            .exec();
    }

    async getTasksTomorrow(userId: string): Promise<Task[]> {
        const today = new Date();
        today.setDate(today.getDate() + 1);

        const tomorrowFormat = this.getTaskDateFormat(today);

        return Task.find({ users: userId, date: { $regex: tomorrowFormat }, done: false })
            .populate({ path: "users", select: "first last email id" })
            .lean<Task[]>()
            .exec();
    }

    async getTasksWeek(userId: string): Promise<Task[]> {
        const today = new Date();
        const format = this.getTaskDateWeekFormat(today);

        return Task.find({ users: userId, date: { $regex: format }, done: false })
            .populate({ path: "users", select: "first last email id" })
            .lean<Task[]>()
            .exec();
    }

    async getTasksOverdue(userId: string): Promise<Task[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasks = await Task.find({ users: userId, done: false })
            .populate({ path: "users", select: "first last email id" })
            .lean<Task[]>()
            .exec();

        return tasks.filter((task) => {
            if (!task.date) return false;
            const taskDate = new Date(task.date);
            const time = taskDate.getTime();
            if (Number.isNaN(time) || time <= 0) return false;
            return taskDate < today;
        });
    }

    async getTasksIncomplete(userId: string): Promise<Task[]> {
        return Task.find({ users: userId, done: false })
            .populate({ path: "users", select: "first last email id" })
            .sort({ priority: -1 })
            .lean<Task[]>()
            .exec();
    }

    async deleteTask(id: string): Promise<Task | null> {
        return Task.findByIdAndDelete(id).lean<Task>().exec();
    }

    async getUsersByTaskId(id: string): Promise<User[] | null> {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return [];
        const populated = await Task.findById(id)
            .select("users")
            .populate({ path: "users", select: "first last email id" })
            .lean<{ users: User[] }>()
            .exec();

        return populated?.users ?? [];
    }
}
