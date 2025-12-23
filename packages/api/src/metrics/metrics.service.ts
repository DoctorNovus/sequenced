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
        const tasks = await this.taskService.getTasksToday(userId);
        return { count: tasks.length };
    }

    async getTaskTomorrowCount(userId: string): Promise<{ count: number }> {
        const tasks = await this.taskService.getTasksTomorrow(userId);
        return { count: tasks.length };
    }

    async getTaskWeekCount(userId: string): Promise<{ count: number }> {
        const tasks = await this.taskService.getTasksWeek(userId);
        return { count: tasks.length };
    }

    async getTaskOverdueCount(userId: string): Promise<{ count: number }> {
        const tasks = await this.taskService.getTasksOverdue(userId);
        return { count: tasks.length };
    }
}
