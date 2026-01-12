import { IsEnum, IsString, IsOptional } from 'class-validator';
import { IssueStatus } from '@prisma/client';

export class UpdateIssueDto {
  @IsEnum(IssueStatus)
  @IsOptional()
  status?: IssueStatus;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}

