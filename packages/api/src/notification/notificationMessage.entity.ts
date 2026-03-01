import { Entity, Index, Model, Prop } from "@/_lib/mongoose";
import { User } from "@/user/user.entity";

@Entity({ timestamps: true })
@Index({ user: 1, scheduledFor: 1, deliveredAt: 1 })
@Index({ dedupeKey: 1 }, { unique: true, sparse: true })
export class NotificationMessage extends Model {
    id: string;

    @Prop({ type: User, required: true })
    user: User | string;

    @Prop({ type: User, required: false, default: null })
    createdBy?: User | string | null;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    body: string;

    @Prop({ type: String, default: "system" })
    type: "task-reminder" | "daily-summary" | "weekly-summary" | "developer-broadcast" | "system";

    @Prop({ type: String, default: "" })
    ctaAction?: string;

    @Prop({ type: Date, default: () => new Date() })
    scheduledFor: Date;

    @Prop({ type: Date, default: null })
    deliveredAt?: Date | null;

    @Prop({ type: String, required: false })
    dedupeKey?: string;
}
