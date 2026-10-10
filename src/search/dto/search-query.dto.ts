export class SearchQueryDto {
  q!: string;
  type?: 'chats' | 'notes' | 'all';
}
