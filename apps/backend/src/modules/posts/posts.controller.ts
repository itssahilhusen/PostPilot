import {
  Headers,
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";

@ApiTags("Posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: "Get all posts for a workspace" })
  @ApiQuery({ name: "workspaceId", required: false, example: "ws-default-1" })
  @ApiQuery({ name: "status", required: false, enum: ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"] })
  @ApiResponse({ status: 200, description: "List of posts returned successfully" })
  async getPosts(
    @Headers("cookie") cookie: string,
    @Query("status") status?: string
  ) {
    const data = await this.postsService.getPosts(cookie, status);
    return { success: true, count: data.length, data };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get single post by ID" })
  async getPostById(@Param("id") id: string, @Headers("cookie") cookie: string) {
    const data = await this.postsService.getPostById(id, cookie);
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a draft or scheduled post" })
  async createPost(@Body() dto: CreatePostDto, @Headers("cookie") cookie: string) {
    const data = await this.postsService.createPost(dto, cookie);
    return { success: true, data };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete post by ID" })
  async deletePost(@Param("id") id: string, @Headers("cookie") cookie: string) {
    await this.postsService.deletePost(id, cookie);
    return { success: true, message: `Post ${id} deleted successfully` };
  }
}

