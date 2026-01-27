import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Import quan trọng
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { OwnerFieldService } from '../../../services/owner-field.service';
import { Field } from '../../../models/field.model';

// [MỚI] Import Mapbox
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-field-save',
  templateUrl: './field-save.component.html',
  styleUrls: ['./field-save.component.css'],
  standalone: false
})
export class FieldSaveComponent implements OnInit, AfterViewInit {
  isEditMode = false;
  fieldId: number = 0;
  isLoading = false;
  isDragging = false;

  // [MỚI] Biến cho Map
  private map!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
  isBrowser: boolean;

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
    { id: 5, name: 'Bóng chuyền' },
    { id: 6, name: 'Pickleball' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldService: OwnerFieldService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadVietnamData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.fieldId = +id;
      this.loadFieldDetail(this.fieldId);
    } else {
        // Nếu là thêm mới, mặc định tọa độ ở TP.HCM hoặc Hà Nội để map không bị xám
        this.fieldData.location.latitude = 10.762622;
        this.fieldData.location.longitude = 106.660172;
    }
  }

  // [MỚI] Khởi tạo Map sau khi View đã render
  ngAfterViewInit() {
    if (this.isBrowser) {
        this.initMap();
    }
  }

  // [MỚI] Hàm khởi tạo Mapbox
  initMap() {
    // Token Mapbox của bạn
    (mapboxgl as any).accessToken = 'Your_Key';

    this.map = new mapboxgl.Map({
      container: 'mini-map', // ID của div trong HTML
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.fieldData.location.longitude || 106.660172, this.fieldData.location.latitude || 10.762622],
      zoom: 13
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Tạo Marker có thể kéo (Draggable)
    this.marker = new mapboxgl.Marker({
      draggable: true,
      color: '#e74c3c' // Màu đỏ
    })
      .setLngLat([this.fieldData.location.longitude || 106.660172, this.fieldData.location.latitude || 10.762622])
      .addTo(this.map);

    // Sự kiện khi kéo Marker xong -> Cập nhật Input
    this.marker.on('dragend', () => {
      const lngLat = this.marker.getLngLat();
      this.fieldData.location.longitude = lngLat.lng;
      this.fieldData.location.latitude = lngLat.lat;
      
      // (Tùy chọn) Gọi API lấy địa chỉ mới từ tọa độ mới kéo
      // this.getAddressFromCoords(lngLat.lat, lngLat.lng, null);
    });
  }

  // [MỚI] Hàm cập nhật vị trí Map & Marker từ code (Khi lấy GPS hoặc Edit)
  updateMapPosition(lat: number, lng: number) {
    if (this.map && this.marker) {
      this.marker.setLngLat([lng, lat]);
      this.map.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true
      });
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
            latitude: res.latitude || 10.762622,
            longitude: res.longitude || 106.660172
          }
        };
        this.currentImages = res.images || [];

        // [MỚI] Đồng bộ map với dữ liệu tải về
        this.updateMapPosition(this.fieldData.location.latitude, this.fieldData.location.longitude);

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

  // --- Xử lý kéo thả ảnh ---
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files) as File[];
      this.processFiles(files);
    }
  }
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.processFiles(files);
    }
  }
  processFiles(files: File[]) {
    if (this.selectedFiles.length + files.length > 5) {
      alert("Chỉ được upload tối đa 5 ảnh mới");
      return;
    }
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert("Chỉ chấp nhận file ảnh (JPG, PNG...)");
    }
    this.selectedFiles.push(...validFiles);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewImages.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }
  removeNewImage(index: number) { this.selectedFiles.splice(index, 1); this.previewImages.splice(index, 1); }
  markDeleteOldImage(imgId: number, index: number) { this.deleteImageIds.push(imgId); this.currentImages.splice(index, 1); }
  
  // --- Lấy vị trí GPS ---
  getCurrentLocation() {
    if (navigator.geolocation) {
      const btn = document.getElementById('btnLocation');
      if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

      navigator.geolocation.getCurrentPosition(
        (p) => {
          const lat = p.coords.latitude;
          const lng = p.coords.longitude;

          this.fieldData.location.latitude = lat;
          this.fieldData.location.longitude = lng;

          // [MỚI] Bay map đến vị trí mới
          this.updateMapPosition(lat, lng);

          this.getAddressFromCoords(lat, lng, btn);
        },
        () => {
          alert('Không thể lấy vị trí. Hãy kiểm tra quyền truy cập GPS.');
          if (btn) btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Lấy vị trí hiện tại';
        }
      );
    } else {
      alert('Trình duyệt không hỗ trợ Geolocation.');
    }
  }

  getAddressFromCoords(lat: number, lng: number, btnElement: any) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        const addr = res.address;
        let apiCityName = addr.city || addr.state || '';
        const foundCity = this.cities.find(c => this.isMatch(c.Name, apiCityName));

        if (foundCity) {
          this.fieldData.location.city = foundCity.Name;
          this.districts = foundCity.Districts;
          let apiDistrictName = addr.district || addr.suburb || addr.county || addr.town || '';
          const foundDistrict = this.districts.find(d => this.isMatch(d.Name, apiDistrictName));
          if (foundDistrict) {
            this.fieldData.location.district = foundDistrict.Name;
          }
        }

        let detail = [];
        if (addr.house_number) detail.push(addr.house_number);
        if (addr.road) detail.push(addr.road);
        if (detail.length === 0 && addr.village) detail.push(addr.village);
        
        if (detail.length > 0) {
          this.fieldData.location.address = detail.join(', ');
        }

        if (btnElement) btnElement.innerHTML = '<i class="fas fa-check"></i> Đã cập nhật vị trí';
      },
      error: (err) => {
        console.error('Lỗi Reverse Geocoding:', err);
        if (btnElement) btnElement.innerHTML = '<i class="fas fa-map-marker-alt"></i> Lấy vị trí hiện tại';
      }
    });
  }

  isMatch(localName: string, apiName: string): boolean {
    if (!localName || !apiName) return false;
    const normalize = (str: string) => {
      return str.toLowerCase()
        .replace(/tỉnh|thành phố|quận|huyện|thị xã|tp\.|q\./g, '')
        .trim();
    };
    return normalize(localName).includes(normalize(apiName)) || 
           normalize(apiName).includes(normalize(localName));
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