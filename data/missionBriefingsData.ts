export interface DialogueLine {
  speakerId: 'ananya' | 'rajesh';
  speakerName: string;
  role: string;
  avatar: string;
  avatarBg: string;
  gender: 'female' | 'male';
  text: string;
  hindiSnippet?: string;
  actionHint?: string;
}

export interface MissionBriefing {
  id: string;
  missionNumber: number;
  title: string;
  subtitle: string;
  dialogue: DialogueLine[];
  objective: string;
}

export const MISSION_BRIEFINGS: Record<string, MissionBriefing> = {
  mission_1_explore: {
    id: 'mission_1_explore',
    missionNumber: 1,
    title: 'Mission 1: Village Survey & Citizen Consultation',
    subtitle: 'Step-by-Step Grassroots Needs Discovery',
    objective: 'Explore all 8 village landmarks, talk to villagers using [E], and record community issues in your Ledger.',
    dialogue: [
      {
        speakerId: 'ananya',
        speakerName: 'Didi Ananya',
        role: 'Civics Educator & Mentor',
        avatar: '👩🏽‍🏫',
        avatarBg: 'from-pink-500 to-rose-600',
        gender: 'female',
        text: 'Welcome, young Bal Sarpanch! In grassroots democracy, a good leader never makes decisions from an office. You must first walk through the village and listen to what the citizens are experiencing.',
        hindiSnippet: 'गाँव का दौरा करें और लोगों की बात सुनें!',
        actionHint: 'Walk through all wards using WASD or touch controls.',
      },
      {
        speakerId: 'rajesh',
        speakerName: 'Kaka Rajesh',
        role: 'Senior Panchayat Advisor',
        avatar: '👨🏽‍💼',
        avatarBg: 'from-amber-500 to-orange-600',
        gender: 'male',
        text: 'Bilkul sahi, Ananya beti! Visit Amina Bi near the Water Tank, Masterji at the Primary School, Dr. Priya at the clinic, and Deepak at the market. Each ward has different challenges.',
        hindiSnippet: 'हर नागरिक की अपनी ज़रूरत होती है।',
        actionHint: 'Approach villagers and press [E] to start conversations.',
      },
      {
        speakerId: 'ananya',
        speakerName: 'Didi Ananya',
        role: 'Civics Educator & Mentor',
        avatar: '👩🏽‍🏫',
        avatarBg: 'from-pink-500 to-rose-600',
        gender: 'female',
        text: 'When you talk to them, select "Record as community need" to add their problem to your Community Needs Ledger. Once you gather enough information, we will assemble the Gram Sabha!',
        hindiSnippet: 'ज़रूरतों को लेजर में दर्ज करें।',
        actionHint: 'Discover at least 2 community needs to unlock Gram Sabha.',
      },
    ],
  },
  mission_2_meeting: {
    id: 'mission_2_meeting',
    missionNumber: 2,
    title: 'Mission 2: Gram Sabha Assembly & Prioritisation',
    subtitle: 'Democratic Consensus & Trade-Offs',
    objective: 'Organize identified community needs into High, Medium, and Low Priority tiers based on citizen impact.',
    dialogue: [
      {
        speakerId: 'rajesh',
        speakerName: 'Kaka Rajesh',
        role: 'Senior Panchayat Advisor',
        avatar: '👨🏽‍💼',
        avatarBg: 'from-amber-500 to-orange-600',
        gender: 'male',
        text: 'The Gram Sabha gong has sounded! All adult residents of our village are seated in the Panchayat Bhavan. Every citizen wants their ward problem solved first.',
        hindiSnippet: 'ग्राम सभा की बैठक शुरू हो चुकी है!',
        actionHint: 'Villagers will react in real time to your choices.',
      },
      {
        speakerId: 'ananya',
        speakerName: 'Didi Ananya',
        role: 'Civics Educator & Mentor',
        avatar: '👩🏽‍🏫',
        avatarBg: 'from-pink-500 to-rose-600',
        gender: 'female',
        text: 'Since public money is limited, we must prioritize! Which issues are critical lifelines (like drinking water and sanitation), and which are secondary? Drag or promote issues into the High, Medium, and Low Priority bins.',
        hindiSnippet: 'महत्वपूर्ण प्राथमिकताओं को पहले रखें।',
        actionHint: 'Use the Up/Down buttons to organize issues into priority tiers.',
      },
      {
        speakerId: 'rajesh',
        speakerName: 'Kaka Rajesh',
        role: 'Senior Panchayat Advisor',
        avatar: '👨🏽‍💼',
        avatarBg: 'from-amber-500 to-orange-600',
        gender: 'male',
        text: 'Notice how our villagers respond! A good democratic consensus balances the urgent needs of the vulnerable while keeping long-term development in sight.',
        hindiSnippet: 'सबकी सहमति से ही गाँव आगे बढ़ता है।',
        actionHint: 'Confirm priorities when ready to move to budget planning.',
      },
    ],
  },
  mission_3_budget: {
    id: 'mission_3_budget',
    missionNumber: 3,
    title: 'Mission 3: Panchayat Budget Allocation',
    subtitle: 'Managing the ₹100,000 Village Fund Responsibly',
    objective: 'Distribute ₹100,000 across 6 sectors without exceeding the budget limit.',
    dialogue: [
      {
        speakerId: 'ananya',
        speakerName: 'Didi Ananya',
        role: 'Civics Educator & Mentor',
        avatar: '👩🏽‍🏫',
        avatarBg: 'from-pink-500 to-rose-600',
        gender: 'female',
        text: 'Here is our village treasury: exactly ₹100,000! In municipal administration, you cannot spend more than the available budget. Overspending leads to deficit and stalled projects.',
        hindiSnippet: '₹1,00,000 का बजट समझदारी से बांटें।',
        actionHint: 'Watch the Remaining Fund meter closely.',
      },
      {
        speakerId: 'rajesh',
        speakerName: 'Kaka Rajesh',
        role: 'Senior Panchayat Advisor',
        avatar: '👨🏽‍💼',
        avatarBg: 'from-amber-500 to-orange-600',
        gender: 'male',
        text: 'Use the sliders to allocate funds to Water, Sanitation, School, Health, Roads, and Community Spaces. Make sure high-priority areas get adequate investment!',
        hindiSnippet: 'ज़रूरी क्षेत्रों को उचित राशि दें।',
        actionHint: 'Use +₹5,000 and -₹5,000 buttons or slider controls.',
      },
    ],
  },
  mission_4_project: {
    id: 'mission_4_project',
    missionNumber: 4,
    title: 'Mission 4: Infrastructure Project Sanction',
    subtitle: 'Implementing Your Governance Decision',
    objective: 'Select a primary development initiative, pass the resolution, and observe physical 3D village upgrades.',
    dialogue: [
      {
        speakerId: 'rajesh',
        speakerName: 'Kaka Rajesh',
        role: 'Senior Panchayat Advisor',
        avatar: '👨🏽‍💼',
        avatarBg: 'from-amber-500 to-orange-600',
        gender: 'male',
        text: 'Now comes the big decision! Review the 5 major project options. Look at the cost, timeline, number of citizens benefited, and the projected indicator boosts.',
        hindiSnippet: 'गाँव के लिए सबसे उत्तम योजना चुनें।',
        actionHint: 'Compare benefits and tradeoffs on each project card.',
      },
      {
        speakerId: 'ananya',
        speakerName: 'Didi Ananya',
        role: 'Civics Educator & Mentor',
        avatar: '👩🏽‍🏫',
        avatarBg: 'from-pink-500 to-rose-600',
        gender: 'female',
        text: 'Once you sanction a project, watch our 3D village transform! You will see real physical upgrades appear and our 5 indicator meters rise.',
        hindiSnippet: 'आपके फैसले से गाँव का रूप बदलेगा!',
        actionHint: 'Click "Implement This Project" to begin construction.',
      },
    ],
  },
  mission_5_followup: {
    id: 'mission_5_followup',
    missionNumber: 5,
    title: 'Mission 5: Seasonal Challenge & Maintenance',
    subtitle: '3 Months Later: Testing Governance Resilience',
    objective: 'Respond to the heavy monsoon alert using democratic leadership and community mobilization.',
    dialogue: [
      {
        speakerId: 'ananya',
        speakerName: 'Didi Ananya',
        role: 'Civics Educator & Mentor',
        avatar: '👩🏽‍🏫',
        avatarBg: 'from-pink-500 to-rose-600',
        gender: 'female',
        text: 'Three months have passed since our new project opened! But governance is an ongoing journey. Heavy monsoon rains have arrived in the district.',
        hindiSnippet: 'तीन महीने बाद मानसून की परीक्षा!',
        actionHint: 'Unexpected events test community preparedness.',
      },
      {
        speakerId: 'rajesh',
        speakerName: 'Kaka Rajesh',
        role: 'Senior Panchayat Advisor',
        avatar: '👨🏽‍💼',
        avatarBg: 'from-amber-500 to-orange-600',
        gender: 'male',
        text: 'Will you mobilize community Shramdaan (voluntary self-help), hire expensive emergency contractors, or wait and monitor? Your choice determines our resilience score!',
        hindiSnippet: 'श्रमदान और सामूहिक शक्ति सबसे बड़ा साधन है।',
        actionHint: 'Choose the most sustainable governance strategy.',
      },
    ],
  },
};
