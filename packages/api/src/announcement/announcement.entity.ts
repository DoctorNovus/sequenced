import { Entity, Model, Prop } from "@/_lib/mongoose";
import mongoose from "mongoose";
import { User } from "@/user/user.entity";

@Entity({ timestamps: true })
export class Announcement extends Model {
    id: string;

    @Prop({ type: String, required: true, trim: true })
    title: string;

    @Prop({ type: String, required: true, trim: true })
    body: string;

    @Prop({ type: Date, default: () => new Date() })
    date: Date;

    @Prop({ type: String, default: "", trim: true })
    ctaTitle?: string;

    @Prop({ type: String, default: "", trim: true })
    ctaAction?: string;

    @Prop({ type: Boolean, default: true })
    active: boolean;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] })
    viewedBy?: (User | string)[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] })
    clickedBy?: (User | string)[];
}
