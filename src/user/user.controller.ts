import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { User, UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOneById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get(':email')
  async findOne(@Param('email') email: string): Promise<User> {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
