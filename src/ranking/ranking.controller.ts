import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { RankingService } from './ranking.service.js';
import { RankingQueryDto } from './dto/ranking-query.dto.js';

@Controller('ranking')
@UseGuards(AuthGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}
  @Get() findTop(@Query() query: RankingQueryDto) {
    return this.rankingService.findTop(
      query.limit === undefined ? 10 : Number(query.limit),
    );
  }
}
