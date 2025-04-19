import { Injectable } from "@outwalk/firefly";
import { BadRequest, NotFound } from "@outwalk/firefly/errors";
import { User } from "./user.entity";
import bcrypt from "bcrypt";

@Injectable()
export class UserService {

    async createUser(data: Partial<User>): Promise<User> {
        if (await User.exists({ email: data.email }).exec()) {
            throw new BadRequest("Email Already Exists.");
        }

        return User.create(data);
    }

    async getUserById(id: string): Promise<User> {
        const user = await User.findById(id).lean<User>().exec();
        if (!user) throw new NotFound("The user could not be found.", { id });

        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await User.findOne({ email }).lean<User>().exec();
        if (!user) throw new NotFound("The user could not be found.", { email });

        return user;
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        return User.findByIdAndUpdate(id, data).lean<User>().exec();
    }

    async validatePassword(id: string, password: string): Promise<boolean> {
        const user = await User.findById(id).select("password").lean<User>().exec();
        return bcrypt.compare(password, user.password);
    }
}