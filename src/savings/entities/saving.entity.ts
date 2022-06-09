import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Bank } from "../../bank/entities/bank.entity";
import { User } from "../../users/entities/user.entity";

@Schema()
export class Saving {
    @Prop()
    name:string
    @Prop()
    amountSaved: number
    @Prop()
    amountAimed: number
    @Prop({
        type: Boolean, default: false
    })
    frozen: boolean
    @Prop({type: mongoose.Schema.Types.ObjectId,ref: "User"})
    userId: User
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref:"Bank" }
    )
    bankId: Bank

}
