import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-field-detail',
  templateUrl: './field-detail.component.html',
  styleUrls: ['./field-detail.component.css'],
  standalone: false
})
export class FieldDetailComponent implements OnInit {
  field: Field | null = null;
  selectedImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private fieldService: FieldService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fieldService.getById(+id).subscribe(data => {
        this.field = data;
        if (this.field.images.length > 0) {
          this.selectedImage = this.field.images[0];
        }
      });
    }
  }

  changeImage(img: string) {
    this.selectedImage = img;
  }
}