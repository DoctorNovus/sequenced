import { Injectable } from "@outwalk/firefly";
import { BadRequest } from "@outwalk/firefly/errors";
import { User } from "./user.entity";
import bcrypt from "bcrypt";
import { Task } from "@/task/task.entity";
import crypto from "crypto";

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

    async touchLastLoggedIn(id: string): Promise<void> {
        await User.findByIdAndUpdate(id, { lastLoggedIn: new Date() }).exec();
    }

    async updateUser(id: string, data: Partial<User>): Promise<User | null> {
        return User.findByIdAndUpdate(id, data).lean<User>().exec();
    }

    async emailInUse(email: string, excludeId?: string): Promise<boolean> {
        const query: any = { email };
        if (excludeId) query._id = { $ne: excludeId };
        return Boolean(await User.exists(query).exec());
    }

    async validatePassword(id: string, password: string): Promise<boolean> {
        const user = await User.findById(id).select("password").lean<User>().exec();
        if (!user?.password) return false;
        return bcrypt.compare(password, user.password);
    }

    async changePassword(id: string, current: string, next: string): Promise<User | null> {
        const valid = await this.validatePassword(id, current);
        if (!valid) {
            throw new BadRequest("Current password is incorrect.");
        }

        return this.updateUser(id, { password: next });
    }

    async getApiKeys(id: string): Promise<Record<string, string>> {
        const user = await User.findById(id).select("apiKeys").lean<User>().exec();
        return user?.apiKeys ?? {};
    }

    async setApiKeys(id: string, apiKeys: Record<string, string>): Promise<Record<string, string>> {
        await User.findByIdAndUpdate(id, { apiKeys }).exec();
        return apiKeys;
    }

    async generateApiKey(id: string, name: string): Promise<{ name: string; value: string; apiKeys: Record<string, string> }> {
        const user = await User.findById(id).select("apiKeys").lean<User>().exec();
        const apiKeys = user?.apiKeys ?? {};
        const value = crypto.randomBytes(32).toString("hex");
        const nextKeys = { ...apiKeys, [name]: value };
        await User.findByIdAndUpdate(id, { apiKeys: nextKeys }).exec();
        return { name, value, apiKeys: nextKeys };
    }

    private sanitizeUser(user: any) {
        if (!user) return null;
        const { first, last, email, createdAt, updatedAt } = user;
        return { first, last, email, createdAt, updatedAt };
    }

    private sanitizeTask(task: any) {
        if (!task) return null;
        const {
            title,
            description,
            date,
            done,
            repeater,
            reminder,
            type,
            accordion,
            priority,
            group,
            tags,
            id
        } = task;
        return {
            id,
            title,
            description,
            date,
            done,
            repeater,
            reminder,
            type,
            accordion,
            priority,
            group,
            tags
        };
    }

    async exportUserData(id: string): Promise<{ user: any; tasks: any[] }> {
        const user = this.sanitizeUser(await this.getUserById(id));
        const tasksRaw = await Task.find({ users: id }).lean().exec();
        const tasks = tasksRaw.map((t) => this.sanitizeTask(t)).filter(Boolean);
        return { user, tasks };
    }

    async deleteUserData(id: string): Promise<{ deletedUser: boolean; removedFromTasks: number; deletedTasks: number }> {
        const pullResult = await Task.updateMany({ users: id }, { $pull: { users: id } }).exec();
        const cleanup = await Task.deleteMany({ users: { $size: 0 } }).exec();
        const deleted = await User.findByIdAndDelete(id).lean<User>().exec();

        return {
            deletedUser: Boolean(deleted),
            removedFromTasks: pullResult.modifiedCount ?? 0,
            deletedTasks: cleanup.deletedCount ?? 0
        };
    }
}
