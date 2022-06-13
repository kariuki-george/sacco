import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, userRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginResponse } from './res/login.res';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return null;
    }
    if (user.password === password) {
      return user;
    }
    return null;
  }
  login(user: User): LoginResponse {
    
    const payload = {
      email: user.email,
    };

    
    

    return { user, accessToken: this.jwtService.sign(payload)};
  }

  async verify(token: string): Promise<User> {
    const decoded = this.jwtService.verify(token, {
      secret: 'nopass',
    });
    const user = await this.userService.findUserByEmail(decoded.email);
    return user;
  }
}
