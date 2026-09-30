// Stylized World Map Vector Paths for 800x450 Equirectangular / Mercator Radar
// Optimized for dark sci-fi / aerospace radar aesthetic with high visual fidelity.

export interface ContinentPath {
  id: string
  name: string
  d: string
}

export const WORLD_CONTINENT_PATHS: ContinentPath[] = [
  // North America & Central America
  {
    id: 'north-america',
    name: 'North America',
    d: 'M 75 62 L 95 50 L 135 45 L 175 42 L 205 52 L 235 60 L 255 75 L 265 95 L 245 110 L 240 135 L 215 155 L 200 175 L 180 195 L 170 215 L 160 235 L 148 245 L 140 230 L 132 210 L 115 190 L 105 170 L 90 145 L 80 120 L 65 95 L 60 78 Z M 195 180 L 210 195 L 215 210 L 205 215 L 195 200 Z M 215 160 L 235 155 L 238 170 L 225 175 Z'
  },
  // Greenland
  {
    id: 'greenland',
    name: 'Greenland',
    d: 'M 285 30 L 325 25 L 340 45 L 330 70 L 305 80 L 290 65 Z'
  },
  // South America
  {
    id: 'south-america',
    name: 'South America',
    d: 'M 190 230 L 220 235 L 255 250 L 275 275 L 270 310 L 255 340 L 235 375 L 225 410 L 215 415 L 210 380 L 205 340 L 195 300 L 185 260 L 185 240 Z'
  },
  // Europe
  {
    id: 'europe',
    name: 'Europe',
    d: 'M 370 125 L 385 105 L 405 95 L 430 85 L 445 100 L 435 115 L 420 125 L 415 140 L 400 148 L 380 145 L 372 138 Z M 365 90 L 378 82 L 375 105 L 362 100 Z M 395 130 L 405 140 L 400 155 L 392 145 Z'
  },
  // Africa
  {
    id: 'africa',
    name: 'Africa',
    d: 'M 375 160 L 415 155 L 445 165 L 475 180 L 490 210 L 475 245 L 455 285 L 440 330 L 420 355 L 405 330 L 390 280 L 375 240 L 360 215 L 360 185 Z M 485 300 L 495 295 L 490 325 L 480 320 Z'
  },
  // Asia & Russia
  {
    id: 'asia',
    name: 'Asia',
    d: 'M 445 80 L 480 70 L 530 65 L 600 60 L 680 65 L 720 85 L 710 115 L 675 130 L 640 145 L 610 160 L 585 170 L 565 160 L 530 150 L 490 145 L 460 135 L 450 105 Z M 470 155 L 505 160 L 525 185 L 515 210 L 485 200 L 475 175 Z'
  },
  // Indian Subcontinent (detailed for regional focus)
  {
    id: 'india',
    name: 'Indian Subcontinent',
    d: 'M 545 175 L 575 175 L 595 195 L 590 220 L 575 255 L 565 270 L 555 250 L 540 225 L 535 200 Z M 575 278 A 4 4 0 1 1 575 286 A 4 4 0 1 1 575 278 Z'
  },
  // East Asia, Southeast Asia & Maritime
  {
    id: 'southeast-asia',
    name: 'Southeast Asia & Pacific',
    d: 'M 605 180 L 635 185 L 650 210 L 635 235 L 620 240 L 610 215 Z M 625 255 L 665 260 L 655 270 L 620 265 Z M 670 245 L 690 250 L 680 270 Z'
  },
  // Japan
  {
    id: 'japan',
    name: 'Japan',
    d: 'M 700 120 L 715 130 L 705 145 L 695 135 Z M 690 148 L 702 152 L 695 160 Z'
  },
  // Australia & New Zealand
  {
    id: 'australia',
    name: 'Australia & New Zealand',
    d: 'M 660 290 L 715 285 L 740 310 L 745 345 L 720 375 L 675 370 L 650 340 L 650 310 Z M 755 365 L 765 375 L 760 395 Z M 768 350 L 775 360 L 770 370 Z'
  }
]
