import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfirmDeleteDialog } from '../../../../shared/ui/confirm-delete-dialog/confirm-delete-dialog';
import { CocktailStore } from '../../data-access/cocktail.store';
import { Cocktail } from '../../models/cocktail.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

type CatalogViewMode = 'grid' | 'table';

@Component({
  selector: 'app-cocktail-list-page',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './cocktail-list-page.html',
  styleUrl: './cocktail-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CocktailListPage {
  readonly cocktailStore = inject(CocktailStore);

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly searchQuery = signal('');
  readonly viewMode = signal<CatalogViewMode>('grid');

  readonly displayedColumns = ['image', 'createdAt', 'name', 'steps', 'actions'];

  readonly filteredCocktails = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase('ru-RU');

    return [...this.cocktailStore.cocktails()]
      .filter((cocktail) => {
        if (!query) {
          return true;
        }

        const searchableValue = [cocktail.name, cocktail.description]
          .join(' ')
          .toLocaleLowerCase('ru-RU');

        return searchableValue.includes(query);
      })
      .sort(
        (firstCocktail, secondCocktail) =>
          Date.parse(secondCocktail.createdAt) - Date.parse(firstCocktail.createdAt),
      );
  });

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchQuery.set(input.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  changeViewMode(event: MatButtonToggleChange): void {
    const value: unknown = event.value;

    if (value === 'grid' || value === 'table') {
      this.viewMode.set(value);
    }
  }

  openDeleteDialog(cocktail: Cocktail): void {
    const dialogRef = this.dialog.open<ConfirmDeleteDialog, { cocktailName: string }, boolean>(
      ConfirmDeleteDialog,
      {
        width: '460px',
        maxWidth: 'calc(100vw - 32px)',
        data: {
          cocktailName: cocktail.name,
        },
        autoFocus: 'dialog',
        restoreFocus: true,
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      const removed = this.cocktailStore.remove(cocktail.id);

      if (removed) {
        this.snackBar.open(`Рецепт «${cocktail.name}» удалён.`, 'Закрыть', {
          duration: 2500,
        });

        return;
      }

      this.snackBar.open(
        this.cocktailStore.storageError() ?? 'Не удалось удалить рецепт.',
        'Закрыть',
        {
          duration: 5000,
        },
      );
    });
  }
}
