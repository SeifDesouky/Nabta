export interface cropInput{
    N:number;
    P:number;
    K:number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
}

export interface CropPrediction{
    rank:number,
    crop:string,
    confidence:number,
    image:string
}

export interface CropResponse{
    predictions:CropPrediction[]
}