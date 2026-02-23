import { Body, Controller, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateUserDtoRequest, CreateUserDtoResponse } from "./dtos/users.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  async createUser(
    @Body() userData: CreateUserDtoRequest,
  ): Promise<CreateUserDtoResponse> {
    return this.usersService.createUser(userData);
  }
}
