import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BankService } from 'src/bank/bank.service';
import { CreateSavingDto } from 'src/savings/dto/create-saving.dto';
import { SavingsService } from 'src/savings/savings.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userService: Model<User>,
    private readonly savingsService: SavingsService,
    private readonly bankService: BankService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userService(createUserDto);

      //initialize the default savings account
      //read the sacco account bank id
      const saccoBank = await this.bankService.findOneWithNameAndDefault(
        'sacco',
        true,
      );

      const user = await newUser.save();
    
      const createSavingDto: CreateSavingDto = {
         amountSaved: 0,
        name: 'sacco',

        userId: user._id,
        
        amountAimed: 0,
        bankId: saccoBank._id,
        frozen: false,
      };
      await this.savingsService.create(createSavingDto);
      return user;
    } catch (error) {
      console.log(error);
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
