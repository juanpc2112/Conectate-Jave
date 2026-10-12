import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { SearchService } from './search.service.js';
import { SearchQueryDto } from './dto/search-query.dto.js';

interface AuthenticatedRequest {
  user: { id: number };
}

@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @Get() search(
    @Query() query: SearchQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.searchService.search(query, String(req.user.id));
  }
}
