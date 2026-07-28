import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { COCKTAIL_SEED } from './cocktail.seed';
import { Cocktail, CocktailPayload, CocktailStep } from '../models/cocktail.model';

@Injectable({
  providedIn: 'root',
})
export class CocktailStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly storageKey = 'bar-notes.cocktails.v1';

  private readonly storageErrorState = signal<string | null>(null);

  private readonly cocktailsState = signal<Cocktail[]>(this.load());

  readonly cocktails = this.cocktailsState.asReadonly();

  readonly storageError = this.storageErrorState.asReadonly();

  readonly totalCocktails = computed(() => this.cocktailsState().length);

  getById(id: string): Cocktail | undefined {
    return this.cocktailsState().find((cocktail) => cocktail.id === id);
  }

  create(payload: CocktailPayload): Cocktail | null {
    const now = new Date().toISOString();

    const cocktail: Cocktail = {
      id: this.createId(),
      name: payload.name,
      description: payload.description,
      finalImageUrl: payload.finalImageUrl,
      steps: this.cloneSteps(payload.steps),
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.commit([...this.cocktailsState(), cocktail]);

    return saved ? cocktail : null;
  }

  update(id: string, payload: CocktailPayload): Cocktail | null {
    const cocktails = this.cocktailsState();
    const currentCocktail = cocktails.find((cocktail) => cocktail.id === id);

    if (!currentCocktail) {
      return null;
    }

    const updatedCocktail: Cocktail = {
      ...currentCocktail,
      name: payload.name,
      description: payload.description,
      finalImageUrl: payload.finalImageUrl,
      steps: this.cloneSteps(payload.steps),
      updatedAt: new Date().toISOString(),
    };

    const nextCocktails = cocktails.map((cocktail) =>
      cocktail.id === id ? updatedCocktail : cocktail,
    );

    const saved = this.commit(nextCocktails);

    return saved ? updatedCocktail : null;
  }

  remove(id: string): boolean {
    const cocktails = this.cocktailsState();

    if (!cocktails.some((cocktail) => cocktail.id === id)) {
      return false;
    }

    return this.commit(cocktails.filter((cocktail) => cocktail.id !== id));
  }

  private commit(cocktails: Cocktail[]): boolean {
    if (!this.isBrowser) {
      this.cocktailsState.set(cocktails);
      return true;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cocktails));

      this.cocktailsState.set(cocktails);
      this.storageErrorState.set(null);

      return true;
    } catch (error) {
      this.storageErrorState.set(this.getStorageErrorMessage(error));

      return false;
    }
  }

  private load(): Cocktail[] {
    if (!this.isBrowser) {
      return this.cloneSeed();
    }

    try {
      const storedValue = localStorage.getItem(this.storageKey);

      if (!storedValue) {
        return this.cloneSeed();
      }

      const parsedValue: unknown = JSON.parse(storedValue);

      if (!Array.isArray(parsedValue)) {
        throw new Error('Сохранённые данные имеют неверный формат.');
      }

      const cocktails = parsedValue
        .map((value) => this.normalizeCocktail(value))
        .filter((cocktail): cocktail is Cocktail => cocktail !== null);

      /*
       * Пустой массив является допустимым состоянием:
       * пользователь мог удалить все рецепты.
       */
      return cocktails;
    } catch {
      this.storageErrorState.set(
        'Сохранённые данные были повреждены. Загружена стартовая коллекция.',
      );

      return this.cloneSeed();
    }
  }

  private normalizeCocktail(value: unknown): Cocktail | null {
    if (!this.isRecord(value)) {
      return null;
    }

    if (
      typeof value['id'] !== 'string' ||
      typeof value['name'] !== 'string' ||
      typeof value['description'] !== 'string'
    ) {
      return null;
    }

    const createdAt =
      typeof value['createdAt'] === 'string' ? value['createdAt'] : new Date().toISOString();

    const updatedAt = typeof value['updatedAt'] === 'string' ? value['updatedAt'] : createdAt;

    return {
      id: value['id'],
      name: value['name'],
      description: value['description'],

      finalImageUrl: typeof value['finalImageUrl'] === 'string' ? value['finalImageUrl'] : null,

      steps: this.normalizeSteps(value['steps']),
      createdAt,
      updatedAt,
    };
  }

  private normalizeSteps(value: unknown): CocktailStep[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((step): CocktailStep | null => {
        if (!this.isRecord(step)) {
          return null;
        }

        if (typeof step['title'] !== 'string' || typeof step['description'] !== 'string') {
          return null;
        }

        return {
          id: typeof step['id'] === 'string' ? step['id'] : this.createId(),

          title: step['title'],
          description: step['description'],

          imageUrl: typeof step['imageUrl'] === 'string' ? step['imageUrl'] : null,
        };
      })
      .filter((step): step is CocktailStep => step !== null);
  }

  private cloneSteps(steps: CocktailStep[]): CocktailStep[] {
    return steps.map((step) => ({
      ...step,
    }));
  }

  private cloneSeed(): Cocktail[] {
    return COCKTAIL_SEED.map((cocktail) => ({
      ...cocktail,

      steps: cocktail.steps.map((step) => ({
        ...step,
      })),
    }));
  }

  private createId(): string {
    return (
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private getStorageErrorMessage(error: unknown): string {
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      return [
        'Не удалось сохранить рецепт:',
        'локальное хранилище переполнено.',
        'Попробуйте использовать изображения меньшего размера.',
      ].join(' ');
    }

    return 'Не удалось записать данные в локальное хранилище.';
  }
}
