import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export enum userRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@ObjectType()
@Schema()
export class User {
  @Field(() => String)
  _id: Types.ObjectId;
  @Prop()
  @Field(() => String)
  firstName: string;
  @Field(() => String)
  @Prop()
  lastName: string;
  @Field(() => String)
  @Prop({ unique: true })
  email: string;
  @Prop({ nullable: true })
  password?: string;
  @Prop({ nullable: true, default: userRole.MEMBER })
  role?: userRole;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
