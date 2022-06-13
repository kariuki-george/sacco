import {  UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { AdminAuthGuard } from 'src/auth/guards/admin-guard';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(
    @Args('createUserDto') createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.create(createUserDto);
  }
  @Mutation(() => User)
  createAdmin(@Args('createAdminDto') createAdminDto: CreateUserDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @UseGuards(AdminAuthGuard)
  @Query(() => [User])
  getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
