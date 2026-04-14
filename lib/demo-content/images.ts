export type DemoImageReference = {
  path: string;
  sourceLabel: string;
  sourceUrl?: string | null;
  alt: string;
};

export const demoBikeImages = {
  bmwR1300GS: {
    path: "/bikes/bmw-r1300gs.jpg",
    sourceLabel: "Accessorise It demo bike asset",
    sourceUrl: "https://www.bmwmotorcycles.com/en/models/adventure/r1300gs.html",
    alt: "BMW R 1300 GS demo bike image",
  },
  bmwR1300GSA: {
    path: "/bikes/bmw-r1300gsa.jpg",
    sourceLabel: "Accessorise It demo bike asset",
    sourceUrl:
      "https://www.bmwmotorcycles.com/en/models/adventure/r1300gs-adventure.html",
    alt: "BMW R 1300 GS Adventure demo bike image",
  },
  yamahaTenere700: {
    path: "/bikes/yamaha-tenere-700.jpg",
    sourceLabel: "Accessorise It demo bike asset",
    sourceUrl: "https://www.yamahamotorsports.com/models/tenere-700/features",
    alt: "Yamaha Tenere 700 demo bike image",
  },
  ktm890Adventure: {
    path: "/bikes/ktm-890-adventure.jpg",
    sourceLabel: "Accessorise It demo bike asset",
    sourceUrl: "https://www.ktm.com/en-us/models/travel/2025-ktm-890-adventure-r.html",
    alt: "KTM 890 Adventure demo bike image",
  },
} satisfies Record<string, DemoImageReference>;

export const demoAccessoryImages = {
  panniers: {
    path: "/accessories/panniers.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Adventure pannier system demo image",
  },
  topBox: {
    path: "/accessories/top-box.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Adventure top-box rack demo image",
  },
  tankBag: {
    path: "/accessories/tank-bag.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Tank bag demo image",
  },
  crashBars: {
    path: "/accessories/crash-bars.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Crash bars demo image",
  },
  skidPlate: {
    path: "/accessories/skid-plate.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Skid plate demo image",
  },
  ledLights: {
    path: "/accessories/led-lights.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Auxiliary driving lights demo image",
  },
  gpsMount: {
    path: "/accessories/gps-mount.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "GPS mount demo image",
  },
  seat: {
    path: "/accessories/seat.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Comfort seat demo image",
  },
  risers: {
    path: "/accessories/risers.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Bar risers demo image",
  },
  usbHub: {
    path: "/accessories/usb-hub.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Power hub demo image",
  },
  touringScreen: {
    path: "/accessories/touring-screen.jpg",
    sourceLabel: "Accessorise It demo accessory asset",
    alt: "Touring screen demo image",
  },
  tenereBuild: {
    path: "/expert-builds/tenereexpertbuild.jpg",
    sourceLabel: "Accessorise It supplied real build photo",
    alt: "Yamaha Tenere 700 expert build photo",
  },
  abikethingR1300GSABuild: {
    path: "/expert-builds/r1300gsa-abikething-main.jpg",
    sourceLabel: "ABikething supplied build photo",
    alt: "BMW R1300GSA ABikething tech touring build photo",
  },
} satisfies Record<string, DemoImageReference>;
