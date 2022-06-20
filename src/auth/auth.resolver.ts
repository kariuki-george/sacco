import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { LoginResponse } from './res/login.res';

@Resolver('auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => LoginResponse)
  async login(
    @Args('loginDto') loginDto: LoginDto,
    @Context() context,
  ): Promise<LoginResponse> {
    return this.authService.login(context.user as User);
  }
}
