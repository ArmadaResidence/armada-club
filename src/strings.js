// Single source of truth for the page copy. The build renders the Arabic
// strings into index.html; app.js swaps them when the visitor picks English.

// Bump when the consent wording changes, and record the new text in CONSENT.md.
export const CONSENT_VERSION = '2026-11-03';

export const T = {
  ar: {
    docTitle: 'نادي أرمادا | أرمادا ريزيدنس',
    logoAlt: 'أرمادا ريزيدنس',
    langToggle: 'English',
    title: 'نادي أرمادا',
    subtitle: 'سجّل مجانًا لتصلك عروض خاصة بالأعضاء في أرمادا ريزيدنس بالطائف.',
    b1: 'عروض وأكواد خصم للأعضاء فقط',
    b2: 'أول من يعرف بالعروض الموسمية',
    b3: 'مجانًا ودون أي التزام',
    phoneLabel: 'رقم الجوال',
    countryLabel: 'رمز الدولة',
    nameLabel: 'الاسم (اختياري)',
    consent: 'أوافق على تلقي العروض من أرمادا ريزيدنس عبر الواتساب والبريد الإلكتروني، وعلى عرض إعلاناتها لي على منصات مثل سناب شات وتيك توك وميتا وجوجل، ويمكنني إلغاء ذلك في أي وقت.',
    submit: 'انضم إلى النادي',
    doneTitle: 'تم تسجيلك في نادي أرمادا.',
    doneText: 'ستصلك عروض الأعضاء عبر الواتساب والبريد الإلكتروني.',
    follow: 'تابعنا على حساباتنا',
    errPhone: 'اكتب رقم جوال صحيحًا.',
    errConsent: 'يلزم الموافقة للانضمام إلى النادي.',
    errNetwork: 'تعذّر التسجيل الآن، حاول مرة أخرى بعد قليل.',
    privacySummary: 'كيف نستخدم بياناتك',
    privacyText: 'نستخدم رقم جوالك واسمك لإرسال عروض أرمادا ريزيدنس إليك عبر الواتساب، ونرفع رقم جوالك بصيغة مشفّرة إلى منصات الإعلان، مثل سناب شات وتيك توك وميتا وجوجل، لعرض إعلاناتنا لك، وقد تعالج هذه المنصات البيانات خارج المملكة. يمكنك إلغاء اشتراكك في أي وقت بالرد على أي رسالة منا. نحذف بيانات الأعضاء بعد 24 شهرًا من آخر نشاط.',
  },
  en: {
    docTitle: 'Armada Club | Armada Residence',
    logoAlt: 'Armada Residence',
    langToggle: 'العربية',
    title: 'Armada Club',
    subtitle: 'Join free to receive member-only offers at Armada Residence in Taif.',
    b1: 'Member-only offers and promo codes',
    b2: 'Be the first to hear about seasonal offers',
    b3: 'Free, with no commitment',
    phoneLabel: 'Mobile number',
    countryLabel: 'Country code',
    nameLabel: 'Name (optional)',
    consent: 'I agree to receive Armada Residence offers by WhatsApp and email, and to be shown its ads on platforms such as Snapchat, TikTok, Meta and Google. I can opt out at any time.',
    submit: 'Join the club',
    doneTitle: "You've joined Armada Club.",
    doneText: 'Member offers will reach you by WhatsApp and email.',
    follow: 'Follow us',
    errPhone: 'Enter a valid mobile number.',
    errConsent: 'Your consent is needed to join the club.',
    errNetwork: "We couldn't sign you up right now; please try again shortly.",
    privacySummary: 'How we use your data',
    privacyText: 'We use your mobile number and name to send you Armada Residence offers by WhatsApp, and we upload your mobile number in hashed form to advertising platforms such as Snapchat, TikTok, Meta and Google to show you our ads; these platforms may process the data outside Saudi Arabia. You can unsubscribe at any time by replying to any of our messages. We delete members\' data 24 months after their last activity.',
  },
};
