import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferResponseDto } from './dto/transfer-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Transfers')
@Controller('transfers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  @RequirePermissions('transferencias:list', 'transferencias:read')
  @ApiOperation({ summary: 'List all transfers' })
  @ApiResponse({ status: 200, type: [TransferResponseDto] })
  async findAll(): Promise<TransferResponseDto[]> {
    const transfers = await this.transfersService.findAll();
    return transfers.map((t) => plainToInstance(TransferResponseDto, t, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('transferencias:read')
  @ApiOperation({ summary: 'Get transfer by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: TransferResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.findById(id);
    if (!transfer) throw new NotFoundException('Transfer not found');
    return plainToInstance(TransferResponseDto, transfer, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('transferencias:create')
  @ApiOperation({ summary: 'Create a new transfer' })
  @ApiResponse({ status: 201, type: TransferResponseDto })
  async create(@Body() dto: CreateTransferDto): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.create(dto);
    return plainToInstance(TransferResponseDto, transfer, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('transferencias:update')
  @ApiOperation({ summary: 'Update a transfer' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: TransferResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransferDto): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.update(id, dto);
    return plainToInstance(TransferResponseDto, transfer, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('transferencias:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transfer' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.transfersService.remove(id);
  }
}
