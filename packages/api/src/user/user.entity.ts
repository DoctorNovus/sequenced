import { Entity, Model, Prop } from "@outwalk/firefly/mongoose";
import bcrypt from "bcrypt";

@Entity()
export class User extends Model {

    @Prop({ type: String, required: true })
    first: string;

    @Prop({ type: String, required: true })
    last: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String, select: false, set: (value) => bcrypt.hashSync(value, 10) })
    password: string;

    @Prop({ type: Boolean, default: false })
    developer: boolean;    
}