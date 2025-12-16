
import { Station, Vehicle, UserProfile, PaymentMethod, Language } from './types';

export const MUNICH_CENTER: [number, number] = [48.137154, 11.576124];

// Greater Munich Area (approx S-Bahn network coverage)
export const MUNICH_BOUNDS: [[number, number], [number, number]] = [
  [47.900000, 11.100000], // South-West (past Starnberg/Ammersee)
  [48.450000, 12.100000]  // North-East (past Airport/Erding)
];

const generateRandomAvailability = (): number[] => {
  const slots = new Array(48).fill(2); // Start with all Free
  let i = 0;
  const startOffset = Math.floor(Math.random() * 5); 
  i += startOffset;

  while(i < 48) {
    if(Math.random() < 0.25) {
       const duration = Math.floor(Math.random() * 7) + 2; 
       for(let j = 0; j < duration && (i + j) < 48; j++) {
         slots[i+j] = 1; // Mark as Busy
       }
       i += duration + Math.floor(Math.random() * 3);
    } else {
       i++;
    }
  }
  return slots;
};

export const MOCK_STATIONS: Station[] = [
  // Existing Stations - Updated with new pricing & locations & RANDOM AVAILABILITY
  {
    id: 'e1',
    name: 'Villa Bogenhausen Charge',
    address: 'Prinzregentenstraße 150, 81677 München',
    lat: 48.1395,
    lng: 11.6150,
    type: 'Typ 2',
    power: 22.0,
    price: 30, // 30ct/kWh Energy
    parkingFee: 2.24, // Garage
    locationType: 'garage',
    status: 'available',
    rating: 4.9,
    owner: 'Dr. Müller',
    availability: generateRandomAvailability()
  },
  {
    id: 'e2',
    name: 'Haidhausen Hinterhof',
    address: 'Weißenburger Platz 4, 81667 München',
    lat: 48.1285,
    lng: 11.5965,
    type: 'Typ 2',
    power: 11.0,
    price: 30,
    parkingFee: 1.65, // Outdoor
    locationType: 'outdoor',
    status: 'busy',
    rating: 4.5,
    owner: 'Familie Weber',
    availability: generateRandomAvailability()
  },
  {
    id: 'e3',
    name: 'Berg am Laim TechSpot',
    address: 'Baumkirchner Straße 12, 81673 München',
    lat: 48.1290,
    lng: 11.6320,
    type: 'CCS',
    power: 50.0,
    price: 30,
    parkingFee: 2.24, // Garage
    locationType: 'garage',
    status: 'available',
    rating: 4.2,
    owner: 'TechHub Ost',
    availability: generateRandomAvailability()
  },
  {
    id: 'e4',
    name: 'Trudering Garden Charge',
    address: 'Wasserburger Landstraße 155, 81827 München',
    lat: 48.1185,
    lng: 11.6665,
    type: 'Typ 2',
    power: 11.0,
    price: 30,
    parkingFee: 1.65, // Outdoor
    locationType: 'outdoor',
    status: 'available',
    rating: 4.8,
    owner: 'Privat',
    availability: generateRandomAvailability()
  },
  {
    id: 'e5',
    name: 'Riem Arkaden FastCharge',
    address: 'Willy-Brandt-Platz 5, 81829 München',
    lat: 48.1345,
    lng: 11.6940,
    type: 'CCS',
    power: 150.0,
    price: 30,
    parkingFee: 2.24, // Garage
    locationType: 'garage',
    status: 'available',
    rating: 4.6,
    owner: 'Shopping Mall',
    availability: generateRandomAvailability()
  },
  // --- NEUE STATIONEN MÜNCHEN OST ---
  {
    id: 'e6',
    name: 'Einstein Center Charge',
    address: 'Einsteinstraße 130, 81675 München',
    lat: 48.1355,
    lng: 11.6145,
    type: 'Typ 2',
    power: 22.0,
    price: 35,
    parkingFee: 2.00,
    locationType: 'garage',
    status: 'busy',
    rating: 4.3,
    owner: 'Einstein Center',
    availability: generateRandomAvailability()
  },
  {
    id: 'e7',
    name: 'Ostpark Parkplatz',
    address: 'Feichtstraße 19, 81735 München',
    lat: 48.1132,
    lng: 11.6305,
    type: 'CCS',
    power: 50.0,
    price: 39,
    parkingFee: 1.00,
    locationType: 'outdoor',
    status: 'available',
    rating: 4.0,
    owner: 'Stadtwerke München',
    availability: generateRandomAvailability()
  },
  {
    id: 'e8',
    name: 'PEP Einkaufscenter',
    address: 'Ollenhauerstraße 6, 81737 München',
    lat: 48.0945,
    lng: 11.6440,
    type: 'CCS',
    power: 150.0,
    price: 45,
    parkingFee: 0.00, // often free for shoppers
    locationType: 'garage',
    status: 'available',
    rating: 4.7,
    owner: 'PEP Mall',
    availability: generateRandomAvailability()
  },
  {
    id: 'e9',
    name: 'Messe München West',
    address: 'Am Messesee 2, 81829 München',
    lat: 48.1350,
    lng: 11.6980,
    type: 'CCS',
    power: 300.0,
    price: 55,
    parkingFee: 3.50,
    locationType: 'outdoor',
    status: 'busy',
    rating: 4.8,
    owner: 'Ionity',
    availability: generateRandomAvailability()
  },
  {
    id: 'e10',
    name: 'Technopark Neumarkter',
    address: 'Neumarkter Straße 18, 81673 München',
    lat: 48.1335,
    lng: 11.6380,
    type: 'Typ 2',
    power: 11.0,
    price: 29,
    parkingFee: 1.50,
    locationType: 'garage',
    status: 'available',
    rating: 3.9,
    owner: 'TechPark Mgmt',
    availability: generateRandomAvailability()
  },
  {
    id: 'e11',
    name: 'Friedensengel Public',
    address: 'Prinzregentenstraße 60, 81675 München',
    lat: 48.1415,
    lng: 11.5975,
    type: 'Typ 2',
    power: 11.0,
    price: 32,
    parkingFee: 2.00, // street parking
    locationType: 'outdoor',
    status: 'busy',
    rating: 4.5,
    owner: 'SWM',
    availability: generateRandomAvailability()
  },
  {
    id: 'e12',
    name: 'Werksviertel Mitte',
    address: 'Atelierstraße 10, 81671 München',
    lat: 48.1245,
    lng: 11.6080,
    type: 'Typ 2',
    power: 22.0,
    price: 38,
    parkingFee: 2.50,
    locationType: 'garage',
    status: 'available',
    rating: 4.9,
    owner: 'Werksviertel',
    availability: generateRandomAvailability()
  },
  {
    id: 'e13',
    name: 'Michaelibad Charge',
    address: 'Heinrich-Wieland-Straße 24, 81735 München',
    lat: 48.1205,
    lng: 11.6350,
    type: 'CCS',
    power: 50.0,
    price: 42,
    parkingFee: 1.00,
    locationType: 'outdoor',
    status: 'available',
    rating: 4.1,
    owner: 'SWM',
    availability: generateRandomAvailability()
  },
  {
    id: 'e14',
    name: 'Truderinger Wald',
    address: 'Friedenspromenade 40, 81827 München',
    lat: 48.1105,
    lng: 11.6705,
    type: 'Typ 2',
    power: 11.0,
    price: 25,
    parkingFee: 0.50, // cheap residential
    locationType: 'outdoor',
    status: 'available',
    rating: 4.6,
    owner: 'Privat',
    availability: generateRandomAvailability()
  },
  {
    id: 'e15',
    name: 'Zamilapark Business',
    address: 'Siedlerstraße 2, 81929 München',
    lat: 48.1480,
    lng: 11.6450,
    type: 'Typ 2',
    power: 22.0,
    price: 31,
    parkingFee: 1.80,
    locationType: 'garage',
    status: 'busy',
    rating: 4.2,
    owner: 'Office Hub',
    availability: generateRandomAvailability()
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    make: 'Tesla',
    model: 'Model 3',
    plate: 'M-XY 1234',
    color: '#ef4444', // Red
    batterySize: 60,
    country: 'D'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@example.com',
  password: 'password123',
  avatar: '👨‍🚀' // Default avatar
};

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', type: 'paypal', label: 'max.mustermann@example.com', isDefault: true }
];

