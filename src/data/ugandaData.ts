// Uganda Administrative Divisions Data
export interface UgandaLocation {
  district: string;
  subcounties: {
    [subcounty: string]: {
      parishes: {
        [parish: string]: string[]; // villages
      };
    };
  };
}

export const ugandaData: UgandaLocation[] = [
  {
    district: "Kampala",
    subcounties: {
      "Central Division": {
        parishes: {
          "Nakasero": ["Naguru", "Kololo", "Nakaser"],
          "Makerere": ["Wandegeya", "Kikoni", "Makerere"],
          "Nabagereka": ["Mengo", "Lubaga", "Namirembe"]
        }
      },
      "Kawempe Division": {
        parishes: {
          "Kawempe": ["Kawempe", "Bwaise", "Kanyanya"],
          "Nakawa": ["Nakawa", "Ntinda", "Naguru"]
        }
      },
      "Makindye Division": {
        parishes: {
          "Makindye": ["Makindye", "Kabalagala", "Nsambya"],
          "Ssabagabo": ["Ssabagabo", "Luzira", "Port Bell"]
        }
      },
      "Nakawa Division": {
        parishes: {
          "Nakawa": ["Nakawa", "Ntinda", "Naguru"],
          "Kyambogo": ["Kyambogo", "Bukoto", "Kireka"]
        }
      },
      "Rubaga Division": {
        parishes: {
          "Rubaga": ["Rubaga", "Nakulabye", "Lubaga"],
          "Ndeeba": ["Ndeeba", "Mutundwe", "Busega"]
        }
      }
    }
  },
  {
    district: "Wakiso",
    subcounties: {
      "Busiro": {
        parishes: {
          "Wakiso": ["Wakiso", "Kakiri", "Bukasa"],
          "Kira": ["Kira", "Namugongo", "Banda"]
        }
      },
      "Entebbe": {
        parishes: {
          "Entebbe": ["Entebbe", "Katabi", "Abayita"],
          "Kajjansi": ["Kajjansi", "Kitubulu", "Ssisa"]
        }
      }
    }
  },
  {
    district: "Mukono",
    subcounties: {
      "Mukono": {
        parishes: {
          "Mukono": ["Mukono", "Goma", "Nagojje"],
          "Namasuba": ["Namasuba", "Kyampisi", "Seeta"]
        }
      },
      "Nakisunga": {
        parishes: {
          "Nakisunga": ["Nakisunga", "Kasawo", "Nabbaale"],
          "Kyetume": ["Kyetume", "Mpunge", "Naminya"]
        }
      }
    }
  },
  {
    district: "Jinja",
    subcounties: {
      "Jinja": {
        parishes: {
          "Walukuba": ["Walukuba", "Mpumudde", "Buwaali"],
          "Masese": ["Masese", "Bugembe", "Namagunga"]
        }
      },
      "Budondo": {
        parishes: {
          "Budondo": ["Budondo", "Kagoma", "Namulesa"],
          "Butagaya": ["Butagaya", "Kakira", "Kimaka"]
        }
      }
    }
  },
  {
    district: "Mbale",
    subcounties: {
      "Mbale": {
        parishes: {
          "Nkoma": ["Nkoma", "Busamaga", "Namakwekwe"],
          "Namakwekwe": ["Namakwekwe", "Busamaga", "Nkoma"]
        }
      },
      "Bungokho": {
        parishes: {
          "Bungokho": ["Bungokho", "Busiu", "Sironko"],
          "Bumasikye": ["Bumasikye", "Bukonde", "Buwalasi"]
        }
      }
    }
  },
  {
    district: "Masaka",
    subcounties: {
      "Masaka": {
        parishes: {
          "Kimaanya": ["Kimaanya", "Kitovu", "Kyamulibwa"],
          "Nyendo": ["Nyendo", "Ssaza", "Katwe"]
        }
      },
      "Bukomansimbi": {
        parishes: {
          "Bukomansimbi": ["Bukomansimbi", "Bigasa", "Sunga"],
          "Mbirizi": ["Mbirizi", "Kitengesa", "Lwabenge"]
        }
      }
    }
  },
  {
    district: "Mbarara",
    subcounties: {
      "Mbarara": {
        parishes: {
          "Nyamitanga": ["Nyamitanga", "Ruti", "Kakoba"],
          "Kakoba": ["Kakoba", "Nyamitanga", "Ruti"]
        }
      },
      "Rwampara": {
        parishes: {
          "Rwampara": ["Rwampara", "Kagamba", "Ndeija"],
          "Kashari": ["Kashari", "Rubindi", "Rugando"]
        }
      }
    }
  },
  {
    district: "Fort Portal",
    subcounties: {
      "Fort Portal": {
        parishes: {
          "Kabarole": ["Kabarole", "Kibiito", "Rwebisengo"],
          "Busoro": ["Busoro", "Karago", "Kigarama"]
        }
      },
      "Bubandi": {
        parishes: {
          "Bubandi": ["Bubandi", "Kikyo", "Muhokya"],
          "Kibiito": ["Kibiito", "Kabarole", "Rwebisengo"]
        }
      }
    }
  },
  {
    district: "Arua",
    subcounties: {
      "Arua": {
        parishes: {
          "River Oli": ["River Oli", "Oli", "Ayivu"],
          "Ayivu": ["Ayivu", "River Oli", "Oli"]
        }
      },
      "Vurra": {
        parishes: {
          "Vurra": ["Vurra", "Kuluva", "Ajia"],
          "Kuluva": ["Kuluva", "Vurra", "Ajia"]
        }
      }
    }
  },
  {
    district: "Gulu",
    subcounties: {
      "Gulu": {
        parishes: {
          "Laroo": ["Laroo", "Bobi", "Layibi"],
          "Bobi": ["Bobi", "Laroo", "Layibi"]
        }
      },
      "Aswa": {
        parishes: {
          "Aswa": ["Aswa", "Aswa", "Bar-Dege"],
          "Bar-Dege": ["Bar-Dege", "Aswa", "Aswa"]
        }
      }
    }
  }
];

// Helper functions for getting data
export const getDistricts = (): string[] => {
  return ugandaData.map(location => location.district);
};

export const getSubcounties = (district: string): string[] => {
  const location = ugandaData.find(loc => loc.district === district);
  return location ? Object.keys(location.subcounties) : [];
};

export const getParishes = (district: string, subcounty: string): string[] => {
  const location = ugandaData.find(loc => loc.district === district);
  if (!location) return [];
  const subcountyData = location.subcounties[subcounty];
  return subcountyData ? Object.keys(subcountyData.parishes) : [];
};

export const getVillages = (district: string, subcounty: string, parish: string): string[] => {
  const location = ugandaData.find(loc => loc.district === district);
  if (!location) return [];
  const subcountyData = location.subcounties[subcounty];
  if (!subcountyData) return [];
  return subcountyData.parishes[parish] || [];
};