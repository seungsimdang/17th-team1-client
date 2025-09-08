declare module 'globe.gl' {
  interface GlobeInstance {
    (element?: HTMLElement): GlobeInstance;
    width(width: number): GlobeInstance;
    height(height: number): GlobeInstance;
    backgroundColor(color: string): GlobeInstance;
    globeImageUrl(url: string): GlobeInstance;
    showAtmosphere(show: boolean): GlobeInstance;
    atmosphereColor(color: string): GlobeInstance;
    atmosphereAltitude(altitude: number): GlobeInstance;
    polygonsData(data: any[]): GlobeInstance;
    polygonAltitude(altitude: number | ((d: any) => number)): GlobeInstance;
    polygonCapColor(color: string | ((d: any) => string)): GlobeInstance;
    polygonSideColor(color: string | ((d: any) => string)): GlobeInstance;
    polygonStrokeColor(color: string | ((d: any) => string)): GlobeInstance;
    polygonStrokeWidth(width: number | ((d: any) => number)): GlobeInstance;
    controls(): any;
  }

  const Globe: () => GlobeInstance;
  export default Globe;
}
