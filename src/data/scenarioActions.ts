import { ScenarioAction } from '../types/scenario'

export const scenarioActions: ScenarioAction[] = [

  // ─── ASSESSMENT ───────────────────────────────────────────────────────────

  {
    id: 'check-responsiveness',
    label: 'ตรวจ Responsiveness',
    labelEn: 'Check Responsiveness',
    category: 'assessment',
    icon: '🤚',
    findings: [
      'ไม่ตอบสนองต่อการกระตุ้น',
      'ไม่มีการเปิดตา / ไม่มี verbal response',
      'ไม่มี motor response — GCS 3/15',
    ],
    stateEffect: { isUnresponsive: true, consciousness: 'unresponsive' },
    notesThai: {
      title: 'ตรวจ Responsiveness',
      keyPoints: [
        'ตบไหล่ทั้งสองข้างพร้อมเรียก "คุณเป็นยังไงบ้าง?"',
        'ห้ามใช้ sternal rub ใน adult',
        'ไม่ตอบสนอง → เรียก Code ทันที',
      ],
      discussionQuestion: 'ถามผู้เรียน: "เจอคนไข้ไม่รู้สึกตัว ทำอะไรก่อน?"',
    },
  },

  {
    id: 'call-team',
    label: 'Call for Help',
    labelEn: 'Activate Emergency Response',
    category: 'assessment',
    icon: '📢',
    findings: [
      'เปิดสัญญาณเตือน Code Blue',
      'ทีม CPR กำลังมา',
      'แบ่ง role: Leader / Compressor / Airway / IV / Recorder',
    ],
    notesThai: {
      title: 'Call for Help / Activate Code',
      keyPoints: [
        'โทรแจ้ง code หรือกดปุ่มเรียกทีมทันที',
        'แบ่ง role ให้ชัดเจน',
        'เริ่ม resuscitation โดยไม่รอทีมครบ',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ใครรับผิดชอบอะไรบ้างในทีม?"',
    },
    stateEffect: { teamCalled: true },
  },

  {
    id: 'check-pulse',
    label: 'ตรวจชีพจร',
    labelEn: 'Pulse & Breathing Check',
    category: 'assessment',
    icon: '❤️',
    findings: [
      'ไม่พบชีพจรที่ carotid ทั้งสองข้าง',
      'ไม่พบ femoral pulse',
      'ตรวจภายใน 10 วินาที → ไม่พบชีพจร',
      'ไม่มีการหายใจปกติ — พบ agonal gasps',
    ],
    notesThai: {
      title: 'ตรวจ Pulse และ Breathing',
      keyPoints: [
        'Carotid pulse + ดู breathing พร้อมกัน',
        'ไม่เกิน 10 วินาที',
        'Gasping ไม่ถือว่าหายใจปกติ',
        'ไม่แน่ใจ → เริ่ม CPR เลย',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ทำไมต้องจำกัดเวลาตรวจชีพจรไว้ที่ 10 วินาที?"',
    },
  },

  {
    id: 'assess-symptoms-brady',
    label: 'ประเมินอาการ (Brady)',
    labelEn: 'Assess Symptoms (Bradycardia)',
    category: 'assessment',
    icon: '🩺',
    findings: [
      'HR 38 bpm — Symptomatic bradycardia',
      'ผู้ป่วยมึนงง ความดันต่ำ',
      'BP: 80/50 mmHg',
      'SpO₂: 94% on room air',
      'อาการสัมพันธ์กับ bradycardia → ต้องรักษาทันที',
    ],
    notesThai: {
      title: 'ประเมินอาการของ Bradycardia',
      keyPoints: [
        'HR < 50/min ถือว่า bradycardia ที่มีนัยสำคัญ',
        'อาการ: hypotension, syncope, chest pain, altered consciousness',
        'ถ้ามีอาการ → Unstable bradycardia → รักษาทันที',
      ],
      discussionQuestion: 'ถามผู้เรียน: "bradycardia แบบไหนที่ต้องรักษาทันที?"',
    },
  },

  {
    id: 'assess-stability',
    label: 'ประเมิน Stability',
    labelEn: 'Assess Hemodynamic Stability',
    category: 'assessment',
    icon: '🩺',
    findings: [
      'HR 185 bpm — Narrow complex tachycardia',
      'BP: 100/70 mmHg — ยังพอ stable',
      'ผู้ป่วยรู้สึกตัว — ใจสั่น หน้ามืด',
      'ไม่มี chest pain, ไม่มี AMS, ไม่มี shock',
      '→ Stable tachycardia — มีเวลาพิจารณา rhythm',
    ],
    notesThai: {
      title: 'ประเมิน Hemodynamic Stability ใน Tachycardia',
      keyPoints: [
        'Unstable signs: hypotension, chest pain, shock, altered consciousness',
        'ถ้า Unstable → Synchronized Cardioversion ทันที',
        'ถ้า Stable → เวลาพิจารณา rhythm และยา',
      ],
      discussionQuestion: 'ถามผู้เรียน: "อาการอะไรบ่งบอกว่า unstable tachycardia?"',
    },
  },

  {
    id: 'repeat-vitals',
    label: 'วัด Vital Signs ซ้ำ',
    labelEn: 'Repeat Vital Signs',
    category: 'assessment',
    icon: '📋',
    findings: [
      'BP, HR, SpO₂, RR — วัดซ้ำและบันทึก',
      'เปรียบเทียบกับค่าก่อนหน้า',
      'ประเมิน trend การเปลี่ยนแปลง',
    ],
  },

  // ─── RESUSCITATION ────────────────────────────────────────────────────────

  {
    id: 'start-cpr',
    label: 'เริ่ม CPR',
    labelEn: 'Start High-Quality CPR',
    category: 'resuscitation',
    icon: '🫀',
    findings: [
      'Rate 100–120/min',
      'Depth 2–2.5 นิ้ว (5–6 cm)',
      'Ventilation 30:2 / ถ้าใส่ ETT → ทุก 6 วินาที',
      'Full recoil ทุกครั้ง',
      'Avoid interruption > 10 วินาที',
      'เปลี่ยนคนกดนวดหัวใจทุก 2 นาที',
    ],
    stateEffect: { cprActive: true },
    algoNodeId: 'cpr',
    notesThai: {
      title: 'High-Quality CPR',
      keyPoints: [
        "Rate 100–120/min — เพลง Stayin' Alive",
        'Depth 5–6 cm',
        'ปล่อยให้หน้าอกขยายกลับเต็มที่ทุกครั้ง',
        'Minimize interruptions < 10 วินาที',
        'เปลี่ยนคนกดทุก 2 นาที',
      ],
      discussionQuestion: 'ถามผู้เรียน: "High-quality CPR คืออะไร? กดยังไง?"',
    },
  },

  {
    id: 'apply-oxygen',
    label: 'Airway / BVM',
    labelEn: 'Apply Oxygen / BVM',
    category: 'resuscitation',
    icon: '😷',
    findings: [
      'Bag-mask ventilation เริ่มแล้ว',
      '30 compressions : 2 breaths',
      'SpO₂ กำลังดีขึ้น',
      'ระวัง hyperventilation',
    ],
    stateEffect: { oxygenApplied: true, airwayDevice: 'mask', isBreathing: true },
    notesThai: {
      title: 'BVM Ventilation',
      keyPoints: [
        'BVM ventilation: 30 compressions : 2 breaths',
        'Advanced airway → 1 breath ทุก 6 วินาที',
        'ระวัง hyperventilation',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ทำไม hyperventilation ถึงอันตรายใน cardiac arrest?"',
    },
  },

  {
    id: 'airway-opa',
    label: 'ใส่ OPA (Oropharyngeal)',
    labelEn: 'Insert OPA',
    category: 'resuscitation',
    icon: '🫁',
    findings: [
      'OPA ใส่แล้ว — ขนาดเหมาะสม (วัดจากมุมปากถึง tragus)',
      'ช่วยเปิดทางเดินหายใจในผู้ป่วยไม่รู้สึกตัว',
      'ใช้ร่วมกับ BVM ventilation',
      'ห้ามใช้ใน conscious patient (กระตุ้น gag reflex)',
    ],
    stateEffect: { oxygenApplied: true, isBreathing: true },
    notesThai: {
      title: 'OPA — Oropharyngeal Airway',
      keyPoints: [
        'ขนาด: วัดจากมุมปากถึง tragus หรือ center of mouth ถึงใบหู',
        'ใส่ได้เฉพาะ unconscious patient เท่านั้น',
        'ใช้ร่วมกับ BVM เสมอ',
      ],
      discussionQuestion: 'ถามผู้เรียน: "OPA เหมาะกับสถานการณ์ใด และห้ามใช้เมื่อไหร่?"',
    },
  },

  {
    id: 'airway-npa',
    label: 'ใส่ NPA (Nasopharyngeal)',
    labelEn: 'Insert NPA',
    category: 'resuscitation',
    icon: '👃',
    findings: [
      'NPA ใส่แล้ว — ช่วยเปิดทางเดินหายใจ',
      'ใช้ได้แม้ผู้ป่วยมี gag reflex บางส่วน',
      'ห้ามใช้ถ้าสงสัย basilar skull fracture',
      'หล่อลื่น lubricant ก่อนใส่',
    ],
    stateEffect: { oxygenApplied: true, isBreathing: true },
    notesThai: {
      title: 'NPA — Nasopharyngeal Airway',
      keyPoints: [
        'ใส่ได้แม้ผู้ป่วยกึ่งรู้สึกตัว (semi-conscious)',
        'ขนาด: วัดจากปลายจมูกถึงใบหู',
        'ห้ามใช้ถ้าสงสัย basilar skull fracture',
      ],
      discussionQuestion: 'ถามผู้เรียน: "NPA ต่างจาก OPA อย่างไร และเลือกใช้เมื่อไหร่?"',
    },
  },

  {
    id: 'airway-sga',
    label: 'ใส่ Supraglottic Airway (LMA)',
    labelEn: 'Insert Supraglottic Airway',
    category: 'resuscitation',
    icon: '🔧',
    findings: [
      'LMA / i-gel ใส่แล้ว — Supraglottic airway in place',
      'Confirm: chest rise สมมาตร, no leak',
      'หลังใส่ advanced airway: ventilate 1 ครั้ง ทุก 6 วินาที (10 bpm)',
      'ไม่ต้องหยุด CPR เพื่อ ventilate',
    ],
    stateEffect: { oxygenApplied: true, airwayDevice: 'lma', isBreathing: true },
    notesThai: {
      title: 'Supraglottic Airway (LMA / i-gel)',
      keyPoints: [
        'หลังใส่: 1 breath ทุก 6 วินาที (asynchronous)',
        'ไม่ต้องหยุด CPR',
        'ง่ายกว่า ETT — ฝึกได้เร็วกว่า',
        'i-gel ไม่ต้อง inflate cuff',
      ],
      discussionQuestion: 'ถามผู้เรียน: "SGA กับ ETT ต่างกันอย่างไรใน cardiac arrest?"',
    },
  },

  {
    id: 'airway-ett',
    label: 'ใส่ท่อช่วยหายใจ (ETT)',
    labelEn: 'Endotracheal Intubation',
    category: 'resuscitation',
    icon: '🫀',
    findings: [
      'ETT ใส่แล้ว — ยืนยัน bilateral breath sounds',
      'Confirm: EtCO₂ capnography, CXR',
      'Depth: ~23 cm ที่มุมปาก (ชาย) / 21 cm (หญิง)',
      'Ventilate: 1 breath ทุก 6 วินาที — ไม่ต้องหยุด CPR',
    ],
    stateEffect: { oxygenApplied: true, airwayDevice: 'ett', isBreathing: true },
    notesThai: {
      title: 'Endotracheal Intubation (ETT)',
      keyPoints: [
        'Gold standard ของ definitive airway',
        'หลังใส่: 1 breath ทุก 6 วินาที (asynchronous)',
        'ยืนยันตำแหน่ง: EtCO₂ + auscultation + CXR',
        'ใน cardiac arrest: ไม่ต้องหยุด CPR เพื่อ intubate',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ข้อบ่งชี้ในการ intubate ใน cardiac arrest คืออะไร?"',
    },
  },

  {
    id: 'vagal-maneuvers',
    label: 'Vagal Maneuvers',
    labelEn: 'Vagal Maneuvers',
    category: 'resuscitation',
    icon: '🤲',
    findings: [
      'Modified Valsalva maneuver ทำแล้ว',
      'นอนราบ — ยกขา 45° หลัง Valsalva',
      'HR ชั่วคราวช้าลง — กำลังประเมิน response',
    ],
    notesThai: {
      title: 'Vagal Maneuvers ใน SVT',
      keyPoints: [
        'Valsalva maneuver: เบ่งแรงๆ 10–15 วินาที',
        'Modified Valsalva: นอนราบ ยกขา 45° หลัง Valsalva',
        'Carotid sinus massage: กดเบาๆ ด้านเดียว',
      ],
      discussionQuestion: 'ถามผู้เรียน: "Vagal maneuver ออกฤทธิ์ผ่านกลไกใด?"',
    },
  },

  // ─── DEVICE ───────────────────────────────────────────────────────────────

  {
    id: 'iv-access',
    label: 'เปิด IV/IO',
    labelEn: 'Establish IV/IO Access',
    category: 'device',
    icon: '💉',
    findings: [
      'Peripheral IV 18G — antecubital fossa ขวา',
      'Flush NS 10 mL — ไหลดี',
      'IV access พร้อมให้ยา',
    ],
    stateEffect: { ivAccess: true },
    notesThai: {
      title: 'IV / IO Access',
      keyPoints: [
        'Peripheral IV ขนาดใหญ่ (18G ขึ้นไป)',
        'ถ้า IV ยาก → IO ได้เลย ไม่ต้องเสียเวลา',
        'IO sites: proximal tibia, humeral head',
        'Flush ยาทุกครั้งด้วย NS 20 mL',
      ],
      discussionQuestion: 'ถามผู้เรียน: "เมื่อไหร่ควรเปลี่ยนมาใช้ IO?"',
    },
  },

  {
    id: 'attach-monitor',
    label: 'ติด Monitor / Defib Pads',
    labelEn: 'Attach Monitor / Defibrillator',
    category: 'device',
    icon: '🖥️',
    findings: [
      'Defibrillator pads ติดแล้ว',
      'Monitor เชื่อมต่อ — ECG ปรากฏ',
      'Pad: ขวา infraclavicular + ซ้าย lateral (V5-6)',
      'Charge เครื่อง 200J ระหว่าง CPR',
    ],
    stateEffect: { monitorAttached: true, defibPadsAttached: true },
    algoNodeId: 'monitor',
    notesThai: {
      title: 'ติด Monitor / Defibrillator',
      keyPoints: [
        'ติด pads ขณะ CPR ดำเนินต่อ — ไม่หยุดกด',
        'Pad placement: ขวา infraclavicular + ซ้าย lateral (V5-6)',
        'Charge defibrillator ระหว่าง CPR ทันที',
      ],
      discussionQuestion: 'ถามผู้เรียน: "วาง defibrillator pads ตรงไหน?"',
    },
  },

  {
    id: 'attach-monitor-brady',
    label: 'ติด Monitor / 12-Lead',
    labelEn: 'Attach Monitor + 12-Lead ECG',
    category: 'device',
    icon: '🖥️',
    findings: [
      'Monitor เชื่อมต่อแล้ว',
      '12-Lead ECG กำลังพิมพ์',
      'Rate 38 bpm — Bradycardia ชัดเจน',
    ],
    stateEffect: { monitorAttached: true },
    algoNodeId: 'monitor',
    notesThai: {
      title: 'Monitor และ 12-Lead ECG ใน Bradycardia',
      keyPoints: [
        'ทำ 12-Lead ECG ทันทีเพื่อหาสาเหตุ',
        'ดู PR interval, QRS width, AV block degree',
        '3rd degree AV block ต้องการ pacemaker',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ดู 12-lead อะไรบ้างใน bradycardia?"',
    },
  },

  {
    id: 'attach-monitor-tachy',
    label: 'ติด Monitor / 12-Lead',
    labelEn: 'Attach Monitor + 12-Lead ECG',
    category: 'device',
    icon: '🖥️',
    findings: [
      'Monitor เชื่อมต่อแล้ว',
      '12-Lead ECG — Narrow complex tachycardia',
      'Rate 185 bpm — Regular rhythm',
      'No delta wave — ไม่น่าเป็น WPW',
    ],
    stateEffect: { monitorAttached: true },
    algoNodeId: 'monitor',
    notesThai: {
      title: 'Monitor และ 12-Lead ECG ใน Tachycardia',
      keyPoints: [
        'ทำ 12-Lead ECG ก่อนให้ยาทุกครั้ง',
        'Narrow complex (<120ms) vs Wide complex (≥120ms)',
        'Regular vs Irregular rhythm',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ดู 12-lead แล้วบอกได้ว่าอะไร?"',
    },
  },

  {
    id: 'rhythm-check',
    label: 'Rhythm Check',
    labelEn: 'Analyze Rhythm',
    category: 'device',
    icon: '📊',
    findings: [
      'หยุด CPR — ตรวจ rhythm',
      'ให้ผู้เรียนอ่าน rhythm ก่อนเฉลย',
      'Resume CPR < 10 วินาที',
    ],
    stateEffect: { rhythmVisible: true, cprActive: false },
    algoNodeId: 'rhythm',
    notesThai: {
      title: 'Rhythm Check',
      keyPoints: [
        'หยุด CPR ไม่เกิน 10 วินาที',
        'ให้ผู้เรียนอ่าน rhythm ก่อนเฉลย',
        'ถ้าเห็น organized rhythm → ตรวจชีพจรพร้อมกัน',
        'ทำ rhythm check ทุก 2 นาที',
      ],
      discussionQuestion: 'ถามผู้เรียน: "คลื่นนี้คืออะไร? Shockable ไหม?"',
    },
  },

  {
    id: 'defibrillate',
    label: 'Defibrillate',
    labelEn: 'Deliver Shock',
    category: 'device',
    icon: '⚡',
    findings: [
      'Shock 200J biphasic — delivered',
      '"Stand clear!" — everyone clear',
      'ผู้ป่วยหดตัวชั่วขณะ',
      'Resume CPR ทันที — ห้ามรอดู rhythm',
      'ประเมิน rhythm ใน 2 นาที',
    ],
    stateEffect: { shockDelivered: true, cprActive: true },
    algoNodeId: 'shock',
    notesThai: {
      title: 'Defibrillation',
      keyPoints: [
        'Biphasic 200J (หรือตามที่เครื่องแนะนำ)',
        'ประกาศ "Stand clear!" ก่อน shock ทุกครั้ง',
        'Resume CPR ทันทีหลัง shock — ไม่รอดู rhythm',
        'CPR 2 นาที → rhythm check → ยา',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ทำไมต้อง Resume CPR ทันทีหลัง shock?"',
    },
  },

  {
    id: 'synchronized-cardioversion',
    label: 'Synchronized Cardioversion',
    labelEn: 'Synchronized Cardioversion',
    category: 'device',
    icon: '⚡',
    findings: [
      'Synchronized mode เปิดแล้ว',
      'Energy: SVT/AFL 50–100J / AF 120–200J',
      'Sedation ให้แล้ว (ถ้าผู้ป่วยรู้สึกตัว)',
      '"Stand clear!" — Shock delivered',
    ],
    algoNodeId: 'shock',
    notesThai: {
      title: 'Synchronized Cardioversion',
      keyPoints: [
        'Unstable tachycardia → Cardioversion ทันที',
        'Synchronize กับ R wave เสมอ',
        'SVT/Aflutter: เริ่ม 50–100J',
        'AF: เริ่ม 120–200J biphasic',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ทำไมต้อง Synchronize และไม่ทำ Unsynchronized shock?"',
    },
  },

  {
    id: 'transcutaneous-pacing',
    label: 'Transcutaneous Pacing',
    labelEn: 'TCP (Transcutaneous Pacing)',
    category: 'device',
    icon: '⚡',
    findings: [
      'TCP เริ่มที่ rate 60/min',
      'เพิ่ม output จนเห็น capture บน ECG',
      'Sedation/Analgesia ให้แล้ว — เจ็บมาก',
      'ประสาน Cardiology สำหรับ transvenous pacemaker',
    ],
    notesThai: {
      title: 'Transcutaneous Pacing (TCP)',
      keyPoints: [
        'ใช้เมื่อ Atropine ไม่ได้ผลหรือ high-degree AV block',
        'เริ่ม rate 60/min, เพิ่ม output จน capture',
        'ตรวจ capture จาก pulse palpation — ไม่ใช่แค่ ECG',
        'ให้ Sedation/Analgesia ขณะ TCP — เจ็บมาก',
      ],
      discussionQuestion: 'ถามผู้เรียน: "จะรู้ได้อย่างไรว่า TCP capture แล้ว?"',
    },
  },

  // ─── MEDICATION ───────────────────────────────────────────────────────────

  {
    id: 'epinephrine',
    label: 'Epinephrine 1mg',
    labelEn: 'Epinephrine 1mg IV/IO',
    category: 'medication',
    icon: '💊',
    findings: [
      'Epinephrine 1mg IV push',
      'Flush NS 20 mL ตาม',
      'บันทึกเวลา — ให้ซ้ำทุก 3–5 นาที',
    ],
    algoNodeId: 'epi',
    notesThai: {
      title: 'Epinephrine 1mg',
      keyPoints: [
        'VF/pVT: ให้หลัง shock ที่ 2',
        'PEA/Asystole: ให้เร็วที่สุดเมื่อมี IV/IO',
        'ซ้ำทุก 3–5 นาที',
        'Flush ด้วย NS 20 mL หลังให้',
      ],
      discussionQuestion: 'ถามผู้เรียน: "Epinephrine ออกฤทธิ์ยังไงใน cardiac arrest?"',
    },
  },

  {
    id: 'amiodarone',
    label: 'Amiodarone 300mg',
    labelEn: 'Amiodarone 300mg IV/IO',
    category: 'medication',
    icon: '💉',
    findings: [
      'Amiodarone 300mg IV push',
      'Flush NS 20 mL ตาม',
      'ครั้งที่ 2: Amiodarone 150mg (ถ้าจำเป็น)',
      'ใช้ใน refractory VF/pVT (≥ 3 shocks)',
    ],
    algoNodeId: 'amio',
    notesThai: {
      title: 'Amiodarone',
      keyPoints: [
        'ครั้งแรก 300mg IV/IO push',
        'ครั้งที่สอง 150mg ถ้ายังจำเป็น',
        'ใช้ใน VF/pVT ที่ไม่ตอบสนองต่อ shock',
        'ทางเลือก: Lidocaine 1–1.5mg/kg',
      ],
      discussionQuestion: 'ถามผู้เรียน: "Amiodarone ใช้เมื่อไหร่ใน cardiac arrest?"',
    },
  },

  {
    id: 'lidocaine',
    label: 'Lidocaine 1–1.5 mg/kg',
    labelEn: 'Lidocaine 1–1.5 mg/kg IV/IO',
    category: 'medication',
    icon: '💉',
    findings: [
      'Lidocaine 1–1.5 mg/kg IV/IO push',
      'ครั้งที่ 2: 0.5–0.75 mg/kg ทุก 5–10 นาที (max 3 mg/kg)',
      'ทางเลือกของ Amiodarone ใน VF/pVT',
      'Flush NS 20 mL ตาม',
    ],
    notesThai: {
      title: 'Lidocaine ใน Cardiac Arrest',
      keyPoints: [
        'ทางเลือกของ Amiodarone ใน refractory VF/pVT',
        'Dose: 1–1.5 mg/kg IV/IO',
        'Max cumulative dose 3 mg/kg',
      ],
      discussionQuestion: 'ถามผู้เรียน: "Lidocaine และ Amiodarone ใช้เมื่อไหร่ ต่างกันอย่างไร?"',
    },
  },

  {
    id: 'atropine',
    label: 'Atropine 0.5mg',
    labelEn: 'Atropine 0.5mg IV',
    category: 'medication',
    icon: '💊',
    findings: [
      'Atropine 0.5mg IV push',
      'HR เพิ่มขึ้นเล็กน้อยใน 1–2 นาที',
      'อาจให้ซ้ำทุก 3–5 นาที (max 3mg)',
      'ถ้าไม่ตอบสนอง → TCP หรือ Dopamine',
    ],
    algoNodeId: 'epi',
    notesThai: {
      title: 'Atropine ใน Symptomatic Bradycardia',
      keyPoints: [
        '0.5mg IV ทุก 3–5 นาที (max 3mg)',
        'First-line treatment ใน symptomatic bradycardia',
        'ไม่มีประสิทธิภาพใน 2nd degree type II และ 3rd degree AV block',
        'ถ้าไม่ตอบสนอง → TCP หรือ Dopamine infusion',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ทำไม Atropine ไม่ได้ผลใน complete heart block?"',
    },
  },

  {
    id: 'dopamine-infusion',
    label: 'Dopamine Infusion',
    labelEn: 'Dopamine 2–20 mcg/kg/min',
    category: 'medication',
    icon: '💉',
    findings: [
      'Dopamine infusion เริ่ม 5 mcg/kg/min',
      'Titrate ตาม HR และ BP',
      'เป็น bridge ขณะรอ pacemaker',
    ],
    notesThai: {
      title: 'Dopamine Infusion ใน Bradycardia',
      keyPoints: [
        '2–20 mcg/kg/min IV infusion',
        'ใช้เป็น bridge ขณะรอ pacemaker',
        'Titrate ให้ HR > 50/min และ hemodynamics ดีขึ้น',
      ],
      discussionQuestion: 'ถามผู้เรียน: "เลือก Dopamine หรือ Epinephrine infusion เมื่อไหร่?"',
    },
  },

  {
    id: 'adenosine',
    label: 'Adenosine 6mg',
    labelEn: 'Adenosine 6mg IV',
    category: 'medication',
    icon: '💊',
    findings: [
      'Adenosine 6mg IV rapid push',
      'Flush NS 20 mL เร็วมาก',
      'ผู้ป่วยรู้สึก chest pressure / ใจหาย ชั่วขณะ',
      'อาจให้ซ้ำ 12mg ได้ 2 ครั้ง',
    ],
    algoNodeId: 'epi',
    notesThai: {
      title: 'Adenosine ใน SVT',
      keyPoints: [
        '6mg IV rapid push + NS 20mL flush เร็ว',
        'ซ้ำ 12mg ได้ 2 ครั้งถ้าไม่หาย',
        'ใช้ antecubital หรือ larger vein',
        'ระวังใน WPW + AF → อาจทำให้แย่ลง',
      ],
      discussionQuestion: 'ถามผู้เรียน: "ทำไม Adenosine ต้อง push เร็วมาก?"',
    },
  },

  {
    id: 'antiarrhythmic-tachy',
    label: 'Antiarrhythmic Drug',
    labelEn: 'Amiodarone / Procainamide',
    category: 'medication',
    icon: '💉',
    findings: [
      'Amiodarone 150mg ใน 10 นาที — IV infusion',
      'Monitor BP และ ECG ระหว่างให้',
      'ห้ามใช้สองตัวพร้อมกัน (risk of TdP)',
    ],
    notesThai: {
      title: 'Antiarrhythmic ใน Stable VT / Wide Complex',
      keyPoints: [
        'Amiodarone 150mg IV ใน 10 นาที (preferred)',
        'Procainamide 20–50mg/min (สำหรับ stable VT)',
        'ไม่ใช้ยาสองตัวร่วมกัน (risk of TdP)',
      ],
      discussionQuestion: 'ถามผู้เรียน: "เลือกยาตัวไหนก่อนใน stable wide-complex tachycardia?"',
    },
  },

  // ─── OUTCOME ──────────────────────────────────────────────────────────────

  {
    id: 'rosc',
    label: 'ROSC',
    labelEn: 'Return of Spontaneous Circulation',
    category: 'outcome',
    icon: '✅',
    findings: [
      'ชีพจรกลับมา — carotid pulse palpable',
      'BP: 90/60 mmHg (กำลังดีขึ้น)',
      'SpO₂: 88% → กำลังเพิ่ม',
      'ผู้ป่วยเริ่มขยับ',
      'เริ่ม Post-ROSC care ทันที',
    ],
    stateEffect: {
      rosc: true,
      hasPulse: true,
      isBreathing: true,
      consciousness: 'pain',
      heartRate: 88,
      bloodPressure: '90/60',
      spo2: 88,
      cprActive: false,
    },
    algoNodeId: 'rosc',
    notesThai: {
      title: 'ROSC — กลับมามีชีพจร',
      keyPoints: [
        'สัญญาณ: ชีพจรกลับมา, BP ขึ้น, ETCO2 > 40 mmHg',
        'Post-ROSC: Targeted Temperature Management',
        'พิจารณา PCI ถ้าสงสัย STEMI',
        'MAP ≥ 65 mmHg',
      ],
      discussionQuestion: 'ถามผู้เรียน: "หลัง ROSC ดูแลอะไรบ้างใน 1 ชั่วโมงแรก?"',
    },
  },

  // ─── COMMON BASE ACTIONS (available in every topic) ──────────────────────────

  {
    id: 'check-breathing',
    label: 'ตรวจการหายใจ',
    labelEn: 'Check Breathing',
    category: 'assessment',
    icon: '🫁',
    findings: [
      'ดู/ฟัง/รู้สึก การหายใจ — ≤10 วินาที',
      'Gasping = ไม่ถือว่าหายใจปกติ',
      '→ ผู้สอนแจ้งผลตามสถานการณ์',
    ],
    notesThai: {
      title: 'ตรวจการหายใจ',
      keyPoints: ['Look-Listen-Feel ≤10 วินาที', 'Gasping ≠ normal breathing', 'ประเมินพร้อม pulse check เสมอ'],
      discussionQuestion: 'ถามผู้เรียน: "ทำไมต้องประเมินการหายใจพร้อมกับชีพจร?"',
    },
  },

  {
    id: 'oxygen-nasal',
    label: 'Nasal Cannula O₂',
    labelEn: 'Nasal Cannula Oxygen',
    category: 'resuscitation',
    icon: '👃',
    findings: [
      'Nasal cannula ใส่แล้ว — flow 2–6 LPM',
      'FiO₂ ประมาณ 24–44%',
      'SpO₂ กำลังเพิ่ม',
    ],
    stateEffect: { oxygenApplied: true, airwayDevice: 'nasal', isBreathing: true },
    notesThai: {
      title: 'Nasal Cannula Oxygen',
      keyPoints: ['Flow 1–6 LPM → FiO₂ 24–44%', 'ใช้เฉพาะผู้ป่วยที่หายใจได้เอง', 'Target SpO₂ 94–99%'],
      discussionQuestion: 'ถามผู้เรียน: "เมื่อไหร่ควรเปลี่ยนจาก nasal cannula เป็น mask?"',
    },
  },

  {
    id: 'oxygen-mask',
    label: 'Face Mask O₂',
    labelEn: 'Simple Face Mask Oxygen',
    category: 'resuscitation',
    icon: '😷',
    findings: [
      'Simple face mask ใส่แล้ว — flow 5–10 LPM',
      'FiO₂ ประมาณ 35–50%',
      'SpO₂ เพิ่มขึ้น',
    ],
    stateEffect: { oxygenApplied: true, airwayDevice: 'mask', isBreathing: true },
    notesThai: {
      title: 'Simple Face Mask O₂',
      keyPoints: ['Flow ≥5 LPM เพื่อ flush CO₂', 'FiO₂ 35–50%', 'ใช้เฉพาะผู้ป่วยที่หายใจได้เอง'],
      discussionQuestion: 'ถามผู้เรียน: "Simple mask กับ NRBM ต่างกันอย่างไร?"',
    },
  },

  {
    id: 'oxygen-nrbm',
    label: 'Non-Rebreather Mask',
    labelEn: 'Non-Rebreather Mask (NRBM)',
    category: 'resuscitation',
    icon: '🫁',
    findings: [
      'Non-rebreather mask ใส่แล้ว — flow 10–15 LPM',
      'FiO₂ ประมาณ 60–80%',
      'Reservoir bag + one-way valve',
    ],
    stateEffect: { oxygenApplied: true, airwayDevice: 'nrbm', isBreathing: true },
    notesThai: {
      title: 'Non-Rebreather Mask (NRBM)',
      keyPoints: ['High-flow O₂: FiO₂ 60–80% ที่ 10–15 LPM', 'ให้ bag พอง 2/3 ก่อนใส่', 'ใช้ใน hypoxemia รุนแรง'],
      discussionQuestion: 'ถามผู้เรียน: "เมื่อไหร่ควรใช้ NRBM แทน simple mask?"',
    },
  },

  {
    id: 'io-access',
    label: 'IO Access',
    labelEn: 'Intraosseous Access (IO)',
    category: 'device',
    icon: '🦴',
    findings: [
      'IO needle ใส่แล้ว — proximal tibia',
      'Flush NS 10 mL ยืนยันตำแหน่ง',
      'ให้ยาได้เทียบเท่า IV — Flush NS 20 mL ทุก dose',
    ],
    stateEffect: { ivAccess: true },
    notesThai: {
      title: 'Intraosseous (IO) Access',
      keyPoints: ['IO ใช้เมื่อ IV ยาก ≥2 พยายาม', 'Sites: proximal tibia, humeral head', 'ยาทุกชนิดที่ให้ IV ให้ IO ได้ทั้งหมด'],
      discussionQuestion: 'ถามผู้เรียน: "IO กับ IV ต่างกันอย่างไรใน drug delivery?"',
    },
  },

  {
    id: 'blood-sampling',
    label: 'Blood Sampling / Lab',
    labelEn: 'Send Blood Work & Labs',
    category: 'device',
    icon: '🧪',
    findings: [
      'เจาะเลือดส่งตรวจ: CBC, BMP, troponin, coag, lactate',
      'Blood gas: ABG/VBG',
      'Type & Screen',
    ],
    notesThai: {
      title: 'Blood Work ใน Emergency',
      keyPoints: ['CBC, BMP, troponin, coag, lactate, blood gas', 'Troponin สำคัญใน ACS workup', 'Lactate สูง → poor perfusion'],
      discussionQuestion: 'ถามผู้เรียน: "Lab ไหนสำคัญที่สุดในผู้ป่วย cardiac arrest?"',
    },
  },

  {
    id: '12-lead-ecg',
    label: '12-Lead ECG',
    labelEn: '12-Lead Electrocardiogram',
    category: 'device',
    icon: '📋',
    findings: [
      '12-Lead ECG กำลังบันทึก',
      'อ่านผล: Rate / Rhythm / Axis / Intervals',
      'มองหา: STEMI, LBBB, Prolonged QT, WPW',
    ],
    stateEffect: { monitorAttached: true },
    notesThai: {
      title: '12-Lead ECG',
      keyPoints: ['ควรทำภายใน 10 นาทีของ presentation', 'STEMI: ST elevation ≥1mm ใน 2 leads ติดกัน', 'อ่าน: Rate, Rhythm, Axis, P/QRS/T'],
      discussionQuestion: 'ถามผู้เรียน: "ดู 12-lead แล้วหา STEMI อย่างไร?"',
    },
  },

  // ─── AIRWAY ──────────────────────────────────────────────────────────────────

  {
    id: 'head-tilt',
    label: 'Head-tilt chin-lift',
    labelEn: 'Head-Tilt Chin-Lift',
    category: 'resuscitation',
    icon: '🙆',
    findings: ['Head-tilt chin-lift ทำแล้ว', 'เปิดทางเดินหายใจ — ตรวจการหายใจ'],
    notesThai: {
      title: 'Head-Tilt Chin-Lift',
      keyPoints: ['วิธีแรกใน BLS สำหรับผู้ป่วยไม่มี trauma', 'ห้ามใช้ถ้าสงสัย C-spine injury'],
      discussionQuestion: 'ถามผู้เรียน: "เมื่อไหร่ต้องใช้ jaw thrust แทน?"',
    },
  },

  {
    id: 'jaw-thrust',
    label: 'Jaw Thrust',
    labelEn: 'Jaw Thrust Maneuver',
    category: 'resuscitation',
    icon: '🫦',
    findings: ['Jaw thrust ทำแล้ว', 'ใช้ใน trauma หรือสงสัย C-spine injury'],
    notesThai: {
      title: 'Jaw Thrust',
      keyPoints: ['ใช้เมื่อสงสัย cervical spine injury', 'ต้องการ 2 มือ — อาจต้องการ rescuer 2 คน'],
      discussionQuestion: 'ถามผู้เรียน: "Jaw thrust ต่างจาก head-tilt อย่างไร?"',
    },
  },

  // ─── MONITORING ───────────────────────────────────────────────────────────────

  {
    id: 'attach-3lead',
    label: 'ติด 3-Lead Monitor',
    labelEn: 'Attach 3-Lead Monitor',
    category: 'device',
    icon: '🔌',
    findings: ['3-Lead ECG ติดแล้ว', 'ดู rhythm ต่อเนื่อง', 'Lead II แสดงผล'],
    stateEffect: { monitorAttached: true },
    notesThai: {
      title: '3-Lead Monitor',
      keyPoints: ['Standard monitoring ใน resuscitation', 'Lead II ดี P wave ชัด', 'ต้องแปล rhythm ก่อน treat'],
      discussionQuestion: 'ถามผู้เรียน: "3-lead กับ 12-lead ใช้ต่างกันอย่างไร?"',
    },
  },

  {
    id: 'capnography',
    label: 'Capnography / ETCO₂',
    labelEn: 'End-Tidal CO₂ Monitoring',
    category: 'device',
    icon: '📉',
    findings: [
      'Capnography เชื่อมต่อแล้ว',
      'ETCO₂ ปกติ: 35–45 mmHg',
      'ใน CPR: ETCO₂ > 10 mmHg → CPR ดี',
      'ETCO₂ สูงขึ้นฉับพลัน → สัญญาณ ROSC',
    ],
    notesThai: {
      title: 'Capnography / ETCO₂',
      keyPoints: ['ETCO₂ < 10 mmHg ขณะ CPR → CPR ไม่ดี', 'ETCO₂ > 40 mmHg ฉับพลัน → ROSC', 'ยืนยัน ETT ตำแหน่งถูกต้อง'],
      discussionQuestion: 'ถามผู้เรียน: "ETCO₂ บอกอะไรเราเกี่ยวกับ CPR quality?"',
    },
  },

  {
    id: 'ultrasound',
    label: 'Point-of-Care Ultrasound',
    labelEn: 'POCUS / Bedside Ultrasound',
    category: 'device',
    icon: '🔊',
    findings: [
      'POCUS ทำแล้ว',
      'Cardiac view: ดู wall motion, pericardial effusion',
      'Lung: ดู pneumothorax, pleural effusion',
      'IVC: ประเมิน volume status',
    ],
    notesThai: {
      title: 'Point-of-Care Ultrasound (POCUS)',
      keyPoints: ['ใช้ใน PEA เพื่อหา reversible causes', 'Cardiac POCUS: tamponade, massive PE', 'Lung POCUS: tension PTX'],
      discussionQuestion: 'ถามผู้เรียน: "POCUS ช่วยใน PEA arrest อย่างไร?"',
    },
  },

  // ─── DIAGNOSTICS ──────────────────────────────────────────────────────────────

  {
    id: 'abg',
    label: 'ABG / Blood Gas',
    labelEn: 'Arterial Blood Gas',
    category: 'device',
    icon: '💉',
    findings: [
      'ABG ส่งตรวจ',
      'ดู: pH, PaO₂, PaCO₂, HCO₃, Base excess',
      'ช่วยวินิจฉัย: acidosis, alkalosis, hypoxemia',
    ],
    notesThai: {
      title: 'Arterial Blood Gas (ABG)',
      keyPoints: ['pH < 7.35 → acidosis', 'PaO₂ < 60 mmHg → hypoxemia (room air)', 'Base deficit < -2 → metabolic acidosis'],
      discussionQuestion: 'ถามผู้เรียน: "ABG บอกอะไรเราใน cardiac arrest?"',
    },
  },

  {
    id: 'chest-xray',
    label: 'Chest X-Ray',
    labelEn: 'Portable Chest Radiograph',
    category: 'device',
    icon: '🫁',
    findings: [
      'Portable CXR สั่งแล้ว',
      'ดู: pneumothorax, pleural effusion, cardiomegaly',
      'ETT position, pulmonary edema',
    ],
    notesThai: {
      title: 'Chest X-Ray',
      keyPoints: ['Portable CXR ทำได้ขณะ resuscitation', 'ดู mediastinum ถ้าสงสัย PE/dissection', 'ETT tip ควรอยู่ 2-3 cm เหนือ carina'],
      discussionQuestion: 'ถามผู้เรียน: "CXR ใน cardiac arrest บอกอะไร?"',
    },
  },

  // ─── MECHANICAL VENTILATION ───────────────────────────────────────────────────

  {
    id: 'mechanical-ventilation',
    label: 'Mechanical Ventilation',
    labelEn: 'Connect to Ventilator',
    category: 'resuscitation',
    icon: '🌬️',
    findings: [
      'ETT เชื่อมกับ ventilator',
      'Initial settings: FiO₂ 100%, TV 6 mL/kg IBW',
      'Rate 10/min, PEEP 5 cmH₂O',
    ],
    notesThai: {
      title: 'Mechanical Ventilation (Post-intubation)',
      keyPoints: ['TV 6 mL/kg IBW → lung protective', 'FiO₂ ลดลงตาม SpO₂ (target 94–99%)', 'ตรวจ tube position ด้วย CXR + ETCO₂'],
      discussionQuestion: 'ถามผู้เรียน: "Lung protective ventilation คืออะไร?"',
    },
  },

  // ─── COMMUNICATION ────────────────────────────────────────────────────────────

  {
    id: 'assign-roles',
    label: 'กำหนดบทบาทในทีม',
    labelEn: 'Assign Team Roles',
    category: 'assessment',
    icon: '👥',
    findings: [
      'บทบาทกำหนดแล้ว',
      'Team Leader / CPR / Airway / IV-Drugs / Timer / Recorder',
      'Closed-loop communication เริ่มต้น',
    ],
    notesThai: {
      title: 'Team Role Assignment',
      keyPoints: ['Team leader: ดูภาพรวม ไม่ทำ CPR เอง', 'Closed-loop: confirm ทุกคำสั่ง', 'บทบาทชัดเจน → ลด error'],
      discussionQuestion: 'ถามผู้เรียน: "Team leader ทำอะไรระหว่าง code?"',
    },
  },

  {
    id: 'closed-loop',
    label: 'Closed-loop Communication',
    labelEn: 'Closed-Loop Communication',
    category: 'assessment',
    icon: '🔁',
    findings: [
      'Closed-loop communication ปฏิบัติ',
      'ผู้รับ: repeat back คำสั่งก่อนทำ',
      'ผู้สั่ง: ยืนยันเมื่องานสำเร็จ',
    ],
    notesThai: {
      title: 'Closed-Loop Communication',
      keyPoints: ['สั่ง → รับ/repeat → ยืนยัน', 'ลด miscommunication ใน high-stress', 'เป็น ACLS core skill'],
      discussionQuestion: 'ถามผู้เรียน: "ยกตัวอย่าง closed-loop communication?"',
    },
  },

]

export const actionsByCategory = {
  assessment:    scenarioActions.filter((a) => a.category === 'assessment'),
  resuscitation: scenarioActions.filter((a) => a.category === 'resuscitation'),
  device:        scenarioActions.filter((a) => a.category === 'device'),
  medication:    scenarioActions.filter((a) => a.category === 'medication'),
  outcome:       scenarioActions.filter((a) => a.category === 'outcome'),
}

export type ActionLibraryGroup = {
  id: string
  label: string
  icon: string
  actionIds: string[]
}

// ─── 5H5T Treatment Actions ───────────────────────────────────────────────────

const HT_TREATMENT_ACTIONS: ScenarioAction[] = [

  // ── Hypovolemia ──
  {
    id: 'fluid-bolus',
    label: 'IV Fluid Bolus',
    labelEn: 'NSS / LRS 1–2 L rapid IV',
    category: 'medication',
    icon: '🧴',
    findings: [
      'NSS หรือ LRS 1–2 L IV bolus rapid',
      'ประเมิน BP และ HR ทุก 5–10 นาที',
      'พิจารณา vasopressor ถ้า BP ยังต่ำหลัง fluid',
    ],
    notesThai: { title: 'Fluid Resuscitation', keyPoints: ['NSS/LRS 1–2L bolus', 'ประเมิน response', 'ระวัง fluid overload ใน cardiac cause'], discussionQuestion: 'ถามผู้เรียน: "เลือก crystalloid อะไร และ target MAP เท่าไหร่?"' },
  },
  {
    id: 'prc-uncrossed',
    label: 'Uncrossed PRC',
    labelEn: 'Uncrossmatched Packed Red Cells',
    category: 'medication',
    icon: '🩸',
    findings: [
      'O-negative PRC 2 units IV rapid',
      'ให้เมื่อ hemorrhagic shock และรอ crossmatch ไม่ได้',
      'ส่ง type & screen / crossmatch ก่อนให้ถ้าทำได้',
      'พิจารณา 1:1:1 ratio (PRC:FFP:Plt) ใน massive hemorrhage',
    ],
    notesThai: { title: 'Emergency Blood Transfusion', keyPoints: ['O-neg ให้ได้ทันทีใน hemorrhagic arrest', '1:1:1 ratio ใน massive transfusion protocol', 'MTP activation'], discussionQuestion: 'ถามผู้เรียน: "เมื่อไหร่ activate MTP?"' },
  },

  // ── Hypoxia — covered by existing airway/O₂ actions ──

  // ── Hydrogen ion (Acidosis) ──
  {
    id: 'sodium-bicarbonate',
    label: 'Sodium Bicarbonate',
    labelEn: 'NaHCO₃ 1 mEq/kg IV',
    category: 'medication',
    icon: '🧪',
    findings: [
      'NaHCO₃ 1 mEq/kg IV push',
      'พิจารณาเมื่อ pH < 7.1 หรือ HCO₃ < 10',
      'ข้อบ่งชี้: severe metabolic acidosis, hyperkalemia, TCA overdose',
      'ไม่แนะนำ routine ใน cardiac arrest',
    ],
    notesThai: { title: 'Sodium Bicarbonate', keyPoints: ['1 mEq/kg IV', 'ใช้ใน pH < 7.1 หรือ hyperK', 'Sodium bicarbonate ใน TCA overdose — 1–2 mEq/kg'], discussionQuestion: 'ถามผู้เรียน: "NaHCO₃ routine ใน arrest ดีหรือไม่?"' },
  },

  // ── Hyper/Hypokalemia ──
  {
    id: 'calcium-gluconate',
    label: 'Calcium Gluconate / Chloride',
    labelEn: 'Calcium Gluconate 1 g IV (HyperK / HypoCa)',
    category: 'medication',
    icon: '💊',
    findings: [
      'Calcium gluconate 1 g (10 mL of 10%) IV over 2–3 min',
      'หรือ Calcium chloride 1 g IV (มีประสิทธิภาพกว่า แต่ต้อง central line)',
      'ข้อบ่งชี้: Hyperkalemia, Hypocalcemia, Calcium channel blocker OD',
      'Onset < 5 นาที — membrane stabilization',
    ],
    notesThai: { title: 'Calcium ใน Hyperkalemia', keyPoints: ['Calcium gluconate 1g IV — membrane stabilizer', 'ไม่ลด K+ แต่ป้องกัน cardiac toxicity', 'ตาม NaHCO3 + Insulin/Glucose'], discussionQuestion: 'ถามผู้เรียน: "Calcium ช่วย hyperK อย่างไร?"' },
  },
  {
    id: 'insulin-dextrose',
    label: 'Insulin + Dextrose',
    labelEn: 'Insulin 10 u + D50W 50 mL IV (HyperK)',
    category: 'medication',
    icon: '💉',
    findings: [
      'Regular insulin 10 units IV + D50W 50 mL IV',
      'ลด K+ ประมาณ 0.5–1 mEq/L ใน 30–60 นาที',
      'ติดตาม glucose ทุก 30–60 นาที',
      'ออกฤทธิ์ shift K+ เข้าเซลล์ — ไม่ขับออกจากร่างกาย',
    ],
    notesThai: { title: 'Insulin-Glucose ใน HyperK', keyPoints: ['Insulin shift K+ เข้าเซลล์', '10 units RI + D50W 50mL', 'Monitor glucose หลังให้'], discussionQuestion: 'ถามผู้เรียน: "ทำไมต้องให้ glucose ด้วย?"' },
  },
  {
    id: 'magnesium-sulfate',
    label: 'Magnesium Sulfate',
    labelEn: 'MgSO₄ 2 g IV (Torsades / HypoMg)',
    category: 'medication',
    icon: '💊',
    findings: [
      'MgSO₄ 2 g (4 mL of 50%) IV over 5–20 min',
      'ข้อบ่งชี้: Torsades de pointes, Hypomagnesemia, Pre-eclampsia',
      'ให้เร็วได้ใน Torsades (IV push over 1–2 min)',
      'Maintenance 0.5–1 g/hr infusion ถ้าจำเป็น',
    ],
    notesThai: { title: 'Magnesium Sulfate', keyPoints: ['2g IV ใน Torsades de pointes', 'ให้เร็วได้ถ้า Torsades', 'ระวัง respiratory depression'], discussionQuestion: 'ถามผู้เรียน: "Torsades de pointes แตกต่างจาก VT อย่างไร?"' },
  },
  {
    id: 'amiodarone-150',
    label: 'Amiodarone (Cordarone) 150 mg IV',
    labelEn: 'Amiodarone 150 mg IV (2nd dose / Post-ROSC)',
    category: 'medication',
    icon: '💉',
    findings: [
      'Amiodarone 150 mg IV over 10 min',
      'ให้เป็น 2nd dose ใน refractory VF/pVT หรือ post-ROSC',
      'ตามด้วย maintenance 1 mg/min × 6 ชั่วโมง',
      'Monitor BP — อาจทำให้ความดันต่ำ',
    ],
    notesThai: { title: 'Amiodarone 2nd Dose', keyPoints: ['150mg IV over 10 min', 'ใช้เมื่อ VF/pVT ยังไม่ตอบสนอง', 'Maintenance infusion หลัง ROSC'], discussionQuestion: 'ถามผู้เรียน: "Amiodarone 1st และ 2nd dose ต่างกันอย่างไร?"' },
  },

  // ── Hypothermia ──
  {
    id: 'warm-fluids',
    label: 'Warm IV Fluids / Rewarming',
    labelEn: 'Active Rewarming (Hypothermia)',
    category: 'medication',
    icon: '🌡️',
    findings: [
      'Warm NSS 42°C IV infusion',
      'Active external rewarming: warm blanket, warm humidified O₂',
      'Target core temp > 30°C ก่อนหยุด CPR',
      'ไม่หยุด resuscitation จนกว่า temp > 32–35°C',
    ],
    notesThai: { title: 'Hypothermia Rewarming', keyPoints: ['Warm IV fluid 42°C', '"No one is dead until warm and dead"', 'Core temp > 30°C ก่อน consider termination'], discussionQuestion: 'ถามผู้เรียน: "Hypothermia arrest — หยุด CPR ได้เมื่อไหร่?"' },
  },

  // ── Tension Pneumothorax ──
  {
    id: 'needle-decompression',
    label: 'Needle Decompression',
    labelEn: '2nd ICS MCL Needle Decompression',
    category: 'procedure',
    icon: '🩹',
    findings: [
      '14G IV catheter 2nd ICS midclavicular line',
      'หรือ 4th–5th ICS anterior axillary line (ผู้ป่วยอ้วน)',
      'เสียงลมออก → ยืนยัน tension PTX',
      'ตามด้วย ICD (intercostal drain) ทันที',
    ],
    notesThai: { title: 'Needle Decompression', keyPoints: ['2nd ICS MCL — 14G needle', 'ฟัง hiss of air เมื่อแทง', 'ต้องตาม ICD เสมอ'], discussionQuestion: 'ถามผู้เรียน: "Tension PTX signs 6T คืออะไร?"' },
  },
  {
    id: 'chest-tube-icd',
    label: 'Chest Tube / ICD',
    labelEn: 'Intercostal Drain (Tension PTX / Hemothorax)',
    category: 'procedure',
    icon: '🫁',
    findings: [
      '4th–5th ICS anterior/mid axillary line',
      'ใช้ 28–32F ใน pneumothorax, 32–36F ใน hemothorax',
      'เชื่อมต่อ underwater seal drainage',
      'CXR ยืนยัน tube position หลังใส่',
    ],
    notesThai: { title: 'Intercostal Drain', keyPoints: ['4th-5th ICS AAL', 'Blunt dissection technique', 'Underwater seal / suction'], discussionQuestion: 'ถามผู้เรียน: "ICD กับ needle decompression ต่างกันอย่างไร?"' },
  },

  // ── Cardiac Tamponade ──
  {
    id: 'pericardiocentesis',
    label: 'Pericardiocentesis',
    labelEn: 'Emergency Pericardiocentesis (Tamponade)',
    category: 'procedure',
    icon: '❤️‍🩹',
    findings: [
      'Subxiphoid approach — 45° angle toward L shoulder',
      'ใช้ 18G spinal needle + syringe ดูด fluid',
      'Echo-guided ถ้าทำได้',
      'Remove 20–50 mL อาจช่วยให้ BP ดีขึ้นชั่วคราว',
      'Definitive: surgical drainage (pericardial window)',
    ],
    notesThai: { title: 'Pericardiocentesis', keyPoints: ['Beck\'s triad: JVD, hypotension, muffled heart sounds', 'Subxiphoid approach', '20-50mL ช่วยได้ทันที'], discussionQuestion: 'ถามผู้เรียน: "Beck\'s triad คืออะไร?"' },
  },

  // ── Toxins ──
  {
    id: 'naloxone',
    label: 'Naloxone (Narcan)',
    labelEn: 'Naloxone 0.4–2 mg IV/IM/IN (Opioid OD)',
    category: 'medication',
    icon: '💊',
    findings: [
      'Naloxone 0.4–2 mg IV, IM, SC หรือ intranasal',
      'อาจให้ซ้ำทุก 2–3 นาที (max 10 mg)',
      'Duration: 30–90 นาที — อาจต้องให้ซ้ำ',
      'ข้อบ่งชี้: respiratory depression จาก opioid',
    ],
    notesThai: { title: 'Naloxone ใน Opioid Toxidrome', keyPoints: ['0.4–2mg IV/IN', 'Short acting — อาจต้องให้ซ้ำ', 'ระวัง acute withdrawal ใน chronic user'], discussionQuestion: 'ถามผู้เรียน: "Opioid toxidrome: miosis + bradypnea + ?"' },
  },
  {
    id: 'antidote-generic',
    label: 'Antidote / ยาแก้พิษ',
    labelEn: 'Specific Antidote (Toxin-dependent)',
    category: 'medication',
    icon: '🧫',
    findings: [
      'TCA overdose: NaHCO₃ 1–2 mEq/kg IV',
      'Beta-blocker OD: Glucagon 5–10 mg IV + High-dose insulin',
      'Ca-channel blocker OD: Calcium + High-dose insulin (HIET)',
      'Organophosphate: Atropine high-dose + Pralidoxime',
      'Digoxin toxicity: Digoxin Fab (DigiFab)',
    ],
    notesThai: { title: 'Antidotes ใน Toxin PEA', keyPoints: ['TCA → NaHCO3', 'BBl/CCB → High-dose insulin therapy', 'ปรึกษา poison control'], discussionQuestion: 'ถามผู้เรียน: "Toxidrome อะไรบ้างที่พบบ่อย?"' },
  },

  // ── Thrombosis — Pulmonary Embolism ──
  {
    id: 'thrombolytics',
    label: 'Thrombolytics (PE arrest)',
    labelEn: 'Alteplase 50 mg IV (Massive PE)',
    category: 'medication',
    icon: '💊',
    findings: [
      'Alteplase (tPA) 50 mg IV bolus ใน cardiac arrest จาก PE',
      'CPR ต้องต่อเนื่อง 60–90 นาทีหลังให้ lytics',
      'หรือ Tenecteplase 0.5 mg/kg IV (max 50 mg)',
      'Contraindicated: recent surgery < 10 วัน, intracranial bleed',
      'พิจารณา ECMO / surgical embolectomy ถ้ามีทรัพยากร',
    ],
    notesThai: { title: 'Thrombolytics ใน PE Arrest', keyPoints: ['Alteplase 50mg bolus', 'CPR ต่อเนื่อง 60–90 นาที', 'ห้าม heparin ร่วมกัน'], discussionQuestion: 'ถามผู้เรียน: "PE arrest — ให้ lytics เมื่อไหร่?"' },
  },

  // ── Thrombosis — ACS / STEMI ──
  {
    id: 'emergent-pci',
    label: 'Emergent PCI / Cath Lab',
    labelEn: 'Activate Cath Lab (STEMI / ACS arrest)',
    category: 'procedure',
    icon: '🏥',
    findings: [
      'Activate cardiac catheterization lab ทันที',
      'Door-to-balloon time < 90 นาที (STEMI)',
      'CPR ต่อเนื่องระหว่าง transfer ถ้าจำเป็น',
      'พิจารณา mechanical CPR device (LUCAS) สำหรับ transfer',
      'Anticoagulation: Heparin 5,000 u IV bolus',
    ],
    notesThai: { title: 'Emergent PCI ใน ACS Arrest', keyPoints: ['STEMI → cath lab < 90 min', 'Heparin + Antiplatelet', 'LUCAS/AutoPulse ช่วย transfer'], discussionQuestion: 'ถามผู้เรียน: "Post-ROSC STEMI — next step?"' },
  },
]

scenarioActions.push(...HT_TREATMENT_ACTIONS)

export const ACTION_LIBRARY_GROUPS: ActionLibraryGroup[] = [
  {
    id: 'assessment',
    label: 'Assessment',
    icon: '🔍',
    actionIds: ['check-responsiveness', 'check-pulse', 'check-breathing', 'assess-symptoms-brady', 'assess-stability', 'repeat-vitals'],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: '📢',
    actionIds: ['call-team', 'assign-roles', 'closed-loop'],
  },
  {
    id: 'airway',
    label: 'Airway',
    icon: '😮‍💨',
    actionIds: ['head-tilt', 'jaw-thrust', 'airway-opa', 'airway-npa', 'airway-sga', 'airway-ett'],
  },
  {
    id: 'breathing',
    label: 'Breathing / O₂',
    icon: '🫁',
    actionIds: ['oxygen-nasal', 'oxygen-mask', 'oxygen-nrbm', 'apply-oxygen', 'mechanical-ventilation'],
  },
  {
    id: 'circulation',
    label: 'Circulation',
    icon: '❤️',
    actionIds: ['start-cpr', 'iv-access', 'io-access', 'defibrillate', 'synchronized-cardioversion', 'transcutaneous-pacing', 'vagal-maneuvers'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: '📊',
    actionIds: ['attach-monitor', 'attach-monitor-brady', 'attach-monitor-tachy', 'attach-3lead', 'rhythm-check', '12-lead-ecg', 'capnography', 'ultrasound'],
  },
  {
    id: 'medication',
    label: 'Medication',
    icon: '💊',
    actionIds: ['epinephrine', 'atropine', 'adenosine', 'amiodarone', 'amiodarone-150', 'lidocaine', 'dopamine-infusion', 'antiarrhythmic-tachy'],
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    icon: '🧪',
    actionIds: ['blood-sampling', 'abg', 'chest-xray'],
  },
  {
    id: 'ht-hypovolemia',
    label: '5H5T — Hypovolemia / Hemorrhage',
    icon: '🩸',
    actionIds: ['fluid-bolus', 'prc-uncrossed'],
  },
  {
    id: 'ht-acidosis',
    label: '5H5T — Acidosis / Electrolytes',
    icon: '🧪',
    actionIds: ['sodium-bicarbonate', 'calcium-gluconate', 'insulin-dextrose', 'magnesium-sulfate'],
  },
  {
    id: 'ht-hypothermia',
    label: '5H5T — Hypothermia',
    icon: '🌡️',
    actionIds: ['warm-fluids'],
  },
  {
    id: 'ht-ptx',
    label: '5H5T — Tension Pneumothorax',
    icon: '🫁',
    actionIds: ['needle-decompression', 'chest-tube-icd'],
  },
  {
    id: 'ht-tamponade',
    label: '5H5T — Cardiac Tamponade',
    icon: '❤️‍🩹',
    actionIds: ['pericardiocentesis'],
  },
  {
    id: 'ht-toxins',
    label: '5H5T — Toxins / Overdose',
    icon: '☠️',
    actionIds: ['naloxone', 'antidote-generic'],
  },
  {
    id: 'ht-thrombosis',
    label: '5H5T — Thrombosis (PE / ACS)',
    icon: '🏥',
    actionIds: ['thrombolytics', 'emergent-pci'],
  },
  {
    id: 'outcome',
    label: 'Outcome',
    icon: '✅',
    actionIds: ['rosc'],
  },
]
