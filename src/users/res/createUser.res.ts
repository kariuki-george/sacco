import { Field, ObjectType } from '@nestjs/graphql';
import { Errorr } from 'src/lib/error.interface';
import { User } from '../entities/user.entity';

@ObjectType()
export class createUserResponse {
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => Errorr, { nullable: true })
  errors?: Errorr
}