export const CAR_COLORS = [
  '#22c55e', '#ef4444', '#eab308', '#f97316', '#a855f7', '#3b82f6', '#6366f1', '#14b8a6',
];

export const AVATAR_OPTIONS = [
  '👨‍🚀', '🦸‍♀️', '🦹', '🧙‍♂️', '🦊', '🐯', '🦁', '🐶', 
  '🦄', '🤖', '👽', '👻', '💩', '🤡', '🤠', '😎',
  '🕵️‍♂️', '👩‍🔬', '👨‍🎤', '🐼'
];

export const LEGAL_TEXTS = {
  de: {
    terms: `ALLGEMEINE NUTZUNGSBEDINGUNGEN (AGB)... (Text unchanged)`,
    privacy: `DATENSCHUTZERKLÄRUNG... (Text unchanged)`,
    faq: `HÄUFIG GESTELLTE FRAGEN (FAQ)

1. WIE FUNKTIONIERT DAS LADEN MIT SMART SHIFT?
Wählen Sie eine Ladestation auf der Karte, reservieren Sie einen passenden Zeitslot und navigieren Sie dorthin. Vor Ort scannen Sie den QR-Code an der Wallbox über die App, um den Ladevorgang zu starten. Die Abrechnung erfolgt automatisch nach Beendigung.

2. WIE SETZT SICH DER PREIS ZUSAMMEN?
Der Preis besteht aus zwei Komponenten:
- Einmalige Stellplatzgebühr (variiert je nach Standort, z.B. Garage oder Außenstellplatz).
- Energiekosten pro kWh (abhängig vom Strompreis des Anbieters).
Der Gesamtpreis wird vor der verbindlichen Reservierung transparent angezeigt.

3. KANN ICH EINE RESERVIERUNG STORNIEREN?
Ja, Sie können Ihre Reservierung unter "Meine Reservierungen" stornieren, solange der Ladevorgang noch nicht begonnen hat.

4. WIE WEIT IM VORAUS KANN ICH BUCHEN?
Sie können Slots für den heutigen Tag, morgen und übermorgen reservieren. Längere Vorausbuchungen sind aktuell nicht möglich, um Flexibilität zu gewährleisten.

5. KANN ICH MEINE EIGENE WALLBOX VERMIETEN?
Ja! Gehen Sie in den Einstellungen auf "Host werden" und füllen Sie das Formular aus. Wir prüfen Ihren Standort und schalten Ihre Wallbox für die Community frei.

6. WELCHE ZAHLUNGSMETHODEN WERDEN AKZEPTIERT?
Aktuell unterstützen wir PayPal und gängige Kreditkarten (Visa, Mastercard). Sie können Ihre Zahlungsmethoden in den Einstellungen verwalten.

7. WAS PASSIERT, WENN ICH MICH VERSPÄTE?
Ihr Slot ist verbindlich gebucht. Der Preis berechnet sich nach der gebuchten Zeit inkl. eines kleinen Puffers (5 Min). Wenn Sie später ankommen, verfällt die ungenutzte Zeit kostenpflichtig.

8. BRAUCHE ICH EINEN ACCOUNT?
Ja, für die Buchung und Abrechnung ist ein Account notwendig. Sie können die App jedoch im "Demo-Modus" testen, um sich einen Überblick zu verschaffen.`
  },
  en: {
    terms: `TERMS OF USE... (Text unchanged)`,
    privacy: `PRIVACY POLICY... (Text unchanged)`,
    faq: `FREQUENTLY ASKED QUESTIONS (FAQ)

1. HOW DOES CHARGING WORK WITH SMART SHIFT?
Select a charging station on the map, reserve a suitable time slot, and navigate there. Once on-site, scan the QR code on the wallbox via the app to start charging. Billing occurs automatically after the session ends.

2. HOW IS THE PRICE CALCULATED?
The price consists of two components:
- One-time parking fee (varies by location, e.g., garage or outdoor).
- Energy costs per kWh (depending on the provider's electricity price).
The total estimated price is displayed transparently before you confirm your reservation.

3. CAN I CANCEL A RESERVATION?
Yes, you can cancel your reservation under "My Reservations" as long as the charging session has not yet started.

4. HOW FAR IN ADVANCE CAN I BOOK?
You can reserve slots for today, tomorrow, and the day after tomorrow. Longer advance bookings are currently not possible to ensure flexibility.

5. CAN I RENT OUT MY OWN WALLBOX?
Yes! Go to Settings and select "Become a Host" to fill out the application form. We will verify your location and enable your wallbox for the community.

6. WHICH PAYMENT METHODS ARE ACCEPTED?
We currently support PayPal and major credit cards (Visa, Mastercard). You can manage your payment methods in the settings.

7. WHAT HAPPENS IF I AM LATE?
Your slot is booked bindingly. The price is calculated based on the reserved duration, including a small buffer (5 min). If you arrive late, the unused time is still charged.

8. DO I NEED AN ACCOUNT?
Yes, an account is required for booking and billing. However, you can explore the app using the "Demo Mode" to get an overview.`
  }
};

