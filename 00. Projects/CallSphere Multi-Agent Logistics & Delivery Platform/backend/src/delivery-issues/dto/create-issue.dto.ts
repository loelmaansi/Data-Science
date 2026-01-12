import { IsEnum, IsString, IsUUID } from 'class-validator';
import { IssueType } from '@prisma/client';

export class CreateIssueDto {
  @IsUUID()
  shipmentId: string;

  @IsEnum(IssueType)
  issueType: IssueType;

  @IsString()
  description: string;
}

