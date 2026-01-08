import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OwnerFieldService } from '../../../services/owner-field.service';

@Component({
  selector: 'app-field-save',
  templateUrl: './field-save.component.html',
  styleUrls: ['./field-save.component.css'],
  standalone: false
})
export class FieldSaveComponent implements OnInit {
  isEditMode = false;
  fieldId: number = 0;
  isLoading = false;

  // Model dữ liệu form
  fieldData = {
    fieldName: '',
    price: 0,
    sportTypeId: 1, // Mặc định bóng đá
    location: {
      city: '',
      district: '',
      address: '',
      latitude: 10.762622, // Tọa độ mặc định HCM
      longitude: 106.660172
    }
  };

  // Quản lý ảnh
  currentImages: any[] = []; // Ảnh cũ (chỉ dùng khi Edit)
  selectedFiles: File[] = []; // Ảnh mới user vừa chọn
  previewImages: string[] = []; // Preview ảnh mới
  deleteImageIds: number[] = []; // Danh sách ID ảnh cũ cần xóa

  // Danh sách môn (Có thể gọi API lấy về)
  sportTypes = [
    { id: 1, name: 'Bóng đá' },
    { id: 2, name: 'Cầu lông' },
    { id: 3, name: 'Tennis' },
    { id: 4, name: 'Bóng rổ' },
    { id: 6, name: 'Pickleball' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldService: OwnerFieldService
  ) {}

  ngOnInit(): void {
    // Kiểm tra URL xem có ID không
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.fieldId = +id;
      this.loadFieldDetail(this.fieldId);
    }
  }

  loadFieldDetail(id: number) {
    this.fieldService.getFieldById(id).subscribe({
      next: (res) => {
        // Map dữ liệu từ API vào form
        this.fieldData = {
          fieldName: res.fieldName,
          price: res.price,
          sportTypeId: res.sportTypeId || 1, // API trả về tên hay ID? Cần check lại DTO
          location: {
            city: res.city,
            district: res.district,
            address: res.location?.address || '', // Cần check cấu trúc response
            latitude: res.latitude,
            longitude: res.longitude
          }
        };
        // Lưu danh sách ảnh cũ (để hiển thị và xóa)
        // Giả sử API trả về mảng string URL hoặc object {id, imageUrl}
        // Ở đây mình giả định response trả về mảng object Image đầy đủ
        // Nếu API chỉ trả list string url thì logic xóa sẽ khác (cần ID)
         this.currentImages = res.images || []; 
      },
      error: (err) => alert('Không thể tải thông tin sân')
    });
  }

  // Xử lý chọn ảnh mới
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.selectedFiles.push(...files);

      // Tạo preview
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.previewImages.push(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  }

  // Xóa ảnh mới vừa chọn (chưa upload)
  removeNewImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  // Đánh dấu xóa ảnh cũ (khi Edit)
  markDeleteOldImage(imgId: number, index: number) {
    this.deleteImageIds.push(imgId); // Thêm vào danh sách xóa
    this.currentImages.splice(index, 1); // Ẩn khỏi giao diện
  }

  onSubmit() {
    this.isLoading = true;

    if (this.isEditMode) {
      // GỌI API UPDATE
      this.fieldService.updateField(this.fieldId, this.fieldData, this.selectedFiles, this.deleteImageIds)
        .subscribe({
          next: () => {
            alert('Cập nhật thành công!');
            this.router.navigate(['/owner/dashboard']);
          },
          error: (err) => {
            console.error(err);
            alert('Lỗi cập nhật');
            this.isLoading = false;
          }
        });
    } else {
      // GỌI API CREATE
      this.fieldService.createField(this.fieldData, this.selectedFiles)
        .subscribe({
          next: () => {
            alert('Thêm sân mới thành công!');
            this.router.navigate(['/owner/dashboard']);
          },
          error: (err) => {
            console.error(err);
            alert('Lỗi thêm mới');
            this.isLoading = false;
          }
        });
    }
  }
}