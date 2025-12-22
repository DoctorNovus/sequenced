import { Controller, Get, Inject, Middleware, Patch, Post } from "@outwalk/firefly";
import { UserService } from "./user.service";
import { session } from "@/_middleware/session";
import { Request } from "express";
import { User } from "./user.entity";
import { BadRequest } from "@outwalk/firefly/errors";

@Controller()
@Middleware(session)
export class UserController {

    @Inject()
    userService: UserService;

    @Get()
    async getUser({ session }: Request): Promise<User | null> {
        return this.userService.getUserById(session.user.id);
    }

    @Patch()
    async updateName({ session, body }: Request): Promise<User | null> {
        const { first, last, email } = body ?? {};

        if (!first && !last && !email) {
            throw new BadRequest("No profile fields provided.");
        }

        if (email && await this.userService.emailInUse(email, session.user.id)) {
            throw new BadRequest("Email already in use.");
        }

        return this.userService.updateUser(session.user.id, { first, last, email });
    }

    @Patch("/password")
    async changePassword({ session, body }: Request): Promise<User | null> {
        const { currentPassword, newPassword } = body ?? {};

        if (!currentPassword || !newPassword) {
            throw new BadRequest("Current and new passwords are required.");
        }

        return this.userService.changePassword(session.user.id, currentPassword, newPassword);
    }

    @Get("/export")
    async exportData({ session }: Request): Promise<{ user: User | null; tasks: any[] }> {
        return this.userService.exportUserData(session.user.id);
    }

    @Post("/delete")
    async deleteData({ session }: Request): Promise<{ deletedUser: boolean; removedFromTasks: number; deletedTasks: number }> {
        return this.userService.deleteUserData(session.user.id);
    }

    @Get("/synced")
    async getSynced({ session }: Request): Promise<boolean> {
        const user = await this.userService.getUserById(session.user.id);
        return user?.synced ?? false;
    }
}
