import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export class Auth {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async login(auth: Auth): Promise<any> {
    const user = await this.userService.findOne(auth.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(auth.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken: string = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async register(user: CreateUserDto): Promise<any> {
    const existingUser = await this.userService.findOne(user.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, this.saltRounds);

    const newUser = await this.userService.createUser({
      email: user.email,
      password: hashedPassword,
      name: user.name,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  profile(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }
    console.log(decoded);
    return decoded;
  }
}
