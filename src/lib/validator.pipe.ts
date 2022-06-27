import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';

export class GraphQlValidation extends ValidationPipe {
  public async transform(
    value,
    metadata: ArgumentMetadata,
  ): Promise<any | ValidationErrorResponse> {
    try {
      return await super.transform(value, metadata);
    } catch (e) {
      return new  UserInputError(e.message || e.response.mesage)
    }
  }
}

@ObjectType()
class ValidationErrorResponse {
  @Field(() => String)
  error: string;
  @Field(() => String)
  type: string;
}
