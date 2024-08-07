import { CountryFormatInterface } from './country-format.interface';

export interface CountryResponseInterface {
  total: number;
  page: number;
  limit: number;
  data: CountryFormatInterface[];
}
