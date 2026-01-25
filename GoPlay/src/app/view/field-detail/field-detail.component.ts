import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service'; 

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
    if (!this.field || !this.field.ownerId) return;

    const contactData = {
      receiverId: this.field.ownerId,
      
      fieldId: this.field.fieldId, 
      
     
      subject: 'Liên hệ thuê sân', 
      initialMessage: `Xin chào, tôi quan tâm đến sân "${this.field.fieldName}".`
    };

    this.chatService.createContact(contactData).subscribe({
        next: (res) => {
          this.router.navigate(['/chat', res.contactId]);
        },
        error: (err) => {
          console.error(err);
          alert('Không thể kết nối máy chủ.');
        }
      });
  }
  showBookingModal = false;

  openBooking() {
    this.showBookingModal = true;
  }

  closeBooking() {
    this.showBookingModal = false;
  }
}