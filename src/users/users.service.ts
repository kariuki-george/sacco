import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsProducerService } from 'src/bull/accounts.producer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userService: Model<User>,
  
    private readonly accountsQueueProducerService: AccountsProducerService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userService(createUserDto);
      const user = await newUser.save();
      
      await this.accountsQueueProducerService.accountCreate(user._id);
      return user;

      
    } catch (error) {
     
      throw new InternalServerErrorException(error);
    }
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userService(createUserDto);

    return newUser.save();
  }

  findAll(): Promise<User[]> {
    return this.userService.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
