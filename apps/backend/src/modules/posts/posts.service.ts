import { Injectable, NotFoundException } from "@nestjs/common";
import { PostsRepository } from "@reerts/database";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostsService {
  async getPosts(workspaceId: string, status?: string) {
    return PostsRepository.findWorkspacePosts(workspaceId, status);
  }

  async getPostById(id: string) {
    const post = await PostsRepository.findPostById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async createPost(dto: CreatePostDto) {
    return PostsRepository.createPost({
      workspaceId: dto.workspaceId,
      title: dto.title,
      content: dto.content,
      platforms: dto.platforms ? JSON.stringify(dto.platforms) : '["x","linkedin"]',
      mediaUrls: dto.mediaUrls ? JSON.stringify(dto.mediaUrls) : "[]",
      status: dto.status as any,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });
  }

  async deletePost(id: string) {
    await this.getPostById(id);
    return PostsRepository.deletePost(id);
  }
}

