import { BlockTrade } from './blockchain';
import { MatSnackBar } from '@angular/material';
import { HelperService } from './helperService';

export abstract class TradeFlow {
  abstract hasViewAccess;
  abstract hasActionAccess;
  file: any;
  content: any;

  constructor(
    protected helperService: HelperService,
    protected snackBar: MatSnackBar
  ) {}

  get isVisible() {
    return this.hasViewAccess.includes(this.currentUserId);
  }

  get currentUserId() {
    return this.helperService.getCurrentUserId();
  }

  get hasExecutionAccess() {
    return this.hasActionAccess.includes(this.currentUserId);
  }

  fileChanged(e) {
    const fileReader = new FileReader();
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
      fileReader.onload = (res: any) => {
        try {
          const str = res.target.result.toString();

          const parsed: BlockTrade = JSON.parse(str);

          this.content = parsed;
        } catch (error) {
          this.snackBar.open('File cannot be parsed to json', 'Close', {
            duration: 2000,
          });
        }
      };

      fileReader.readAsText(this.file);
    }
  }
}
