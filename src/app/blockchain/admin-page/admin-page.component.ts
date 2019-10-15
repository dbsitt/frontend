import { Component, OnInit } from '@angular/core';
import { HelperService } from '../helperService';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
  file: any = null;
  content: any = null;

  constructor(
    private helperService: HelperService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.helperService.currentUser$.subscribe(() => {
      this.file = null;
      this.content = null;
      (document.getElementsByClassName('file-chooser')[0] as any).value = '';
    });
  }

  get currentUserRole() {
    return this.helperService.getCurrentUserRole();
  }

  get currentUserId() {
    return this.helperService.getCurrentUserId();
  }

  fileChanged(e) {
    const fileReader = new FileReader();
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
      fileReader.onload = (res: any) => {
        try {
          const str = res.target.result.toString();

          const parsed: any = JSON.parse(str);

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

  onSubmit(url) {
    this.helperService.postJson(this.content, [this.currentUserId], `/${url}`);
  }
}
