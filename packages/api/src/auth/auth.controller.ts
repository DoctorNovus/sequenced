import { Controller, Get, Inject, Post } from "@outwalk/firefly";
import { BadRequest, Unauthorized } from "@outwalk/firefly/errors";
import { UserService } from "@/user/user.service";
import { User } from "@/user/user.entity";
import { Request } from "express";
import sendToWebhook from "@/logging/webhook";

@Controller()
export class AuthController {

    @Inject()
    userService: UserService;

    @Get("/")
    async getAuth({ session }: Request): Promise<{ message: string }> {
        if (!session.user) throw new Unauthorized("Not Logged In");
        return { message: "Logged In" };
    }

    @Post("/login")
    async loginToSystem(req: Request): Promise<User> {
        const { email, password } = req.body;

        const user = await this.userService.getUserByEmail(email);
        if (!user) throw new Unauthorized("Account not found. Please register an account.");

        if (!(await this.userService.validatePassword(user.id, password))) {
            throw new Unauthorized("Incorrect Email/Password Combo.");
        }

        req.session.user = { id: user.id, first: user.first };
        await this.userService.updateUser(user.id, { lastLoggedIn: new Date() });
        return user;
    }

    @Post("/register")
    async registerInSystem(req: Request): Promise<User> {
        const { first, last, email, password } = req.body;

        if (await this.userService.getUserByEmail(email)) {
            throw new BadRequest("Email Already Exists");
        }

        const user = await this.userService.createUser({ first, last, email, password, lastLoggedIn: new Date() });
        req.session.user = { id: user.id, first: user.first };

        sendToWebhook({
            embeds: [
                { title: "New User Has Registered", description: `**${first} ${last}** has registered with the email, **${email}**.`, timestamp: new Date() }
            ]
        });
        return user;
    }

    @Post("/loginAsUser")
    async loginAsUser(req: Request): Promise<User> {
        const { id } = req.body;

        const user = await this.userService.getUserById(req.session.user.id);
        if (!user || !user.developer) throw new Unauthorized("Not a Developer");

        const controlled = await this.userService.getUserById(id);
        if (!controlled) throw new Unauthorized("Account not found.");

        req.session.user = { id: controlled.id, first: user.first, isControlled: true };
        await this.userService.updateUser(controlled.id, { lastLoggedIn: new Date() });
        return controlled;
    }

    @Post("/logout")
    async logout(req: Request): Promise<{ message: string }> {
        if (!req.session.user) throw new Unauthorized("You are not logged in.");

        /* destroy the session and respond with a success message */
        await new Promise<void>((resolve, reject) => req.session.destroy((error) => {
            if (error) reject(error);
            else resolve();
        }));

        return { message: "success" };
    }

}
