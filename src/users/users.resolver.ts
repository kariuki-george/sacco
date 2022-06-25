import {  UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { AdminAuthGuard } from 'src/auth/guards/admin-guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { createUserResponse } from './res/createUser.res';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(
    @Args('createUserDto') createUserDto: CreateUserDto,
  ): Promise<createUserResponse> {
    return this.usersService.create(createUserDto);
  }
  @Mutation(() => User)
  createAdmin(@Args('createAdminDto') createAdminDto: CreateUserDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @UseGuards(JwtAuthGuard)
  @Query(()=>Int)
  getUsersTotal():Promise<number>{
    return this.usersService.getUsersTotal()
  }



  @UseGuards(AdminAuthGuard)
  @Query(() => [User])
  getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
