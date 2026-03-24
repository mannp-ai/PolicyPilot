import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  User, 
  CheckCircle, 
  Database, 
  Languages as Translate, 
  ChevronRight,
  Clock,
  ArrowRight,
  Mic,
  MicOff,
  MapPin,
  CalendarPlus,
  Upload,
  FileText,
  AlertTriangle,
  FileWarning,
  WifiOff
} from 'lucide-react'

interface Scheme {
  id: string;
  name: string;
  match_score: number;
  benefit: string;
  category: string;
  deadline: string;
  verified: boolean;
  reason: string;
  effort?: string;
  docs?: string[];
  red_flags?: string[];
  missing_docs?: string[];
}

const MOCK_SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    match_score: 98,
    benefit: "₹6,000 per year directly to bank account.",
    category: "Agriculture",
    deadline: "Closing in 12 days",
    verified: true,
    reason: "You qualify because: [PM-KISAN gazette, Section 3.1, Page 4]: Annual income of farming families not exceeding Rs. 2,00,000.",
    effort: "Easy",
    docs: ["Aadhaar", "Land Record"]
  },
  {
    id: "pmay-g",
    name: "PMAY-G",
    match_score: 85,
    benefit: "Financial assistance for housing construction.",
    category: "Housing",
    deadline: "Ongoing",
    verified: true,
    reason: "Based on your BPL card status and rural location, you are eligible for the EWS housing grant.",
    effort: "Medium",
    docs: ["Aadhaar", "BPL Card", "Income Certificate"]
  }
]

