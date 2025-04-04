import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateListDto, FindListsDto, UpdateListDto } from 'shared';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() createListDto: CreateListDto, @CurUser('id') userId: string) {
    return this.listsService.create(createListDto, userId);
  }

  @Get()
  findAll(@Query() query: FindListsDto, @CurUser('id') userId: string) {
    return this.listsService.find(query, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.listsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  update(
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto,
    @CurUser('id') userId: string,
  ) {
    return this.listsService.update(id, updateListDto, userId);
  }

  @Patch(':id/publish')
  @UseGuards(AuthenticatedGuard)
  publish(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.listsService.publish(id, userId);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  remove(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.listsService.remove(id, userId);
  }

  @Get(':id/items')
  findItems(
    @Param('id') id: string,
    @Query('page', ParseIntPipe) page: number,
    @CurUser('id') userId: string,
  ) {
    return this.listsService.findItems(id, userId, page);
  }

  @Post(':id/items')
  @UseGuards(AuthenticatedGuard)
  addToList(
    @Param('id') id: string,
    @Body('releaseId') releaseId: string,
    @CurUser('id') userId: string,
  ) {
    return this.listsService.addToList(id, releaseId, userId);
  }

  @Patch(':id/items')
  @UseGuards(AuthenticatedGuard)
  reorder(
    @Param('id') id: string,
    @Body('items') items: { id: string; index: number }[],

    @CurUser('id') userId: string,
  ) {
    return this.listsService.reorderListItems({ listId: id, items, userId });
  }

  @Patch(':id/items/:itemId')
  @UseGuards(AuthenticatedGuard)
  editItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body('note') note: string,
    @CurUser('id') userId: string,
  ) {
    return this.listsService.editListItem(itemId, note, userId);
  }

  @Delete(':id/items/:itemId')
  @UseGuards(AuthenticatedGuard)
  removeFromList(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurUser('id') userId: string,
  ) {
    return this.listsService.removeFromList(id, itemId, userId);
  }

  @Post(':id/likes')
  @UseGuards(AuthenticatedGuard)
  like(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.listsService.like(id, userId);
  }

  @Delete(':id/likes')
  @UseGuards(AuthenticatedGuard)
  removeLike(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.listsService.removeLike(id, userId);
  }
  @Post(':id/comments')
  @UseGuards(AuthenticatedGuard)
  comment(
    @Param('id') id: string,
    @Body('body') body: string,
    @CurUser('id') userId: string,
  ) {
    return this.listsService.comment(id, body, userId);
  }

  @Delete(':id/comments')
  @UseGuards(AuthenticatedGuard)
  removeComment(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.listsService.removeComment(id, userId);
  }

  @Get(':id/comments')
  findComments(
    @Param('id') id: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.listsService.findComments(id, page || 1);
  }

  @Get('release/:releaseId')
  @UseGuards(AuthenticatedGuard)
  releaseInMyLists(
    @Param('releaseId') releaseId: string,
    @CurUser('id') userId: string,
  ) {
    return this.listsService.releaseInMyLists(releaseId, userId);
  }
}
