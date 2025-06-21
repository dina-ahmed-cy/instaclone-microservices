import { IsString, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  caption?: string;

  @IsUrl()
  @IsNotEmpty()
  mediaUrl: string;
} 