import { useState, useEffect } from 'react';
import * as ugLocale from 'ug-locale';

interface UgandaLocation {
  districts: string[];
  counties: { [district: string]: string[] };
  subcounties: { [district: string]: { [county: string]: string[] } };
  parishes: { [district: string]: { [subcounty: string]: string[] } };
  villages: { [district: string]: { [subcounty: string]: { [parish: string]: string[] } } };
}

export const useUgandaLocale = () => {
  const [locations, setLocations] = useState<UgandaLocation>({
    districts: [],
    counties: {},
    subcounties: {},
    parishes: {},
    villages: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUgandaData = async () => {
      try {
        setLoading(true);
        const uganda = ugLocale.default();

        const districtsObjs = uganda.districts(); // [{ name, code, ... }]
        const districts = districtsObjs.map((d: any) => d.name);

        const counties: { [district: string]: string[] } = {};
        const subcounties: { [district: string]: { [county: string]: string[] } } = {};
        const parishes: { [district: string]: { [subcounty: string]: string[] } } = {};
        const villages: { [district: string]: { [subcounty: string]: { [parish: string]: string[] } } } = {};

        for (const districtObj of districtsObjs) {
          const districtName = districtObj.name;

          // Counties: pass district name string
          const districtCountiesRaw = uganda.counties(districtName) || [];
          const districtCounties = districtCountiesRaw.map((c: any) => (typeof c === 'string' ? c : c.name));
          counties[districtName] = districtCounties;
          subcounties[districtName] = {};

          parishes[districtName] = {};
          villages[districtName] = {};

          for (const countyName of districtCounties) {
            // Subcounties: pass county name string
            const countySubcountiesRaw = uganda.subCounties(countyName) || [];
            const countySubcounties = countySubcountiesRaw.map((sc: any) => (typeof sc === 'string' ? sc : sc.name));
            subcounties[districtName][countyName] = countySubcounties;

            for (const subcountyName of countySubcounties) {
              const subcountyParishesRaw = uganda.parishes(subcountyName) || [];
              const subcountyParishes = subcountyParishesRaw.map((p: any) => (typeof p === 'string' ? p : p.name));
              parishes[districtName][subcountyName] = subcountyParishes;

              villages[districtName][subcountyName] = {};
              for (const parishName of subcountyParishes) {
                const parishVillagesRaw = uganda.villages(parishName) || [];
                const parishVillages = parishVillagesRaw.map((v: any) => (typeof v === 'string' ? v : v.name));
                villages[districtName][subcountyName][parishName] = parishVillages;
              }
            }
          }
        }

        setLocations({ districts, counties, subcounties, parishes, villages });
        setError(null);
      } catch (err) {
        console.error('Error loading Uganda locale data:', err);
        setError('Failed to load location data');
      } finally {
        setLoading(false);
      }
    };

    loadUgandaData();
  }, []);

  // Helper functions
  const getDistricts = () => locations.districts;
  const getCounties = (district: string) => locations.counties[district] || [];
  const getSubcounties = (district: string, county?: string) =>
    county ? locations.subcounties[district]?.[county] || [] : Object.values(locations.subcounties[district] || []).flat();
  const getParishes = (district: string, subcounty: string) =>
    locations.parishes[district]?.[subcounty] || [];
  const getVillages = (district: string, subcounty: string, parish: string) =>
    locations.villages[district]?.[subcounty]?.[parish] || [];

  return {
    districts: getDistricts(),
    getCounties,
    getSubcounties,
    getParishes,
    getVillages,
    loading,
    error,
  };
};
