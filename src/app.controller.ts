import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Account } from './interface/interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/account/login')
  async login(@Req() req : any )  {
    const user = {
      username : req.body.username,
      password : req.body.password
    } as Account
    return await this.appService.login(user);
  }

  @Post('/account/register')
  async register(@Req() req : any )  {
    const user = {
      username : req.body.username,
      password : req.body.password
    } as Account
    return await this.appService.registerUser(user);
  }

}
