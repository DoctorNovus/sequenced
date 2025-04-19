import { Injectable } from "@outwalk/firefly";
import { Task } from "./task.entity";
import { User } from "@/user/user.entity";

@Injectable()
export class TaskService {

    async addTask(data: Partial<Task>): Promise<Task> {
        return Task.create(data);
    }

    async updateTask(id: string, data: Partial<Task>): Promise<Task> {
        return Task.findByIdAndUpdate(id, data).lean<Task>().exec();
    }

    async getTasksByUserId(userId: string): Promise<Task[]> {
        return Task.find({ users: userId }).populate("subtasks").lean<Task[]>().exec();
    }

    async getTaskDateFormat(date: Date) {
        const year = `${date.getFullYear()}`;
        const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        const day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate();

        return new RegExp(`${year}-${month}-${day}`);
    }

    async getTaskDateWeekFormat(date: Date) {
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
            .populate("subtasks")
            .lean<Task[]>()
            .exec();
    }

    async getTasksTomorrow(userId: string): Promise<Task[]> {
        const today = new Date();
        today.setDate(today.getDate() + 1);

        const tomorrowFormat = this.getTaskDateFormat(today);

        return Task.find({ users: userId, date: { $regex: tomorrowFormat }, done: false })
            .populate("subtasks")
            .lean<Task[]>()
            .exec();
    }

    async getTasksWeek(userId: string): Promise<Task[]> {
        const today = new Date();
        const format = await this.getTaskDateWeekFormat(today);

        return Task.find({ users: userId, date: { $regex: format }, done: false })
            .populate("subtasks")
            .lean<Task[]>()
            .exec();
    }

    async getTasksOverdue(userId: string): Promise<Task[]> {
        const format = { $lt: new Date(), $gt: new Date(0) };

        return Task.find({ users: userId, date: format, done: false })
            .populate("subtasks")
            .lean<Task[]>()
            .exec();
    }

    async getTasksIncomplete(userId: string): Promise<Task[]> {
        return Task.find({ users: userId, done: false })
            .populate("subtasks")
            .sort({ priority: -1 })
            .lean<Task[]>()
            .exec();
    }

    async deleteTask(id: string): Promise<Task> {
        return Task.findByIdAndDelete(id).lean<Task>().exec();
    }

    async getUsersByTaskId(id: string): Promise<User[]> {
        return (await Task.findById(id).select("users").populate("users").exec()).users;
    }
}