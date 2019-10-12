import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlockTrade } from '../blockchain';

@Component({
  selector: 'app-data-upload',
  templateUrl: './block-trade.component.html',
  styleUrls: ['./block-trade.component.scss'],
})
export class BlockTradeComponent implements OnInit {
  file: any;

  content: BlockTrade;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {}

  fileChanged(e) {
    const fileReader = new FileReader();
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
      fileReader.onload = (res: any) => {
        const str = res.target.result.toString();

        const parsed: BlockTrade = JSON.parse(str);

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
