import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

interface Recipe {
  name: string;
  cuisine: string;
  difficulty: string;
  cookingTime: string;
  servings: number;
  ingredients: {
    protein: string;
    vegetables: string[];
    grain: string;
    sauce: string;
    garnish: string;
  };
  instructions: string[];
  tips: string;
}

@Component({
  selector: 'app-resource-api-page',
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

      @if (!error()) {
        @if (recipe()) {
          <div class="recipe">
            <h2>{{ recipe()!.name }}</h2>
            <div class="recipe-lists">
              <ul class="details">
                <li><strong>Cuisine:</strong> {{ recipe()!.cuisine }}</li>
                <li><strong>Difficulty:</strong> {{ recipe()!.difficulty }}</li>
                <li><strong>Cooking Time:</strong> {{ recipe()!.cookingTime }}</li>
                <li><strong>Servings:</strong> {{ recipe()!.servings }}</li>
              </ul>
              <ul class="ingredients">
                <li>{{ recipe()!.ingredients.protein }}</li>
                @for (veg of recipe()!.ingredients.vegetables; track veg) {
                  <li>{{ veg }}</li>
                }
                <li>{{ recipe()!.ingredients.grain }}</li>
                <li>{{ recipe()!.ingredients.sauce }}</li>
                <li>{{ recipe()!.ingredients.garnish }}</li>
              </ul>
            </div>
            <ol class="instructions">
              @for (step of recipe()!.instructions; track step) {
                <li>{{ step }}</li>
              }
            </ol>
            <p class="tips"><em>{{ recipe()!.tips }}</em></p>
          </div>
        } @else {
          @if (!loading()) {
            <p>Unable to fetch recipe (see output below)</p>
          }
        }
      }

      <h2>Raw Recipe Response</h2>

      @if (error()) {
        <pre class="error">Error: {{ error() }}</pre>
      } @else {
        @if (recipe()) {
          <pre class="json">{{ recipe() | json }}</pre>
        } @else {
          @if (!loading()) {
            <pre>Click the button to fetch a recipe...</pre>
          }
        }
      }
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceApiPage implements OnInit {
  protected readonly recipe = signal<any>(null);
  protected readonly error = signal<any>(null);
  protected readonly loading = signal(false);
  protected readonly resourceApiUrl = environment.resourceApiUrl ?? 'http://resource-api.local:5001';
  private readonly auth = inject(AuthService);

  ngOnInit() {
    this.fetchRecipe();
  }

  async fetchRecipe() {
    this.loading.set(true);
    this.error.set(null);
    try {
      // Fetch the latest access token from the backend
      const accessToken = this.auth.getAccessToken();
      if (accessToken) {
        // Make request to the resource API with the access token
        const res = await fetch(`${this.resourceApiUrl}/api/recipe`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch resource API data');
        const result = await res.json();
        this.recipe.set(result);
      }
    } catch (err: unknown) {
      this.error.set(err);
      this.recipe.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
