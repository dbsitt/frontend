import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { UserState } from 'src/app/store/user.reducers';
import { getCurrentUser } from 'src/app/store/user.selector';

@Component({
  selector: 'app-allocate-transaction',
  templateUrl: './allocate-transaction.component.html',
  styleUrls: ['./allocate-transaction.component.scss'],
})
export class AllocateTransactionComponent implements OnInit {
  file: any;

  content: any;

  currentUser$: Observable<string>;
  currentUser: string = null;

  constructor(
    private snackBar: MatSnackBar,
    private userStore: Store<UserState>
  ) {}

  ngOnInit() {
    this.currentUser$ = this.userStore.pipe(select(getCurrentUser));
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  fileChanged(e) {
    const fileReader = new FileReader();
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
      fileReader.onload = (res: any) => {
        const str = res.target.result.toString();

        const parsed = JSON.parse(str);

        this.content = parsed;
      };

      fileReader.readAsText(this.file);
    }
  }

  onSubmit() {
    if (this.content) {
      if (this.currentUser === 'Broker1') {
        this.snackBar.open('Successfully Uploaded', 'Close', {
          duration: 2000,
        });
      } else {
        this.snackBar.open(
          'Only Broker1 is allowed for this actions',
          'Close',
          {
            duration: 4000,
          }
        );
      }
    } else {
      this.snackBar.open('Please select a file first', 'Close', {
        duration: 2000,
      });
    }
  }
}
