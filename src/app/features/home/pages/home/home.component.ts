import { Component } from '@angular/core';
import { HeroComponent } from "../../components/hero/hero.component";
import { NavbarComponent } from "../../../../shared/components/navbar/navbar.component";
import { FooterComponent } from "../../../../shared/components/footer/footer.component";
import { FeaturesComponent } from "../../components/features/features.component";
import { ArticlesComponent } from "../../components/articles/articles.component";
import { TestimonialsComponent } from "../../components/testimonials/testimonials.component";
import { CtaComponent } from "../../components/cta/cta.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, NavbarComponent, FooterComponent, FeaturesComponent, ArticlesComponent, TestimonialsComponent, CtaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
