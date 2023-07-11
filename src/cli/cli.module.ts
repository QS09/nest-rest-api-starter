import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { AppModule } from 'src/app.module';
import { UserSeedService } from 'src/database/seeder/seeder.service';
import { UserSeedCommand } from 'src/database/seeder/user-seed.command';

@Module({
  imports: [AppModule, CommandModule],
  providers: [UserSeedCommand, UserSeedService],
})
export class CliModule {}
