import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  response: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  @ViewChild('chatMessages') private messagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: 'Welcome to In-N-Out Burger! How can I assist you today?'
    }
  ];
  userInput: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  async sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    this.messages.push({
      role: 'user',
      content: this.userInput
    });

    const userMessage = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    try {
      // Send request to your Ollama endpoint
      const response = await this.http.post<ChatResponse>('http://localhost:3000/api/chat', {
        message: userMessage
      }).toPromise();

      // Add AI response
      this.messages.push({
        role: 'assistant',
        content: response!.response
      });
    } catch (error) {
      console.error('Error:', error);
      this.messages.push({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      });
    }

    this.isLoading = false;
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }
}
