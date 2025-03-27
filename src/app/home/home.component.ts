import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToStudents() {
    this.router.navigate(['/students']).catch((err) => {
      console.error('Navigation error:', err);
    });
  }
}
