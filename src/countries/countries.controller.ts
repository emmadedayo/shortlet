import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryQueryDataDto } from './dto/country-query-data.dto';
import { StatsDto } from './dto/stats.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CountryResponseInterface } from './interfaces/country-response.interface';
import { CountryFormatInterface } from './interfaces/country-format.interface';
import { RegionInterface } from './interfaces/region.interface';
import { LanguageInterface } from './interfaces/language.interface';

@Controller('')
@UseGuards(ThrottlerGuard)
@ApiTags('Country-API Documentation')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get('countries')
  @ApiOperation({
    summary: 'Retrieve a list of countries based on search criteria',
    description:
      'Fetches a list of countries that match the provided search criteria. Results include pagination and are sorted alphabetically by country name.',
  })
  @ApiResponse({
    status: 200,
    description:
      'A list of countries matching the search criteria, including pagination information.',
  })
  getCountries(
    @Query() searchCountryQuery: CountryQueryDataDto,
  ): Promise<CountryResponseInterface> {
    return this.countriesService.getCountries(searchCountryQuery);
  }

  @Get('countries/:name')
  @ApiOperation({
    summary: 'Retrieve details of a country by name',
    description:
      'Fetches detailed information about a specific country based on its name. Returns formatted country details including population, languages, borders, and geographical coordinates.',
  })
  @ApiParam({
    name: 'name',
    type: String,
    description: 'The name of the country to retrieve details for.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed information about the specified country.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The specified country could not be found.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error: An unexpected error occurred on the server.',
  })
  getCountryByName(
    @Param('name') name: string,
  ): Promise<CountryFormatInterface> {
    return this.countriesService.getCountryByName(name);
  }

  @Get('regions')
  @ApiOperation({
    summary: 'Retrieve a list of regions with aggregated country data',
    description:
      'Fetches a list of regions, including details such as the list of countries within each region and the total population of each region.',
  })
  @ApiResponse({
    status: 200,
    description:
      'A list of regions with details including countries and total population.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error: An unexpected error occurred on the server.',
  })
  getRegions(): Promise<Record<string, RegionInterface>> {
    return this.countriesService.getRegions();
  }

  @Get('languages')
  @ApiOperation({
    summary: 'Retrieve a list of languages with details',
    description:
      'Fetches a list of languages, including information about which countries speak each language and the total number of speakers for each language.',
  })
  @ApiResponse({
    status: 200,
    description:
      'A list of languages with details including the countries where each language is spoken and the total number of speakers.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error: An unexpected error occurred on the server.',
  })
  getLanguages(): Promise<Record<string, LanguageInterface>> {
    return this.countriesService.getLanguages();
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Retrieve various statistics about countries',
    description:
      'Fetches general statistics about countries such as the total number of countries, average population, and other relevant metrics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Various statistics about countries.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error: An unexpected error occurred on the server.',
  })
  getStatistics(): Promise<StatsDto> {
    return this.countriesService.getStatistics();
  }
}
