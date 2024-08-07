export interface CountryFormatInterface {
  commonName: string;
  population: number;
  languages: Record<string, string>;
  latlng: number[];
  borders: string[];
}
