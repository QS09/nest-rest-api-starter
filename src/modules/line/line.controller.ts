import { Express } from 'express';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { Readable } from 'stream';
import { parse } from 'papaparse';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginationQuery } from 'src/common/decorators/api-pagination-query.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorators';
import { UserEntity } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { LineService } from './line.service';
import { CreateLineDto } from './dtos/create-line.dto';
import { UpdateLineDto } from './dtos/update-line.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportLineDto } from './dtos/import-line.dto';

@Controller({ path: 'lines' })
@ApiTags('Line')
export class LineController {
  constructor(private lineService: LineService) {}

  /**
   * Get all lines
   */
  @Get()
  @ApiOperation({ summary: 'Get all lines' })
  @ApiPaginationQuery()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getLines(
    @AuthUser() authUser: UserEntity,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit = 100,
  ) {
    const { items, meta } = await this.lineService.getLines(authUser, {
      limit: limit > 100 ? 100 : limit,
      page,
    });

    return { data: { items, meta } };
  }

  /**
   * Create line
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create line' })
  async createLine(@Body() createLineDto: CreateLineDto) {
    const line = await this.lineService.create(createLineDto);
    return { data: line };
  }

  /**
   * Upload lines with CSV
   */
  @Post('/import')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload lines with CSV' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async importLines(
    @Body() importLineDto: ImportLineDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'csv' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const stream = Readable.from(file.buffer);

    try {
      const lines = await new Promise((resolve, reject) => {
        parse(stream, {
          header: true,
          skipEmptyLines: true,
          delimiter: ',',
          complete: ({ data }) =>
            resolve(
              data
                .map(
                  (item: any) =>
                    ({
                      phoneNumber: item['Phone Number'],
                      status: item['Status'] ?? importLineDto.status,
                      note: item['Note'] ?? importLineDto.note,
                    } as CreateLineDto),
                )
                .filter((line) => /^\d{10}$/.test(line.phoneNumber)),
            ),
          error: (err) => {
            reject(err);
          },
        });
      });
      const importedLines = await this.lineService.importLines(
        lines as CreateLineDto[],
      );
      return { data: importedLines };
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  /**
   * Get a line
   */
  @Get(':line')
  @ApiOperation({ summary: 'Get line' })
  @ApiParam({ name: 'line', description: 'line ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getLine(@Param('line', ParseUUIDPipe) lineId: string) {
    const line = await this.lineService.findById(lineId);
    if (!line) {
      throw new NotFoundException('Line not found by given id');
    }
    return { data: line };
  }

  /**
   * Update line
   */
  @Put(':line')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update line' })
  async updateLine(
    @Param('line', ParseUUIDPipe) lineId: string,
    @Body() updateLineDto: UpdateLineDto,
  ) {
    const line = await this.lineService.update(lineId, updateLineDto);
    return { data: line };
  }

  /**
   * Delete line
   */
  @Delete(':line')
  @ApiOperation({
    summary: 'Delete a line by id',
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async deleteLine(@Param('line', ParseUUIDPipe) lineId: string) {
    await this.lineService.delete(lineId);
    return { message: 'Line deleted successfully' };
  }
}
