import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { AppModule } from './app-module';
import { App} from './app';
// Import chính xác serverRoutes từ file vừa tạo ở Bước 1
import { serverRoutes } from './app.routes.server';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  providers: [
    // Cung cấp cấu hình server rendering với các route đã định nghĩa
    provideServerRendering(withRoutes(serverRoutes))
  ],
  bootstrap: [App],
})
export class AppServerModule {}