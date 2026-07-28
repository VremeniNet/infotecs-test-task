import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './features/cocktails/guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/app-shell/app-shell').then((component) => component.AppShell),
    children: [
      {
        path: '',
        title: 'Bar Notes',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then(
            (component) => component.HomePage,
          ),
      },
      {
        path: 'cocktails',
        title: 'Коллекция коктейлей — Bar Notes',
        loadComponent: () =>
          import('./features/cocktails/pages/cocktail-list-page/cocktail-list-page').then(
            (component) => component.CocktailListPage,
          ),
      },
      {
        path: 'cocktails/new',
        title: 'Новый рецепт — Bar Notes',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./features/cocktails/pages/cocktail-form-page/cocktail-form-page').then(
            (component) => component.CocktailFormPage,
          ),
      },
      {
        path: 'cocktails/:id/edit',
        title: 'Редактирование рецепта — Bar Notes',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./features/cocktails/pages/cocktail-form-page/cocktail-form-page').then(
            (component) => component.CocktailFormPage,
          ),
      },
      {
        path: 'cocktails/:id',
        title: 'Рецепт коктейля — Bar Notes',
        loadComponent: () =>
          import('./features/cocktails/pages/cocktail-detail-page/cocktail-detail-page').then(
            (component) => component.CocktailDetailPage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
