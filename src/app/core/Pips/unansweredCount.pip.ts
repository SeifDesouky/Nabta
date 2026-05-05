import { Pipe, PipeTransform } from '@angular/core';
import { PostWithUI } from '../models/expert/consulation.model';

@Pipe({ name: 'unansweredCount', standalone: true })
export class UnansweredCountPipe implements PipeTransform {
  transform(posts: PostWithUI[]): number {
    return posts.filter(p => !p.commentCount || p.commentCount === 0).length;
  }
}