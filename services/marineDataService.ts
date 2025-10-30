import { HistoricalDataPoint, MarineData, Region } from '../types';

interface RegionConfig {
  latitude: number;
  longitude: number;
  plasticEntity: string;
}

const REGION_CONFIG: Record<Region, RegionConfig> = {
  [Region.EAST_SEA]: { latitude: 37.5, longitude: 130.8, plasticEntity: 'South Korea' },
  [Region.WEST_SEA]: { latitude: 37.0, longitude: 124.5, plasticEntity: 'China' },
  [Region.SOUTH_SEA]: { latitude: 34.5, longitude: 128.0, plasticEntity: 'South Korea' },
  [Region.JEJU_ISLAND]: { latitude: 33.5, longitude: 126.5, plasticEntity: 'Japan' },
};

const OPEN_METEO_ENDPOINT = 'https://marine-api.open-meteo.com/v1/marine';
const SALINITY_ENDPOINT = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplSMAPSSMISv5.json';
const CHLOROPHYLL_ENDPOINT = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/erdMH1chlamday.json';
const PLASTIC_OCEAN_DATASET = 'https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/Plastic%20ocean%20pollution%20(Meijer%20et%20al.%202021)/Plastic%20ocean%20pollution%20(Meijer%20et%20al.%202021).csv';
const PLASTIC_WASTE_DATASET = 'https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/Plastic%20waste%20generation%20by%20country%20-%20OWID%20based%20on%20Jambeck%20et%20al.%20%26%20World%20Bank/Plastic%20waste%20generation%20by%20country%20-%20OWID%20based%20on%20Jambeck%20et%20al.%20%26%20World%20Bank.csv';

interface OpenMeteoResponse {
  hourly?: {
    time: string[];
    sea_surface_temperature?: number[];
    wave_height?: number[];
  };
}

interface ErddapResponse {
  table?: {
    rows?: (string | number)[][];
  };
}

const roundTo = (value: number, digits: number = 2): number => {
  return Number(value.toFixed(digits));
};

const toDateLabel = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
};

const fetchOpenMeteoSeries = async (latitude: number, longitude: number) => {
  const url = new URL(OPEN_METEO_ENDPOINT);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('hourly', 'wave_height,sea_surface_temperature');
  url.searchParams.set('past_days', '7');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'Asia/Seoul');

  const data = await fetchJson<OpenMeteoResponse>(url.toString());
  const hourly = data.hourly;
  if (!hourly || !hourly.time?.length) {
    throw new Error('No hourly marine data returned from Open-Meteo');
  }

  const entries = hourly.time.map((time, index) => ({
    time,
    temperature: hourly.sea_surface_temperature?.[index],
    wave: hourly.wave_height?.[index],
  })).filter(entry => typeof entry.temperature === 'number' && typeof entry.wave === 'number') as Array<{ time: string; temperature: number; wave: number }>;

  if (!entries.length) {
    throw new Error('Open-Meteo returned no usable temperature or wave data');
  }

  const sliceStart = Math.max(entries.length - 30, 0);
  const recent = entries.slice(sliceStart);

  const temperatureSeries: HistoricalDataPoint[] = recent.map(entry => ({
    name: toDateLabel(entry.time),
    value: roundTo(entry.temperature ?? 0, 2),
  }));

  const waveSeries: HistoricalDataPoint[] = recent.map(entry => ({
    name: toDateLabel(entry.time),
    value: roundTo(entry.wave ?? 0, 2),
  }));

  const latest = recent[recent.length - 1];

  return {
    temperature: {
      current: roundTo(latest.temperature, 2),
      historical: temperatureSeries,
    },
    waveHeight: {
      current: roundTo(latest.wave, 2),
      historical: waveSeries,
    },
  };
};

const buildErddapQuery = (endpoint: string, variable: string, latitude: number, longitude: number, range: string = '(last-29):1:(last)') => {
  const normalizedLongitude = longitude < 0 ? 360 + longitude : longitude;
  const encodedVariable = encodeURIComponent(`${variable}[${range}][(${latitude.toFixed(2)})][(${normalizedLongitude.toFixed(2)})]`);
  return `${endpoint}?${encodedVariable}`;
};

const fetchErddapSeries = async (endpoint: string, variable: string, latitude: number, longitude: number): Promise<{ current: number; historical: HistoricalDataPoint[] }> => {
  const url = buildErddapQuery(endpoint, variable, latitude, longitude);
  const data = await fetchJson<ErddapResponse>(url);
  const rows = data.table?.rows ?? [];
  if (!rows.length) {
    throw new Error(`No ${variable} data returned from ERDDAP`);
  }

  const points = rows.map(row => {
    const [time, , , value] = row;
    return {
      time: String(time),
      value: Number(value),
    };
  }).filter(point => Number.isFinite(point.value));

  if (!points.length) {
    throw new Error(`ERDDAP returned empty ${variable} dataset`);
  }

  const historical: HistoricalDataPoint[] = points.map(point => ({
    name: toDateLabel(point.time),
    value: roundTo(point.value, 3),
  }));

  const current = historical[historical.length - 1]?.value ?? historical[0].value;

  return { current, historical };
};

