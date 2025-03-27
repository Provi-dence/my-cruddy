import { Routes } from '@angular/router';
import { StudentsComponent } from './students/index.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'students', component: StudentsComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: 'home', pathMatch: 'full' } // Catch unknown routes
];
