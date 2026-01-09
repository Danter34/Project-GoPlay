import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service'; // <--- 1. Import AuthService

@Component({
  selector: 'app-field-detail',
  templateUrl: './field-detail.component.html',
  styleUrls: ['./field-detail.component.css'],
  standalone: false
})
export class FieldDetailComponent implements OnInit {
  field: Field | null = null;
  selectedImage: string = '';
  currentUserId: number = 0; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldService: FieldService,
    private chatService: ChatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    
    this.currentUserId = this.authService.getCurrentUserId();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fieldService.getById(+id).subscribe(data => {
        this.field = data;
        
        if (this.field.images && this.field.images.length > 0) {
          this.selectedImage = this.field.images[0].imageUrl;
        }
      });
    }
  }

  changeImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }

  contactOwner() {
    if (!this.field || !this.field.ownerId) {
      alert('Không tìm thấy thông tin chủ sân!');
      return;
    }
    
    
    if (this.currentUserId === 0) {
        this.router.navigate(['/login']);
        return;
    }

    const contactData = {
      receiverId: this.field.ownerId, 
      subject: `Liên hệ thuê sân`,
      initialMessage: 'Xin chào, tôi muốn thuê sân'
    };

    this.chatService.createContact(contactData.receiverId, contactData.subject, contactData.initialMessage)
      .subscribe({
        next: (res) => {
          this.router.navigate(['/chat', res.contactId]);
        },
        error: (err) => {
          console.error(err);
          alert('Có lỗi khi kết nối với chủ sân.');
        }
      });
  }
}