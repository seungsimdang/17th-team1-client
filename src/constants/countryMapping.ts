export const COUNTRIES_BY_CONTINENT = {
  아시아: {
    KOR: "대한민국",
    JPN: "일본",
    TWN: "대만",
    THA: "태국",
    SGP: "싱가포르",
    CHN: "중국",
    IND: "인도",
    VNM: "베트남",
    MYS: "말레이시아",
    IDN: "인도네시아",
    PHL: "필리핀",
    ARE: "아랍에미리트",
    SAU: "사우디아라비아",
    TUR: "튀르키예",
    ISR: "이스라엘",
    JOR: "요단",
    LBN: "레바논",
    QAT: "카타르",
    KWT: "쿠웨이트",
  },
  유럽: {
    FRA: "프랑스",
    DEU: "독일",
    GBR: "영국",
    ITA: "이탈리아",
    ESP: "스페인",
    NLD: "네덜란드",
    BEL: "벨기에",
    CHE: "스위스",
    AUT: "오스트리아",
    PRT: "포르투갈",
    DNK: "덴마크",
    NOR: "노르웨이",
    SWE: "스웨덴",
    FIN: "핀란드",
    ISL: "아이슬란드",
    CZE: "체코",
    HUN: "헝가리",
    POL: "폴란드",
    RUS: "러시아",
    GRC: "그리스",
    MLT: "몰타",
    EST: "에스토니아",
    LVA: "라트비아",
    LTU: "리투아니아",
  },
  북아메리카: {
    USA: "미국",
    CAN: "캐나다",
    MEX: "멕시코",
  },
  남아메리카: {
    BRA: "브라질",
    ARG: "아르헨티나",
    CHL: "칠레",
    PER: "페루",
    COL: "콜롬비아",
    URY: "우루과이",
    PRY: "파라과이",
  },
  오세아니아: {
    AUS: "호주",
    NZL: "뉴질랜드",
  },
  아프리카: {
    EGY: "이집트",
    ZAF: "남아프리카공화국",
    MAR: "모로코",
    KEN: "케냐",
    ETH: "에티오피아",
    NGA: "나이지리아",
  },
} as const;

// 기존 호환성을 위한 플랫 맵
export const COUNTRY_CODE_TO_NAME: { [key: string]: string } = Object.values(COUNTRIES_BY_CONTINENT).reduce(
  (acc, countries) => ({ ...acc, ...countries }),
  {},
);

// 국가 코드에서 나라명을 가져오는 함수
export const getCountryName = (countryCode: string): string => {
  return COUNTRY_CODE_TO_NAME[countryCode] || countryCode;
};

// 국가 코드에서 대륙명을 가져오는 함수
export const getContinent = (countryCode: string): string => {
  for (const [continent, countries] of Object.entries(COUNTRIES_BY_CONTINENT)) {
    if (countryCode in countries) {
      return continent;
    }
  }
  return "기타";
};

// 여러 국가 코드를 받아서 고유한 나라명들을 반환하는 함수
export const getUniqueCountryNames = (countryCodes: string[]): string[] => {
  const uniqueNames = new Set(countryCodes.map((code) => getCountryName(code)));
  return Array.from(uniqueNames);
};

// 여러 국가가 같은 대륙인지 확인하는 함수
export const areSameContinent = (countryCodes: string[]): boolean => {
  const continents = new Set(countryCodes.map((code) => getContinent(code)));
  return continents.size === 1;
};

// 대륙별 클러스터 이름 생성 함수
export const getContinentClusterName = (countryCodes: string[]): string => {
  const uniqueContinents = new Set(countryCodes.map((code) => getContinent(code)));

  if (uniqueContinents.size === 1) {
    const continent = Array.from(uniqueContinents)[0];
    const uniqueCountries = new Set(countryCodes);
    return `${continent} +${uniqueCountries.size}`;
  }

  // 여러 대륙이 섞인 경우 (일반적이지 않음)
  const uniqueCountries = new Set(countryCodes);
  return `${uniqueCountries.size}개국`;
};
