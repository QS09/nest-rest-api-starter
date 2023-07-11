/* eslint-disable @typescript-eslint/no-unused-vars */
import { Command, Positional, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserSeedService } from './seeder.service';

@Injectable()
export class UserSeedCommand {
  constructor(private readonly userSeedService: UserSeedService) {}

  @Command({
    command: 'import:users',
    describe: 'import users from csv',
  })
  async import() {
    await this.userSeedService.import();
  }
}
