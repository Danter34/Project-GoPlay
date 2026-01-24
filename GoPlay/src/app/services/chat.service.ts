import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: signalR.HubConnection | undefined;
  private apiUrl = 'http://localhost:5210/api/contacts'; 
  private hubUrl = 'http://localhost:5210/chatHub';

  public messageReceived$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) { }


 // createContact nhận object data linh động
  createContact(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  // Lấy danh sách hội thoại
  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations`);
  }

  // Lấy tin nhắn cũ của 1 hội thoại
  getMessages(contactId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${contactId}/messages`);
  }



  public async startConnection(): Promise<void> {
  const token = localStorage.getItem('authToken'); 
  // Nếu đã có kết nối và đang mở thì không tạo mới
  if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
    return Promise.resolve();
  }

  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.hubUrl, {
      accessTokenFactory: () => token || ''
    })
    .withAutomaticReconnect()
    .build();

  // Lắng nghe sự kiện trước khi start
  this.hubConnection.on('ReceiveMessage', (data) => {
    this.messageReceived$.next(data);
  });

  // Trả về Promise của hàm start()
  try {
    await this.hubConnection.start();
    console.log('SignalR Connection started');
  } catch (err) {
    console.log('Error while starting connection: ' + err);
  }
}

// hàm ngắt kết nối để tránh lỗi khi chuyển trang
public async stopConnection() {
  if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
    await this.hubConnection.stop();
  }
}

  // Gửi tin nhắn
  public async sendMessage(contactId: number, content: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('SendMessage', { contactId, content });
    }
  }

  // Join vào room chat cụ thể
  public async joinGroup(contactId: number) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinChat', contactId);
    }
  }
}