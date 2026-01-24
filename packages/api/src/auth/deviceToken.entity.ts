import { Entity, Model, Prop, Index } from "@/_lib/mongoose";
import { User } from "@/user/user.entity";

@Entity({ timestamps: true })
@Index({ tokenHash: 1 }, { unique: true })
export class DeviceToken extends Model {

    id: string;

    @Prop({ type: String, required: true })
    tokenHash: string;

    @Prop({ type: Date, required: true, expires: 0 })
    expiresAt: Date;

    @Prop({ type: User, required: true })
    user: User;

    @Prop({ type: String, default: "Siri" })
    label?: string;
}
