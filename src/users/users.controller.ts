import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { CreateUserDtoResponse } from "./dtos/users.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Get all users" })
  async getAllUsers(): Promise<CreateUserDtoResponse[]> {
    return this.usersService.getAllUsers();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  async getUserById(id: string): Promise<CreateUserDtoResponse | undefined> {
    return this.usersService.getUserById(id);
  }
}
