interface District {
  name: string;
  region: string;
}

interface City {
  name: string;
  district: string;
}

export const ugandaDistricts: District[] = [
  // Central Region
  { name: "Kampala", region: "Central" },
  { name: "Wakiso", region: "Central" },
  { name: "Mukono", region: "Central" },
  { name: "Buikwe", region: "Central" },
  { name: "Kayunga", region: "Central" },
  { name: "Luwero", region: "Central" },
  { name: "Nakaseke", region: "Central" },
  { name: "Nakasongola", region: "Central" },
  { name: "Masaka", region: "Central" },
  { name: "Mpigi", region: "Central" },

  // Eastern Region
  { name: "Jinja", region: "Eastern" },
  { name: "Iganga", region: "Eastern" },
  { name: "Mbale", region: "Eastern" },
  { name: "Tororo", region: "Eastern" },
  { name: "Soroti", region: "Eastern" },
  { name: "Busia", region: "Eastern" },
  { name: "Bugiri", region: "Eastern" },
  { name: "Pallisa", region: "Eastern" },
  { name: "Kamuli", region: "Eastern" },
  { name: "Budaka", region: "Eastern" },

  // Northern Region
  { name: "Gulu", region: "Northern" },
  { name: "Lira", region: "Northern" },
  { name: "Kitgum", region: "Northern" },
  { name: "Pader", region: "Northern" },
  { name: "Apac", region: "Northern" },
  { name: "Amuru", region: "Northern" },
  { name: "Dokolo", region: "Northern" },
  { name: "Adjumani", region: "Northern" },
  { name: "Arua", region: "Northern" },
  { name: "Nebbi", region: "Northern" },

  // Western Region
  { name: "Mbarara", region: "Western" },
  { name: "Kabale", region: "Western" },
  { name: "Fort Portal", region: "Western" },
  { name: "Kasese", region: "Western" },
  { name: "Hoima", region: "Western" },
  { name: "Masindi", region: "Western" },
  { name: "Bushenyi", region: "Western" },
  { name: "Ntungamo", region: "Western" },
  { name: "Rukungiri", region: "Western" },
  { name: "Kibaale", region: "Western" }
];

export const ugandaCities: City[] = [
  // Kampala District
  { name: "Kampala Central", district: "Kampala" },
  { name: "Nakawa", district: "Kampala" },
  { name: "Kawempe", district: "Kampala" },
  { name: "Makindye", district: "Kampala" },
  { name: "Rubaga", district: "Kampala" },

  // Wakiso District
  { name: "Entebbe", district: "Wakiso" },
  { name: "Kira", district: "Wakiso" },
  { name: "Nansana", district: "Wakiso" },
  { name: "Kasangati", district: "Wakiso" },
  { name: "Wakiso Town", district: "Wakiso" },

  // Mukono District
  { name: "Mukono Town", district: "Mukono" },
  { name: "Seeta", district: "Mukono" },
  { name: "Namataba", district: "Mukono" },
  { name: "Katosi", district: "Mukono" },

  // Jinja District
  { name: "Jinja City", district: "Jinja" },
  { name: "Kakira", district: "Jinja" },
  { name: "Bugembe", district: "Jinja" },
  { name: "Mpumudde", district: "Jinja" },

  // Mbarara District
  { name: "Mbarara City", district: "Mbarara" },
  { name: "Biharwe", district: "Mbarara" },
  { name: "Kashare", district: "Mbarara" },
  { name: "Rubindi", district: "Mbarara" },

  // Gulu District
  { name: "Gulu City", district: "Gulu" },
  { name: "Layibi", district: "Gulu" },
  { name: "Bardege", district: "Gulu" },
  { name: "Laroo", district: "Gulu" },

  // Mbale District
  { name: "Mbale City", district: "Mbale" },
  { name: "Industrial Division", district: "Mbale" },
  { name: "Nakaloke", district: "Mbale" },
  { name: "Namakwekwe", district: "Mbale" },

  // Lira District
  { name: "Lira City", district: "Lira" },
  { name: "Adyel", district: "Lira" },
  { name: "Ojwina", district: "Lira" },
  { name: "Railways", district: "Lira" },

  // Masaka District
  { name: "Masaka City", district: "Masaka" },
  { name: "Nyendo", district: "Masaka" },
  { name: "Kimaanya", district: "Masaka" },
  { name: "Kyabakuza", district: "Masaka" },

  // Kasese District
  { name: "Kasese Town", district: "Kasese" },
  { name: "Hima", district: "Kasese" },
  { name: "Bwera", district: "Kasese" },
  { name: "Mpondwe", district: "Kasese" },

  // Tororo District
  { name: "Tororo Municipality", district: "Tororo" },
  { name: "Malaba", district: "Tororo" },
  { name: "Nagongera", district: "Tororo" },
  { name: "Mukuju", district: "Tororo" },

  // Soroti District
  { name: "Soroti City", district: "Soroti" },
  { name: "Arapai", district: "Soroti" },
  { name: "Gweri", district: "Soroti" },
  { name: "Tubur", district: "Soroti" },

  // Arua District
  { name: "Arua City", district: "Arua" },
  { name: "Oli", district: "Arua" },
  { name: "River Oli", district: "Arua" },
  { name: "Adumi", district: "Arua" }
];
