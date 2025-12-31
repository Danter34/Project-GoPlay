import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.css'],
  standalone: false
})
export class MapSearchComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

 
  center: google.maps.LatLngLiteral = { lat: 10.762622, lng: 106.660172 }; // Mặc định TP.HCM
  zoom = 12;
  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false, 
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [ 
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };


  allFields: Field[] = [];      
  displayFields: Field[] = [];  
  selectedField: Field | null = null; 


  sportFilters = [
    { id: 0, name: 'Tất cả', icon: 'fa-th-large', active: true },
    { id: 1, name: 'Bóng đá', icon: 'fa-futbol', active: false },
    { id: 2, name: 'Cầu lông', icon: 'fa-table-tennis', active: false },
    { id: 3, name: 'Tennis', icon: 'fa-baseball', active: false },
    { id: 4, name: 'Bóng rổ', icon: 'fa-basketball', active: false },
    { id: 6, name: 'Pickleball', icon: 'fa-golf-ball-tee', active: false }
  ];

  constructor(private fieldService: FieldService) {}

  ngOnInit(): void {
    this.loadData();
    this.getCurrentLocation();
  }

  loadData() {
    this.fieldService.getAllForMap().subscribe({
      next: (data) => {
        this.allFields = data;
        this.displayFields = data; 
      },
      error: (err) => console.error('Lỗi tải map:', err)
    });
  }

  
  filterSport(sportId: number) {
   
    this.sportFilters.forEach(s => s.active = (s.id === sportId));

    
    if (sportId === 0) {
      this.displayFields = [...this.allFields];
    } else {
 
      const sportName = this.getSportNameById(sportId);
      this.displayFields = this.allFields.filter(f => 
        f.sportName.toLowerCase().includes(sportName.toLowerCase())
      );
    }
  }

  getSportNameById(id: number): string {
    const sport = this.sportFilters.find(s => s.id === id);
    return sport ? sport.name : '';
  }

  
  openInfoWindow(marker: MapMarker, field: Field) {
    this.selectedField = field;
    this.infoWindow.open(marker);
  }


  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.zoom = 14; 
          
         
        },
        (error) => {
          console.warn('Không lấy được vị trí:', error);
        }
      );
    } else {
      alert("Trình duyệt này không hỗ trợ định vị.");
    }
  }
}