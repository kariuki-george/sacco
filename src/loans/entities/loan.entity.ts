import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "../../users/entities/user.entity";


@Schema()
export class Loan {
    @Prop()
    amount: number
    @Prop()
    amountPaid: number
    @Prop({type: mongoose.Schema.Types.ObjectId,ref: "User"})
    userId: User
    
}
