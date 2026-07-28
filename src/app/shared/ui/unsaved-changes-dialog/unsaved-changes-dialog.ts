import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-unsaved-changes-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './unsaved-changes-dialog.html',
  styleUrl: './unsaved-changes-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnsavedChangesDialog {
  private readonly dialogRef = inject<MatDialogRef<UnsavedChangesDialog, boolean>>(MatDialogRef);

  stay(): void {
    this.dialogRef.close(false);
  }

  leave(): void {
    this.dialogRef.close(true);
  }
}
