export interface Subsidiary {
  name: string;
  address: string;
  plusCode?: string;
  mapsUrl?: string;
  phone: string;
  hours: {
    [key: string]: string;
  };
  latitude?: number;
  longitude?: number;
  contact?: string;
  email?: string;
}
