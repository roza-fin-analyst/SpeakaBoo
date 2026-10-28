/* =====================================================================
   SPEAKABOO SETTINGS: the only file you need to edit on GitHub.
   1. Paste your Firebase web config below (Firebase console → Project
      settings → Your apps → Web app → "SDK setup and configuration" → Config).
   2. Keep the product IDs the same as the subscriptions you create in
      Google Play Console → Monetize → Subscriptions.
   While apiKey is empty, the app runs in "local mode": no accounts, no
   subscription, everything free and saved only on this device.
   ===================================================================== */
window.SPEAKABOO_CONFIG = {
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  },
  trialDays: 7,
  /* What the free trial includes. Premium unlocks everything. */
  trial: { seasons: 1, talkPerDay: 10, callBoo: false },
  /* Prices are really set in Play Console; these labels show until Play's local prices load. */
  products: [
    { id: 'speakaboo_monthly', name: 'Monthly', period: 'month', price: '$4.99' },
    { id: 'speakaboo_yearly', name: 'Yearly', period: 'year', price: '$39.99', note: 'save 33%', best: true }
  ],
  playStoreUrl: 'https://play.google.com/store/apps/details?id=app.speakaboo.twa',
  /* Owner / tester emails: these accounts get everything unlocked plus a 'jump ahead' button. Nobody else can skip. */
  owners: ['ayeshaferozroza@gmail.com'],
  supportEmail: 'ayeshaferozroza@gmail.com'
};
