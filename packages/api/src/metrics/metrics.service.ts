import { Injectable, Inject } from "@outwalk/firefly";
import { TaskService } from "@/task/task.service";
import { Task } from "@/task/task.entity";

@Injectable()
export class MetricsService {

    @Inject()
    taskService: TaskService;

    async getTaskCount(userId: string): Promise<{ count: number }> {
        return { count: await Task.countDocuments({ users: userId }).exec() };
    }

    async getTaskTodayCount(userId: string): Promise<{ count: number }> {
        const todayFormat = await this.taskService.getTaskDateFormat(new Date());
        const count = await Task.countDocuments({ users: userId, date: { $regex: todayFormat }, done: false }).exec();

        return { count };
    }

    async getTaskTomorrowCount(userId: string): Promise<{ count: number }> {
        const today = new Date();
        today.setDate(today.getDate() + 1);

        const tomorrowFormat = await this.taskService.getTaskDateFormat(today);
        const count = await Task.countDocuments({ users: userId, date: { $regex: tomorrowFormat }, done: false }).exec();

        return { count };
    }

    async getTaskWeekCount(userId: string): Promise<{ count: number }> {
        const format = await this.taskService.getTaskDateWeekFormat(new Date());
        const count = await Task.countDocuments({ users: userId, date: { $regex: format }, done: false }).exec();

        return { count };
    }

    async getTaskOverdueCount(userId: string): Promise<{ count: number }> {
        const format = { $lt: new Date(), $gt: new Date(0) };
        const count = await Task.countDocuments({ users: userId, date: format, done: false }).exec();

        return { count };
    }
}