const TRANSLATIONS: any = {
  en: {
    hero_title: "Apni Yojana, Apna Haq",
    hero_subtitle: "Your AI-powered guide to 100% of the government benefits you deserve.",
    find_schemes: "Find My Schemes",
    upload_profile: "Auto-Fill Profile",
    language: "Language",
    tabs: { onboarding: "Get Started", dashboard: "My Dashboard", chat: "AI Assistant" },
    onboarding: {
      title: "Tell us about yourself",
      subtitle: "We'll show you exactly which schemes you qualify for.",
      state: "State",
      district: "District",
      age: "Age",
      income: "Annual Income (₹)",
      occupation: "Occupation",
      category: "Category",
      situation: "Describe your situation (e.g., 'I am a 45yo farmer with 3 children...')",
      searching: "Matching your profile..."
    },
    dashboard: {
      title: "Your Personalized Schemes",
      subtitle: "Based on your profile, we found {count} high-match opportunities.",
      match_score: "Match Strength",
      benefit: "Benefit Amount",
      deadline: "Application Deadline",
      view_details: "View Details",
      eligible: "Eligible",
      likely: "Likely Eligible",
      monthly_support: "Monthly Financial Support",
      verified: "Across verified government initiatives",
      calc: "Understand Calculations"
    },
    chat: {
      title: "AI Policy Assistant",
      placeholder: "Type your question...",
      initial_msg: "Hello! I am PolicyPilot. I can answer questions about eligibility and application steps in your preferred language."
    },
    modal: {
      official: "Official Scheme",
      strength: "{score}% Match Strength",
      why: "Why you qualify",
      benefits: "Detailed Benefits",
      initiative: "As part of the {category} initiative.",
      window: "Official Submission Window",
      deadline: "Deadline: {date}",
      ask: "Ask AI how to Apply",
      close: "Close View"
    }
  },
  hi: {
    hero_title: "अपनी योजना, अपना हक",
    hero_subtitle: "सरकारी लाभों के लिए आपका एआई-संचालित मार्गदर्शक।",
    find_schemes: "मेरी योजनाएं खोजें",
    upload_profile: "प्रोफ़ाइल ऑटो-फिल",
    language: "भाषा",
    tabs: { onboarding: "शुरू करें", dashboard: "मेरा डैशबोर्ड", chat: "एआई सहायक" },
    onboarding: {
      title: "हमें अपने बारे में बताएं",
      subtitle: "हम आपको दिखाएंगे कि आप किन योजनाओं के लिए पात्र हैं।",
      state: "राज्य",
      district: "जिला",
      age: "आयु",
      income: "वार्षिक आय (₹)",
      occupation: "व्यवसाय",
      category: "श्रेणी",
      situation: "अपनी स्थिति बताएं (जैसे, 'मैं 3 बच्चों वाला 45 वर्षीय किसान हूं...')",
      searching: "प्रोफ़ाइल मिलान कर रहे हैं..."
    },
    dashboard: {
      title: "आपकी व्यक्तिगत योजनाएं",
      subtitle: "आपकी प्रोफ़ाइल के आधार पर, हमें {count} उच्च-मैच अवसर मिले हैं।",
      match_score: "मैच ताकत",
      benefit: "लाभ राशि",
      deadline: "आवेदन की समय सीमा",
      view_details: "विवरण देखें",
      eligible: "पात्र",
      likely: "संभावित पात्र",
      monthly_support: "मासिक वित्तीय सहायता",
      verified: "सत्यापित सरकारी पहलों के माध्यम से",
      calc: "गणना को समझें"
    },
    chat: {
      title: "एआई नीति सहायक",
      placeholder: "अपना प्रश्न टाइप करें...",
      initial_msg: "नमस्ते! मैं पॉलिसीपायलट हूं। मैं आपकी पसंद की भाषा में पात्रता और आवेदन चरणों के बारे में प्रश्नों का उत्तर दे सकता हूं। "
    },
    modal: {
      official: "आधिकारिक योजना",
      strength: "{score}% मैच की ताकत",
      why: "आप पात्र क्यों हैं",
      benefits: "विस्तृत लाभ",
      initiative: "{category} पहल के हिस्से के रूप में।",
      window: "आधिकारिक प्रस्तुत करने की विंडो",
      deadline: "समय सीमा: {date}",
      ask: "एआई से पूछें कि आवेदन कैसे करें",
      close: "दृश्य बंद करें"
    }
  },
  gu: {
    hero_title: "આપણી યોજના, આપણો હક",
    hero_subtitle: "સરકારી લાભો માટે તમારું AI-સંચાલિત માર્ગદર્શક.",
    find_schemes: "મારી યોજનાઓ શોધો",
    upload_profile: "પ્રોફાઇલ ઓટો-ફિલ",
    language: "ભાષા",
    tabs: { onboarding: "શરૂ કરો", dashboard: "મારું ડેશબોર્ડ", chat: "AI સહાયક" },
    onboarding: {
      title: "તમારા વિશે અમને જણાવો",
      subtitle: "અમે તમને બતાવીશું કે તમે કઈ યોજનાઓ માટે પાત્ર છો.",
      state: "રાજ્ય",
      district: "જિલ્લો",
      age: "ઉંમર",
      income: "વાર્ષિક આવક (₹)",
      occupation: "વ્યવસાય",
      category: "કેટેગરી",
      situation: "તમારી પરિસ્થિતિનું વર્ણન કરો (દા.ત., 'હું 3 બાળકો સાથે 45 વર્ષનો ખેડૂત છું...')",
      searching: "પ્રોફાઇલ મેચ કરી રહ્યા છીએ..."
    },
    dashboard: {
      title: "તમારી વ્યક્તિગત યોજનાઓ",
      subtitle: "તમારી પ્રોફાઇલના આધારે, અમને {count} ઉચ્ચ-મેચ તકો મળી છે.",
      match_score: "મેચ સ્ટ્રેન્થ",
      benefit: "લાભની રકમ",
      deadline: "અરજીની અંતિમ તારીખ",
      view_details: "વિગતો જુઓ",
      eligible: "પાત્ર",
      likely: "સંભવિત પાત્ર",
      monthly_support: "માસિક નાણાકીય સહાય",
      verified: "ચકાસાયેલ સરકારી પહેલો દ્વારા",
      calc: "ગણતરીઓ સમજો"
    },
    chat: {
      title: "AI પોલિસી સહાયક",
      placeholder: "તમારો પ્રશ્ન લખો...",
      initial_msg: "નમસ્તે! હું PolicyPilot છું. હું તમારી પસંદગીની ભાષામાં પાત્રતા અને અરજીના પગલાં વિશેના પ્રશ્નોના જવાબ આપી શકું છું."
    },
    modal: {
      official: "સત્તાવાર યોજના",
      strength: "{score}% મેચ શક્તિ",
      why: "તમે કેમ પાત્ર છો",
      benefits: "વિગતવાર લાભો",
      initiative: "{category} પહેલના ભાગ રૂપે.",
      window: "સત્તાવાર સબમિશન વિન્ડો",
      deadline: "અંતિમ તારીખ: {date}",
      ask: "અરજી કેવી રીતે કરવી તે પૂછો",
      close: "બંધ કરો"
    }
  },
  mr: {
    hero_title: "आपली योजना, आपला हक्क",
    hero_subtitle: "सरकारी फायद्यांसाठी तुमचे AI-आधारित मार्गदर्शक.",
    find_schemes: "माझ्या योजना शोधा",
    upload_profile: "प्रोफाइल ऑटो-फिल",
    language: "भाषा",
    tabs: { onboarding: "सुरू करा", dashboard: "माझे डॅशबोर्ड", chat: "AI सहाय्यक" },
    onboarding: {
      title: "आम्हाला तुमच्याबद्दल सांगा",
      subtitle: "तुम्ही कोणत्या योजनांसाठी पात्र आहात हे आम्ही तुम्हाला दाखवू.",
      state: "राज्य",
      district: "जिल्हा",
      age: "वय",
      income: "वार्षिक उत्पन्न (₹)",
      occupation: "व्यवसाय",
      category: "वर्ग",
      situation: "तुमच्या परिस्थितीचे वर्णन करा (उदा., 'मी 3 मुलांसह 45 वर्षांचा शेतकरी आहे...')",
      searching: "प्रोफाइल मॅच करत आहे..."
    },
    dashboard: {
      title: "तुमच्या वैयक्तिक योजना",
      subtitle: "तुमच्या प्रोफाइलच्या आधारे, आम्हाला {count} उच्च-साम्य संधी मिळाल्या आहेत.",
      match_score: "मॅच स्ट्रेंथ",
      benefit: "फायद्याची रक्कम",
      deadline: "अर्ज करण्याची शेवटची तारीख",
      view_details: "तपशील पहा",
      eligible: "पात्र",
      likely: "संभाव्य पात्र",
      monthly_support: "मासिक आर्थिक सहाय्य",
      verified: "सत्यापित सरकारी उपक्रमांद्वारे",
      calc: "गणना समजावून घ्या"
    },
    chat: {
      title: "AI धोरण सहाय्यक",
      placeholder: "तुमचा प्रश्न टाइप करा...",
      initial_msg: "नमस्कार! मी पॉलिसीपायलट आहे. मी तुमच्या पसंतीच्या भाषेत पात्रता आणि अर्ज प्रक्रियेबद्दल प्रश्नांची उत्तरे देऊ शकतो."
    },
    modal: {
      official: "अधिकृत योजना",
      strength: "{score}% मॅच स्ट्रेंथ",
      why: "तुम्ही का पात्र आहात",
      benefits: "तपशीलवार फायदे",
      initiative: "{category} उपक्रमाचा भाग म्हणून.",
      window: "अधिकृत सबमिशन विंडो",
      deadline: "मुदत: {date}",
      ask: "अर्ज कसा करायचा ते AI ला विचारा",
      close: "बंद करा"
    }
  }
}

