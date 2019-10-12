import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-affirm-transaction',
  templateUrl: './affirm-transaction.component.html',
  styleUrls: ['./affirm-transaction.component.scss'],
})
export class AffirmTransactionComponent implements OnInit {
  file: any;

  content: any;

  constructor(private snackBar: MatSnackBar) {}

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
      console.log(this.content);
    } else {
      this.snackBar.open('Please select a file first', 'Close', {
        duration: 2000,
      });
    }
  }
}
