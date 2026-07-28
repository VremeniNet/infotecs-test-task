export interface CocktailStep {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

export interface Cocktail {
  id: string;
  name: string;
  description: string;
  finalImageUrl: string | null;
  steps: CocktailStep[];
  createdAt: string;
  updatedAt: string;
}

export type CocktailPayload = Pick<Cocktail, 'name' | 'description' | 'finalImageUrl' | 'steps'>;
