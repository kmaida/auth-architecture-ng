import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-resource-api-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="resource-api-page">
      <h1>Call an External API</h1>
      <p>This page makes a secured <code>GET</code> request to the backend to proxy a call to a cross-domain external API. The user must be logged in and have a valid session in an <code>httpOnly</code> cookie to call the appropriate backend endpoint. The backend uses the session to look up the access token, add <code>Authorization: Bearer 'accessToken'</code>, and send the request to the external resource API. The returned data is a randomized, made-up recipe (though you're welcome to try to cook it).</p>

      <button
        (click)="fetchRecipe()"
        [disabled]="loading()"
        class="btn btn-primary"
      >
        {{ loading() ? 'Fetching Recipe...' : 'Get New Recipe' }}
      </button>

      <ng-container *ngIf="!error()">
        <ng-container *ngIf="recipe(); else unableBlock">
          <div class="recipe">
            <h2>{{ recipe().name }}</h2>
            <div class="recipe-lists">
              <ul class="details">
                <li><strong>Cuisine:</strong> {{ recipe().cuisine }}</li>
                <li><strong>Difficulty:</strong> {{ recipe().difficulty }}</li>
                <li><strong>Cooking Time:</strong> {{ recipe().cookingTime }}</li>
                <li><strong>Servings:</strong> {{ recipe().servings }}</li>
              </ul>
              <ul class="ingredients">
                <li>{{ recipe().ingredients.protein }}</li>
                <ng-container *ngFor="let veg of recipe().ingredients.vegetables">
                  <li>{{ veg }}</li>
                </ng-container>
                <li>{{ recipe().ingredients.grain }}</li>
                <li>{{ recipe().ingredients.sauce }}</li>
                <li>{{ recipe().ingredients.garnish }}</li>
              </ul>
            </div>
            <ol class="instructions">
              <ng-container *ngFor="let step of recipe().instructions; let i = index">
                <li>{{ step }}</li>
              </ng-container>
            </ol>
            <p class="tips"><em>{{ recipe().tips }}</em></p>
          </div>
        </ng-container>
        <ng-template #unableBlock>
          <ng-container *ngIf="!loading()">
            <p>Unable to fetch recipe (see output below)</p>
          </ng-container>
        </ng-template>
      </ng-container>

      <h2>Raw Recipe Response</h2>

      <ng-container *ngIf="error()">
        <pre class="error">Error: {{ error()?.message }}</pre>
      </ng-container>
      <ng-container *ngIf="!error()">
        <ng-container *ngIf="recipe(); else noRecipeBlock">
          <pre class="json">{{ recipe() | json }}</pre>
        </ng-container>
        <ng-template #noRecipeBlock>
          <ng-container *ngIf="!loading()">
            <pre>Click the button to fetch a recipe...</pre>
          </ng-container>
        </ng-template>
      </ng-container>
    </section>
  `,
  styles: []
})
export class ResourceApiPage {
  protected readonly recipe = signal<any>(null);
  protected readonly error = signal<any>(null);
  protected readonly loading = signal(false);
  protected readonly apiUrl = environment.apiUrl ?? '';

  constructor() {
    this.fetchRecipe();
  }

  async fetchRecipe() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await fetch(`${this.apiUrl}/resource/api/recipe`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch resource API data');
      const result = await res.json();
      this.recipe.set(result);
    } catch (err: unknown) {
      this.error.set(err);
      this.recipe.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
