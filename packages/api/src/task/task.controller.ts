import { Controller, Delete, Get, Inject, Middleware, Patch, Post } from "@outwalk/firefly";
import { BadRequest } from "@outwalk/firefly/errors";
import { UserService } from "@/user/user.service";
import { TaskService } from "./task.service";
import { User } from "@/user/user.entity";
import { Task } from "./task.entity";
import { session } from "@/_middleware/session";
import { Request } from "express";

@Controller()
@Middleware(session)
export class TaskController {

    @Inject()
    userService: UserService;

    @Inject()
    taskService: TaskService;

    @Get()
    async getTasks({ session }: Request): Promise<Task[]> {
        return this.taskService.getTasksByUserId(session.user.id);
    }

    @Get("/:id/users")
    async getUsers({ params }: Request): Promise<User[]> {
        return this.taskService.getUsersByTaskId(params.id);
    }


    @Get("/today")
    async getTasksToday({ session }: Request): Promise<Task[]> {
        return this.taskService.getTasksToday(session.user.id);
    }

    @Get("/tomorrow")
    async getTasksTomorrow({ session }: Request): Promise<Task[]> {
        return this.taskService.getTasksTomorrow(session.user.id);
    }

    @Get("/week")
    async getTasksWeek({ session }: Request): Promise<Task[]> {
        return this.taskService.getTasksWeek(session.user.id);
    }

    @Get("/overdue")
    async getTasksOverdue({ session }: Request): Promise<Task[]> {
        return this.taskService.getTasksOverdue(session.user.id);
    }

    @Get("/incomplete")
    async getTasksIncomplete({ session }: Request): Promise<Task[]> {
        return this.taskService.getTasksIncomplete(session.user.id);
    }

    @Post()
    async addTask({ session, body }: Request): Promise<Task> {
        return this.taskService.addTask({ ...body, users: [session.user.id] });
    }

    @Patch()
    async updateTask({ body }: Request): Promise<Task> {
        return this.taskService.updateTask(body.id, body);
    }

    @Delete()
    async deleteTask({ body }: Request): Promise<Task> {
        return this.taskService.deleteTask(body.id);
    }

    @Post("/invite")
    async inviteUser({ session, body }: Request): Promise<{ success: boolean }> {
        const user = await this.userService.getUserByEmail(body.email);
        if (user.id == session.user.id) throw new BadRequest("Cannot add yourself.");

        await this.taskService.updateTask(body.task.id, { $push: { users: user.id } });
        return { success: true };
    }

    @Delete("/:id/users/:email/remove")
    async removeUser({ session, params }: Request): Promise<{ success: boolean }> {
        const user = await this.userService.getUserByEmail(params.email);
        if (user.id == session.user.id) throw new BadRequest("Cannot delete yourself.");

        await this.taskService.updateTask(params.id, { $pull: { users: user.id } });
        return { success: true };
    }
}