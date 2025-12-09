import { Controller, Get, Inject, Middleware } from "@outwalk/firefly";
import { MetricsService } from "./metrics.service";
import { session } from "@/_middleware/session";
import { Request } from "express";

@Controller()
@Middleware(session)
export class MetricsController {

    @Inject()
    metricsService: MetricsService;

    @Get("/tasks")
    async getTasksCount({ session }: Request): Promise<{ count: number }> {
        return this.metricsService.getTaskCount(session.user.id);
    }

    @Get("/tasks/today")
    async getTasksToday({ session }: Request): Promise<{ count: number }> {
        return this.metricsService.getTaskTodayCount(session.user.id);
    }

    @Get("/tasks/tomorrow")
    async getTasksTomorrow({ session }: Request): Promise<{ count: number }> {
        return this.metricsService.getTaskTomorrowCount(session.user.id);
    }

    @Get("/tasks/week")
    async getTasksWeek({ session }: Request): Promise<{ count: number }> {
        return this.metricsService.getTaskWeekCount(session.user.id);
    }

    @Get("/tasks/overdue")
    async getTasksOverdue({ session }: Request): Promise<{ count: number }> {
        return this.metricsService.getTaskOverdueCount(session.user.id);
    }
}
