import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';
import { UiState } from 'src/app/store/ui.reducer';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-affirm-transaction',
  templateUrl: './affirm-transaction.component.html',
  styleUrls: ['./affirm-transaction.component.scss'],
})
export class AffirmTransactionComponent implements OnInit {
  file: any;

  content: any;

  constructor(
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {}

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
      this.httpClient.get(environment.clientApi + '/affirmation');
    } else {
      this.snackBar.open('Please select a file first', 'Close', {
        duration: 2000,
      });
    }
  }
}
