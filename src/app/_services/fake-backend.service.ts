import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Student } from '../_model/student';

@Injectable({ providedIn: 'root' })
export class FakeBackendService {
  private localStorageKey = 'students';

  constructor() {
    if (!localStorage.getItem(this.localStorageKey)) {
      localStorage.setItem(this.localStorageKey, JSON.stringify([]));
    }
  }

  private getStudentsFromLocalStorage(): Student[] {
    return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  }

  private saveStudentsToLocalStorage(students: Student[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(students));
  }

  getStudents(): Observable<Student[]> {
    return of(this.getStudentsFromLocalStorage());
  }

  addStudent(student: Student): Observable<Student> {
    const students = this.getStudentsFromLocalStorage();
    student.id = students.length ? students[students.length - 1].id + 1 : 1;
    students.push(student);
    this.saveStudentsToLocalStorage(students);
    return of(student);
  }

  updateStudent(id: number, updatedStudent: Partial<Student>): Observable<Student | null> {
    const students = this.getStudentsFromLocalStorage();
    const index = students.findIndex((s) => s.id === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...updatedStudent };
      this.saveStudentsToLocalStorage(students);
      return of(students[index]);
    }
    return of(null);
  }

  deleteStudent(id: number): Observable<boolean> {
    let students = this.getStudentsFromLocalStorage();
    const initialLength = students.length;
    students = students.filter((s) => s.id !== id);
    if (students.length < initialLength) {
      this.saveStudentsToLocalStorage(students);
      return of(true);
    }
    return of(false);
  }
}
