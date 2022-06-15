import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AccountsProducerService } from 'src/bull/accounts.producer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, userRole } from './entities/user.entity';
import * as argon from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userService: Model<User>,

    private readonly accountsQueueProducerService: AccountsProducerService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const hash = await argon.hash(password);

    try {
      const newUser = new this.userService({
        ...createUserDto,
        password: hash,
      });
      const user = await newUser.save();
      await this.accountsQueueProducerService.accountCreate(
        new Types.ObjectId(user._id),
      );
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password } = createUserDto;
      const hash = await argon.hash(password);

      const newUser = new this.userService({
        ...createUserDto,
        password: hash,
        role: userRole.ADMIN,
      });

      const user = await newUser.save();
      return user;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getUsersTotal(): Promise<number> {
    const users = await this.userService.countDocuments({}).exec();
    return users - 1;
  }

  findAll(): Promise<User[]> {
    return this.userService.find().exec();
  }
  findUserByEmail(email: string): Promise<User | null> {
    return this.userService.findOne({ email }).exec();
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
