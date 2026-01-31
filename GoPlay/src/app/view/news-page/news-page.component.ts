import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news-page',
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css'],
  standalone: false
})
export class NewsPageComponent implements OnInit {
  newsList: any[] = [];
  isLoading = true;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getPublicNews().subscribe({
      next: (res) => {
        this.newsList = res.map(item => ({
          ...item,
          isExpanded: false
        }));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;
  }
}