import { UserService } from "@/user/user.service";
import { Controller, Get, Inject, Post } from "@outwalk/firefly";
import { Unauthorized } from "@outwalk/firefly/errors";
import { AuthService } from "./auth.service";

import { Request } from "express";

export type SessionRequest = Request & {
    session: {
        user: {
            id: string;
            first: string
        },
        destroy?: CallableFunction
    }
}

export function session(req: SessionRequest, res: Response, next) {
    if (!req.session.user) return new Unauthorized("Not Logged In");
    next();
}

@Controller()
export class AuthController {

    @Inject() authService: AuthService;
    @Inject() userService: UserService;

    @Get("/")
    async getAuth(req, res) {
        if (!req.session.user)
            return new Unauthorized("Not Logged In");

        return { message: "Logged In" };
    }

    @Post("/login")
    async loginToSystem(req: SessionRequest, res: Response, next) {
        const { email, password } = req.body;

        const validation = await this.authService.validatePassword(email, password);

        if (validation) {
            const user = await this.userService.getUserByEmail(email);
            req.session.user = { id: user.id, first: user.first };
        } else {
            return new Unauthorized("Incorrect Email/Password Combo.");
        }
    }

    @Post("/register")
    async registerInSystem(req: SessionRequest): Promise<void> {
        const { first, last, email, password } = req.body;

        const user = await this.userService.createUser(first, last, email, password);
        req.session.user = { id: user.id, first: user.first };
    }

    @Post("/logout")
    async logout(req: SessionRequest) {
        req.session.destroy(() => { });
    }

}