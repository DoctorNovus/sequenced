import { Entity, Model, Prop } from "@/_lib/mongoose";
import mongoose from "mongoose";
import { SubTask } from "./subtask.entity";
import { User } from "../user/user.entity";

@Entity()
export class Task extends Model {

    id: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, default: "" })
    description: string;

    /** this should be changed to a Date object, but current filtering logic is using regex on a string */
    @Prop({ type: String, default: () => new Date().toString() })
    date: string;

    @Prop({ type: mongoose.Schema.Types.Mixed, default: false })
    done: boolean | string[];

    @Prop({ type: String, default: "" })
    repeater: string;

    @Prop({ type: String, default: "" })
    reminder: string;

    @Prop({ type: String, default: "" })
    type: string;

    /** (git blame Hiro) - figure out what this actually does */
    @Prop({ type: Boolean, default: false })
    accordion: boolean;

    @Prop({ type: Number, default: 0 })
    priority: number;

    @Prop({ type: [SubTask], default: [] })
    subtasks: SubTask[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] })
    users: (User | string)[];

    @Prop({ type: [String], default: [] })
    tags: string[];
}
