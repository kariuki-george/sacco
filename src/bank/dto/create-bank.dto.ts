import mongoose from "mongoose";

export class CreateBankDto {
        default: boolean;
        
        type: string;
        
        amount: number;
        
        accountId: mongoose.Schema.Types.ObjectId;
     
}
