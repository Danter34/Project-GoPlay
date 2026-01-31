import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';

// [FIX 1]: Import kiểu này để tránh lỗi "Immutable binding"
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.css'],
  standalone: false
})
export class MapSearchComponent implements OnInit, AfterViewInit {
  private map!: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  
  isBrowser: boolean;
  allFields: Field[] = [];
  displayFields: Field[] = [];

  sportFilters = [
    { id: 0, name: 'Tất cả', icon: 'fa-th-large', active: true, color: '#27ae60' },
    { id: 1, name: 'Bóng đá', icon: 'fa-futbol', active: false, color: '#e74c3c' },
    { id: 2, name: 'Cầu lông', icon: 'fa-table-tennis', active: false, color: '#f1c40f' },
    { id: 3, name: 'Tennis', icon: 'fa-baseball', active: false, color: '#3498db' },
    { id: 4, name: 'Bóng rổ', icon: 'fa-basketball', active: false, color: '#e67e22' },
    { id: 5, name: 'Bóng chuyền', icon: 'fa-volleyball-ball', active: false, color: '#1abc9c' },
    { id: 6, name: 'Pickleball', icon: 'fa-golf-ball-tee', active: false, color: '#9b59b6' }
  ];

  constructor(
    private fieldService: FieldService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadData();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initMap();
    }
  }

  private initMap(): void {

    (mapboxgl as any).accessToken = 'Yuor_API_KEY';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [108.2062, 16.0474], // Tâm Đà Nẵng
      zoom: 5.5,
      projection: 'globe' as any
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // [AN TOÀN]: Ẩn nhãn biển đảo nhạy cảm
    this.map.on('style.load', () => {
      if (this.map.getLayer('country-label')) {
        this.map.setLayoutProperty('country-label', 'text-field', ['get', 'name_en']);
      }

      const layers = this.map.getStyle().layers;
      if (layers) {
        layers.forEach((layer) => {
          if (
            (layer.id.includes('water') && layer.id.includes('label')) ||
            (layer.id.includes('island') && layer.id.includes('label')) ||
            (layer.id.includes('natural-point-label'))
          ) {
             this.map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });
      }
    });

    this.map.on('load', () => {
      if (this.allFields.length > 0) {
        this.updateMarkers(this.displayFields);
      }
    });
  }

  loadData() {
    this.fieldService.getAllForMap().subscribe({
      next: (data) => {
        this.allFields = data;
        this.displayFields = [...this.allFields];
        if (this.map && this.map.loaded()) {
          this.updateMarkers(this.displayFields);
        }
      }
    });
  }
  

  private createCustomMarkerElement(sportName: string) {
    const filter = this.sportFilters.find(s => 
      sportName?.toLowerCase().includes(s.name.toLowerCase())
    ) || this.sportFilters[0];

    const el = document.createElement('div');
    el.className = 'custom-marker'; 
    

    el.innerHTML = `
      <div class="marker-container" style="color: ${filter.color}">
        <i class="fas fa-map-marker-alt fa-3x marker-pin-icon"></i>
        <i class="fas ${filter.icon} marker-center-icon"></i>
      </div>
    `;
    return el;
  }

  private updateMarkers(fields: Field[]) {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    fields.forEach(field => {
      const el = this.createCustomMarkerElement(field.sportName);

      const fieldImg = field.images && field.images.length > 0 ? field.images[0].imageUrl : 'assets/placeholder.jpg';
      const popupHTML = `
        <div class="info-card">
          <img src="${fieldImg}" class="popup-img">
          <div class="popup-title">${field.fieldName}</div>
          <div class="popup-sport"><i class="fas fa-running"></i> ${field.sportName}</div>
          <a href="/field/${field.fieldId}" class="popup-btn">XEM CHI TIẾT</a>
        </div>
      `;

      // Offset 35 để popup nằm trên đỉnh giọt nước
      const popup = new mapboxgl.Popup({ offset: 35 }).setHTML(popupHTML);

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' }) 
        .setLngLat([field.longitude!, field.latitude!])
        .setPopup(popup)
        .addTo(this.map);

      this.markers.push(marker);
    });
  }
  filterSport(sportId: number) {
    this.sportFilters.forEach(s => s.active = (s.id === sportId));
    
    if (sportId === 0) {
      this.displayFields = [...this.allFields];
    } else {
      const selectedSport = this.sportFilters.find(s => s.id === sportId);
      
      if (selectedSport) {
        this.displayFields = this.allFields.filter(f => 
          (f.sportName || '').toLowerCase().includes(selectedSport.name.toLowerCase())
        );
      }
    }
    
    this.updateMarkers(this.displayFields);
    
   if (sportId === 0) {
        // Nếu chọn "Tất cả": Zoom out ra toàn Việt Nam
        this.map.flyTo({
            center: [108.2062, 16.0474], // Tâm Việt Nam (Đà Nẵng)
            zoom: 5.5, // Zoom level nhìn thấy cả nước
            essential: true
        });
    } else {
        // Nếu chọn môn cụ thể: Zoom vào sân gần nhất (hoặc sân đầu tiên)
        if (this.displayFields.length > 0) {
            
           
            const bounds = new mapboxgl.LngLatBounds();
            this.displayFields.forEach(f => {
                if (f.longitude && f.latitude) {
                    bounds.extend([f.longitude, f.latitude]);
                }
            });
            
            this.map.fitBounds(bounds, {
                padding: 100, // Khoảng cách đệm
                maxZoom: 14   // Zoom tối đa
            });
        }
    }
  }

  getCurrentLocation() {
    if (!this.isBrowser) return;
    navigator.geolocation.getCurrentPosition(pos => {
      this.map.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 14
      });
    });
  }
}