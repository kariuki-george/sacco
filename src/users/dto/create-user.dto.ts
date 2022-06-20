import { Field, InputType, Int } from "@nestjs/graphql";
import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator";

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  @Field()
  lastName: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Field()
  password: string;
  @Field(()=>String)
  @IsPhoneNumber()
  phoneNumber:string


  
}
