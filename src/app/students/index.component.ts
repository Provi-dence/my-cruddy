import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Student } from '../_model/student';
import Swal from 'sweetalert2';
import { FakeBackendService } from '../_services/fake-backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], // Include HttpClientModule here
  templateUrl: './index.component.html',
})
export class StudentsComponent implements OnInit {
  private http = inject(HttpClient);
  private fakeBackend = inject(FakeBackendService); // nag add ko fakebackend incase ma fail nag GSHEET api

  students: Student[] = [];
  selectedStudent: Student | null = null; // Store selected student for editing
  selectedStudentId: number | null = null; // Store ID of student being updated

  searchQuery = new FormControl(''); // Search

  isSubmitting = false; // Spinner state
  isLoading: boolean = true; // Spinner state sa table
  isThereStudents: boolean = false;
  googleScriptURL =
    'https://script.google.com/macros/s/AKfycbxEHOppH7BO-shEvBlsyr5r7MCIoiNxRc3l55tmjcQea0ThhHkd9Xv9QfI0JwC5NE6e/exec'; // Replace with your actual script URL

  isModalOpen = false;
  constructor(private router: Router) {}

  openModal(student?: Student) {
    this.isModalOpen = true;
    if (student) {
      this.selectedStudent = student;
      this.studentForm.patchValue(student); // Populate form with selected student data
    } else {
      this.selectedStudent = null;
      this.studentForm.reset(); // Reset form for new entry
      this.studentForm.patchValue({ status: 'Active' }); // Ensure default status
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  @ViewChild('updateModal') updateModal!: ElementRef<HTMLDialogElement>;

  // Open update modal with selected student
  openUpdateModal(student: Student) {
    this.selectedStudent = student;
    this.selectedStudentId = student.id; // Store student ID
    this.updateModal.nativeElement.showModal(); // Open the modal

    this.updateForm.setValue({
      name: student.name,
      email: student.email,
      status: student.status,
      course: student.course,
    });
  }

  closeUpdateModal() {
    this.selectedStudentId = null;
    this.updateModal.nativeElement.close(); // Close the modal
    this.updateForm.reset();
  }

  // Add Student Form
  studentForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    status: new FormControl('Active'),
    course: new FormControl('', Validators.required),
  });

  // Update Student Form
  updateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    status: new FormControl('', Validators.required),
    course: new FormControl('', Validators.required),
  });

// Update Student
updateStudent() {
  if (this.updateForm.valid && this.selectedStudentId) {

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    const body = new URLSearchParams();
    body.set('action', 'update');
    body.set('id', String(this.selectedStudentId));
    body.set('name', this.updateForm.value.name || '');
    body.set('email', this.updateForm.value.email || '');
    body.set('status', this.updateForm.value.status || '');
    body.set('course', this.updateForm.value.course || '');

    this.isSubmitting = true;
    this.http.post(`${this.googleScriptURL}`, body.toString(), { headers }).subscribe(response => {


      this.closeUpdateModal();

      setTimeout(() => {
        this.isSubmitting = false;
        Swal.fire({
          title: 'Updated!',
          text: 'Student updated successfully.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          this.fetchStudents();
        });
      }, 300); // Wait 300ms before showing SweetAlert

    }, error => {
      Swal.fire('Error', 'Failed to update student.', 'error');
      console.error('Update error:', error);
    });
  } else {
    Swal.fire('Error', 'Invalid data or missing student ID', 'error');
  }
}


  submit() {
    console.log('Form Submitted', this.studentForm.value);
    if (this.studentForm.valid) {
      this.isSubmitting = true; // Start loading
      this.addStudent(this.studentForm.value).subscribe(
        () => {
          this.isSubmitting = false; // Stop loading
          Swal.fire({
            title: 'Success!',
            text: 'Student added successfully.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            this.closeModal();
            this.studentForm.reset(); // Clear form after submission
            this.fetchStudents(); // Refresh student list
          });
        },
        (err) => {
          console.error(err);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add student. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
    } else {
      console.log('Form is invalid', this.studentForm.errors);
    }
  }

  addStudent(studentData: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let body = new HttpParams()
      .set('name', studentData.name)
      .set('email', studentData.email)
      .set('status', studentData.status)
      .set('course', studentData.course);

    return this.http.post(this.googleScriptURL, body.toString(), { headers })
  }

  deleteStudent(studentId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This student will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        const body = new URLSearchParams();
        body.set('action', 'delete'); // Identify delete request
        body.set('id', String(studentId));

        this.http.post(`${this.googleScriptURL}`, body.toString(), { headers }).subscribe(response => {
          Swal.fire('Deleted!', 'Student has been deleted.', 'success');
          this.fetchStudents(); // Refresh the list after deletion
        }, error => {
          Swal.fire('Error', 'Failed to delete student.', 'error');
          console.error('Delete error:', error);
        });
      }
    });
  }


  ngOnInit() {
    this.isLoading = true; // Show loading spinner before fetching data
    this.fetchStudents(); // Fetch students when component loads
  }

  // get data
  fetchStudents() {
    this.http.get<any>(this.googleScriptURL).subscribe(
      (response) => {
        console.log('Fetched data:', response); // Debugging step
        if (response.result === 'success' && Array.isArray(response.students)) {
          this.students = response.students; // Assign only if it's an array
        } else {
          console.error('API fetch failed, using fake backend: ', response);
          this.isThereStudents = true;
          this.fakeBackend.getStudents().subscribe((students) => {
            this.students = students;
          });
        }
        this.isLoading = false; // Stop loading spinner after response is processed
      },
      (error) => {
        console.error('Error fetching students:', error);

        this.fakeBackend.getStudents().subscribe((students) => {
          this.students = students;
        });

        this.isLoading = false; // Stop loading spinner on error
        this.isThereStudents = true;
      }
    );
  }


  // Search bar
  get filteredStudents(): Student[] {
    if (!this.searchQuery.value) {
      return this.students;
    }
    const query = this.searchQuery.value.toLowerCase();
    return this.students.filter((student) =>
      Object.values(student).some((value) =>
        value.toString().toLowerCase().includes(query)
      )
    );
  }

  goToDB(){
    window.open('https://docs.google.com/spreadsheets/d/1aK6Ho7nyzJhndGzl5zCKmr7rLaSmZIkec8EMxi1MGJw/edit?usp=sharing', '_blank');
  }
}
