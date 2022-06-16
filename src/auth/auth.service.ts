import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginResponse } from './res/login.res';
import * as argon from 'argon2';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async validate(email: string, password: string): Promise<User | null> {
    //look if user exists in cache first
    let user: User = await this.cacheService.get(email);
    if (!user) {
      user = await this.userService.findUserByEmail(email);
    }

    if (!user) {
      return null;
    }

    const unhash = await argon.verify(user.password, password);
    if (unhash) {
      return user;
    }
    return null;
  }
  async login(user: User): Promise<LoginResponse> {
    //set user in cache
    await this.cacheService.set(user.email, user, {
      ttl: 60 * 3,
    });
    const payload = {
      email: user.email,
    };

    return { user, accessToken: this.jwtService.sign(payload) };
  }

  async verify(token: string): Promise<User> {
    const decoded = this.jwtService.verify(token, {
      secret: 'nopass',
    });
    const user = await this.userService.findUserByEmail(decoded.email);
    return user;
  }
}
