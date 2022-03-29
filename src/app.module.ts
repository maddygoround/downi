import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, 
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    useFactory: async () => ({
      secret: process.env.JWT_SECRET,
      signInOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN
      },
    }),
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
