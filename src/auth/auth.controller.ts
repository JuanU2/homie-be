import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthUserDtoRequest, AuthUserDtoResponse } from './dtos/auth.dto';

@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: "Authenticate a user and return a JWT token" })
    async authUser(@Body() data: AuthUserDtoRequest): Promise<any> {  
      const tokenId =  await this.authService.authenticateUser(data);

      return {
        token: tokenId,
      }
    }
}
