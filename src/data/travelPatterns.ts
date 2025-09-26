export interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

export interface TravelPattern {
  title: string;
  subtitle: string;
  countries: CountryData[];
}

export const travelPatterns: TravelPattern[] = [
  {
    title: "아시아 문화 여행",
    subtitle: "전통과 현대가 공존하는 아시아의 매력",
    countries: [
      {
        id: "JPN",
        name: "도쿄, 일본",
        flag: "🇯🇵",
        lat: 35.6762,
        lng: 139.6503,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "오사카, 일본",
        flag: "🇯🇵",
        lat: 34.6937,
        lng: 135.5023,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "교토, 일본",
        flag: "🇯🇵",
        lat: 36.0116,
        lng: 135.7681,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "요코하마, 일본",
        flag: "🇯🇵",
        lat: 35.4437,
        lng: 139.638,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "나고야, 일본",
        flag: "🇯🇵",
        lat: 35.1815,
        lng: 136.9066,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "후쿠오카, 일본",
        flag: "🇯🇵",
        lat: 33.5904,
        lng: 130.4017,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "삿포로, 일본",
        flag: "🇯🇵",
        lat: 43.0642,
        lng: 141.3469,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "센다이, 일본",
        flag: "🇯🇵",
        lat: 38.2682,
        lng: 140.8694,
        color: "#e91e63",
      },
      {
        id: "JPN",
        name: "히로시마, 일본",
        flag: "🇯🇵",
        lat: 34.3853,
        lng: 132.4553,
        color: "#e91e63",
      },
      {
        id: "KOR",
        name: "서울, 한국",
        flag: "🇰🇷",
        lat: 37.5665,
        lng: 126.978,
        color: "#9c27b0",
      },
      {
        id: "KOR",
        name: "부산, 한국",
        flag: "🇰🇷",
        lat: 35.1796,
        lng: 129.0756,
        color: "#9c27b0",
      },
      {
        id: "KOR",
        name: "대구, 한국",
        flag: "🇰🇷",
        lat: 35.8714,
        lng: 128.6014,
        color: "#9c27b0",
      },
      {
        id: "KOR",
        name: "인천, 한국",
        flag: "🇰🇷",
        lat: 37.4563,
        lng: 126.7052,
        color: "#9c27b0",
      },
      {
        id: "KOR",
        name: "광주, 한국",
        flag: "🇰🇷",
        lat: 35.1595,
        lng: 126.8526,
        color: "#9c27b0",
      },
      {
        id: "TWN",
        name: "타이베이, 대만",
        flag: "🇹🇼",
        lat: 25.033,
        lng: 121.5654,
        color: "#673ab7",
      },
      {
        id: "THA",
        name: "방콕, 태국",
        flag: "🇹🇭",
        lat: 13.7563,
        lng: 100.5018,
        color: "#3f51b5",
      },
      {
        id: "SGP",
        name: "싱가포르",
        flag: "🇸🇬",
        lat: 1.3521,
        lng: 103.8198,
        color: "#2196f3",
      },
    ],
  },
  {
    title: "세계 명소 순례",
    subtitle: "꿈에 그리던 세계 각국의 랜드마크들",
    countries: [
      {
        id: "USA",
        name: "뉴욕, 미국",
        flag: "🇺🇸",
        lat: 40.7128,
        lng: -74.006,
        color: "#f44336",
      },
      {
        id: "FRA",
        name: "파리, 프랑스",
        flag: "🇫🇷",
        lat: 48.8566,
        lng: 2.3522,
        color: "#e91e63",
      },
      {
        id: "EGY",
        name: "카이로, 이집트",
        flag: "🇪🇬",
        lat: 30.0444,
        lng: 31.2357,
        color: "#9c27b0",
      },
      {
        id: "BRA",
        name: "리우데자네이루, 브라질",
        flag: "🇧🇷",
        lat: -22.9068,
        lng: -43.1729,
        color: "#4caf50",
      },
      {
        id: "AUS",
        name: "시드니, 호주",
        flag: "🇦🇺",
        lat: -33.8688,
        lng: 151.2093,
        color: "#00bcd4",
      },
    ],
  },
  {
    title: "유럽 로맨틱 여행",
    subtitle: "낭만적인 유럽의 고성과 거리들",
    countries: [
      // 독일
      {
        id: "DEU",
        name: "드레스덴, 독일",
        flag: "🇩🇪",
        lat: 51.0504,
        lng: 13.7373,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "베를린, 독일",
        flag: "🇩🇪",
        lat: 52.52,
        lng: 13.405,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "마르부르크, 독일",
        flag: "🇩🇪",
        lat: 50.8021,
        lng: 8.7667,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "에센, 독일",
        flag: "🇩🇪",
        lat: 51.4556,
        lng: 7.0116,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "도르트문트, 독일",
        flag: "🇩🇪",
        lat: 51.5136,
        lng: 7.4653,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "쾰른, 독일",
        flag: "🇩🇪",
        lat: 50.9375,
        lng: 6.9603,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "프랑크푸르트, 독일",
        flag: "🇩🇪",
        lat: 50.1109,
        lng: 8.6821,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "하이델베르크, 독일",
        flag: "🇩🇪",
        lat: 49.3988,
        lng: 8.6724,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "뮌헨, 독일",
        flag: "🇩🇪",
        lat: 48.1351,
        lng: 11.582,
        color: "#ff9800",
      },
      {
        id: "DEU",
        name: "뒤셀도르프, 독일",
        flag: "🇩🇪",
        lat: 51.2277,
        lng: 6.7735,
        color: "#ff9800",
      },

      // 프랑스
      {
        id: "FRA",
        name: "니스, 프랑스",
        flag: "🇫🇷",
        lat: 43.7102,
        lng: 7.262,
        color: "#2196f3",
      },
      {
        id: "FRA",
        name: "노르망디 - 몽생미셸, 프랑스",
        flag: "🇫🇷",
        lat: 48.6361,
        lng: -1.5115,
        color: "#2196f3",
      },
      {
        id: "FRA",
        name: "콜마르, 프랑스",
        flag: "🇫🇷",
        lat: 48.0794,
        lng: 7.3584,
        color: "#2196f3",
      },
      {
        id: "FRA",
        name: "파리, 프랑스",
        flag: "🇫🇷",
        lat: 48.8566,
        lng: 2.3522,
        color: "#2196f3",
      },
      {
        id: "FRA",
        name: "스트라스부르, 프랑스",
        flag: "🇫🇷",
        lat: 48.5734,
        lng: 7.7521,
        color: "#2196f3",
      },

      // 네덜란드
      {
        id: "NLD",
        name: "루르몬드, 네덜란드",
        flag: "🇳🇱",
        lat: 51.1944,
        lng: 5.9944,
        color: "#4caf50",
      },
      {
        id: "NLD",
        name: "벤로, 네덜란드",
        flag: "🇳🇱",
        lat: 51.3703,
        lng: 6.1662,
        color: "#4caf50",
      },
      {
        id: "NLD",
        name: "아인트호번, 네덜란드",
        flag: "🇳🇱",
        lat: 51.4416,
        lng: 5.4697,
        color: "#4caf50",
      },
      {
        id: "NLD",
        name: "잔세 스칸스, 네덜란드",
        flag: "🇳🇱",
        lat: 52.4742,
        lng: 4.8175,
        color: "#4caf50",
      },
      {
        id: "NLD",
        name: "암스테르담, 네덜란드",
        flag: "🇳🇱",
        lat: 52.3676,
        lng: 4.9041,
        color: "#4caf50",
      },

      // 오스트리아
      {
        id: "AUT",
        name: "빈, 오스트리아",
        flag: "🇦🇹",
        lat: 48.2082,
        lng: 16.3738,
        color: "#e91e63",
      },

      // 포르투갈
      {
        id: "PRT",
        name: "리스본, 포르투갈",
        flag: "🇵🇹",
        lat: 38.7223,
        lng: -9.1393,
        color: "#9c27b0",
      },
      {
        id: "PRT",
        name: "포르투, 포르투갈",
        flag: "🇵🇹",
        lat: 41.1579,
        lng: -8.6291,
        color: "#9c27b0",
      },

      // 덴마크
      {
        id: "DNK",
        name: "코펜하겐, 덴마크",
        flag: "🇩🇰",
        lat: 55.6761,
        lng: 12.5683,
        color: "#f44336",
      },

      // 노르웨이/아이슬란드 (오로라 관광)
      {
        id: "NOR",
        name: "오로라 관광 (노르웨이/아이슬란드)",
        flag: "🇳🇴",
        lat: 69.6492,
        lng: 18.9553, // 트롬소 좌표 사용
        color: "#00bcd4",
      },

      // 체코
      {
        id: "CZE",
        name: "프라하, 체코",
        flag: "🇨🇿",
        lat: 50.0755,
        lng: 14.4378,
        color: "#795548",
      },

      // 헝가리
      {
        id: "HUN",
        name: "부다페스트, 헝가리",
        flag: "🇭🇺",
        lat: 47.4979,
        lng: 19.0402,
        color: "#607d8b",
      },

      // 벨기에
      {
        id: "BEL",
        name: "브뤼셀, 벨기에",
        flag: "🇧🇪",
        lat: 50.8503,
        lng: 4.3517,
        color: "#ffc107",
      },

      // 몰타
      {
        id: "MLT",
        name: "몰타",
        flag: "🇲🇹",
        lat: 35.9375,
        lng: 14.3754,
        color: "#ff5722",
      },

      // 이탈리아
      {
        id: "ITA",
        name: "로마, 이탈리아",
        flag: "🇮🇹",
        lat: 41.9028,
        lng: 12.4964,
        color: "#ff5722",
      },
      {
        id: "ITA",
        name: "피사, 이탈리아",
        flag: "🇮🇹",
        lat: 43.7228,
        lng: 10.4017,
        color: "#ff5722",
      },
      {
        id: "ITA",
        name: "피렌체, 이탈리아",
        flag: "🇮🇹",
        lat: 43.7696,
        lng: 11.2558,
        color: "#ff5722",
      },
      {
        id: "ITA",
        name: "베니스, 이탈리아",
        flag: "🇮🇹",
        lat: 45.4408,
        lng: 12.3155,
        color: "#ff5722",
      },
      {
        id: "ITA",
        name: "밀라노, 이탈리아",
        flag: "🇮🇹",
        lat: 45.4642,
        lng: 9.19,
        color: "#ff5722",
      },

      // 그리스
      {
        id: "GRC",
        name: "아테네, 그리스",
        flag: "🇬🇷",
        lat: 37.9838,
        lng: 23.7275,
        color: "#3f51b5",
      },

      // 스위스
      {
        id: "CHE",
        name: "인터라켄, 스위스",
        flag: "🇨🇭",
        lat: 46.6863,
        lng: 7.8632,
        color: "#009688",
      },

      // 영국
      {
        id: "GBR",
        name: "런던, 영국",
        flag: "🇬🇧",
        lat: 51.5074,
        lng: -0.1278,
        color: "#673ab7",
      },

      // 스페인
      {
        id: "ESP",
        name: "바르셀로나, 스페인",
        flag: "🇪🇸",
        lat: 41.3851,
        lng: 2.1734,
        color: "#ffeb3b",
      },

      // 에스토니아
      {
        id: "EST",
        name: "탈린, 에스토니아",
        flag: "🇪🇪",
        lat: 59.437,
        lng: 24.7536,
        color: "#cddc39",
      },
    ],
  },
];
