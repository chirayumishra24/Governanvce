export const TRANSLATIONS = {
  en: {
    // HUD & Navigation
    villageName: 'Sundarpur Village',
    subtitle: 'Governance Lab',
    treasuryFund: 'Treasury',
    mapView: 'Map View',
    walkView: 'Walk View',
    mentorsGuide: 'Mentors Guide',
    teacherView: 'Teacher View',
    tutorial: 'Help',
    badges: 'Badges',
    socialAudit: 'Social Audit',
    day: 'Day',
    sunset: 'Sunset',
    night: 'Night',

    // Indicators
    wellbeing: 'Wellbeing',
    health: 'Health',
    education: 'Education',
    cleanliness: 'Cleanliness',
    development: 'Development',

    // Bottom Navigation
    navMap: 'Village Map',
    navVillagers: 'Villagers',
    navNeeds: 'Needs Ledger',
    navMeeting: 'Gram Sabha',
    navBudget: 'Budget',
    navProjects: 'Projects',
    navReport: 'Report Card',

    // Mission Objectives
    startMission: 'Start Mission Now!',
    nextInstruction: 'Next Instruction',
    previous: 'Previous',
    step: 'Step',
    speaking: 'Speaking',
    listenTTS: 'Listen (TTS)',
    speakingTTS: 'Speaking...',

    // Gram Sabha & Budget
    gramSabhaTitle: 'Gram Sabha Assembly',
    gramSabhaSubtitle: 'Prioritize community needs through democratic consensus',
    highPriority: 'High Priority (Urgent Action)',
    medPriority: 'Medium Priority (Planned Action)',
    lowPriority: 'Low Priority (Future Consideration)',
    confirmPriorities: 'Confirm Priorities & Allocate Budget',
    budgetTitle: 'Panchayat Budget Allocation',
    budgetSubtitle: 'Distribute ₹100,000 public fund responsibly across 6 sectors',
    remainingBudget: 'Remaining Unallocated Fund',
    proceedProjects: 'Confirm Budget & Select Project',

    // Social Audit
    socialAuditTitle: 'Panchayat Social Audit & Transparency Board',
    socialAuditSubtitle: 'Right to Information (RTI) & Public Fund Verification',
    verifyVouchers: 'Verify Expense Vouchers',
    contractorQuality: 'Material Quality Inspection',
    gramSabhaApproval: 'Gram Sabha Social Audit Sign-Off',
    verifiedBadge: 'Verified Clean & Transparent',

    // Badges
    badgesTitle: 'Bal Sarpanch Honors & Civic Badges',
    badgesSubtitle: 'Merit badges earned for exemplary grassroots leadership',
  },
  hi: {
    // HUD & Navigation
    villageName: 'सुंदरपुर गाँव',
    subtitle: 'शासन प्रयोगशाला (Governance Lab)',
    treasuryFund: 'गाँव का कोष',
    mapView: 'मानचित्र दृश्य',
    walkView: 'दौरा दृश्य',
    mentorsGuide: 'मार्गदर्शक चर्चा',
    teacherView: 'शिक्षक समीक्षा',
    tutorial: 'सहायता',
    badges: 'सम्मान पदक',
    socialAudit: 'सामाजिक अंकेक्षण',
    day: 'दिन',
    sunset: 'संध्या',
    night: 'रात',

    // Indicators
    wellbeing: 'खुशहाली',
    health: 'स्वास्थ्य',
    education: 'शिक्षा',
    cleanliness: 'स्वच्छता',
    development: 'विकास',

    // Bottom Navigation
    navMap: 'गाँव का नक्शा',
    navVillagers: 'ग्रामवासी',
    navNeeds: 'ज़रूरत पुस्तिका',
    navMeeting: 'ग्राम सभा',
    navBudget: 'बजट आवंटन',
    navProjects: 'विकास योजनाएँ',
    navReport: 'मूल्यांकन पत्र',

    // Mission Objectives
    startMission: 'मिशन शुरू करें!',
    nextInstruction: 'अगला निर्देश',
    previous: 'पिछला',
    step: 'चरण',
    speaking: 'बोल रहे हैं',
    listenTTS: 'आवाज़ सुनें (TTS)',
    speakingTTS: 'आवाज़ जारी है...',

    // Gram Sabha & Budget
    gramSabhaTitle: 'ग्राम सभा की बैठक',
    gramSabhaSubtitle: 'लोकतांत्रिक सहमति से प्राथमिकताओं का निर्धारण करें',
    highPriority: 'उच्च प्राथमिकता (अति आवश्यक)',
    medPriority: 'मध्यम प्राथमिकता (नियोजित कार्य)',
    lowPriority: 'कम प्राथमिकता (भविष्य के लिए)',
    confirmPriorities: 'प्राथमिकताएँ तय करें और बजट बनाएं',
    budgetTitle: 'पंचायत बजट आवंटन',
    budgetSubtitle: '₹1,00,000 की सार्वजनिक राशि का समझदारी से बंटवारा करें',
    remainingBudget: 'शेष बचा हुआ कोष',
    proceedProjects: 'बजट स्वीकृत करें और योजना चुनें',

    // Social Audit
    socialAuditTitle: 'पंचायत सामाजिक अंकेक्षण एवं पारदर्शिता बोर्ड',
    socialAuditSubtitle: 'सूचना का अधिकार (RTI) और सरकारी धन का हिसाब-किताब',
    verifyVouchers: 'खर्च बिलों का सत्यापन',
    contractorQuality: 'निर्माण सामग्री गुणवत्ता जाँच',
    gramSabhaApproval: 'ग्राम सभा सामाजिक अंकेक्षण अनुमोदन',
    verifiedBadge: 'सत्यापित एवं पूर्णतः पारदर्शी',

    // Badges
    badgesTitle: 'बाल सरपंच सम्मान एवं पदक',
    badgesSubtitle: 'सराहनीय लोकतांत्रिक नेतृत्व के लिए प्राप्त पदक',
  },
};

export const CIVIC_BADGES_LIST = [
  {
    id: 'badge_democrat',
    title: 'Grassroots Explorer',
    hindiTitle: 'जमीनी मार्गदर्शक',
    description: 'Consulted and listened to all 6 village citizens across all wards.',
    icon: '🤝',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'badge_consensus',
    title: 'Consensus Champion',
    hindiTitle: 'सहमति शिरोमणि',
    description: 'Ratified a balanced priority matrix addressing both water and health.',
    icon: '🌟',
    color: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'badge_fiscal',
    title: 'Fiscal Guardian',
    hindiTitle: 'वित्तीय रक्षक',
    description: 'Managed the ₹100,000 fund with zero deficit and balanced distribution.',
    icon: '💰',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'badge_resilience',
    title: 'Monsoon Defender',
    hindiTitle: 'मानसून रक्षक',
    description: 'Mobilized community Shramdaan for sustainable disaster management.',
    icon: '🌧️',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'badge_transparency',
    title: 'Transparency Auditor',
    hindiTitle: 'पारदर्शिता प्रहरी',
    description: 'Verified public receipts and conducted open social audit under RTI.',
    icon: '🔍',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'badge_master',
    title: 'Master Bal Sarpanch',
    hindiTitle: 'आदर्श बाल सरपंच',
    description: 'Scored over 80/90 on the comprehensive NCERT Governance Rubric.',
    icon: '🏆',
    color: 'from-rose-500 to-pink-600',
  },
];
