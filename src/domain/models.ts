export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Environment {
  id: number;
  name: string;
}

export interface Feature {
  id: number;
  key: string;
  description: string | null;
}

export interface FeatureValue {
  id: number;
  feature_id: number;
  environment_id: number;
  value: number;
}
