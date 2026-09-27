import type { Language } from "../api/client";

type Strings = {
  loginSubtitle: string;
  phoneLabel: string;
  phoneNote: string;
  loginFirstTimeHint: string;
  otpWhatsappFailed: string;
  sendCode: string;
  codeLabel: string;
  codeHint: (phone: string, mins: number) => string;
  codeHintClick: (mins: number) => string;
  continue: string;
  changeNumber: string;
  signupHint: string;
  openWhatsApp: string;
  openWhatsAppForCode: string;
  roleTenant: string;
  roleLandlord: string;
  logout: string;
  logoutConfirm: string;
  menu: string;
  shareLocation: string;
  shareLocationUser: string;
  messagePlaceholder: string;
  send: string;
  locationDenied: string;
  welcomeTenant: string;
  welcomeLandlord: string;
  welcomeSignup: string;
  tapMenu: string;
  errorGeneric: string;
  invalidCongoPhone: string;
  tabChat: string;
  tabBrowse: string;
  tabListings: string;
  tabAccount: string;
  tabContacts: string;
  tabMenu: string;
  searchTitle: string;
  searchModeMap: string;
  searchModeManual: string;
  searchNearMe: string;
  searchManualBtn: string;
  searchRegion: string;
  searchTown: string;
  searchNeighbourhood: string;
  searchMinRent: string;
  searchMaxRent: string;
  searchPriceHint: string;
  searchParking: string;
  searchWater: string;
  searchAnyRegion: string;
  searchResults: (n: number) => string;
  searchEmpty: string;
  searchEmptyHint: string;
  searchDistance: (km: number) => string;
  browseTitle: string;
  browseEmpty: string;
  browseRent: (amount: number) => string;
  browseUnlock: string;
  browseUnlockDone: string;
  browseLandlordOnly: string;
  takePhoto: string;
  takeVideo: string;
  uploadBusy: string;
  uploadDone: string;
  cameraDenied: string;
  signingUp: string;
  changeLanguage: string;
  themeTitle: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  openMap: string;
  mapTitle: string;
  mapDirections: string;
  mapCount: (n: number) => string;
  languageUpdated: string;
  detailTitle: string;
  detailClose: string;
  detailDirections: string;
  detailCall: string;
  detailWhatsApp: string;
  listingWhatsAppPrefill: (houseId: string) => string;
  contactWhatsAppPrefill: (place: string) => string;
  detailAmenities: string;
  detailDescription: string;
  detailInactive: string;
  detailMonthsUpfront: (n: number) => string;
  detailWater: string;
  detailParking: string;
  detailFenced: string;
  detailBorehole: string;
  detailFurnished: string;
  detailSecurity: string;
  detailGenerator: string;
  detailViewListing: string;
  landlordTitle: string;
  landlordSubtitle: string;
  landlordEmpty: string;
  landlordEmptyHint: string;
  landlordEdit: string;
  landlordEditTitle: string;
  landlordSave: string;
  landlordMarkRented: string;
  landlordReactivate: string;
  landlordRemove: string;
  landlordRemoveTitle: string;
  landlordRemoveConfirm: string;
  landlordStatusActive: string;
  landlordStatusRented: string;
  landlordRentLabel: string;
  landlordMonthsUpfront: string;
  landlordRentRequired: string;
  verifyBadgeVerified: string;
  verifyBadgeUnverified: string;
  verifyBannerTitle: string;
  verifyBannerBody: string;
  verifyBannerCta: string;
  signupTitle: string;
  signupSubtitle: string;
  signupTenantDesc: string;
  signupLandlordDesc: string;
  signupReferralToggle: string;
  signupReferralLabel: string;
  actionListProperty: string;
  actionMoreOptions: string;
  landlordActions: string;
  tenantActions: string;
  helpTitle: string;
  helpBody: string;
  deleteAccountTitle: string;
  deleteAccountBody: string;
  deleteAccountLink: string;
  contactsSubtitle: string;
  contactsEmpty: string;
  contactsEmptyHint: string;
  flowWorking: string;
  flowYes: string;
  flowNo: string;
  flowConfirm: string;
  flowPickRent: string;
  flowPickBedrooms: string;
  flowPickToilets: string;
  flowBedroomsHint: string;
  flowPhotosAdded: (n: number) => string;
  flowPhotosDone: string;
  flowVideoDone: string;
  flowLocationTooShort: string;
  flowSuggestions: string;
  tabSaved: string;
  offlineBanner: string;
  pullRefresh: string;
  searchCategory: string;
  searchResidential: string;
  searchCommercial: string;
  searchFenced: string;
  searchGenerator: string;
  searchSort: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortDistance: string;
  saveSearch: string;
  saveSearchDone: string;
  savedTitle: string;
  savedShortlist: string;
  savedAlerts: string;
  savedCompare: string;
  savedCompareNeed: string;
  savedEmptyShortlist: string;
  savedEmptyShortlistHint: string;
  savedEmptyAlerts: string;
  savedEmptyAlertsHint: string;
  savedRemove: string;
  savedAddAlert: string;
  detailSave: string;
  detailSaved: string;
  detailReport: string;
  detailReportTitle: string;
  detailReportPlaceholder: string;
  detailReportSubmit: string;
  detailListedAgo: (days: number) => string;
  trustVerifiedPlus: string;
  unlockSheetTitle: string;
  unlockFee: (kes: number) => string;
  unlockReference: (ref: string) => string;
  unlockCredits: (n: number) => string;
  unlockDailyLimit: (used: number, limit: number) => string;
  unlockCopyReference: string;
  unlockCopied: string;
  unlockOpenMpesa: string;
  unlockConfirmPaid: string;
  unlockFreeForNow: string;
  unlockAlreadyDone: string;
  unlockLimitReached: string;
  unlockPaymentRequired: string;
  unlockMoveInTitle: string;
  unlockMoveInTotal: (kes: number) => string;
  marketTitle: string;
  marketHeatMap: string;
  diasporaTitle: string;
  diasporaHint: string;
  diasporaSave: string;
  referTitle: string;
  referShare: string;
  tenantVerifyTitle: string;
  tenantVerifyId: string;
  tenantVerifyMpesa: string;
  pickFromGallery: string;
  flowPublish: string;
  flowCancelPublish: string;
  landlordStatsTitle: string;
  landlordBulkActivate: string;
  landlordBulkDeactivate: string;
  detailBedrooms: (n: number) => string;
  detailToilets: (n: number) => string;
  detailElectricity: (meter: string) => string;
  detailShare: string;
  detailRetry: string;
  detailGallery: string;
  detailConcierge: string;
  detailLease: string;
  detailReportRented: string;
  searchFurnished: string;
  searchSecurity: string;
  searchElectricity: string;
  searchPropertyType: string;
  searchMinBeds: string;
  searchMinToilets: string;
  searchSubtypeStudio: string;
  searchSubtypeApartment: string;
  searchSubtypeHouse: string;
  searchSubtypeParcelle: string;
  searchAnyType: string;
  savedAiCompare: string;
  marketTrendsTitle: string;
  marketTrendLine: (area: string, pct: number) => string;
  tenantVerifiedBadge: string;
  tenantVerifyPrompt: string;
  onboardingSkip: string;
  onboardingNext: string;
  onboardingDone: string;
  onboardingTenant1Title: string;
  onboardingTenant1Body: string;
  onboardingTenant2Title: string;
  onboardingTenant2Body: string;
  onboardingTenant3Title: string;
  onboardingTenant3Body: string;
  onboardingLandlord1Title: string;
  onboardingLandlord1Body: string;
  onboardingLandlord2Title: string;
  onboardingLandlord2Body: string;
  onboardingLandlord3Title: string;
  onboardingLandlord3Body: string;
  lowDataMode: string;
  lowDataHint: string;
  notificationInbox: string;
  notificationEmpty: string;
  landlordGenerateLease: string;
  landlordAddPhotos: string;
  landlordAddVideo: string;
  landlordViewsUnlocks: (views: number, unlocks: number) => string;
  cachedResultsHint: string;
  errorRetry: string;
  goToSearch: string;
  savedRemoveItem: string;
  savedCompareResult: string;
  savedAiCompareTitle: string;
  savedAiBestFit: string;
  searchTownPlaceholder: string;
  searchNeighbourhoodPlaceholder: string;
  searchValidationLocation: string;
  searchValidationRent: string;
  detailReportThanks: string;
  detailReportRentedThanks: string;
  unlockSuccessHint: string;
  unlockStepContact: string;
  searching: string;
  searchPlaceholder: string;
  filters: string;
  filtersApply: string;
  filtersClear: string;
  filtersCount: (n: number) => string;
  mapView: string;
  listView: string;
  searchMeterPrepaid: string;
  searchMeterPostpaid: string;
  cardBeds: (n: number) => string;
  cardBaths: (n: number) => string;
  cardMonths: (n: number) => string;
  unlockWhy: string;
  unlockStepCopyLabel: string;
  unlockStepPayLabel: string;
  unlockStepConfirmLabel: string;
  unlockMessageWhatsApp: string;
  unlockShowNumber: string;
  listStepWhat: string;
  listStepWhere: string;
  listStepHome: string;
  listStepPhotos: string;
  listStepOf: (n: number, total: number) => string;
  listPhotosHint: string;
  listAmenitiesNext: string;
  moreActions: string;
  bulkConfirmActivate: string;
  bulkConfirmDeactivate: string;
  signupRoleHint: string;
  loginCodeFailedHint: string;
  coachFilters: string;
  coachListPhotos: string;
  yourLandlords: string;
  accountYou: string;
  accountActivity: string;
  accountTools: string;
  accountSettings: string;
  locationAsk: string;
  savedTitleShort: string;
  loginContinueBrowse: string;
  loginToContinue: string;
  guestAccountHint: string;
  filtersMore: string;
  filtersLess: string;
  listVideoRequired: string;
  accountMoreTools: string;
  menuBulkManage: string;
  menuAgent: string;
  menuOpenFull: string;
  menuVerifyRequested: string;
  accountLogin: string;
  signupConfirm: string;
  signupConfirmTenant: string;
  signupConfirmLandlord: string;
  tabInterest: string;
  interestEmpty: string;
  interestEmptyHint: string;
  compareColRent: string;
  compareColArea: string;
  compareColBeds: string;
  locationTypeHint: string;
  unlockComingSoon: string;
  notificationEmptyLine: string;
};

