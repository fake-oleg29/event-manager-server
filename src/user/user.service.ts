import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
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
  private buildUserWhere(
    query?: UserQueryDto,
  ): Prisma.UserWhereInput | undefined {
    const s = query?.search?.trim();
    if (!s) return undefined;
    return {
      OR: [
        { email: { contains: s, mode: 'insensitive' } },
        { name: { contains: s, mode: 'insensitive' } },
      ],
    };
  }

  async findAll(query?: UserQueryDto): Promise<User[]> {
    const where = this.buildUserWhere(query);
    const users = await this.prisma.user.findMany({
      where,
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
