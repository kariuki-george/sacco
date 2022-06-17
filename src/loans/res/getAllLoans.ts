import { Field, ObjectType } from "@nestjs/graphql";
import { Guarantor } from "../entities/guarantor.entity";
import { Loan } from "../entities/loan.entity";

@ObjectType()
export class GetAllLoansResponse{
    @Field(()=>[Loan])
    loans: Loan[]
    @Field(()=>[Guarantor])
    guarantorLoans: Guarantor[]
}
