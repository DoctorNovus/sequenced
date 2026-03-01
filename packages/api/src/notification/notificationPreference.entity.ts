import { Entity, Index, Model, Prop } from "@/_lib/mongoose";
import { User } from "@/user/user.entity";

@Entity({ timestamps: true })
@Index({ user: 1 }, { unique: true })
export class NotificationPreference extends Model {
    id: string;

    @Prop({ type: User, required: true })
    user: User | string;

    @Prop({ type: Boolean, default: true })
    pushEnabled: boolean;

    @Prop({ type: Boolean, default: true })
    remindersEnabled: boolean;

    @Prop({ type: String, enum: ["off", "daily", "weekly"], default: "daily" })
    summaryCadence: "off" | "daily" | "weekly";

    @Prop({ type: String, default: "08:00" })
    summaryTime: string;

    @Prop({ type: Number, min: 0, max: 6, default: 1 })
    weeklyDay: number;

    @Prop({ type: Number, default: 0 })
    utcOffsetMinutes: number;
}