function App() {
  const [lang, setLang] = useState('en')
  
  const t = (path: string) => {
    const keys = path.split('.');
    let result = TRANSLATIONS[lang];
    for (const key of keys) {
      if (result && result[key]) result = result[key];
      else return path;
    }
    return result;
  }

  const [activeTab, setActiveTab] = useState('onboarding')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const [isCscMode, setIsCscMode] = useState(false)
  const [schemes, setSchemes] = useState(MOCK_SCHEMES)
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', content: TRANSLATIONS[lang].chat.initial_msg }
  ])
  const [profile, setProfile] = useState<any>({
    state: '',
    district: '',
    age: null,
    income: null,
    occupation: '',
    category: '',
    situation: '',
    language: 'English'
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [lastMatchedSituation, setLastMatchedSituation] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  // Feature 1: Voice Input
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  // Feature 4: CSC Map
  const [showCscMap, setShowCscMap] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const isListeningRef = useRef(false) // Track actual intent outside React state closures
  const baseTranscriptRef = useRef('') // Holds the permanent text before the current speech session
  
  // Feature 1: Voice Input using Web Speech API
  const handleVoiceInput = (e: React.MouseEvent) => {
    e.preventDefault()
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome.')
      return
    }

    // Stop listening manually
    if (isListeningRef.current) {
      isListeningRef.current = false
      setIsListening(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      return
    }

    // Start listening
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN'
    
    recognition.continuous = true
    recognition.interimResults = true // Capturing interim results for real-time typing effect
    
    // Store whatever was already in the textarea before we started speaking
    baseTranscriptRef.current = profile.situation || ''
    
    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      
      // If we got a final phrase, commit it permanently to the base transcript
      if (finalTranscript.trim()) {
        const base = baseTranscriptRef.current
        baseTranscriptRef.current = base + (base && !base.endsWith(' ') ? ' ' : '') + finalTranscript.trim() + ' '
      }
      
      // Display current permanent + current interim
      const currentBase = baseTranscriptRef.current
      const displayString = currentBase + (currentBase && !currentBase.endsWith(' ') && interimTranscript ? ' ' : '') + interimTranscript
      
      setProfile((prev: any) => ({ 
        ...prev, 
        situation: displayString 
      }))
    }
    
    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        alert(`Microphone access error: ${e.error}. Please check permissions/internet.`)
        isListeningRef.current = false
        setIsListening(false)
      }
      // 'no-speech' is triggered after a few seconds of silence; ignore and let onend restart it
    }
    
    recognition.onend = () => {
      // Auto-restart to prevent unexpected shutdowns, UNLESS user manually clicked stop
      if (isListeningRef.current) {
        try {
          // Because we restart the API, event.resultIndex resets to 0. 
          // So our baseTranscriptRef perfectly saves the state across restarts!
          recognitionRef.current.start()
        } catch (err) {
          console.error('Failed to auto-restart mic', err)
          isListeningRef.current = false
          setIsListening(false)
        }
      }
    }
    
    try {
      isListeningRef.current = true
      setIsListening(true)
      recognition.start()
    } catch (err) {
      console.error('Failed to start mic', err)
      isListeningRef.current = false
      setIsListening(false)
    }
  }

  // Feature 2: Document Upload with Gemini Vision AI extraction
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/extract-doc', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Extraction failed')
      const extracted = await res.json()
      setProfile({ ...profile, ...extracted, language: profile.language })
      if (extracted.situation) {
        setErrorMessage('')
      }
    } catch (err) {
      alert('Could not extract profile from document. Please fill it in manually.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Feature 4: Generate and download a .ics calendar file for scheme deadline
  const downloadICS = (scheme: Scheme) => {
    const now = new Date()
    const deadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // default: 30 days
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PolicyPilot//EN',
      'BEGIN:VEVENT',
      `UID:${scheme.id}-${Date.now()}@policypilot.in`,
      `DTSTAMP:${fmt(now)}`,
      `DTSTART:${fmt(deadline)}`,
      `DTEND:${fmt(new Date(deadline.getTime() + 3600000))}`,
      `SUMMARY:Apply for ${scheme.name} - PolicyPilot Reminder`,
      `DESCRIPTION:Don't forget to apply for ${scheme.name}. Benefit: ${scheme.benefit}. Login at https://services.india.gov.in`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${scheme.id}-reminder.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Feature 6: CSC Map URL
  const getCscMapUrl = () => {
    const location = profile.district ? `${profile.district}, ${profile.state}` : profile.state || 'India'
    return `https://www.google.com/maps/search/Common+Service+Centre+near+${encodeURIComponent(location)}`
  }

  // Feature 9: Download Auto-Filled PDF Application (The Last Mile)
  const downloadApplication = async (scheme: Scheme) => {
    setIsLoading(true)
    try {
      const payload = {
        profile: { ...profile, language: profile.language || 'English' },
        scheme: { ...scheme, name: scheme.name || '', category: scheme.category || '', benefit: scheme.benefit || '', deadline: scheme.deadline || '', match_score: scheme.match_score || 0, verified: scheme.verified || true, reason: scheme.reason || '' }
      }
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Failed to generate PDF')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${scheme.id}_application.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (e) {
      alert("Error generating PDF application. Please ensure the backend server is reachable.")
    } finally {
      setIsLoading(false)
    }
  }

  // Legacy demo upload (used when no backend is available)
  const handleUpload = () => {
    setIsUploading(true)
    setTimeout(() => {
      setProfile({
        state: 'Gujarat', district: 'Mehsana', age: 55, income: 120000,
        occupation: 'Farmer', category: 'SC',
        situation: 'I am a 55 year old farmer from Mehsana, Gujarat. I am looking for support for my wheat crop and education for my children.',
        language: profile.language
      })
      setIsUploading(false)
    }, 1500)
  }

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-black text-slate-900 mt-6 mb-3">{line.replace('### ', '')}</h3>
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black text-slate-900 mt-8 mb-4">{line.replace('## ', '')}</h2>
      if (line.trim().startsWith('* ')) return <li key={i} className="ml-6 mb-2 list-disc">{renderLinksAndBold(line.replace('* ', ''))}</li>
      if (/^\d+\./.test(line.trim())) return <li key={i} className="ml-6 mb-2 list-decimal">{renderLinksAndBold(line.replace(/^\d+\.\s/, ''))}</li>
      if (line.trim() === '') return <div key={i} className="h-4" />
      return <p key={i} className="mb-4 leading-relaxed">{renderLinksAndBold(line)}</p>
    })
  }

  const renderLinksAndBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#003fb1]">{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#003fb1] underline underline-offset-4 font-bold">{linkMatch[1]}</a>;
      }
      return part;
    });
  }

  const fetchMatches = async () => {
    if (profile.situation.length < 20) {
      setErrorMessage("Please describe your situation in more detail (min 20 characters).")
      return
    }
    if (profile.situation === lastMatchedSituation) {
      setActiveTab('dashboard')
      return
    }
    
    setErrorMessage("")
    setIsLoading(true)
    try {
      if (isOffline) {
        setSchemes(MOCK_SCHEMES)
        setLastMatchedSituation(profile.situation)
        setActiveTab('dashboard')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...profile, language: profile.language || 'English'})
      })
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }
      const data = await response.json()
      setSchemes(data && data.length > 0 ? data : MOCK_SCHEMES)
      setLastMatchedSituation(profile.situation)
      setActiveTab('dashboard')
    } catch (e) {
      console.error("Match API Error", e)
      setSchemes(MOCK_SCHEMES)
      setActiveTab('dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChat = async (query: string) => {
    const newMessages = [...chatMessages, { role: 'user', content: query }]
    setChatMessages(newMessages)
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, profile: {...profile, language: profile.language || 'English'} })
      })
      const data = await response.json()
      setChatMessages([...newMessages, { role: 'bot', content: data.response }])
    } catch (e) {
      setChatMessages([...newMessages, { role: 'bot', content: "I'm having trouble connecting to the local brain. Please ensure the backend is running." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner */}
      <div className="w-full bg-[#003fb1] text-white py-2 px-6 text-center text-[10px] font-bold tracking-widest uppercase">
        🇮🇳 Built for India | Supports 4 languages | Trusted by CSC operators
      </div>

      {isOffline && (
        <div className="w-full bg-red-600 text-white py-2 px-6 text-center text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2">
          <WifiOff size={14} /> You are offline. Showing cached / fallback schemes.
        </div>
      )}

      {/* Header */}
      <header className="official-header shadow-sm sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex flex-col gap-0.5">
            <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">PolicyPilot</span>
            <span className="text-[11px] font-extrabold text-[#003fb1] uppercase tracking-widest leading-none">Apni Yojana, Apna Haq</span>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 items-center">
              <button onClick={() => setActiveTab('onboarding')} className={`text-sm font-bold transition-colors ${activeTab === 'onboarding' ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-slate-500 hover:text-[#003fb1]'}`}>{t('tabs.onboarding')}</button>
              <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-slate-500 hover:text-[#003fb1]'}`}>{t('tabs.dashboard')}</button>
              <button onClick={() => setActiveTab('chat')} className={`text-sm font-bold transition-colors ${activeTab === 'chat' ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-slate-500 hover:text-[#003fb1]'}`}>{t('tabs.chat')}</button>
            </nav>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Translate size={14} className="text-[#003fb1]" />
                  <span className="text-[10px] font-bold uppercase">{lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : lang === 'gu' ? 'ગુજરાતી' : 'मराठी'}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <button onClick={() => {setLang('en'); setProfile({...profile, language: 'English'})}} className="w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-blue-50 border-b border-slate-50 uppercase">English</button>
                  <button onClick={() => {setLang('hi'); setProfile({...profile, language: 'Hindi'})}} className="w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-blue-50 border-b border-slate-50 uppercase">हिंदी</button>
                  <button onClick={() => {setLang('gu'); setProfile({...profile, language: 'Gujarati'})}} className="w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-blue-50 border-b border-slate-50 uppercase">ગુજરાતી</button>
                  <button onClick={() => {setLang('mr'); setProfile({...profile, language: 'Marathi'})}} className="w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-blue-50 uppercase">मराठी</button>
                </div>
              </div>
              <User size={24} className="text-slate-400 cursor-pointer hover:text-[#003fb1]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'onboarding' && (
          <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center animate-hero">
            <div className="relative z-10 flex flex-col gap-8">
              <h1 className="text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
                {t('hero_title')}
              </h1>
              <p className="text-2xl text-slate-500 max-w-xl leading-relaxed font-semibold opacity-90">
                {t('hero_subtitle')}
              </p>
              <div className="premium-card relative overflow-hidden mb-8">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#003fb1]" />
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-2xl">✍️</span> {t('onboarding.title')}</h3>
                <div className="relative mb-6">
                  <textarea name="situation" value={profile.situation} onChange={handleInputChange} placeholder={t('onboarding.situation')} rows={6} className="input-premium h-40 resize-none w-full pr-14" />
                  <button
                    onClick={handleVoiceInput}
                    title={isListening ? 'Stop listening' : 'Speak your situation'}
                    className={`absolute bottom-3 right-3 p-3 rounded-full transition-all shadow ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#003fb1] text-white hover:bg-blue-700'}`}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
                {isListening && <p className="text-red-500 text-xs font-bold mb-3 flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block"></span>Listening... speak clearly into your mic (Make sure you are using Chrome)</p>}
                {errorMessage && <p className="text-red-500 text-sm font-bold mb-4 animate-bounce">{errorMessage}</p>}
                <button 
                  className={`btn-primary w-full py-4 text-lg justify-center shadow-lg shadow-blue-500/20 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  onClick={fetchMatches} 
                  disabled={isLoading}
                >
                  {isLoading ? t('onboarding.searching') : t('find_schemes')}
                </button>
                {/* Feature 2: Document Upload */}
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-4 mt-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                >
                  {isUploading ? <><span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span> Reading document...</> : <><FileText size={14} /> Upload Aadhaar / Document (AI Auto-Fill)</>}
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-white shadow-2xl relative border-8 border-white">
                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWXLIBExfF0yDYbrSEaZmgE4PxbBvEwMr9WU_w4Nr75iDMSzkLmSuny8dUOb2q-lOQG1Rf_LqxxflKiBrymNDyXPGqHItAOwQ65_TcQJRt6SSsR1MKZ6zxT9kMUmnnA3izp0kjGOJ8qqPlwHeEvxgsa0uojoEa74x6zfbv0vQQSB4QuzGKUwmtAGOLvGAUepxiJ7buMCjMeMJfh8tZ_CRwiFjm9Mt4HsV6o3wIASEBdTcmyPsb0hQ3jJRjrZKvUxC49r33Fs1k_I3p" alt="Bharat" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{t('dashboard.title')}</h2>
                <p className="text-lg text-slate-500 font-medium">{t('dashboard.subtitle').replace('{count}', schemes.length.toString())}</p>
              </div>
              {/* Feature 6: Find Nearest CSC */}
              <a
                href={getCscMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-[#003fb1] text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-sm whitespace-nowrap"
              >
                <MapPin size={18} /> Find Nearest CSC Centre
              </a>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {schemes.map(scheme => (
                <div key={scheme.id} className="premium-card flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${scheme.match_score > 85 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {scheme.match_score > 85 ? <CheckCircle size={12} /> : null}{scheme.match_score > 85 ? t('dashboard.eligible') : t('dashboard.likely')}
                      </span>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.match_score')}</div>
                        <div className="text-lg font-black text-[#003fb1]">{scheme.match_score}%</div>
                      </div>
                    </div>
                    {/* Feature 4: Deadline Badge */}
                    {scheme.deadline && scheme.deadline !== 'Ongoing' && (
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl mb-4 w-fit">
                        <Clock size={12} /> {scheme.deadline}
                      </div>
                    )}
                    <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-[#003fb1] transition-colors">{scheme.name}</h3>
                    <p className="text-xs font-bold text-[#003fb1] uppercase tracking-widest mb-4 opacity-80">{scheme.category}</p>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4 bg-slate-50 p-4 rounded-xl italic">"{scheme.reason}"</p>
                    {(scheme.red_flags?.length || scheme.missing_docs?.length) ? (
                      <div className="mb-6 flex flex-col gap-2">
                        {scheme.red_flags && scheme.red_flags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-red-700 bg-red-50 px-3 py-2 rounded-xl border border-red-100/50">
                            <AlertTriangle size={12} className="shrink-0" />
                            <span>{scheme.red_flags.length} red flag{scheme.red_flags.length > 1 ? 's' : ''} detected</span>
                          </div>
                        )}
                        {scheme.missing_docs && scheme.missing_docs.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100/50">
                            <FileWarning size={12} className="shrink-0" />
                            <span>Missing {scheme.missing_docs.length} document{scheme.missing_docs.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6"></div>
                    )}
                  </div>
                  <div className="pt-6 border-t border-slate-100 mt-auto">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Benefit</span>
                       <span className="text-[#006c4b] font-black">{scheme.benefit}</span>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         className="btn-primary flex-1 justify-center" 
                         onClick={() => setSelectedScheme(scheme)}
                       >
                         {t('dashboard.view_details')} <ChevronRight size={18} />
                       </button>
                       {/* Feature 4: Add to Calendar */}
                       <button
                         onClick={() => downloadICS(scheme)}
                         title="Save Reminder to Calendar"
                         className="p-3 border-2 border-[#003fb1] text-[#003fb1] rounded-2xl hover:bg-blue-50 transition-colors"
                       >
                         <CalendarPlus size={20} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col h-[85vh] animate-fade-in">
            <header className="mb-8"><h2 className="text-3xl font-black text-slate-900 mb-2">{t('chat.title')}</h2></header>
            <div className="flex-1 bg-white border border-slate-100 rounded-3xl shadow-sm mb-6 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-6 rounded-[1.5rem] font-medium shadow-sm transition-all ${
                      msg.role === 'user' 
                        ? 'bg-[#003fb1] text-white rounded-tr-none shadow-blue-500/10' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none prose prose-slate'
                    }`}>
                      {msg.role === 'user' ? msg.content : formatMessage(msg.content)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder={t('chat.placeholder')} 
                    className="input-premium flex-1 bg-white border-2 border-slate-200 focus:border-[#003fb1] outline-none transition-all px-6"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        handleChat((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button 
                    className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={() => {
                      if (!isLoading) {
                        const input = document.querySelector('input[placeholder="' + t('chat.placeholder') + '"]') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          handleChat(input.value);
                          input.value = '';
                        }
                      }
                    }}
                    disabled={isLoading}
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div><span className="text-xl font-black text-slate-900">PolicyPilot</span><p className="text-xs text-slate-400 mt-4 font-medium">© 2024 Digital India Initiative. All Rights Reserved.</p></div>
          <div className="flex gap-8 text-sm font-bold text-slate-500"><a href="#" className="hover:text-[#003fb1]">About</a><a href="#" className="hover:text-[#003fb1]">Privacy</a><a href="#" className="hover:text-[#003fb1]">Support</a></div>
        </div>
      </footer>

      {/* Premium Scheme Details Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScheme(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 pb-4 flex justify-between items-start border-b border-slate-50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-[#003fb1] rounded-full text-[10px] font-black uppercase tracking-widest">{t('modal.official')}</span>
                    <span className="text-sm font-bold text-[#006c4b] flex items-center gap-1"><CheckCircle size={14} /> {t('modal.strength').replace('{score}', selectedScheme.match_score.toString())}</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedScheme.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedScheme(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-400"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{t('modal.why')}</h4>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-slate-600 leading-relaxed font-medium italic">"{selectedScheme.reason}"</p>
                  </div>
                </section>
                
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{t('modal.benefits')}</h4>
                   <div className="flex items-start gap-4">
                     <div className="p-3 bg-green-100 rounded-2xl text-[#006c4b]"><Database size={24} /></div>
                     <div>
                       <div className="text-2xl font-black text-[#006c4b] mb-1">{selectedScheme.benefit}</div>
                       <p className="text-slate-500 text-sm font-medium">{t('modal.initiative').replace('{category}', selectedScheme.category)}</p>
                     </div>
                   </div>
                </section>
 
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{t('modal.window')}</h4>
                   <div className="flex items-center gap-2 text-slate-700 font-bold bg-slate-100 w-fit px-4 py-2 rounded-xl">
                     <Clock size={16} className="text-[#003fb1]" />
                     {t('modal.deadline').replace('{date}', selectedScheme.deadline)}
                   </div>
                </section>
                
                {(selectedScheme.red_flags?.length || selectedScheme.missing_docs?.length) ? (
                  <section>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4">⚠️ Application Warnings</h4>
                     <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex flex-col gap-5">
                       {selectedScheme.red_flags && selectedScheme.red_flags.length > 0 && (
                         <div>
                           <div className="flex items-center gap-2 font-black text-red-800 mb-2 uppercase tracking-wide text-[10px]"><AlertTriangle size={14} /> Discrepancies Found</div>
                           <ul className="list-disc list-inside text-sm text-red-600 font-medium space-y-1">
                             {selectedScheme.red_flags.map((flag: string, i: number) => <li key={i}>{flag}</li>)}
                           </ul>
                         </div>
                       )}
                       {selectedScheme.missing_docs && selectedScheme.missing_docs.length > 0 && (
                         <div>
                           <div className="flex items-center gap-2 font-black text-amber-800 mb-2 uppercase tracking-wide text-[10px]"><FileWarning size={14} /> Missing Documents Needed</div>
                           <div className="flex flex-wrap gap-2">
                             {selectedScheme.missing_docs.map((doc: string, i: number) => (
                               <span key={i} className="px-3 py-1.5 bg-white text-amber-900 text-xs font-bold rounded-xl border border-amber-200/60 shadow-sm">
                                 {doc}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                  </section>
                ) : null}
              </div>
 
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                
                <button 
                  className="w-full py-4 rounded-2xl font-black text-lg border-2 border-[#003fb1] text-[#003fb1] hover:bg-blue-50 transition-colors flex items-center justify-center gap-3 shadow-sm bg-white"
                  onClick={() => downloadApplication(selectedScheme)}
                  disabled={isLoading}
                >
                  <FileText size={24} /> Download Auto-Filled Application Form
                </button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    className="btn-primary flex-1 py-4 justify-center text-lg shadow-lg shadow-blue-500/20"
                    onClick={() => {
                      const schemeName = selectedScheme.name;
                      setSelectedScheme(null);
                      setActiveTab('chat');
                      handleChat(`I want to know more about ${schemeName} and how to apply.`);
                    }}
                  >
                    {t('modal.ask')}
                  </button>
                  <button 
                    className="flex-1 py-4 px-6 border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-white hover:border-[#003fb1] hover:text-[#003fb1] transition-all"
                    onClick={() => setSelectedScheme(null)}
                  >
                    {t('modal.close')}
                  </button>
                </div>
                
                {/* Feature 6: CSC Map link in modal */}
                <div className="text-center pt-2">
                  <a 
                    href={getCscMapUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#003fb1] hover:underline"
                  >
                    <MapPin size={16} /> Need help? Find a Common Service Centre nearby.
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#003fb1]/95 z-[200] flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-md">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="mb-12 relative"><Search size={100} className="relative z-10" /></motion.div>
            <h2 className="text-5xl font-black mb-4 tracking-tighter">Analyzing 30+ Policies...</h2>
            <div className="mt-16 flex gap-4"><div className="w-3 h-3 rounded-full bg-white animate-bounce" style={{ animationDelay: '0s' }} /><div className="w-3 h-3 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