export const TRANSLATIONS = {
  de: {
    map: 'Karte',
    scan: 'Scan',
    settings: 'Einstellungen',
    reservationSuccess: 'Reservierung erfolgreich!',
    summary: 'Zusammenfassung',
    reservationSuccessSub: 'Du hast den Slot erfolgreich reserviert. Die Navigation kann jetzt gestartet werden.',
    confirmBinding: 'Verbindlich reservieren',
    date: 'Datum',
    startTime: 'Startzeit',
    duration: 'Dauer',
    totalPrice: 'Gesamtpreis',
    carColor: 'Fahrzeugfarbe',
    country: 'Land',
    make: 'Marke',
    model: 'Modell',
    plate: 'Kennzeichen',
    batterySize: 'Batteriegröße (kWh)',
    save: 'Speichern',
    faq: 'FAQ & Hilfe',
    terms: 'AGB',
    privacy: 'Datenschutz',
    profile: 'Profil bearbeiten',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    password: 'Passwort',
    repeatPassword: 'Passwort wiederholen',
    hostTitle: 'Host werden',
    hostIntro: 'Verdiene Geld mit deiner Wallbox, wenn du sie nicht brauchst.',
    submitApplication: 'Bewerbung absenden',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    myVehicles: 'Meine Fahrzeuge',
    addVehicle: 'Fahrzeug hinzufügen',
    lightDesign: 'Helles Design',
    darkDesign: 'Dunkles Design',
    changeLanguage: 'Sprache',
    history: 'Ladehistorie',
    paymentMethods: 'Zahlungsmethoden',
    contact: 'Kontakt & Support',
    logout: 'Abmelden',
    login: 'Anmelden',
    register: 'Registrieren',
    forgotPassword: 'Passwort vergessen?',
    demoAccount: 'Demo-Account nutzen',
    myReservations: 'Meine Reservierungen',
    cancelReservation: 'Stornieren',
    startCharging: 'Laden starten',
    reviewTitle: 'Wie war dein Ladevorgang?',
    reviewPlaceholder: 'Teile deine Erfahrung (optional)...',
    skip: 'Überspringen',
    submitReview: 'Bewertung senden',
    // New additions
    today: 'Heute',
    tomorrow: 'Morgen',
    garage: 'Garage',
    outdoor: 'Außen',
    available: 'Frei',
    busy: 'Belegt',
    priceBreakdown: 'Preiszusammensetzung',
    parkingFee: 'Stellplatzgebühr',
    oneTime: 'Einmalig',
    energyCost: 'Energiekosten',
    chargingDuration: 'Ladedauer',
    total: 'Gesamt',
    min: 'Min',
    hours: 'Std',
    priceInfoBuffer: 'Preis beinhaltet einmalige Stellplatzgebühr zzgl. geschätztem Stromverbrauch (5 Min Puffer inklusive).',
    timeSlots: 'Zeitfenster',
    noSlots: 'Keine passenden Timeslots.',
    tooShort: 'Zu kurz',
    occupied: 'Belegt',
    confirmBindingSub: 'Mit der Bestätigung reservierst du diesen Slot verbindlich. Die Stellplatzgebühr fällt einmalig an.',
    energyEstimated: 'Energie (geschätzt)',
    reserve: 'Reservieren',
    startNavigation: 'Navigation starten',
    searchPlaceholder: 'Ladestation suchen...',
    noReservationsFound: 'Keine offene Reservierung gefunden.',
    paymentMethodAdd: 'Methode hinzufügen',
    creditCard: 'Kreditkarte',
    standard: 'Standard',
    deleteVehicleTitle: 'Auto löschen?',
    deleteVehicleConfirm: 'Bist du dir sicher, dass du dieses Fahrzeug entfernen möchtest?',
    birthDate: 'Geburtsdatum',
    phoneNumber: 'Telefonnummer',
    address: 'Adresse',
    fillOnlyIfChanged: 'Nur bei Änderung ausfüllen',
    passwordStrength: 'Passwort-Sicherheit',
    wallboxLocation: 'Standort der Wallbox',
    techSpecs: 'Technische Daten',
    power: 'Leistung',
    access: 'Zugang',
    private: 'Privatgelände',
    public: 'Öffentlich',
    applicationSent: 'Bewerbung gesendet!',
    applicationReview: 'Wir prüfen deine Angaben und melden uns in Kürze.',
    contactSubject: 'Betreff',
    contactMessage: 'Nachricht',
    contactPlaceholder: 'Beschreibe dein Anliegen...',
    contactSend: 'Nachricht absenden',
    contactSuccess: 'Nachricht gesendet!',
    contactIntro: 'Hast du Fragen zur App, Probleme bei der Reservierung oder Feedback? Schreib uns gerne!',
    orReachUs: 'Oder erreiche uns direkt unter:',
    noHistory: 'Keine Ladevorgänge',
    historyEmpty: 'Deine Historie ist noch leer.',
    errorEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    errorRequired: 'Bitte füllen Sie alle Pflichtfelder aus.',
    errorAge: 'Sie müssen mindestens 18 Jahre alt sein.',
    errorPasswordMatch: 'Die Passwörter stimmen nicht überein.',
    errorPasswordPolicy: 'Das Passwort erfüllt nicht alle Anforderungen.',
    errorCredentials: 'E-Mail oder Passwort ist falsch.',
    stationsNearby: 'Stationen in der Nähe',
    availableStations: 'Verfügbare Stationen',
    filter: 'Filter',
    onlyAvailable: 'Nur verfügbar',
    hideBusy: 'Belegte Stationen ausblenden',
    minPower: 'Mindestleistung',
    connectorType: 'Steckertyp',
    reset: 'Zurücksetzen',
    apply: 'Anwenden',
    activeCharging: 'Aktiver Ladevorgang',
    runtime: 'Laufzeit',
    departure: 'Abfahrt bis',
    booked: 'Gebucht',
    stopCharging: 'Ladevorgang beenden',
    confirmStop: 'Wirklich beenden?',
    arrival: 'Ankunft',
    scanToCharge: 'Scan zum Laden',
    cameraStarting: 'Kamera wird gestartet...',
    activateReservation: 'Reservierung aktivieren',
    scanQRCode: 'QR-Code scannen',
    searchingCode: 'Suche Wallbox-Code...',
    scanInstruction: 'Scannen Sie den QR-Code, um das Laden zu starten.',
    simulateScan: 'Simuliere Scan',
    passwordMinLen: 'Min. 8 Zeichen',
    passwordUpper: 'Großbuchstabe',
    passwordLower: 'Kleinbuchstabe',
    passwordSpecial: 'Zahl/Sonderzeichen',
    or: 'Oder',
    noResults: 'Keine Ergebnisse',
    adjustFilter: 'Passe deine Filter an oder suche in einem anderen Gebiet.',
    activeReservation: 'Aktive Reservierung',
    all: 'Alle',
    street: 'Straße',
    houseNr: 'Hausnr.',
    zip: 'PLZ',
    city: 'Stadt',
    phone: 'Telefon',
    rate: 'Bewerten'
  },
  en: {
    map: 'Map',
    scan: 'Scan',
    settings: 'Settings',
    reservationSuccess: 'Reservation successful!',
    summary: 'Summary',
    reservationSuccessSub: 'You have successfully reserved the slot. You can start navigation now.',
    confirmBinding: 'Confirm Reservation',
    date: 'Date',
    startTime: 'Start Time',
    duration: 'Duration',
    totalPrice: 'Total Price',
    carColor: 'Car Color',
    country: 'Country',
    make: 'Make',
    model: 'Model',
    plate: 'License Plate',
    batterySize: 'Battery Size (kWh)',
    save: 'Save',
    faq: 'FAQ & Help',
    terms: 'Terms',
    privacy: 'Privacy',
    profile: 'Edit Profile',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'E-Mail',
    password: 'Password',
    repeatPassword: 'Repeat Password',
    hostTitle: 'Become a Host',
    hostIntro: 'Earn money with your wallbox when you don\'t need it.',
    submitApplication: 'Submit Application',
    cancel: 'Cancel',
    delete: 'Delete',
    myVehicles: 'My Vehicles',
    addVehicle: 'Add Vehicle',
    lightDesign: 'Light Design',
    darkDesign: 'Dark Design',
    changeLanguage: 'Language',
    history: 'Charging History',
    paymentMethods: 'Payment Methods',
    contact: 'Contact & Support',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password?',
    demoAccount: 'Use Demo Account',
    myReservations: 'My Reservations',
    cancelReservation: 'Cancel',
    startCharging: 'Start Charging',
    reviewTitle: 'How was your charging session?',
    reviewPlaceholder: 'Share your experience (optional)...',
    skip: 'Skip',
    submitReview: 'Submit Review',
    // New additions
    today: 'Today',
    tomorrow: 'Tomorrow',
    garage: 'Garage',
    outdoor: 'Outdoor',
    available: 'Free',
    busy: 'Busy',
    priceBreakdown: 'Price Breakdown',
    parkingFee: 'Parking Fee',
    oneTime: 'One-time',
    energyCost: 'Energy Costs',
    chargingDuration: 'Duration',
    total: 'Total',
    min: 'Min',
    hours: 'Hrs',
    priceInfoBuffer: 'Price includes one-time parking fee plus estimated energy (5 min buffer included).',
    timeSlots: 'Time Slots',
    noSlots: 'No matching time slots.',
    tooShort: 'Too short',
    occupied: 'Occupied',
    confirmBindingSub: 'By confirming, you make a binding reservation. The parking fee is charged once.',
    energyEstimated: 'Energy (estimated)',
    reserve: 'Reserve',
    startNavigation: 'Start Navigation',
    searchPlaceholder: 'Search charging station...',
    noReservationsFound: 'No open reservation found.',
    paymentMethodAdd: 'Add Method',
    creditCard: 'Credit Card',
    standard: 'Default',
    deleteVehicleTitle: 'Delete Car?',
    deleteVehicleConfirm: 'Are you sure you want to remove this vehicle?',
    birthDate: 'Birth Date',
    phoneNumber: 'Phone Number',
    address: 'Address',
    fillOnlyIfChanged: 'Fill only if changed',
    passwordStrength: 'Password Strength',
    wallboxLocation: 'Wallbox Location',
    techSpecs: 'Technical Data',
    power: 'Power',
    access: 'Access',
    private: 'Private Property',
    public: 'Public',
    applicationSent: 'Application Sent!',
    applicationReview: 'We will review your details and contact you shortly.',
    contactSubject: 'Subject',
    contactMessage: 'Message',
    contactPlaceholder: 'Describe your request...',
    contactSend: 'Send Message',
    contactSuccess: 'Message Sent!',
    contactIntro: 'Questions about the app, issues with reservation, or feedback? Write to us!',
    orReachUs: 'Or reach us directly at:',
    noHistory: 'No Charging Sessions',
    historyEmpty: 'Your history is empty.',
    errorEmail: 'Please enter a valid email address.',
    errorRequired: 'Please fill in all required fields.',
    errorAge: 'You must be at least 18 years old.',
    errorPasswordMatch: 'Passwords do not match.',
    errorPasswordPolicy: 'Password does not meet requirements.',
    errorCredentials: 'Email or password incorrect.',
    stationsNearby: 'Stations Nearby',
    availableStations: 'Available Stations',
    filter: 'Filter',
    onlyAvailable: 'Available Only',
    hideBusy: 'Hide busy stations',
    minPower: 'Min Power',
    connectorType: 'Connector Type',
    reset: 'Reset',
    apply: 'Apply',
    activeCharging: 'Active Session',
    runtime: 'Runtime',
    departure: 'Departure',
    booked: 'Booked',
    stopCharging: 'Stop Charging',
    confirmStop: 'Confirm Stop?',
    arrival: 'Arrival',
    scanToCharge: 'Scan to Charge',
    cameraStarting: 'Starting camera...',
    activateReservation: 'Activate Reservation',
    scanQRCode: 'Scan QR Code',
    searchingCode: 'Searching wallbox code...',
    scanInstruction: 'Scan the QR code to start charging.',
    simulateScan: 'Simulate Scan',
    passwordMinLen: 'Min. 8 chars',
    passwordUpper: 'Uppercase',
    passwordLower: 'Lowercase',
    passwordSpecial: 'Number/Special',
    or: 'Or',
    noResults: 'No Results',
    adjustFilter: 'Adjust your filters or search in a different area.',
    activeReservation: 'Active Reservation',
    all: 'All',
    street: 'Street',
    houseNr: 'Hausnr.',
    zip: 'ZIP',
    city: 'City',
    phone: 'Phone',
    rate: 'Rate'
  }
};
