import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthUserDtoRequest } from './dtos/auth.dto';

@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: "Authenticate a user and return a JWT token" })
    async authUser(@Body() data: AuthUserDtoRequest): Promise<string> {  
      return this.authService.authenticateUser(data);
    }
}
