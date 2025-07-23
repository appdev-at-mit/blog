import { Author } from './author';

export type Post = {
    id: string;
    title: string;
    author: Author;
    date: string;
    tags: string[];
    content: string;
    image?: string;
    excerpt?: string;
    important?: boolean;
}