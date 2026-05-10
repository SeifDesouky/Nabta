import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { cropInput, CropPrediction } from '../../../../core/models/AI.models/recommendation.model';
import { CommonModule } from '@angular/common';
import { RecommendationService } from '../../../../core/services/AI-Module/Recommendation/recommendation.service';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './recommendation.component.html',
  styleUrl: './recommendation.component.css'
})
export class RecommendationComponent {

  isLoading=false
  predictions:CropPrediction[]=[]
  hasResult=false
  errorMsg:string|null=null
  rankClass=['first','second','third']
  rankIcon=['🥇', '🥈', '🥉']

  constructor(private recService:RecommendationService){}

  form=new FormGroup({
    N:new FormControl(null,[Validators.required,Validators.min(0)]),
    P:new FormControl(null,[Validators.required,Validators.min(0)]),
    K:new FormControl(null,[Validators.required,Validators.min(0)]),
    temperature:new FormControl('',[Validators.required,Validators.min(0)]),
    humidity:new FormControl('',[Validators.required,Validators.min(0)]),
    ph:new FormControl('',[Validators.required,Validators.min(0)]),
    rainfall:new FormControl('',[Validators.required,Validators.min(0)]),
  })

  analyze():void{
    if(this.form.invalid){
      this.form.markAllAsTouched()
      return
    }
    const formValue=this.form.value
    const payload: cropInput = {
      N: Number(formValue.N),
      P: Number(formValue.P),
      K: Number(formValue.K),
      temperature: Number(formValue.temperature),
      humidity: Number(formValue.humidity),
      ph: Number(formValue.ph),
      rainfall: Number(formValue.rainfall),
    };
    this.isLoading=true
    this.errorMsg=null
    this.hasResult=false
    this.recService.recommend(payload).subscribe({
      next:(res)=>{
        this.predictions=res.predictions
        this.hasResult=true
        this.isLoading=false
      },
      error:(err)=>{
        console.error(err);
        this.errorMsg='Failed to reach AI model. please try again'
        this.isLoading=false
      }
      
    })
  }

  formatCrop(name:string):string{
    return name.charAt(0).toUpperCase()+name.slice(1)
  }

  barWidth(confidence:number):string{
    return Math.max(confidence,4)+'%'
  }

  isInvalid(field:string):boolean{
    const c=this.form.get(field)
    return !!(c && c.invalid && c.touched)
  }
  
}
