import { IsString, IsBoolean, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsIn(['executive_management', 'cohort_founders', 'advisory_board', 'global_mentors'])
  section: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  mediaIds?: string[];
}

export class UpdateTeamMemberDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  @IsIn(['executive_management', 'cohort_founders', 'advisory_board', 'global_mentors'])
  section?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  mediaIds?: string[];
}