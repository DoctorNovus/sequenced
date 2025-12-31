import { Entity, Model, Prop, Index } from "@/_lib/mongoose";
import { User } from "@/user/user.entity";

@Entity({ timestamps: true })
@Index({ tokenHash: 1 }, { unique: true })
export class PasswordReset extends Model {

    id: string;

    @Prop({ type: String, required: true })
    tokenHash: string;

    @Prop({ type: Date, required: true, expires: 0 })
    expiresAt: Date;

    @Prop({ type: Boolean, default: false })
    used: boolean;

    @Prop({ type: User, required: true })
    user: User;
}
