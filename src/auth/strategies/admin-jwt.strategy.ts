import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, userRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "adminJwt") {
  constructor(private readonly userService: UsersService , configService:ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(validationPayload: { email: string }): Promise<User | null> {

    
    const admin = await  this.userService.findUserByEmail(validationPayload.email);
    if (admin.role !== userRole.ADMIN){
        return null
    }
    return admin
  }
}
