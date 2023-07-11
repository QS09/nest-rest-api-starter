/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { UserStatusEnum } from 'src/modules/user/user.types';
import { UserRoleEnum } from 'src/modules/user/user.types';

@Injectable()
export class UserSeedService {
  constructor(private userService: UserService) {}

  async import() {
    console.log(`user imported!`);
  }
}
