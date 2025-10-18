import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="resource-api-page">
      <h1>Call a Proxied External API</h1>
      <p>This page makes a <code>GET</code> request to an external API that has been proxied to <code>/api</code>. A request is made on page load and each time the <code>Get New Recipe</code> button is clicked. The resource server requires authorization, which the request delivers with the <code>app.at</code> cookie set by FusionAuth's hosted backend. The returned data is a randomized, made-up recipe (though you're welcome to try to cook it).</p>

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
                @for (veg of recipe()!.ingredients.vegetables; track $index) {
                  <li>{{ veg }}</li>
                }
                <li>{{ recipe()!.ingredients.grain }}</li>
                <li>{{ recipe()!.ingredients.sauce }}</li>
                <li>{{ recipe()!.ingredients.garnish }}</li>
              </ul>
            </div>
            <ol class="instructions">
              @for (step of recipe()!.instructions; track $index) {
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
export class ResourceApiPage implements OnInit{
  private readonly http = inject(HttpClient);
  protected readonly recipe = signal<Recipe | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly loading = signal(false);

  ngOnInit() {
    this.fetchRecipe();
  }

  fetchRecipe() {
    this.loading.set(true);
    this.error.set(null);
    // Uses a proxy to call the external API as a same-domain request(see proxy.conf.json)
    this.http.get<Recipe>(`/api/recipe`, { withCredentials: true }).subscribe({
      next: (result) => this.recipe.set(result),
      error: (err) => {
        this.error.set(err);
        this.recipe.set(null);
      },
      complete: () => this.loading.set(false),
    });
  }
}
