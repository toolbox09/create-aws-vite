/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace naver.maps {
  class Map {
    constructor(el: string | HTMLElement, options?: MapOptions);
    setCenter(latlng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    setZoom(zoom: number, effect?: boolean): void;
    getZoom(): number;
    panTo(latlng: LatLng | LatLngLiteral, transitionOptions?: any): void;
    setOptions(options: Partial<MapOptions>): void;
    getElement(): HTMLElement;
    destroy(): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    scaleControl?: boolean;
    logoControl?: boolean;
    mapDataControl?: boolean;
    mapTypeId?: string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latlng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng;
    setIcon(icon: string | ImageIcon | SymbolIcon | HtmlIcon): void;
    setVisible(visible: boolean): void;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    icon?: string | ImageIcon | SymbolIcon | HtmlIcon;
    clickable?: boolean;
    zIndex?: number;
    title?: string;
  }

  interface ImageIcon {
    url: string;
    size?: Size;
    origin?: Point;
    anchor?: Point;
    scaledSize?: Size;
  }

  interface SymbolIcon {
    path: any;
    style?: string;
    radius?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    anchor?: Point;
  }

  interface HtmlIcon {
    content: string;
    size?: Size;
    anchor?: Point;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, anchor?: Marker | LatLng | LatLngLiteral): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
    setPosition(latlng: LatLng | LatLngLiteral): void;
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement;
    position?: LatLng | LatLngLiteral;
    maxWidth?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    disableAnchor?: boolean;
    pixelOffset?: Point;
    anchorSize?: Size;
    anchorSkew?: boolean;
    anchorColor?: string;
  }

  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  namespace Event {
    function addListener(target: any, type: string, listener: (...args: any[]) => void): any;
    function removeListener(listener: any): void;
    function clearListeners(target: any, type: string): void;
  }
}
