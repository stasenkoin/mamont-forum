import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateDiscussionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
