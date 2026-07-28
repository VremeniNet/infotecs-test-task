import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CocktailStore } from '../../data-access/cocktail.store';

@Component({
  selector: 'app-cocktail-detail-page',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './cocktail-detail-page.html',
  styleUrl: './cocktail-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CocktailDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly cocktailStore = inject(CocktailStore);

  private readonly cocktailId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly cocktail = computed(() => this.cocktailStore.getById(this.cocktailId));
}
