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
        const todayFormat = this.taskService.getTaskDateFormat(new Date());
        const count = await Task.countDocuments({ users: userId, date: { $regex: todayFormat }, done: false }).exec();

        return { count };
    }

    async getTaskTomorrowCount(userId: string): Promise<{ count: number }> {
        const today = new Date();
        today.setDate(today.getDate() + 1);

        const tomorrowFormat = this.taskService.getTaskDateFormat(today);
        const count = await Task.countDocuments({ users: userId, date: { $regex: tomorrowFormat }, done: false }).exec();

        return { count };
    }

    async getTaskWeekCount(userId: string): Promise<{ count: number }> {
        const format = this.taskService.getTaskDateWeekFormat(new Date());
        const count = await Task.countDocuments({ users: userId, date: { $regex: format }, done: false }).exec();

        return { count };
    }

    async getTaskOverdueCount(userId: string): Promise<{ count: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasks = await Task.find({ users: userId, done: false }).lean<Task[]>().exec();
        const count = tasks.filter((task) => {
            if (!task.date) return false;
            const taskDate = new Date(task.date);
            if (Number.isNaN(taskDate.getTime())) return false;
            return taskDate < today;
        }).length;

        return { count };
    }
}
