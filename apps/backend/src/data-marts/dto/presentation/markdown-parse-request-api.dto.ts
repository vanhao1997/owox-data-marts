import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MarkdownParseRequestApiDto {
  @ApiProperty({
    description: 'Markdown source to render with the P2PDigital Data Marts Markdown pipeline',
    example: '# Revenue\n\n**Net revenue** after refunds.',
  })
  @IsString()
  markdown!: string;
}