const en: Strings = {
  loginSubtitle: "Trouvez un logement — sur l'app ou WhatsApp.",
  phoneLabel: "Votre numéro WhatsApp",
  phoneNote:
    "Déjà sur Casa ? Continuez avec votre numéro WhatsApp. Nouveau ? Nous envoyons un code sur WhatsApp.",
  loginFirstTimeHint: "Nous envoyons un code à 6 chiffres sur WhatsApp.",
  otpWhatsappFailed:
    "Impossible d'envoyer le code WhatsApp. Vérifiez le numéro et réessayez.",
  sendCode: "Continuer",
  codeLabel: "Entrez le code à 6 chiffres",
  codeHint: (phone, mins) =>
    `Nous avons envoyé un code sur WhatsApp (${phone}). Il expire dans ${mins} minutes.`,
  codeHintClick: (mins) =>
    `WhatsApp va s'ouvrir. Appuyez sur Envoyer — Casa répond avec votre code à 6 chiffres. Il expire dans ${mins} minutes.`,
  continue: "Continuer",
  changeNumber: "Changer de numéro",
  signupHint: "Vous préférez WhatsApp ?",
  openWhatsApp: "Ouvrir Casa sur WhatsApp",
  openWhatsAppForCode: "Ouvrir WhatsApp pour recevoir le code",
  roleTenant: "Locataire",
  roleLandlord: "Propriétaire",
  logout: "Déconnexion",
  logoutConfirm: "Se déconnecter de ce compte Casa ?",
  menu: "Menu principal",
  shareLocation: "Partager la position",
  shareLocationUser: "📍 Ma position",
  messagePlaceholder: "Écrire un message…",
  send: "Envoyer",
  locationDenied: "Autorisez la position pour trouver des logements près de vous.",
  welcomeTenant: "Bienvenue ! Appuyez ci-dessous ou partagez 📍 pour chercher autour.",
  welcomeLandlord: "Bienvenue ! Appuyez ci-dessous pour publier ou gérer vos biens.",
  welcomeSignup:
    "Bienvenue ! Choisissez locataire ou propriétaire.",
  tapMenu: "Astuce : appuyez sur Menu principal pour revenir.",
  errorGeneric: "Une erreur s'est produite. Réessayez.",
  invalidCongoPhone: "Entrez un numéro congolais, ex. 0812 345 678 ou 243812345678.",
  tabChat: "Chat",
  tabBrowse: "Recherche",
  tabListings: "Mes annonces",
  tabAccount: "Compte",
  tabContacts: "Contacts",
  tabMenu: "Menu",
  searchTitle: "Trouver un logement",
  searchModeMap: "Près de moi",
  searchModeManual: "Filtres",
  searchNearMe: "Chercher près de moi",
  searchManualBtn: "Rechercher",
  searchRegion: "Province",
  searchTown: "Ville",
  searchNeighbourhood: "Quartier",
  searchMinRent: "Loyer min (CDF)",
  searchMaxRent: "Loyer max (CDF)",
  searchPriceHint: "Laisser vide = pas de limite",
  searchParking: "Parking",
  searchWater: "Eau courante",
  searchAnyRegion: "Toutes les provinces",
  searchResults: (n) => `${n} logement(s) trouvé(s)`,
  searchEmpty: "Aucun logement ne correspond.",
  searchEmptyHint: "Élargissez les filtres ou cherchez près de votre position.",
  searchDistance: (km) => `${km.toFixed(1)} km`,
  browseTitle: "Logements disponibles",
  browseEmpty: "Pas encore d'annonces. Revenez bientôt.",
  browseRent: (amount) => `${amount.toLocaleString("fr-CD")} CDF / mois`,
  browseUnlock: "Voir le contact du propriétaire",
  browseUnlockDone: "Contact débloqué — voir Contacts",
  browseLandlordOnly: "Passez en compte locataire pour débloquer les contacts.",
  takePhoto: "Prendre une photo",
  takeVideo: "Filmer une vidéo",
  uploadBusy: "Envoi…",
  uploadDone: "Envoyé ✓",
  cameraDenied: "Autorisez l'appareil photo pour ajouter photos ou vidéos.",
  signingUp: "Création du compte…",
  changeLanguage: "Langue",
  themeTitle: "Apparence",
  themeLight: "Clair",
  themeDark: "Sombre",
  themeSystem: "Système",
  openMap: "Ouvrir la carte",
  mapTitle: "Logements à proximité",
  mapDirections: "Itinéraire",
  mapCount: (n) => (n === 1 ? "1 logement" : `${n} logements`),
  languageUpdated: "Langue mise à jour",
  detailTitle: "Détails de l'annonce",
  detailClose: "Fermer",
  detailDirections: "Itinéraire",
  detailCall: "Appeler",
  detailWhatsApp: "WhatsApp",
  listingWhatsAppPrefill: (houseId) =>
    `Bonjour, je suis intéressé(e) par votre annonce Casa Congo (${houseId}).`,
  contactWhatsAppPrefill: (place) =>
    `Bonjour, je vous contacte au sujet de ${place} sur Casa Congo.`,
  detailAmenities: "Équipements",
  detailDescription: "Description",
  detailInactive: "Indisponible",
  detailMonthsUpfront: (n) => `${n} mois d'avance`,
  detailWater: "Eau courante",
  detailParking: "Parking",
  detailFenced: "Clôturé / sécurisé",
  detailBorehole: "Forage / citerne",
  detailFurnished: "Meublé",
  detailSecurity: "Sécurité / gardien",
  detailGenerator: "Groupe électrogène",
  detailViewListing: "Voir les détails",
  landlordTitle: "Mes annonces",
  landlordSubtitle: "Modifier, marquer loué ou retirer de la recherche.",
  landlordEmpty: "Pas encore d'annonces.",
  landlordEmptyHint: "Ajoutez votre premier bien avec photos et une vidéo de visite.",
  landlordEdit: "Modifier",
  landlordEditTitle: "Modifier l'annonce",
  landlordSave: "Enregistrer",
  landlordMarkRented: "Marquer loué",
  landlordReactivate: "Réactiver",
  landlordRemove: "Retirer",
  landlordRemoveTitle: "Retirer l'annonce ?",
  landlordRemoveConfirm: "L'annonce disparaît de la recherche. Vous pourrez la réactiver plus tard.",
  landlordStatusActive: "Active",
  landlordStatusRented: "Loué / masqué",
  landlordRentLabel: "Loyer mensuel (CDF)",
  landlordMonthsUpfront: "Mois d'avance",
  landlordRentRequired: "Entrez un loyer valide.",
  verifyBadgeVerified: "Propriétaire vérifié",
  verifyBadgeUnverified: "Non vérifié",
  verifyBannerTitle: "Obtenez le badge vérifié",
  verifyBannerBody:
    "Les locataires font confiance aux propriétaires vérifiés. Envoyez une photo d'un document où votre nom est visible (carte d'identité, reçu, facture, etc.) dans le Chat.",
  verifyBannerCta: "Vérifier maintenant",
  signupTitle: "Rejoindre Casa",
  signupSubtitle: "Comment allez-vous utiliser Casa ?",
  signupTenantDesc: "Cherchez un logement et écrivez aux propriétaires sur WhatsApp.",
  signupLandlordDesc: "Publiez des biens et voyez qui est intéressé.",
  signupReferralToggle: "Vous avez un numéro de parrain ?",
  signupReferralLabel: "WhatsApp du parrain",
  actionListProperty: "Publier un bien",
  actionMoreOptions: "Plus d'options",
  landlordActions: "Actions propriétaire",
  tenantActions: "Actions locataire",
  helpTitle: "Aide",
  helpBody: "La recherche utilise la carte ou les filtres. Débloquez une annonce pour appeler ou écrire au propriétaire. Propriétaires : vérifiez votre pièce une fois, puis publiez avec photos et vidéo.",
  deleteAccountTitle: "Supprimer le compte",
  deleteAccountBody: "Pour supprimer votre compte Casa et vos données, suivez les étapes sur la page de suppression.",
  deleteAccountLink: "Demander la suppression",
  contactsSubtitle: "Propriétaires débloqués — appuyez pour appeler ou écrire.",
  contactsEmpty: "Aucun contact débloqué.",
  contactsEmptyHint: "Cherchez un logement et débloquez le propriétaire pour l'appeler ou lui écrire.",
  flowWorking: "Chargement…",
  flowYes: "Oui",
  flowNo: "Non",
  flowConfirm: "Confirmer",
  flowPickRent: "Choisissez le loyer mensuel",
  flowPickBedrooms: "Combien de chambres ?",
  flowPickToilets: "Combien de toilettes / salles de bain ?",
  flowBedroomsHint: "Incluez le salon",
  flowPhotosAdded: (n) => `${n} photo(s) ajoutée(s)`,
  flowPhotosDone: "Terminer les photos",
  flowVideoDone: "Terminer la vidéo",
  flowLocationTooShort: "Entrez au moins 2 caractères.",
  flowSuggestions: "Suggestions — appuyez ou tapez le vôtre",
  tabSaved: "Favoris",
  offlineBanner: "Vous êtes hors ligne — vérifiez la connexion et tirez pour actualiser.",
  pullRefresh: "Tirer pour actualiser",
  searchCategory: "Type de bien",
  searchResidential: "Résidentiel",
  searchCommercial: "Commercial",
  searchFenced: "Clôturé / sécurisé",
  searchGenerator: "Groupe électrogène",
  searchSort: "Trier par",
  sortNewest: "Plus récent",
  sortPriceAsc: "Prix ↑",
  sortPriceDesc: "Prix ↓",
  sortDistance: "Distance",
  saveSearch: "Enregistrer la recherche et les alertes",
  saveSearchDone: "Alerte enregistrée — nous vous préviendrons d'une correspondance.",
  savedTitle: "Favoris et alertes",
  savedShortlist: "Comparer la sélection",
  savedAlerts: "Alertes de recherche",
  savedCompare: "Comparer les annonces",
  savedCompareNeed: "Enregistrez au moins 2 annonces pour comparer.",
  savedEmptyShortlist: "Rien d'enregistré.",
  savedEmptyShortlistHint: "Appuyez sur Enregistrer sur une annonce pour constituer votre liste.",
  savedEmptyAlerts: "Aucune alerte pour l'instant.",
  savedEmptyAlertsHint: "Enregistrez une recherche pour être prévenu des nouveaux logements.",
  savedRemove: "Retirer",
  savedAddAlert: "Nouvelle alerte depuis la dernière recherche",
  detailSave: "Enregistrer pour comparer",
  detailSaved: "Enregistré ✓",
  detailReport: "Signaler l'annonce",
  detailReportTitle: "Pourquoi signalez-vous ?",
  detailReportPlaceholder: "ex. Déjà loué, arnaque, mauvais prix…",
  detailReportSubmit: "Envoyer le signalement",
  detailListedAgo: (days) => (days === 0 ? "Publié aujourd'hui" : `Publié il y a ${days} jour(s)`),
  trustVerifiedPlus: "Vérifié+",
  unlockSheetTitle: "Débloquer le contact du propriétaire",
  unlockFee: (kes) => `${kes.toLocaleString("fr-CD")} CDF de déblocage`,
  unlockReference: (ref) => `Référence de paiement : ${ref}`,
  unlockCredits: (n) => `${n} crédit(s) de déblocage gratuit`,
  unlockDailyLimit: (used, limit) => `Déblocages du jour : ${used}/${limit}`,
  unlockCopyReference: "Copier la référence",
  unlockCopied: "Copié ✓",
  unlockOpenMpesa: "Ouvrir le paiement mobile",
  unlockConfirmPaid: "J'ai payé",
  unlockFreeForNow: "Le déblocage est gratuit pour l'instant — appuyez pour voir le contact.",
  unlockAlreadyDone: "Vous avez déjà débloqué cette annonce.",
  unlockLimitReached: "Limite quotidienne atteinte. Réessayez demain.",
  unlockPaymentRequired: "Terminez le paiement, puis appuyez sur J'ai payé.",
  unlockMoveInTitle: "Coût estimé d'emménagement",
  unlockMoveInTotal: (kes) => `Total : ${kes.toLocaleString("fr-CD")} CDF`,
  marketTitle: "Carte des loyers",
  marketHeatMap: "Loyer moyen par quartier (annonces actives)",
  diasporaTitle: "Mode diaspora",
  diasporaHint: "Le WhatsApp du proche en RDC reçoit les contacts débloqués.",
  diasporaSave: "Enregistrer le bénéficiaire",
  referTitle: "Parrainer un ami",
  referShare: "Partager l'invitation",
  tenantVerifyTitle: "Vérification locataire",
  tenantVerifyId: "Vérifier avec une pièce",
  tenantVerifyMpesa: "Vérifier avec le mobile money",
  pickFromGallery: "Choisir dans la galerie",
  flowPublish: "Publier l'annonce",
  flowCancelPublish: "Annuler",
  landlordStatsTitle: "Performance (7 jours)",
  landlordBulkActivate: "Tout activer",
  landlordBulkDeactivate: "Tout désactiver",
  detailBedrooms: (n) => `${n} chambre(s)`,
  detailToilets: (n) => `${n} toilette(s)`,
  detailElectricity: (meter) => `Électricité : ${meter}`,
  detailShare: "Partager l'annonce",
  detailRetry: "Réessayer",
  detailGallery: "Galerie complète",
  detailConcierge: "Guide d'emménagement",
  detailLease: "Modèle de bail",
  detailReportRented: "Déjà loué ?",
  searchFurnished: "Meublé",
  searchSecurity: "Sécurité",
  searchElectricity: "Compteur",
  searchPropertyType: "Type de bien",
  searchMinBeds: "Chambres min",
  searchMinToilets: "Toilettes min",
  searchSubtypeStudio: "Studio",
  searchSubtypeApartment: "2–4 pièces",
  searchSubtypeHouse: "Villa",
  searchSubtypeParcelle: "Parcelle",
  searchAnyType: "Tous types",
  savedAiCompare: "Comparer avec l'IA",
  marketTrendsTitle: "Tendances des loyers",
  marketTrendLine: (area, pct) => `${area}: ${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`,
  tenantVerifiedBadge: "Locataire vérifié",
  tenantVerifyPrompt: "Vérifier le profil locataire",
  onboardingSkip: "Passer",
  onboardingNext: "Suivant",
  onboardingDone: "Commencer",
  onboardingTenant1Title: "Cherchez sur la carte",
  onboardingTenant1Body: "Trouvez des logements vérifiés près de vous ou filtrez par ville, loyer et équipements.",
  onboardingTenant2Title: "Débloquez le contact",
  onboardingTenant2Body: "Un petit frais (quand activé) pour appeler ou écrire directement au propriétaire.",
  onboardingTenant3Title: "Enregistrez et comparez",
  onboardingTenant3Body: "Mettez en favoris, recevez des alertes et comparez les annonces.",
  onboardingLandlord1Title: "Vérifiez votre pièce",
  onboardingLandlord1Body: "Les propriétaires vérifiés reçoivent plus de demandes. Une photo d'un document avec votre nom suffit.",
  onboardingLandlord2Title: "Publiez avec une vidéo",
  onboardingLandlord2Body: "Chaque annonce a besoin d'une vidéo de visite — les locataires font confiance à ce qu'ils voient.",
  onboardingLandlord3Title: "Suivez les performances",
  onboardingLandlord3Body: "Vues et déblocages, modifier le loyer, marquer loué en un tap.",
  lowDataMode: "Mode données limitées",
  lowDataHint: "Miniatures seulement — appuyez pour charger photos et vidéo en Wi‑Fi.",
  notificationInbox: "Notifications",
  notificationEmpty: "Aucune notification.",
  landlordGenerateLease: "Générer un bail",
  landlordAddPhotos: "Ajouter des photos",
  landlordAddVideo: "Ajouter une vidéo",
  landlordViewsUnlocks: (views, unlocks) => `${views} vues · ${unlocks} déblocages`,
  cachedResultsHint: "Résultats enregistrés — tirez pour actualiser une fois en ligne.",
  errorRetry: "Réessayer",
  goToSearch: "Commencer la recherche",
  savedRemoveItem: "Retirer de la sélection",
  savedCompareResult: "Résultat de comparaison",
  savedAiCompareTitle: "Comparaison IA",
  savedAiBestFit: "Meilleur choix",
  searchTownPlaceholder: "Kinshasa, Lubumbashi…",
  searchNeighbourhoodPlaceholder: "Gombe, Ngaliema, Limete…",
  searchValidationLocation: "Entrez une province, une ville ou un quartier.",
  searchValidationRent: "Le loyer min doit être inférieur au loyer max.",
  detailReportThanks: "Merci — notre équipe va examiner.",
  detailReportRentedThanks: "Merci — annonce masquée.",
  unlockSuccessHint: "Vous pouvez écrire au propriétaire maintenant.",
  unlockStepContact: "Afficher le numéro WhatsApp",
  searching: "Recherche de logements près de vous…",
  searchPlaceholder: "Gombe, Ngaliema, Limete…",
  filters: "Filtres",
  filtersApply: "Voir les logements",
  filtersClear: "Effacer",
  filtersCount: (n) => (n === 0 ? "Filtres" : `${n} filtres`),
  mapView: "Carte",
  listView: "Liste",
  searchMeterPrepaid: "Compteur prépayé",
  searchMeterPostpaid: "Facture postpayée",
  cardBeds: (n) => `${n} ch.`,
  cardBaths: (n) => `${n} sdb`,
  cardMonths: (n) => `${n} mois d'avance`,
  unlockWhy: "Ce frais donne le WhatsApp du propriétaire. Casa ne prend pas de commission sur le loyer.",
  unlockStepCopyLabel: "1. Copier le code",
  unlockStepPayLabel: "2. Payer en mobile money",
  unlockStepConfirmLabel: "3. J'ai payé",
  unlockMessageWhatsApp: "Écrire sur WhatsApp",
  unlockShowNumber: "Afficher le numéro WhatsApp",
  listStepWhat: "Quoi",
  listStepWhere: "Où",
  listStepHome: "Le logement",
  listStepPhotos: "Photos",
  listStepOf: (n, total) => `${n} sur ${total}`,
  listPhotosHint: "Ajoutez au moins 5 photos — les locataires ignorent les annonces vides.",
  listAmenitiesNext: "Continuer",
  moreActions: "Plus",
  bulkConfirmActivate: "Activer toutes les annonces ?",
  bulkConfirmDeactivate: "Désactiver toutes les annonces ?",
  signupRoleHint: "Vous pouvez écrire à Casa sur WhatsApp si vous vous trompez de rôle.",
  loginCodeFailedHint:
    "Code non reçu ? Ouvrez WhatsApp, appuyez sur Envoyer, puis saisissez le code que Casa envoie.",
  coachFilters: "Appuyez sur Filtres pour le loyer, les chambres et le quartier.",
  coachListPhotos: "Ajoutez au moins 4 photos. Les locataires ignorent les annonces vides.",
  yourLandlords: "Vos propriétaires",
  accountYou: "Vous",
  accountActivity: "Activité",
  accountTools: "Outils",
  accountSettings: "Réglages",
  locationAsk: "Voir les logements près de vous",
  savedTitleShort: "Favoris",
  loginContinueBrowse: "Pas maintenant — continuer à parcourir",
  loginToContinue: "Connectez-vous pour enregistrer et obtenir le numéro du propriétaire.",
  guestAccountHint: "Parcourez librement. Connectez-vous pour enregistrer ou voir un contact.",
  filtersMore: "Plus de filtres",
  filtersLess: "Moins de filtres",
  listVideoRequired: "Une vidéo de visite est obligatoire avant de publier.",
  accountMoreTools: "Plus d'outils",
  menuBulkManage: "Gestion groupée",
  menuAgent: "Mode agent",
  menuOpenFull: "Ouvrir le menu WhatsApp complet",
  menuVerifyRequested: "Demande reçue. Notre équipe examinera votre pièce.",
  accountLogin: "Connexion",
  signupConfirm: "Confirmer",
  signupConfirmTenant: "Je cherche un logement",
  signupConfirmLandlord: "Je publie des biens à louer",
  tabInterest: "Intérêt",
  interestEmpty: "Personne n'a encore demandé un numéro",
  interestEmptyHint: "Quand un locataire appuie sur Voir le contact, il apparaît ici.",
  compareColRent: "Loyer",
  compareColArea: "Quartier",
  compareColBeds: "Chambres",
  locationTypeHint: "Tapez un quartier ci-dessus — Gombe, Ngaliema, Limete, Himbi…",
  unlockComingSoon: "Le déblocage reste gratuit pour l'instant. Réessayez dans un instant.",
  notificationEmptyLine: "Aucune notification.",
};


export function t(_lang?: Language): Strings {
  return en;
}

export function loginT(_useSwahili?: boolean): Strings {
  return en;
}

export function langFromSignup(_useSwahili?: boolean): Language {
  return "en";
}
