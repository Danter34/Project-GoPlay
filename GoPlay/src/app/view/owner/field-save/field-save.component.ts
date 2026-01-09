import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { OwnerFieldService } from '../../../services/owner-field.service';
import { Field } from '../../../models/field.model';

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


  vnData: any[] = [];
  cities: any[] = [];
  districts: any[] = [];

  fieldData = {
    fieldName: '',
    description: '',
    price: 0,
    sportTypeId: 1, 
    location: {
      city: '',
      district: '',
      address: '',
      latitude: 0, 
      longitude: 0
    }
  };

  currentImages: any[] = [];
  selectedFiles: File[] = [];
  previewImages: string[] = [];
  deleteImageIds: number[] = [];

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
    private fieldService: OwnerFieldService,
    private http: HttpClient 
  ) {}

  ngOnInit(): void {
    
    this.loadVietnamData();

   
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.fieldId = +id;
     
      this.loadFieldDetail(this.fieldId);
    }
  }


  loadVietnamData() {
    const jsonUrl = 'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json';
    this.http.get<any[]>(jsonUrl).subscribe({
      next: (data) => {
        this.vnData = data;
        this.cities = data;
       
      },
      error: (err) => console.error('Lỗi load địa chính:', err)
    });
  }


  onCityChange() {

    this.fieldData.location.district = ''; 
    this.districts = [];

  
    const selectedCity = this.cities.find(c => c.Name === this.fieldData.location.city);
    if (selectedCity) {
      this.districts = selectedCity.Districts;
    }
  }

  loadFieldDetail(id: number) {
    this.fieldService.getFieldById(id).subscribe({
      next: (res: Field) => {
        
        this.fieldData = {
          fieldName: res.fieldName,
          description: res.description || '',
          price: res.price,
          sportTypeId: res.sportTypeId || 1,
          location: {
           
            address: res.address || '', 
            city: res.city || '',
            district: res.district || '',
            latitude: res.latitude || 0,
            longitude: res.longitude || 0
          }
        };

        this.currentImages = res.images || [];

        
        if (this.vnData.length > 0) {
           this.syncDistrictData();
        } else {
           
           setTimeout(() => this.syncDistrictData(), 500); 
        }
      },
      error: (err) => {
        console.error(err);
        alert('Không thể tải thông tin sân');
      }
    });
  }

 
  syncDistrictData() {
    const cityName = this.fieldData.location.city;
    if (cityName) {
      const cityObj = this.cities.find(c => c.Name === cityName);
      if (cityObj) {
        this.districts = cityObj.Districts;
        
      }
    }
  }

  
  onFileSelected(event: any) { 
      if (event.target.files && event.target.files.length > 0) {
        const files = Array.from(event.target.files) as File[];
        if (this.selectedFiles.length + files.length > 5) {
            alert("Chỉ được upload tối đa 5 ảnh mới"); return;
        }
        this.selectedFiles.push(...files);
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e: any) => this.previewImages.push(e.target.result);
          reader.readAsDataURL(file);
        });
      }
  }
  removeNewImage(index: number) { this.selectedFiles.splice(index, 1); this.previewImages.splice(index, 1); }
  markDeleteOldImage(imgId: number, index: number) { this.deleteImageIds.push(imgId); this.currentImages.splice(index, 1); }
  
  getCurrentLocation() { 
     if (navigator.geolocation) {
      const btn = document.getElementById('btnLocation');
      if(btn) btn.innerText = 'Đang lấy...';
      navigator.geolocation.getCurrentPosition(
        (p) => {
          this.fieldData.location.latitude = p.coords.latitude;
          this.fieldData.location.longitude = p.coords.longitude;
          if(btn) btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Lấy vị trí hiện tại';
        },
        () => { alert('Lỗi lấy vị trí'); if(btn) btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Lấy vị trí hiện tại'; }
      );
    }
  }

  onSubmit() {
    this.isLoading = true;
    
 
    if (!this.fieldData.fieldName || !this.fieldData.price || !this.fieldData.location.address) {
        alert("Vui lòng nhập tên, giá và địa chỉ chi tiết!");
        this.isLoading = false;
        return;
    }

 
    if (this.isEditMode) {
      this.fieldService.updateField(this.fieldId, this.fieldData, this.selectedFiles, this.deleteImageIds)
        .subscribe({
          next: () => { alert('Cập nhật thành công!'); this.router.navigate(['/owner/dashboard']); },
          error: (err) => { console.error(err); alert('Lỗi cập nhật'); this.isLoading = false; }
        });
    } else {
      this.fieldService.createField(this.fieldData, this.selectedFiles)
        .subscribe({
          next: () => { alert('Thêm mới thành công!'); this.router.navigate(['/owner/dashboard']); },
          error: (err) => { console.error(err); alert('Lỗi thêm mới'); this.isLoading = false; }
        });
    }
  }
}