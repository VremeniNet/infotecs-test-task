import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ImageProcessorService } from '../../../../shared/data-access/image-processor.service';
import { CocktailStore } from '../../data-access/cocktail.store';
import { CocktailPayload, CocktailStep } from '../../models/cocktail.model';

type CocktailStepForm = FormGroup<{
  id: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string>;
  imageUrl: FormControl<string | null>;
}>;

type CocktailEditorForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  finalImageUrl: FormControl<string | null>;
  steps: FormArray<CocktailStepForm>;
}>;

@Component({
  selector: 'app-cocktail-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './cocktail-form-page.html',
  styleUrl: './cocktail-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CocktailFormPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly cocktailStore = inject(CocktailStore);
  private readonly imageProcessor = inject(ImageProcessorService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly cocktailId = this.route.snapshot.paramMap.get('id');

  readonly isEditMode = this.cocktailId !== null;
  readonly recipeNotFound = signal(false);
  readonly isProcessingImage = signal(false);

  readonly form: CocktailEditorForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
    ]),

    description: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(1000),
    ]),

    finalImageUrl: this.formBuilder.control<string | null>(null),

    steps: this.formBuilder.array<CocktailStepForm>([]),
  });

  constructor() {
    this.initializeForm();
  }

  get steps(): FormArray<CocktailStepForm> {
    return this.form.controls.steps;
  }

  addStep(): void {
    this.steps.push(this.createStepForm());
  }

  removeStep(index: number): void {
    if (this.steps.length <= 1) {
      this.snackBar.open('У рецепта должен остаться хотя бы один этап.', 'Закрыть', {
        duration: 3000,
      });

      return;
    }

    this.steps.removeAt(index);
    this.form.markAsDirty();
  }

  moveStepUp(index: number): void {
    this.moveStep(index, index - 1);
  }

  moveStepDown(index: number): void {
    this.moveStep(index, index + 1);
  }

  async selectFinalImage(event: Event): Promise<void> {
    const file = this.extractFile(event);

    if (!file) {
      return;
    }

    await this.processImage(file, (imageUrl) => {
      this.form.controls.finalImageUrl.setValue(imageUrl);
      this.form.controls.finalImageUrl.markAsDirty();
    });
  }

  removeFinalImage(): void {
    this.form.controls.finalImageUrl.setValue(null);
    this.form.controls.finalImageUrl.markAsDirty();
  }

  async selectStepImage(event: Event, index: number): Promise<void> {
    const file = this.extractFile(event);
    const step = this.steps.at(index);

    if (!file || !step) {
      return;
    }

    await this.processImage(file, (imageUrl) => {
      step.controls.imageUrl.setValue(imageUrl);
      step.controls.imageUrl.markAsDirty();
    });
  }

  removeStepImage(index: number): void {
    const step = this.steps.at(index);

    if (!step) {
      return;
    }

    step.controls.imageUrl.setValue(null);
    step.controls.imageUrl.markAsDirty();
  }

  async save(): Promise<void> {
    if (this.isProcessingImage()) {
      this.snackBar.open('Дождитесь завершения обработки изображения.', 'Закрыть', {
        duration: 3000,
      });

      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.snackBar.open('Проверьте обязательные поля формы.', 'Закрыть', {
        duration: 3000,
      });

      return;
    }

    const rawValue = this.form.getRawValue();

    const payload: CocktailPayload = {
      name: rawValue.name.trim(),
      description: rawValue.description.trim(),
      finalImageUrl: rawValue.finalImageUrl,

      steps: rawValue.steps.map((step) => ({
        id: step.id,
        title: step.title.trim(),
        description: step.description.trim(),
        imageUrl: step.imageUrl,
      })),
    };

    const savedCocktail =
      this.isEditMode && this.cocktailId
        ? this.cocktailStore.update(this.cocktailId, payload)
        : this.cocktailStore.create(payload);

    if (!savedCocktail) {
      this.snackBar.open(
        this.cocktailStore.storageError() ?? 'Не удалось сохранить рецепт.',
        'Закрыть',
        {
          duration: 5000,
        },
      );

      return;
    }

    this.form.markAsPristine();

    this.snackBar.open(
      this.isEditMode ? 'Рецепт обновлён.' : 'Рецепт добавлен в коллекцию.',
      'Закрыть',
      {
        duration: 2500,
      },
    );

    await this.router.navigate(['/cocktails', savedCocktail.id]);
  }

  private initializeForm(): void {
    if (!this.cocktailId) {
      this.addStep();
      return;
    }

    const cocktail = this.cocktailStore.getById(this.cocktailId);

    if (!cocktail) {
      this.recipeNotFound.set(true);
      return;
    }

    this.form.patchValue({
      name: cocktail.name,
      description: cocktail.description,
      finalImageUrl: cocktail.finalImageUrl,
    });

    for (const step of cocktail.steps) {
      this.steps.push(this.createStepForm(step));
    }

    if (this.steps.length === 0) {
      this.addStep();
    }

    this.form.markAsPristine();
  }

  private createStepForm(step?: Partial<CocktailStep>): CocktailStepForm {
    return this.formBuilder.group({
      id: this.formBuilder.nonNullable.control(step?.id ?? this.createId()),

      title: this.formBuilder.nonNullable.control(step?.title ?? '', [
        Validators.required,
        Validators.maxLength(100),
      ]),

      description: this.formBuilder.nonNullable.control(step?.description ?? '', [
        Validators.required,
        Validators.maxLength(700),
      ]),

      imageUrl: this.formBuilder.control<string | null>(step?.imageUrl ?? null),
    });
  }

  private moveStep(currentIndex: number, targetIndex: number): void {
    if (targetIndex < 0 || targetIndex >= this.steps.length) {
      return;
    }

    const step = this.steps.at(currentIndex);

    this.steps.removeAt(currentIndex);
    this.steps.insert(targetIndex, step);

    this.form.markAsDirty();
  }

  private extractFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    input.value = '';

    return file;
  }

  private async processImage(file: File, onSuccess: (imageUrl: string) => void): Promise<void> {
    this.isProcessingImage.set(true);

    try {
      const imageUrl = await this.imageProcessor.process(file);

      onSuccess(imageUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обработать изображение.';

      this.snackBar.open(message, 'Закрыть', {
        duration: 4000,
      });
    } finally {
      this.isProcessingImage.set(false);
    }
  }

  private createId(): string {
    return (
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  }

  hasUnsavedChanges(): boolean {
    return !this.recipeNotFound() && (this.form.dirty || this.isProcessingImage());
  }

  @HostListener('window:beforeunload', ['$event'])
  protectUnsavedChanges(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedChanges()) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  }
}
