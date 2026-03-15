export interface Area {
  id: string;
  name?: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  allowedType: "image" | "text" | "both";
  imagePrice: number;
  textPrice: number;
}

export interface PartData {
  url: string;
}

export interface PartDefinition {
  id: string;
  name: string;
  isCommon: boolean;
  areas: Area[];
}

export interface CustomizerState {
  parts: { [name: string]: PartDefinition };
  commonImages: { [name: string]: string };
  colorImages: { [color: string]: { [name: string]: string } };
}
