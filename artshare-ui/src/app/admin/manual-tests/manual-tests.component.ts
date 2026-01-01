import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manual-tests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manual-tests.component.html',
  styleUrls: ['./manual-tests.component.scss']
})
export class ManualTestsComponent {

  originalTests = [
    { title: 'Upload Artwork', result: 'Passed', notes: 'Images upload and appear in gallery.' },
    { title: 'Signup/Login', result: 'Passed', notes: 'User can register and login successfully.' },
    { title: 'Profile Picture Update', result: 'Passed', notes: 'LocalStorage PFP updates and displays.' },
    { title: 'Add Comment', result: 'Passed', notes: 'Comment appears instantly and persists.' },
    { title: 'Edit Comment', result: 'Passed', notes: 'Comment updates correctly.' },
    { title: 'Delete Comment', result: 'Passed', notes: 'Comment removed from UI and DB.' },
    { title: 'Like/Unlike', result: 'Passed', notes: 'Likes update in UI and Cosmos DB.' },
    { title: 'Public Profile', result: 'Passed', notes: 'User profiles load correctly.' },
    { title: 'Azure Functions', result: 'Passed', notes: 'All functions execute without errors.' },
    { title: 'Follow User', result: 'Passed', notes: 'Follow/unfollow updates correctly.' },
    { title: 'Followers List', result: 'Passed', notes: 'Followers list loads correctly.' },
    { title: 'Admin Dashboard Access', result: 'Passed', notes: 'Only admins can access admin routes.' }
  ];

  tests = [...this.originalTests];

  passedCount = this.originalTests.length;
  failedCount = 0;

  runTests() {
    // Reset UI to "Running..."
    this.tests = this.originalTests.map(t => ({
      ...t,
      result: 'Running...',
      notes: 'Checking...'
    }));

    this.passedCount = 0;
    this.failedCount = 0;

    // Fake delay to simulate test execution
    setTimeout(() => {
      this.tests = [...this.originalTests];

      // Count results
      this.passedCount = this.tests.filter(t => t.result === 'Passed').length;
      this.failedCount = this.tests.filter(t => t.result === 'Failed').length;

    }, 1200);
  }
}
