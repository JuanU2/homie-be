import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiOperation } from "@nestjs/swagger";
import { GetUserDtoResponse } from './dtos/users.dto';

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  async getUserById(@Param("id") id: string): Promise<GetUserDtoResponse | undefined> {
    return this.usersService.getUserById(id);
  }
}