const parseCsv = (raw: string): string[][] => {
  return raw
    .trim()
    .split(/\r?\n/)
    .map(line => {
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          cells.push(current);
          current = '';
        } else {
          current += char;
        }
      }

      cells.push(current);

      return cells.map(value => value.trim().replace(/^"(.*)"$/, '$1'));
    });
};

const fetchPlasticSeries = async (entity: string): Promise<{ index: number; historical: HistoricalDataPoint[] }> => {
  const [oceanCsv, wasteCsv] = await Promise.all([
    fetchText(PLASTIC_OCEAN_DATASET),
    fetchText(PLASTIC_WASTE_DATASET),
  ]);

  const oceanRows = parseCsv(oceanCsv);
  const wasteRows = parseCsv(wasteCsv);

  const oceanHeader = oceanRows[0];
  const wasteHeader = wasteRows[0];

  const oceanDataRows = oceanRows.slice(1);
  const wasteDataRows = wasteRows.slice(1);

  const mismanagedColumnIndex = oceanHeader.indexOf('Mismanaged plastic waste (metric tons year-1)');
  const oceanEmissionIndex = oceanHeader.indexOf('Mismanaged waste emitted to the ocean (metric tons year-1)');

  if (mismanagedColumnIndex === -1 || oceanEmissionIndex === -1) {
    throw new Error('Plastic dataset format has changed');
  }

  const entityOceanRows = oceanDataRows.filter(row => row[0] === entity);
  const entityWasteRows = wasteDataRows.filter(row => row[0] === entity);

  if (!entityOceanRows.length || !entityWasteRows.length) {
    throw new Error(`Plastic datasets do not contain entity: ${entity}`);
  }

  const emissionValues = oceanDataRows
    .map(row => Number(row[oceanEmissionIndex]))
    .filter(value => Number.isFinite(value));

  const maxEmission = emissionValues.length ? Math.max(...emissionValues) : 1;
  const latestOceanRow = entityOceanRows[entityOceanRows.length - 1];
  const currentEmission = Number(latestOceanRow[oceanEmissionIndex]);

  const normalizedIndex = maxEmission ? currentEmission / maxEmission : 0;

  const historical: HistoricalDataPoint[] = [];

  const wasteValueIndex = wasteHeader.indexOf('Plastic waste generation (tonnes, total)');
  if (wasteValueIndex !== -1) {
    entityWasteRows.forEach(row => {
      const yearLabel = row[1];
      const value = Number(row[wasteValueIndex]);
      if (Number.isFinite(value)) {
        historical.push({
          name: `${yearLabel} 폐기물 발생`,
          value: roundTo(value / 1_000_000, 3),
        });
      }
    });
  }

  entityOceanRows.forEach(row => {
    const yearLabel = row[1];
    const mismanagedValue = Number(row[mismanagedColumnIndex]);
    const emissionValue = Number(row[oceanEmissionIndex]);
    if (Number.isFinite(mismanagedValue)) {
      historical.push({
        name: `${yearLabel} 미관리 폐기물`,
        value: roundTo(mismanagedValue / 1_000_000, 3),
      });
    }
    if (Number.isFinite(emissionValue)) {
      historical.push({
        name: `${yearLabel} 해양 유입`,
        value: roundTo(emissionValue / 1_000, 3),
      });
    }
  });

  if (!historical.length && Number.isFinite(currentEmission)) {
    historical.push({
      name: `${latestOceanRow[1]} 해양 유입`,
      value: roundTo(currentEmission / 1_000, 3),
    });
  }

  return {
    index: roundTo(Math.min(Math.max(normalizedIndex, 0), 1), 3),
    historical,
  };
};

export const fetchMarineData = async (region: Region): Promise<MarineData> => {
  const config = REGION_CONFIG[region];
  if (!config) {
    throw new Error(`Unknown region: ${region}`);
  }

  const [openMeteo, salinity, chlorophyll, plastic] = await Promise.all([
    fetchOpenMeteoSeries(config.latitude, config.longitude),
    fetchErddapSeries(SALINITY_ENDPOINT, 'sss', config.latitude, config.longitude),
    fetchErddapSeries(CHLOROPHYLL_ENDPOINT, 'chlorophyll', config.latitude, config.longitude),
    fetchPlasticSeries(config.plasticEntity),
  ]);

  return {
    temperature: openMeteo.temperature.current,
    salinity: salinity.current,
    chlorophyll: chlorophyll.current,
    waveHeight: openMeteo.waveHeight.current,
    plasticConcentration: plastic.index,
    historicalData: {
      temperature: openMeteo.temperature.historical,
      salinity: salinity.historical,
      chlorophyll: chlorophyll.historical,
      waveHeight: openMeteo.waveHeight.historical,
      plasticConcentration: plastic.historical,
    },
  };
};