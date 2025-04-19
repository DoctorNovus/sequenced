import { Controller, Get, Inject, Middleware, Patch } from "@outwalk/firefly";
import { UserService } from "./user.service";
import { session } from "@/_middleware/session";
import { Request } from "express";
import { User } from "./user.entity";

@Controller()
@Middleware(session)
export class UserController {

    @Inject()
    userService: UserService;

    @Get()
    async getUser({ session }: Request): Promise<User> {
        return this.userService.getUserById(session.user.id);
    }

    @Patch()
    async updateName({ session, body }: Request): Promise<User> {
        return this.userService.updateUser(session.user.id, body);
    }

    @Get("/synced")
    async getSynced({ session }: Request): Promise<boolean> {
        return (await this.userService.getUserById(session.user.id)).synced;
    }
}