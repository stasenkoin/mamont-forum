import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDiscussionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
