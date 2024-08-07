import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      ttl: 600,
      max: 600000,
      isGlobal: true,
    }),
    CountriesModule,
    ThrottlerModule.forRoot([
      {
        ttl: 5 * 60,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
