import { Injectable } from "@outwalk/firefly";
import { BadRequest } from "@outwalk/firefly/errors";
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

    async getUserById(id: string): Promise<User | null> {
        return User.findById(id).lean<User>().exec();
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return User.findOne({ email }).lean<User>().exec();
    }

    async updateUser(id: string, data: Partial<User>): Promise<User | null> {
        return User.findByIdAndUpdate(id, data).lean<User>().exec();
    }

    async validatePassword(id: string, password: string): Promise<boolean> {
        const user = await User.findById(id).select("password").lean<User>().exec();
        if (!user?.password) return false;
        return bcrypt.compare(password, user.password);
    }
}
