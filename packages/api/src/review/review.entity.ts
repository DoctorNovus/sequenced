import { Entity, Model, Prop } from "@/_lib/mongoose";
import mongoose from "mongoose";
import { User } from "@/user/user.entity";

@Entity({ timestamps: true })
export class Review extends Model {
    id: string;

    @Prop({ type: Number, required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ type: String, default: "" })
    message: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false })
    user?: User | string;

    @Prop({ type: String, default: "" })
    userEmail?: string;
}
