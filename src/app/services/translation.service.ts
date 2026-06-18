import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'fr' | 'ar';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.sales': 'Sales',
    'nav.marketing': 'Marketing',
    'nav.inbox': 'Inbox',
    'nav.analytics': 'Analytics',
    'nav.partners': 'Partners',
    'nav.finance': 'Finance',
    'nav.sales.deals': 'Deals & Proposals',
    'nav.sales.tasks': 'Tasks',
    'nav.marketing.email': 'Email',
    'nav.marketing.whatsapp': 'WhatsApp',
    'nav.marketing.sms': 'SMS',
    'nav.inbox.tickets': 'My Tickets',
    // Profile Menu
    'profile.language': 'Language',
    'profile.profile': 'My Profile',
    'profile.settings': 'Settings',
    'profile.logout': 'Sign Out',
    'profile.changeLanguage': 'Change Language',
    // Walkthrough
    'walkthrough.title': 'Scenario Walkthrough',
    'walkthrough.progress': 'Scenario Progress',
    'walkthrough.steps': 'Steps',
    'walkthrough.stepList': 'Step List',
    'walkthrough.goToPage': 'Go to Page',
    'walkthrough.completed': 'Scenario Fully Completed!',
    'walkthrough.completedDesc': 'All workflow stages from quote to vendor PO, customer invoicing, and collection recovery were executed successfully.',
    'walkthrough.reset': 'Reset & Run Again',
    'walkthrough.button': 'Walkthrough Wizard',
    // Dashboard
    'dashboard.title': 'Home',
    'dashboard.subtitle': 'Your customizable daily summary. Select which KPIs to track.',
    'dashboard.customize': 'Customize KPIs',
    'dashboard.doneCustomizing': 'Done Customizing',
    'dashboard.selectKpis': 'Select KPIs to display',
    'dashboard.newDeal': 'New Deal',
    'dashboard.addPartner': 'Add Partner',
    'dashboard.newCampaign': 'New Campaign',
    'dashboard.createTicket': 'Create Ticket',
    'dashboard.kpi.totalDeals': 'Total Deals Value',
    'dashboard.kpi.totalDeals.label': 'Total Deals',
    'dashboard.kpi.marketingSpend': 'Marketing Spend',
    'dashboard.kpi.marketingSpend.label': 'Marketing Spend',
    'dashboard.kpi.latePayers': 'Late Payers',
    'dashboard.kpi.latePayers.label': 'Late Payers',
    'dashboard.kpi.activeCampaigns': 'Active Campaigns',
    'dashboard.kpi.activeCampaigns.label': 'Active Campaigns',
    'dashboard.kpi.openTickets': 'Open Tickets',
    'dashboard.kpi.openTickets.label': 'Open Tickets',
    'dashboard.kpi.totalProspects': 'Total Prospects',
    'dashboard.kpi.totalProspects.label': 'Total Prospects',
    'dashboard.kpi.activePipeline': 'Active Pipeline',
    'dashboard.kpi.stableChannels': 'Stable across channels',
    'dashboard.kpi.needsAttention': 'Needs attention',
    'dashboard.kpi.runningSmoothly': 'Running smoothly',
    'dashboard.kpi.pendingResolution': 'Pending resolution',
    'dashboard.kpi.growingPipeline': 'Growing pipeline',
    'dashboard.chart.partnerDirectory': 'Partner Directory',
    'dashboard.chart.tasksStatus': 'Tasks Status',
    'dashboard.chart.customers': 'Customers',
    'dashboard.chart.prospects': 'Prospects',
    'dashboard.chart.vendors': 'Vendors',
    'dashboard.chart.completed': 'Completed',
    'dashboard.chart.inProgress': 'In Progress',
    'dashboard.chart.pending': 'Pending',
    // Languages
    'lang.en': 'English',
    'lang.fr': 'Français',
    'lang.ar': 'العربية',
  },
  fr: {
    // Nav
    'nav.sales': 'Ventes',
    'nav.marketing': 'Marketing',
    'nav.inbox': 'Boîte de réception',
    'nav.analytics': 'Analytique',
    'nav.partners': 'Partenaires',
    'nav.finance': 'Finance',
    'nav.sales.deals': 'Offres & Propositions',
    'nav.sales.tasks': 'Tâches',
    'nav.marketing.email': 'E-mail',
    'nav.marketing.whatsapp': 'WhatsApp',
    'nav.marketing.sms': 'SMS',
    'nav.inbox.tickets': 'Mes tickets',
    // Profile Menu
    'profile.language': 'Langue',
    'profile.profile': 'Mon profil',
    'profile.settings': 'Paramètres',
    'profile.logout': 'Déconnexion',
    'profile.changeLanguage': 'Changer de langue',
    // Walkthrough
    'walkthrough.title': 'Scénario guidé',
    'walkthrough.progress': 'Progression du scénario',
    'walkthrough.steps': 'Étapes',
    'walkthrough.stepList': 'Liste des étapes',
    'walkthrough.goToPage': 'Aller à la page',
    'walkthrough.completed': 'Scénario entièrement complété !',
    'walkthrough.completedDesc': 'Toutes les étapes du flux de travail, du devis au bon de commande fournisseur, à la facturation client et au recouvrement, ont été exécutées avec succès.',
    'walkthrough.reset': 'Réinitialiser & Relancer',
    'walkthrough.button': 'Assistant de scénario',
    // Dashboard
    'dashboard.title': 'Accueil',
    'dashboard.subtitle': 'Votre résumé quotidien personnalisable. Sélectionnez les KPIs à suivre.',
    'dashboard.customize': 'Personnaliser les KPIs',
    'dashboard.doneCustomizing': 'Terminé',
    'dashboard.selectKpis': 'Sélectionner les KPIs à afficher',
    'dashboard.newDeal': 'Nouvelle affaire',
    'dashboard.addPartner': 'Ajouter un partenaire',
    'dashboard.newCampaign': 'Nouvelle campagne',
    'dashboard.createTicket': 'Créer un ticket',
    'dashboard.kpi.totalDeals': 'Valeur totale des affaires',
    'dashboard.kpi.totalDeals.label': 'Total affaires',
    'dashboard.kpi.marketingSpend': 'Dépenses marketing',
    'dashboard.kpi.marketingSpend.label': 'Dépenses marketing',
    'dashboard.kpi.latePayers': 'Retardataires',
    'dashboard.kpi.latePayers.label': 'Retardataires',
    'dashboard.kpi.activeCampaigns': 'Campagnes actives',
    'dashboard.kpi.activeCampaigns.label': 'Campagnes actives',
    'dashboard.kpi.openTickets': 'Tickets ouverts',
    'dashboard.kpi.openTickets.label': 'Tickets ouverts',
    'dashboard.kpi.totalProspects': 'Total prospects',
    'dashboard.kpi.totalProspects.label': 'Total prospects',
    'dashboard.kpi.activePipeline': 'Pipeline actif',
    'dashboard.kpi.stableChannels': 'Stable sur tous les canaux',
    'dashboard.kpi.needsAttention': 'Nécessite attention',
    'dashboard.kpi.runningSmoothly': 'Fonctionne bien',
    'dashboard.kpi.pendingResolution': 'En attente de résolution',
    'dashboard.kpi.growingPipeline': 'Pipeline en croissance',
    'dashboard.chart.partnerDirectory': 'Répertoire partenaires',
    'dashboard.chart.tasksStatus': 'Statut des tâches',
    'dashboard.chart.customers': 'Clients',
    'dashboard.chart.prospects': 'Prospects',
    'dashboard.chart.vendors': 'Fournisseurs',
    'dashboard.chart.completed': 'Complétées',
    'dashboard.chart.inProgress': 'En cours',
    'dashboard.chart.pending': 'En attente',
    // Languages
    'lang.en': 'English',
    'lang.fr': 'Français',
    'lang.ar': 'العربية',
  },
  ar: {
    // Nav
    'nav.sales': 'المبيعات',
    'nav.marketing': 'التسويق',
    'nav.inbox': 'البريد الوارد',
    'nav.analytics': 'التحليلات',
    'nav.partners': 'الشركاء',
    'nav.finance': 'المالية',
    'nav.sales.deals': 'الصفقات والعروض',
    'nav.sales.tasks': 'المهام',
    'nav.marketing.email': 'البريد الإلكتروني',
    'nav.marketing.whatsapp': 'واتساب',
    'nav.marketing.sms': 'رسائل نصية',
    'nav.inbox.tickets': 'تذاكري',
    // Profile Menu
    'profile.language': 'اللغة',
    'profile.profile': 'ملفي الشخصي',
    'profile.settings': 'الإعدادات',
    'profile.logout': 'تسجيل الخروج',
    'profile.changeLanguage': 'تغيير اللغة',
    // Walkthrough
    'walkthrough.title': 'جولة إرشادية',
    'walkthrough.progress': 'تقدم السيناريو',
    'walkthrough.steps': 'خطوات',
    'walkthrough.stepList': 'قائمة الخطوات',
    'walkthrough.goToPage': 'انتقل إلى الصفحة',
    'walkthrough.completed': 'اكتمل السيناريو بالكامل!',
    'walkthrough.completedDesc': 'تم تنفيذ جميع مراحل سير العمل من عرض الأسعار إلى أمر الشراء وفاتورة العميل وتحصيل الديون بنجاح.',
    'walkthrough.reset': 'إعادة ضبط وتشغيل مجدداً',
    'walkthrough.button': 'معالج العرض التوضيحي',
    // Dashboard
    'dashboard.title': 'الرئيسية',
    'dashboard.subtitle': 'ملخصك اليومي القابل للتخصيص. اختر مؤشرات الأداء التي تريد تتبعها.',
    'dashboard.customize': 'تخصيص مؤشرات الأداء',
    'dashboard.doneCustomizing': 'تم التخصيص',
    'dashboard.selectKpis': 'اختر مؤشرات الأداء للعرض',
    'dashboard.newDeal': 'صفقة جديدة',
    'dashboard.addPartner': 'إضافة شريك',
    'dashboard.newCampaign': 'حملة جديدة',
    'dashboard.createTicket': 'إنشاء تذكرة',
    'dashboard.kpi.totalDeals': 'إجمالي قيمة الصفقات',
    'dashboard.kpi.totalDeals.label': 'إجمالي الصفقات',
    'dashboard.kpi.marketingSpend': 'الإنفاق التسويقي',
    'dashboard.kpi.marketingSpend.label': 'الإنفاق التسويقي',
    'dashboard.kpi.latePayers': 'المتأخرون في الدفع',
    'dashboard.kpi.latePayers.label': 'المتأخرون في الدفع',
    'dashboard.kpi.activeCampaigns': 'الحملات النشطة',
    'dashboard.kpi.activeCampaigns.label': 'الحملات النشطة',
    'dashboard.kpi.openTickets': 'التذاكر المفتوحة',
    'dashboard.kpi.openTickets.label': 'التذاكر المفتوحة',
    'dashboard.kpi.totalProspects': 'إجمالي العملاء المحتملين',
    'dashboard.kpi.totalProspects.label': 'إجمالي العملاء المحتملين',
    'dashboard.kpi.activePipeline': 'خط أنابيب نشط',
    'dashboard.kpi.stableChannels': 'مستقر عبر جميع القنوات',
    'dashboard.kpi.needsAttention': 'يحتاج اهتماماً',
    'dashboard.kpi.runningSmoothly': 'يعمل بسلاسة',
    'dashboard.kpi.pendingResolution': 'في انتظار الحل',
    'dashboard.kpi.growingPipeline': 'خط أنابيب متنامٍ',
    'dashboard.chart.partnerDirectory': 'دليل الشركاء',
    'dashboard.chart.tasksStatus': 'حالة المهام',
    'dashboard.chart.customers': 'العملاء',
    'dashboard.chart.prospects': 'العملاء المحتملون',
    'dashboard.chart.vendors': 'الموردون',
    'dashboard.chart.completed': 'مكتملة',
    'dashboard.chart.inProgress': 'جارية',
    'dashboard.chart.pending': 'معلقة',
    // Languages
    'lang.en': 'English',
    'lang.fr': 'Français',
    'lang.ar': 'العربية',
  }
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  currentLang = signal<Language>((localStorage.getItem('crm_lang') as Language) || 'en');

  isRtl = computed(() => this.currentLang() === 'ar');

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem('crm_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  t(key: string): string {
    return translations[this.currentLang()][key] ?? translations['en'][key] ?? key;
  }

  initFromStorage() {
    const lang = this.currentLang();
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}
