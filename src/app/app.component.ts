import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [CommonModule, RouterOutlet], // Ensure RouterOutlet is imported here
})
export class AppComponent {
  constructor(private router: Router) {}

  goHome(){
    this.router.navigate(['/home']).catch((err) => {
      console.error('Navigation error:', err);
    });
  }
}
