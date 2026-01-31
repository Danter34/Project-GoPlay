import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css'],
  standalone: false
})
export class SearchResultComponent implements OnInit {

  fields: Field[] = [];
  keyword = '';
  sortPrice = '';
  
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldService: FieldService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.keyword = params['q'] || '';
      this.onSearch(1);
    });
  }

  onSearch(page: number = 1) {
    const queryParams: any = {
      keyword: this.keyword,
      page: page,
      pageSize: this.itemsPerPage
    };

    if (this.sortPrice) {
        queryParams.sort = this.sortPrice;
    }

    this.fieldService.search(queryParams).subscribe({
      next: res => {
        this.fields = res.items;
        this.totalItems = res.totalItems;
        this.currentPage = res.page;
        if (this.fields.length > 0) {
        console.log('Dữ liệu ảnh trả về:', this.fields[0].images);
        }
        if (this.sortPrice === 'asc') {
           this.fields.sort((a, b) => a.price - b.price);
        } else if (this.sortPrice === 'desc') {
           this.fields.sort((a, b) => b.price - a.price);
        }
      },
      error: err => console.error(err)
    });
  }

  onSortChange() {
    this.onSearch(1);
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.onSearch(page);
    document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth' });
  }
}