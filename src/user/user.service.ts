import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  private readonly userWithCounts = {
    _count: {
      select: {
        tickets: true,
        events: true,
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}
  async findOneById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.userWithCounts,
    });
    return user;
  }
  async findOne(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: this.userWithCounts,
    });
    return user;
  }
  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: this.userWithCounts,
    });
    return users;
  }
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return user;
  }
}
