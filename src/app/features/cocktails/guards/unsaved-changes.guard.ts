import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs';

import { UnsavedChangesDialog } from '../../../shared/ui/unsaved-changes-dialog/unsaved-changes-dialog';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  const dialog = inject(MatDialog);

  return dialog
    .open<UnsavedChangesDialog, void, boolean>(UnsavedChangesDialog, {
      width: '490px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
      autoFocus: '.continue-button',
      restoreFocus: true,
    })
    .afterClosed()
    .pipe(map((shouldLeave) => shouldLeave === true));
};
