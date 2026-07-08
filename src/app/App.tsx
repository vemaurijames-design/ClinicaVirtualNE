/**
 * CONSULTORIO HOLÍSTICO — Plataforma Digital de Tratamiento de Adicciones
 *
 * ═══ INTEGRACIÓN PASARELA DE PAGO (Guía para desarrollador Java) ══════════
 *
 * OPCIÓN 1 — WOMPI (Colombia / Bancolombia)  ← Recomendado para Colombia
 *   1. Registrarse en https://wompi.co y obtener llaves sandbox/producción
 *   2. Agregar variable: VITE_WOMPI_PUBLIC_KEY=pub_test_xxxxxx
 *   3. En PaymentModal submit(), reemplazar el setTimeout por:
 *      const res = await fetch("https://api.wompi.co/v1/transactions", {
 *        method: "POST", headers: { Authorization: `Bearer ${key}` },
 *        body: JSON.stringify({ amount_in_cents: price*100, currency:"COP", ... })
 *      })
 *
 * OPCIÓN 2 — STRIPE (Internacional)
 *   1. pnpm add @stripe/stripe-js @stripe/react-stripe-js
 *   2. Agregar: VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
 *   3. Envolver PaymentModal con <Elements stripe={loadStripe(key)}>
 *   4. Usar <CardElement> en lugar del input manual de tarjeta
 *
 * OPCIÓN 3 — PAYU (Colombia + Latam)
 *   Integrar via iframe: https://developers.payulatam.com/latam/
 *
 * BACKEND JAVA (Spring Boot / Quarkus):
 *   POST /api/auth/register    { name, email, password }     → { token, user }
 *   POST /api/auth/login       { email, password }           → { token, user }
 *   POST /api/historia         { userId, answers }           → { historiaId }
 *   POST /api/diagnostico/ia   { historiaId, answers }       → DiagnosisResult
 *   GET  /api/programas                                      → Program[]
 *   POST /api/pagos            { programId, userId, amount } → { confirmId }
 *   GET  /api/audios           { userId }                    → Audio[]
 *   POST /api/sesiones/grupo   { userId, week, mode }        → { meetingLink }
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation } from "react-router";
import {
  ClipboardList, Send, CheckCircle, Circle, AlertTriangle, ChevronRight,
  LogOut, Brain, Heart, Shield, Clock, ArrowRight, Phone, Mail,
  CreditCard, Lock, Check, Printer, Loader2, Pill, Users,
  Calendar, Activity, Award, Eye, EyeOff, Stethoscope, MessageSquare,
  ShoppingCart, X, Sparkles, Play, Pause, Mic, Headphones, Globe,
  Video, MapPin, Gift, Zap, Star, Volume2, Music, Leaf, ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import doctorPhoto from "@/imports/image.png";

// ═══════════════════════════════════════════════════════
// TRANSLATIONS (ES / EN / FR / DE)
// ═══════════════════════════════════════════════════════

type Lang = "es" | "en" | "fr" | "de";

const T = {
  es: {
    clinicName: "Consultorio Holístico",
    tagline: "Medicina del alma, ciencia del cambio.",
    heroTitle: "Recupera tu vida.\nEmpieza hoy.",
    heroSub: "Centro especializado en tratamiento holístico de adicciones. Psiquiatría, psicología, hipnosis clínica y medicina integrativa.",
    navServices: "Servicios", navHowWorks: "Cómo funciona", navTeam: "Equipo", navContact: "Contacto",
    startBtn: "Comenzar evaluación gratuita", howWorks: "Cómo funciona",
    ourPrograms: "Nuestros Programas", programsSub: "Tratamiento intensivo y progresivo para tu recuperación completa.",
    month1: "Mes 1 — Programa Intensivo", month2: "Mes 2 — Consolidación",
    audioLib: "Biblioteca de Audios", audioSub: "Autohipnosis, música binaural y podcasts terapéuticos con la voz del médico.",
    groupMeetings: "Reuniones Grupales", groupSub: "Semana 1 y Semana 3 de cada mes. Modalidad virtual o presencial.",
    gift: "🎁 Regalo de bienvenida:", giftDesc: "Video de autohipnosis + música binaural (voz del Dr.) en su primera sesión.",
    login: "Iniciar sesión", register: "Registrarse", myPanel: "Mi Panel",
    autohipnosis: "Autohipnosis", binaural: "Música Binaural", podcasts: "Podcasts",
    free: "Gratis", premium: "Premium", locked: "Requiere plan activo",
    virtual: "Virtual", presencial: "Presencial",
    paySecure: "Pago Seguro", total: "Total a pagar", payBtn: "Pagar",
    successTitle: "¡Pago exitoso!", successSub: "Un especialista le contactará en 24 horas.",
    confirmNum: "Número de confirmación",
  },
  en: {
    clinicName: "Holistic Clinic",
    tagline: "Medicine for the soul, science of change.",
    heroTitle: "Reclaim your life.\nStart today.",
    heroSub: "Specialized center for holistic addiction treatment. Psychiatry, psychology, clinical hypnosis and integrative medicine.",
    navServices: "Services", navHowWorks: "How it works", navTeam: "Team", navContact: "Contact",
    startBtn: "Start free assessment", howWorks: "How it works",
    ourPrograms: "Our Programs", programsSub: "Intensive and progressive treatment for your complete recovery.",
    month1: "Month 1 — Intensive Program", month2: "Month 2 — Consolidation",
    audioLib: "Audio Library", audioSub: "Self-hypnosis, binaural music and therapeutic podcasts with the doctor's voice.",
    groupMeetings: "Group Meetings", groupSub: "Week 1 and Week 3 of each month. Virtual or in-person.",
    gift: "🎁 Welcome gift:", giftDesc: "Self-hypnosis video + binaural music (Dr.'s voice) in your first session.",
    login: "Sign in", register: "Sign up", myPanel: "My Dashboard",
    autohipnosis: "Self-Hypnosis", binaural: "Binaural Music", podcasts: "Podcasts",
    free: "Free", premium: "Premium", locked: "Requires active plan",
    virtual: "Virtual", presencial: "In-person",
    paySecure: "Secure Payment", total: "Total to pay", payBtn: "Pay",
    successTitle: "Payment successful!", successSub: "A specialist will contact you within 24 hours.",
    confirmNum: "Confirmation number",
  },
  fr: {
    clinicName: "Clinique Holistique",
    tagline: "Médecine de l'âme, science du changement.",
    heroTitle: "Reprenez votre vie.\nCommencez aujourd'hui.",
    heroSub: "Centre spécialisé en traitement holistique des addictions. Psychiatrie, psychologie, hypnose clinique et médecine intégrative.",
    navServices: "Services", navHowWorks: "Comment ça marche", navTeam: "Équipe", navContact: "Contact",
    startBtn: "Commencer l'évaluation gratuite", howWorks: "Comment ça marche",
    ourPrograms: "Nos Programmes", programsSub: "Traitement intensif et progressif pour votre rétablissement complet.",
    month1: "Mois 1 — Programme Intensif", month2: "Mois 2 — Consolidation",
    audioLib: "Bibliothèque Audio", audioSub: "Auto-hypnose, musique binaurale et podcasts thérapeutiques avec la voix du médecin.",
    groupMeetings: "Réunions de Groupe", groupSub: "Semaine 1 et Semaine 3 de chaque mois. Virtuel ou présentiel.",
    gift: "🎁 Cadeau de bienvenue :", giftDesc: "Vidéo d'auto-hypnose + musique binaurale (voix du Dr.) lors de votre première séance.",
    login: "Se connecter", register: "S'inscrire", myPanel: "Mon tableau de bord",
    autohipnosis: "Auto-hypnose", binaural: "Musique Binaurale", podcasts: "Podcasts",
    free: "Gratuit", premium: "Premium", locked: "Nécessite un plan actif",
    virtual: "Virtuel", presencial: "Présentiel",
    paySecure: "Paiement Sécurisé", total: "Total à payer", payBtn: "Payer",
    successTitle: "Paiement réussi !", successSub: "Un spécialiste vous contactera dans les 24 heures.",
    confirmNum: "Numéro de confirmation",
  },
  de: {
    clinicName: "Ganzheitliche Klinik",
    tagline: "Medizin für die Seele, Wissenschaft der Veränderung.",
    heroTitle: "Holen Sie sich Ihr Leben zurück.\nFangen Sie heute an.",
    heroSub: "Spezialisiertes Zentrum für ganzheitliche Suchtbehandlung. Psychiatrie, Psychologie, klinische Hypnose und integrative Medizin.",
    navServices: "Dienste", navHowWorks: "Wie es funktioniert", navTeam: "Team", navContact: "Kontakt",
    startBtn: "Kostenlose Bewertung starten", howWorks: "Wie es funktioniert",
    ourPrograms: "Unsere Programme", programsSub: "Intensiv- und progressives Behandlungsprogramm für Ihre vollständige Genesung.",
    month1: "Monat 1 — Intensivprogramm", month2: "Monat 2 — Konsolidierung",
    audioLib: "Audio-Bibliothek", audioSub: "Selbsthypnose, binaurale Musik und therapeutische Podcasts mit der Stimme des Arztes.",
    groupMeetings: "Gruppentreffen", groupSub: "Woche 1 und Woche 3 jedes Monats. Virtuell oder persönlich.",
    gift: "🎁 Willkommensgeschenk:", giftDesc: "Selbsthypnose-Video + binaurale Musik (Dr.-Stimme) bei Ihrer ersten Sitzung.",
    login: "Anmelden", register: "Registrieren", myPanel: "Mein Dashboard",
    autohipnosis: "Selbsthypnose", binaural: "Binaurale Musik", podcasts: "Podcasts",
    free: "Kostenlos", premium: "Premium", locked: "Erfordert aktiven Plan",
    virtual: "Virtuell", presencial: "Persönlich",
    paySecure: "Sichere Zahlung", total: "Zu zahlender Betrag", payBtn: "Zahlen",
    successTitle: "Zahlung erfolgreich!", successSub: "Ein Spezialist meldet sich innerhalb von 24 Stunden.",
    confirmNum: "Bestätigungsnummer",
  },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof T["es"]) => string }>({
  lang: "es", setLang: () => {}, t: (k) => T.es[k],
});
const useLang = () => useContext(LangContext);

function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");
  const t = (k: keyof typeof T["es"]) => T[lang][k] || T.es[k];
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

// ═══════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════

interface AuthUser { id: string; name: string; email: string }
interface AuthCtx { user: AuthUser | null; login: (e: string, p: string) => Promise<boolean>; register: (n: string, e: string, p: string) => Promise<boolean>; logout: () => void }
const AuthContext = createContext<AuthCtx>({} as AuthCtx);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("ch_user") || "null"); } catch { return null; }
  });
  const login = async (email: string, pass: string) => {
    const users: any[] = JSON.parse(localStorage.getItem("ch_users") || "[]");
    const found = users.find(u => u.email === email && u.password === pass);
    if (found) { const u = { id: found.id, name: found.name, email: found.email }; setUser(u); localStorage.setItem("ch_user", JSON.stringify(u)); return true; }
    return false;
  };
  const register = async (name: string, email: string, pass: string) => {
    const users: any[] = JSON.parse(localStorage.getItem("ch_users") || "[]");
    if (users.find(u => u.email === email)) return false;
    const nu = { id: Date.now().toString(), name, email, password: pass };
    users.push(nu); localStorage.setItem("ch_users", JSON.stringify(users));
    const u = { id: nu.id, name, email }; setUser(u); localStorage.setItem("ch_user", JSON.stringify(u)); return true;
  };
  const logout = () => { setUser(null); localStorage.removeItem("ch_user"); };
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

// ═══════════════════════════════════════════════════════
// PROGRAMS DATA
// ═══════════════════════════════════════════════════════

const PROGRAMS = [
  {
    id: "mes1", nameKey: "month1" as const, price: 3200000, originalPrice: 4100000,
    duration: "30 días", highlight: true, tag: "Más completo",
    sessions: [
      { name: "Consultas Psiquiatría", count: 2, icon: Brain, note: "IA + médico" },
      { name: "Sesiones Psicología", count: 6, icon: MessageSquare, note: "Individual" },
      { name: "Hipnosis Clínica", count: 4, icon: Sparkles, note: "Con el Dr." },
      { name: "Auriculoterapia Láser", count: 4, icon: Zap, note: "Anti-craving" },
      { name: "Yoga & Mindfulness", count: 4, icon: Leaf, note: "Virtual" },
      { name: "Reuniones Grupales", count: 2, icon: Users, note: "Sem. 1 y 3" },
    ],
    includes: [
      "🎁 Video autohipnosis + música binaural (regalo bienvenida)",
      "Evaluación psiquiátrica y toxicológica con IA",
      "Historia clínica digital completa",
      "Suero terapia con audio binaural",
      "Biblioteca premium de audios ilimitada",
      "Soporte por WhatsApp",
    ],
  },
  {
    id: "mes2", nameKey: "month2" as const, price: 1800000, originalPrice: 2400000,
    duration: "30 días", highlight: false, tag: "Continuidad",
    sessions: [
      { name: "Videos Autohipnosis", count: 6, icon: Video, note: "Nuevos c/mes" },
      { name: "Sesiones Psicología", count: 4, icon: MessageSquare, note: "Individual" },
      { name: "Yoga & Mindfulness", count: 2, icon: Leaf, note: "Virtual" },
      { name: "Reuniones Grupales", count: 2, icon: Users, note: "Sem. 1 y 3" },
    ],
    includes: [
      "6 videos de autohipnosis personalizados (nuevos cada mes)",
      "Música binaural con voz del médico",
      "Continuidad de historia clínica",
      "Podcasts semanales terapéuticos",
      "Biblioteca de audios ampliada",
    ],
  },
];

// ═══════════════════════════════════════════════════════
// AUDIO LIBRARY
// ═══════════════════════════════════════════════════════

const AUDIOS = [
  { id: 1, cat: "autohipnosis", title: "Inducción profunda para la calma", duration: "22:14", free: true, doctor: true, desc: "Sesión guiada por el Dr. para reducción del craving" },
  { id: 2, cat: "autohipnosis", title: "Reprogramación de hábitos", duration: "18:30", free: false, doctor: true, desc: "Técnica de visualización y sugestión positiva" },
  { id: 3, cat: "autohipnosis", title: "Liberación del estrés y ansiedad", duration: "25:00", free: false, doctor: true, desc: "Hipnosis clínica para manejo de la abstinencia" },
  { id: 4, cat: "autohipnosis", title: "Autoimagen positiva y autoestima", duration: "19:45", free: false, doctor: true, desc: "Reconstrucción del autoconcepto en recuperación" },
  { id: 5, cat: "binaural", title: "Ondas Alpha — Reducción del craving", duration: "40:00", free: true, doctor: false, desc: "Frecuencias 8-12 Hz para calma profunda" },
  { id: 6, cat: "binaural", title: "Ondas Theta — Meditación profunda", duration: "45:00", free: false, doctor: false, desc: "4-8 Hz para estados meditativos y sanación" },
  { id: 7, cat: "binaural", title: "Suero terapia — Audio de acompañamiento", duration: "60:00", free: false, doctor: true, desc: "Música binaural + voz del médico para sesiones de suero" },
  { id: 8, cat: "binaural", title: "Ondas Delta — Sueño reparador", duration: "50:00", free: false, doctor: false, desc: "0.5-4 Hz para sueño profundo y regeneración" },
  { id: 9, cat: "podcasts", title: "Ep.1: El camino hacia la recuperación", duration: "35:45", free: true, doctor: true, desc: "El Dr. explica el proceso holístico de sanación" },
  { id: 10, cat: "podcasts", title: "Ep.2: Neurociencia y adicción", duration: "28:20", free: false, doctor: true, desc: "Cómo el cerebro se recupera del consumo" },
  { id: 11, cat: "podcasts", title: "Ep.3: Yoga, mente y adicción", duration: "32:10", free: false, doctor: false, desc: "Entrevista con terapeuta de yoga especializada" },
  { id: 12, cat: "podcasts", title: "Ep.4: Familias en la recuperación", duration: "41:00", free: false, doctor: false, desc: "Cómo involucrar a la familia en el proceso" },
];

// ═══════════════════════════════════════════════════════
// CHATBOT DATA
// ═══════════════════════════════════════════════════════

const SECTIONS = [
  { id: "identificacion", label: "Datos de Identificación" },
  { id: "motivo", label: "Motivo de Consulta" },
  { id: "consumo", label: "Historia de Consumo" },
  { id: "psiquiatrico", label: "Antecedentes Psiquiátricos" },
  { id: "medico", label: "Antecedentes Médicos" },
  { id: "social", label: "Situación Social" },
  { id: "cierre", label: "Cierre" },
];
type QType = "text" | "number" | "choice" | "multiselect" | "scale" | "textarea";
interface Q { id: string; section: string; text: string; type: QType; options?: string[]; placeholder?: string }

const QUESTIONS: Q[] = [
  { id: "nombre", section: "identificacion", type: "text", placeholder: "Nombre completo",
    text: "Buenos días. Soy el asistente clínico del Consultorio Holístico.\n\nEsta conversación es confidencial y sus respuestas formarán parte de su expediente médico.\n\n¿Cuál es su nombre completo?" },
  { id: "edad", section: "identificacion", type: "number", placeholder: "Edad en años", text: "¿Cuántos años tiene?" },
  { id: "estado_civil", section: "identificacion", type: "choice", text: "¿Cuál es su estado civil?",
    options: ["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Separado/a", "Viudo/a"] },
  { id: "escolaridad", section: "identificacion", type: "choice", text: "¿Cuál es su nivel de escolaridad?",
    options: ["Sin escolaridad formal", "Primaria", "Secundaria", "Bachillerato", "Técnico", "Licenciatura", "Posgrado"] },
  { id: "ocupacion", section: "identificacion", type: "text", placeholder: "Ej. Empleado, estudiante...", text: "¿Cuál es su ocupación actual?" },
  { id: "motivo_consulta", section: "motivo", type: "textarea", placeholder: "Cuéntenos su situación...",
    text: "¿Qué le trajo a esta consulta hoy? Descríbalo con sus propias palabras." },
  { id: "quien_sugirio", section: "motivo", type: "choice", text: "¿Quién le motivó a buscar atención?",
    options: ["Decisión propia", "Familiar o pareja", "Amigo/a", "Médico", "Autoridad judicial", "Otro"] },
  { id: "sustancias", section: "consumo", type: "multiselect", text: "¿Qué sustancias ha consumido alguna vez? Seleccione todas las que apliquen.",
    options: ["Alcohol", "Tabaco", "Marihuana/Cannabis", "Cocaína/Crack", "Heroína/Opioides",
      "Benzodiacepinas (sin prescripción)", "Anfetaminas", "Inhalantes", "Alucinógenos", "Otras"] },
  { id: "edad_inicio", section: "consumo", type: "number", placeholder: "Edad", text: "¿A qué edad probó alguna sustancia por primera vez?" },
  { id: "sustancia_principal", section: "consumo", type: "text", placeholder: "Ej. Alcohol, cocaína...", text: "¿Cuál es su sustancia principal de consumo?" },
  { id: "frecuencia", section: "consumo", type: "choice", text: "¿Con qué frecuencia consume actualmente?",
    options: ["Diariamente", "Varios días a la semana", "1–2 veces por semana", "Ocasionalmente", "No consumo actualmente"] },
  { id: "ultimo_consumo", section: "consumo", type: "text", placeholder: "Ej. Ayer, hace 3 días...", text: "¿Cuándo fue la última vez que consumió?" },
  { id: "craving", section: "consumo", type: "scale", text: "Escala del 1 al 10: ¿qué tan fuerte es su deseo de consumir ahora?\n\n1 = Ningún deseo · 10 = Deseo muy intenso" },
  { id: "intentos_abandono", section: "consumo", type: "choice", text: "¿Ha intentado dejar de consumir anteriormente?",
    options: ["Sí, varias veces", "Sí, una vez", "No, nunca"] },
  { id: "abstinencia", section: "consumo", type: "choice", text: "¿Ha presentado síntomas de abstinencia al dejar de consumir?",
    options: ["Sí, síntomas severos", "Sí, síntomas leves", "No", "No lo sé"] },
  { id: "atencion_previa", section: "psiquiatrico", type: "choice", text: "¿Ha recibido atención psiquiátrica o psicológica?",
    options: ["Sí, actualmente", "Sí, en el pasado", "No, nunca"] },
  { id: "diagnosticos", section: "psiquiatrico", type: "multiselect", text: "¿Le han diagnosticado alguna de estas condiciones?",
    options: ["Depresión", "Ansiedad", "Trastorno bipolar", "Psicosis/Esquizofrenia", "TDAH", "Trastorno de personalidad", "TEPT", "Ninguno", "Prefiero no responder"] },
  { id: "medicacion", section: "psiquiatrico", type: "choice", text: "¿Toma medicamentos recetados para su salud mental?",
    options: ["Sí, con regularidad", "Sí, irregularmente", "No"] },
  { id: "ideacion", section: "psiquiatrico", type: "choice", text: "Pregunta importante para su seguridad.\n\n¿Ha tenido pensamientos de hacerse daño o quitarse la vida?",
    options: ["No, nunca", "En el pasado, no actualmente", "Actualmente tengo esos pensamientos"] },
  { id: "enfermedades", section: "medico", type: "textarea", placeholder: "Describa o escriba \"Ninguna\"...",
    text: "¿Tiene alguna enfermedad médica diagnosticada? (diabetes, hepatitis, VIH, etc.)" },
  { id: "antecedentes_familiares", section: "medico", type: "choice", text: "¿Hay historial de adicciones o enfermedades mentales en su familia?",
    options: ["Sí, en varios familiares", "Sí, en algún familiar", "No que yo sepa", "No lo sé"] },
  { id: "vivienda", section: "social", type: "choice", text: "¿Con quién vive actualmente?",
    options: ["Solo/a", "Con pareja", "Con familia", "Con amigos", "En institución", "Sin hogar fijo"] },
  { id: "apoyo_social", section: "social", type: "choice", text: "¿Cuenta con apoyo familiar o social para su tratamiento?",
    options: ["Sí, amplio apoyo", "Sí, apoyo limitado", "No tengo apoyo", "Mi familia no sabe"] },
  { id: "estresores", section: "social", type: "multiselect", text: "¿Está enfrentando alguna de estas situaciones? Seleccione todas las que apliquen.",
    options: ["Problemas económicos", "Problemas legales", "Violencia doméstica", "Desempleo", "Duelo/pérdida reciente", "Inestabilidad vivienda", "Ninguna"] },
  { id: "informacion_adicional", section: "cierre", type: "textarea", placeholder: "Información adicional o escriba \"No\"...",
    text: "Hemos completado la evaluación. Gracias por su confianza.\n\n¿Hay algo más que el equipo clínico deba saber sobre usted?" },
];

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}
function formatTs(ts: number) {
  return new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
function getAck(q: Q, answer: string | string[]): string | null {
  const val = Array.isArray(answer) ? answer.join(", ") : answer;
  if (q.id === "nombre") return `Gracias, ${val.split(" ")[0]}. Sus respuestas están protegidas bajo secreto médico.`;
  if (q.id === "motivo_consulta") return "Gracias por compartir eso. Dar este paso requiere valentía.";
  if (q.id === "ideacion" && val.includes("Actualmente"))
    return "⚠️ Gracias por confiar en nosotros. Un médico revisará esto con prioridad.\n\nLínea de la Vida: 800-911-2000 · Emergencias: 911";
  if (q.id === "craving") return `Nivel de craving registrado: ${val}/10.`;
  if (q.id === "informacion_adicional") return null;
  const acks = ["Anotado.", "Registrado.", "Entendido.", "Comprendido.", "Gracias."];
  return acks[q.id.length % acks.length];
}

async function callGemini(answers: Record<string, string>, apiKey: string): Promise<any> {
  const f = (id: string) => answers[id] || "No respondido";
  const prompt = `Eres un especialista en psiquiatría de adicciones y medicina holística. Analiza esta historia clínica y responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown.

HISTORIA CLÍNICA: Nombre: ${f("nombre")} | Edad: ${f("edad")} | Estado civil: ${f("estado_civil")} | Ocupación: ${f("ocupacion")} | Motivo: ${f("motivo_consulta")} | Sustancias: ${f("sustancias")} | Inicio: ${f("edad_inicio")} años | Principal: ${f("sustancia_principal")} | Frecuencia: ${f("frecuencia")} | Último consumo: ${f("ultimo_consumo")} | Craving: ${f("craving")}/10 | Abstinencia: ${f("abstinencia")} | Psiquiatría previa: ${f("atencion_previa")} | Diagnósticos: ${f("diagnosticos")} | Medicación: ${f("medicacion")} | Ideación: ${f("ideacion")} | Enfermedades: ${f("enfermedades")} | Familia: ${f("antecedentes_familiares")} | Vivienda: ${f("vivienda")} | Apoyo: ${f("apoyo_social")} | Estresores: ${f("estresores")}

JSON requerido: {"resumen":"3-4 oraciones del caso","nivel_riesgo":"BAJO|MEDIO|ALTO|CRÍTICO","nivel_riesgo_justificacion":"justificación breve","diagnosticos":[{"codigo":"F10.2","nombre":"nombre","descripcion":"desc breve"}],"especialistas":[{"especialidad":"nombre","prioridad":"URGENTE|PRIORITARIO|RECOMENDADO","razon":"razón"}],"recomendaciones_inmediatas":["rec1","rec2","rec3"],"plan_tratamiento":{"primera_linea":"tratamiento principal","segunda_linea":"complementario","seguimiento":"plan seguimiento"},"programa_recomendado":"mes1|mes2","toxicologia":"evaluación toxicológica breve"}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(text.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
}

// ═══════════════════════════════════════════════════════
// LANG SWITCHER (shared dropdown)
// ═══════════════════════════════════════════════════════

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const langs: { code: Lang; flag: string; label: string }[] = [
    { code: "es", flag: "🇨🇴", label: "Español" }, { code: "en", flag: "🇺🇸", label: "English" },
    { code: "fr", flag: "🇫🇷", label: "Français" }, { code: "de", flag: "🇩🇪", label: "Deutsch" },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors border border-border">
        <Globe className="w-3.5 h-3.5" />
        <span className="uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{lang}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-36 z-50">
          {langs.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              className={clsx("flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted transition-colors", lang === l.code ? "text-primary" : "text-muted-foreground")}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════

function NavBar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (!user || ["/", "/auth"].includes(location.pathname)) return null;

  const links = [
    { to: "/historia", label: "Historia Clínica", icon: ClipboardList },
    { to: "/diagnostico", label: "Diagnóstico IA", icon: Brain },
    { to: "/tratamientos", label: "Programas", icon: Pill },
    { to: "/audios", label: "Audios", icon: Headphones },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/historia" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">{t("clinicName")}</span>
        </Link>
        <div className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
              location.pathname === l.to ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <l.icon className="w-3.5 h-3.5" />{l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <span className="hidden md:block text-xs text-muted-foreground">{user.name.split(" ")[0]}</span>
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
          <button className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted" onClick={() => setOpen(!open)}>
            {open ? <X className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border px-4 py-2 bg-card space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", location.pathname === l.to ? "bg-primary/15 text-primary" : "text-muted-foreground")}>
              <l.icon className="w-4 h-4" />{l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 1 — LANDING
// ═══════════════════════════════════════════════════════

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();

  const services = [
    { icon: Brain, title: "Atención Psiquiátrica con IA", desc: "Evaluación y diagnóstico psiquiátrico potenciado por inteligencia artificial, validado por médico especialista." },
    { icon: Activity, title: "Atención Toxicológica", desc: "Evaluación toxicológica completa del perfil de consumo. Análisis de sustancias, riesgo y protocolo de desintoxicación." },
    { icon: Sparkles, title: "Hipnosis Clínica", desc: "Sesiones de hipnosis clínica certificada con el médico director para reprogramación de hábitos y reducción del craving." },
    { icon: Zap, title: "Auriculoterapia con Láser", desc: "Técnica de neuromodulación con puntos auriculares y láser de baja frecuencia para control de la ansiedad." },
    { icon: Leaf, title: "Yoga & Mindfulness", desc: "Sesiones virtuales de yoga terapéutico y meditación mindfulness adaptadas para personas en recuperación." },
    { icon: Headphones, title: "Audioterapia Holística", desc: "Música binaural, podcast terapéutico y autohipnosis con la voz del médico. Suero terapia con audio." },
  ];

  const steps = [
    { n: "01", icon: ClipboardList, title: "Completa tu historia clínica", desc: "20 minutos de evaluación guiada con nuestro asistente virtual. Totalmente confidencial." },
    { n: "02", icon: Brain, title: "Diagnóstico con IA Gemini", desc: "Inteligencia artificial analiza tu historia y genera diagnóstico psiquiátrico y toxicológico detallado." },
    { n: "03", icon: ShoppingCart, title: "Elige tu programa", desc: "Selecciona el Mes 1 intensivo o Mes 2 de consolidación y comienza hoy mismo." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{t("clinicName")}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{t("tagline")}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#servicios" className="hover:text-foreground transition-colors">{t("navServices")}</a>
            <a href="#programas" className="hover:text-foreground transition-colors">{t("ourPrograms")}</a>
            <a href="#equipo" className="hover:text-foreground transition-colors">{t("navTeam")}</a>
            <a href="#contacto" className="hover:text-foreground transition-colors">{t("navContact")}</a>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {user ? (
              <button onClick={() => navigate("/historia")} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">{t("myPanel")}</button>
            ) : (
              <button onClick={() => navigate("/auth")} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">{t("register")}</button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-indigo-900/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary mb-6" style={{ fontFamily: "'DM Mono', monospace" }}>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Medicina Holística · Psiquiatría · IA Terapéutica
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-5">
                {t("heroTitle").split("\n")[0]}<br />
                <span className="text-primary">{t("heroTitle").split("\n")[1]}</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-7 max-w-lg">{t("heroSub")}</p>
              {/* Gift badge */}
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 mb-7">
                <Gift className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">{t("gift")}</p>
                  <p className="text-xs text-amber-300/70 mt-0.5">{t("giftDesc")}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate("/auth")} className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  {t("startBtn")} <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#programas" className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                  Ver programas
                </a>
              </div>
            </div>
            {/* Doctor photo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-72 md:w-80 h-96 rounded-2xl overflow-hidden border border-border">
                  <ImageWithFallback src={doctorPhoto} alt="Director Médico — Consultorio Holístico" className="w-full h-full object-cover object-top" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-3">
                  <p className="text-sm font-semibold">Dr. Nicolás — Director Médico</p>
                  <p className="text-xs text-muted-foreground">Psiquiatría · Medicina Holística · Hipnosis Clínica</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                    <span className="text-[10px] text-muted-foreground ml-1" style={{ fontFamily: "'DM Mono', monospace" }}>4.9 · 15 años exp.</span>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-primary/15 border border-primary/30 rounded-xl px-3 py-2 text-center shadow-lg">
                  <p className="text-lg font-bold text-primary">2,400+</p>
                  <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>Pacientes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["2,400+", "Pacientes"], ["15 años", "Experiencia"], ["98%", "Satisfacción"], ["4 Idiomas", "ES · EN · FR · DE"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-xl font-semibold text-primary">{n}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Servicios holísticos</p>
          <h2 className="text-3xl font-semibold text-center mb-12">Atención integral mente, cuerpo y espíritu</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.title} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-medium mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programas" className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Tratamiento progresivo</p>
          <h2 className="text-3xl font-semibold text-center mb-3">{t("ourPrograms")}</h2>
          <p className="text-muted-foreground text-sm text-center mb-12">{t("programsSub")}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {PROGRAMS.map(prog => (
              <div key={prog.id} className={clsx("bg-card border rounded-2xl p-6 relative overflow-hidden", prog.highlight ? "border-primary/40" : "border-border")}>
                {prog.highlight && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={clsx("text-[10px] font-medium px-2 py-1 rounded-full", prog.highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")} style={{ fontFamily: "'DM Mono', monospace" }}>{prog.tag}</span>
                    <h3 className="font-semibold mt-1">{t(prog.nameKey)}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground line-through">{formatCOP(prog.originalPrice)}</p>
                    <p className="text-xl font-bold text-primary">{formatCOP(prog.price)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {prog.sessions.map(s => (
                    <div key={s.name} className="flex items-center gap-2 bg-muted/40 rounded-xl p-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <s.icon className="w-3 h-3 text-primary" />
                      </div>
                      <div><p className="text-[10px] font-semibold">{s.count}× {s.name}</p><p className="text-[9px] text-muted-foreground">{s.note}</p></div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/auth")} className={clsx("w-full py-2.5 rounded-xl text-sm font-medium transition-colors",
                  prog.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-muted")}>
                  Seleccionar programa
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>El proceso</p>
          <h2 className="text-3xl font-semibold text-center mb-14">Tres pasos hacia tu recuperación</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-[10px] text-primary/60 mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>{s.n}</p>
                <h3 className="font-medium mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Group meetings */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Comunidad y apoyo</p>
          <h2 className="text-2xl font-semibold text-center mb-3">{t("groupMeetings")}</h2>
          <p className="text-muted-foreground text-sm text-center mb-8">{t("groupSub")}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { week: "Semana 1", title: "Sesión de Inicio y Bienvenida", desc: "Presentación grupal, metas y conexión entre pares. El Dr. facilita la sesión.", day: "Lunes · 7:00 PM" },
              { week: "Semana 3", title: "Sesión de Progreso y Ajuste", desc: "Revisión de avances, ajuste de estrategias y refuerzo motivacional.", day: "Lunes · 7:00 PM" },
            ].map(m => (
              <div key={m.week} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-2.5 py-1 rounded-full" style={{ fontFamily: "'DM Mono', monospace" }}>{m.week}</span>
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{m.day}</span>
                </div>
                <h3 className="text-sm font-medium mb-1">{m.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{m.desc}</p>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full"><Video className="w-3 h-3" />{t("virtual")} (Zoom)</span>
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full"><MapPin className="w-3 h-3" />{t("presencial")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audio preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Audioterapia holística</p>
          <h2 className="text-2xl font-semibold text-center mb-3">{t("audioLib")}</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">{t("audioSub")}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {AUDIOS.filter(a => a.free).map(a => (
              <div key={a.id} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  {a.cat === "autohipnosis" ? <Mic className="w-4 h-4 text-purple-400" /> : a.cat === "binaural" ? <Music className="w-4 h-4 text-blue-400" /> : <Headphones className="w-4 h-4 text-amber-400" />}
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{a.duration}</span>
                  <span className="ml-auto text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full">{t("free")}</span>
                </div>
                <p className="text-sm font-medium mb-1">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
                {a.doctor && <p className="text-[10px] text-primary/70 mt-2">🎙️ Voz del Dr. Nicolás</p>}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button onClick={() => navigate("/auth")} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Ver biblioteca completa <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-card border border-primary/20 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
          <Gift className="w-10 h-10 text-amber-400 mx-auto mb-4 relative" />
          <h2 className="text-2xl font-semibold mb-3 relative">Primera sesión con regalo incluido</h2>
          <p className="text-muted-foreground text-sm mb-8 relative">{t("giftDesc")}</p>
          <button onClick={() => navigate("/auth")} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors relative">
            {t("startBtn")} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t border-border py-12 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3"><Leaf className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">{t("clinicName")}</span></div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("tagline")}<br />Certificado ante el Ministerio de Salud.</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Servicios</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {["Historia clínica digital", "Diagnóstico IA", "Hipnosis clínica", "Auriculoterapia Láser", "Yoga & Mindfulness", "Audioterapia"].map(s => (
                <li key={s} className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-primary/50" />{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Contacto</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary/70" />800-HOLISTIC</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-primary/70" />info@consultorioholistico.co</li>
              <li className="flex items-center gap-2 text-amber-400/80"><AlertTriangle className="w-3.5 h-3.5" />Crisis: 800-911-2000</li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-2 text-[10px] text-muted-foreground/40" style={{ fontFamily: "'DM Mono', monospace" }}>
          <span>© 2025 Consultorio Holístico IPS · Todos los derechos reservados</span>
          <span>Información confidencial · Secreto médico</span>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 2 — AUTH
// ═══════════════════════════════════════════════════════

function AuthPage() {
  const { login, register, user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (user) navigate("/historia"); }, [user]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "login") { const ok = await login(email, pass); if (!ok) setError("Correo o contraseña incorrectos."); }
      else { if (!name.trim()) { setError("Ingrese su nombre."); return; } const ok = await register(name, email, pass); if (!ok) setError("Este correo ya está registrado."); }
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
        <Link to="/" className="relative flex items-center gap-2.5"><Leaf className="w-5 h-5 text-primary" /><span className="font-semibold">{t("clinicName")}</span></Link>
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border mb-5">
            <ImageWithFallback src={doctorPhoto} alt="Dr. Nicolás" className="w-full h-full object-cover object-top" />
          </div>
          <blockquote className="text-xl font-light text-foreground/90 leading-relaxed mb-4">"El primer paso hacia la recuperación es pedir ayuda. Hoy usted ya lo está haciendo."</blockquote>
          <p className="text-sm text-muted-foreground">Dr. Nicolás · Director Médico</p>
          <div className="flex gap-1 mt-2">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}</div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-muted-foreground/60" style={{ fontFamily: "'DM Mono', monospace" }}><Lock className="w-3.5 h-3.5" /> Cifrado · Secreto médico garantizado</div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8"><Leaf className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">{t("clinicName")}</span></Link>
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} className={clsx("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                {m === "login" ? t("login") : t("register")}
              </button>
            ))}
          </div>
          <h1 className="text-xl font-semibold mb-6">{mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta gratuita"}</h1>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (<div><label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>NOMBRE COMPLETO</label><input value={name} onChange={e => setName(e.target.value)} placeholder="María González" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40" /></div>)}
            <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>CORREO</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40" /></div>
            <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>CONTRASEÑA</label>
              <div className="relative"><input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required className="w-full bg-muted border border-border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}{mode === "login" ? t("login") : t("register")}
            </button>
          </form>
          {mode === "register" && (
            <div className="mt-5 flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
              <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80">Al registrarse hoy recibe gratis: video de autohipnosis + música binaural del Dr.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 3 — CHATBOT
// ═══════════════════════════════════════════════════════

interface Msg { id: string; role: "bot" | "user"; content: string; ts: number; isWarning?: boolean }

function HistoriaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [qIdx, setQIdx] = useState(0);
  const [text, setText] = useState(""); const [selected, setSelected] = useState<string[]>([]); const [scaleVal, setScaleVal] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentQ = QUESTIONS[qIdx];

  useEffect(() => {
    const greeting = user ? `Hola, ${user.name.split(" ")[0]}. ` : "";
    setMsgs([{ id: "init", role: "bot", ts: Date.now(), content: greeting + QUESTIONS[0].text }]);
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, isTyping]);
  useEffect(() => { setText(""); setSelected([]); setScaleVal(null); }, [qIdx]);

  function addMsg(m: Omit<Msg, "id">) { setMsgs(p => [...p, { ...m, id: `${m.role}-${Date.now()}-${Math.random()}` }]); }

  function submitAnswer(answer: string | string[]) {
    if (!answer || (Array.isArray(answer) && answer.length === 0)) return;
    const q = QUESTIONS[qIdx];
    addMsg({ role: "user", content: Array.isArray(answer) ? answer.join(", ") : answer, ts: Date.now() });
    const newAnswers = new Map(answers).set(q.id, answer);
    setAnswers(newAnswers); setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const ack = getAck(q, answer); const isLast = qIdx === QUESTIONS.length - 1;
      const isRisk = q.id === "ideacion" && (Array.isArray(answer) ? answer[0] : answer).includes("Actualmente");
      if (ack) addMsg({ role: "bot", content: ack, ts: Date.now(), isWarning: isRisk });
      if (isLast) {
        const flat: Record<string, string> = {};
        newAnswers.forEach((v, k) => { flat[k] = Array.isArray(v) ? v.join(", ") : v; });
        localStorage.setItem("ch_answers", JSON.stringify(flat));
        setTimeout(() => { addMsg({ role: "bot", ts: Date.now(), content: "✓ Evaluación completada. Redirigiendo al análisis diagnóstico con IA..." }); setTimeout(() => navigate("/diagnostico"), 1500); }, 600);
        return;
      }
      setTimeout(() => {
        const nextQ = QUESTIONS[qIdx + 1]; const sectionChanged = nextQ.section !== q.section;
        const sectionLabel = sectionChanged ? SECTIONS.find(s => s.id === nextQ.section)?.label : null;
        addMsg({ role: "bot", ts: Date.now(), content: sectionLabel ? `— ${sectionLabel} —\n\n${nextQ.text}` : nextQ.text });
        setQIdx(p => p + 1);
      }, ack ? 400 : 150);
    }, 700 + Math.random() * 400);
  }

  function handleSend() {
    if (!currentQ) return;
    if (["text", "textarea", "number"].includes(currentQ.type)) { if (text.trim()) submitAnswer(text.trim()); }
    else if (currentQ.type === "scale") { if (scaleVal !== null) submitAnswer(String(scaleVal)); }
    else if (currentQ.type === "multiselect") { if (selected.length > 0) submitAnswer(selected); }
  }

  const completedSections = new Set<string>();
  for (const q of QUESTIONS.slice(0, qIdx)) completedSections.add(q.section);

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-1 min-h-0">
        <aside className="hidden md:flex flex-col w-52 border-r border-border bg-card shrink-0">
          <div className="px-4 py-4 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>Historia Clínica</p>
          </div>
          <nav className="flex-1 py-2 overflow-y-auto">
            {SECTIONS.map(sec => {
              const done = completedSections.has(sec.id); const curr = sec.id === currentQ?.section;
              const qs = QUESTIONS.filter(q => q.section === sec.id); const answered = qs.filter(q => answers.has(q.id)).length;
              return (
                <div key={sec.id} className={clsx("flex items-start gap-2 px-4 py-2.5 transition-colors", curr && "bg-primary/10")}>
                  <div className="mt-0.5 shrink-0">{done ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Circle className={clsx("w-3.5 h-3.5", curr ? "text-primary" : "text-border")} />}</div>
                  <div><p className={clsx("text-xs leading-tight", curr ? "text-foreground font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/50")}>{sec.label}</p>
                    {curr && <p className="text-[10px] text-primary/60 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{answered}/{qs.length}</p>}</div>
                </div>
              );
            })}
          </nav>
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40" style={{ fontFamily: "'DM Mono', monospace" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />Conversación cifrada
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-border shrink-0">
                <ImageWithFallback src={doctorPhoto} alt="Dr." className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <h1 className="text-sm font-medium">Historia Clínica · Consultorio Holístico</h1>
                <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {SECTIONS.find(s => s.id === currentQ?.section)?.label}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground/50" style={{ fontFamily: "'DM Mono', monospace" }}>{qIdx + 1}/{QUESTIONS.length}</span>
          </header>
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 space-y-4">
            {msgs.map(m => <ChatBubble key={m.id} msg={m} />)}
            {isTyping && <TypingDots />}
            <div ref={bottomRef} />
          </div>
          {currentQ && !isTyping && (
            <ChatInput q={currentQ} text={text} setText={setText} selected={selected}
              toggleOption={(o: string) => setSelected(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o])}
              scaleVal={scaleVal} setScaleVal={setScaleVal} onSend={handleSend} onChoice={(o: string) => submitAnswer(o)} />
          )}
        </main>
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: Msg }) {
  const isBot = msg.role === "bot";
  return (
    <div className={clsx("flex gap-3 items-end", !isBot && "flex-row-reverse")}>
      {isBot && <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/25 shrink-0 mb-5">
        <ImageWithFallback src={doctorPhoto} alt="Dr." className="w-full h-full object-cover object-top" />
      </div>}
      <div className="max-w-[72%] md:max-w-[60%]">
        <div className={clsx("rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isBot ? msg.isWarning ? "bg-amber-950/60 border border-amber-500/35 text-amber-100 rounded-bl-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm"
            : "bg-primary/15 border border-primary/25 text-foreground rounded-br-sm")}>
          {msg.isWarning && <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-amber-500/20"><AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" /><span className="text-[10px] text-amber-400 uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>Alerta de riesgo</span></div>}
          {msg.content.startsWith("— ") ? (<><p className="text-[10px] text-primary/60 uppercase tracking-widest mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>{msg.content.split("\n\n")[0].replace(/^— |—$/g, "")}</p><span>{msg.content.split("\n\n").slice(1).join("\n\n")}</span></>) : msg.content}
        </div>
        <p className={clsx("text-[10px] text-muted-foreground/40 mt-1", !isBot && "text-right")} style={{ fontFamily: "'DM Mono', monospace" }}>{formatTs(msg.ts)}</p>
      </div>
    </div>
  );
}
function TypingDots() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/25 shrink-0">
        <ImageWithFallback src={doctorPhoto} alt="Dr." className="w-full h-full object-cover object-top" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3.5">
        <div className="flex gap-1.5">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{animationDelay:`${i*0.18}s`}}/>)}</div>
      </div>
    </div>
  );
}
function ChatInput({ q, text, setText, selected, toggleOption, scaleVal, setScaleVal, onSend, onChoice }: any) {
  return (
    <div className="border-t border-border bg-card/70 px-4 md:px-8 py-4 shrink-0">
      {q.type==="choice"&&<div className="flex flex-wrap gap-2">{q.options?.map((o:string)=><button key={o} onClick={()=>onChoice(o)} className="px-3.5 py-2 rounded-xl text-sm border border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:bg-primary/8 hover:text-foreground transition-all">{o}</button>)}</div>}
      {q.type==="multiselect"&&<div><div className="flex flex-wrap gap-2 mb-3">{q.options?.map((o:string)=><button key={o} onClick={()=>toggleOption(o)} className={clsx("px-3.5 py-1.5 rounded-xl text-sm border transition-all",selected.includes(o)?"border-primary bg-primary/15 text-primary":"border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground")}>{o}</button>)}</div><button onClick={onSend} disabled={selected.length===0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"><Send className="w-3.5 h-3.5"/>Confirmar ({selected.length})</button></div>}
      {q.type==="scale"&&<div><div className="flex gap-1.5 flex-wrap mb-3">{Array.from({length:10},(_,i)=>i+1).map(n=>{const base=n<=3?"border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20":n<=6?"border-amber-500/30 text-amber-400 hover:bg-amber-500/20":"border-red-500/30 text-red-400 hover:bg-red-500/20";const active=n<=3?"bg-emerald-500/30 border-emerald-400 text-emerald-300":n<=6?"bg-amber-500/30 border-amber-400 text-amber-300":"bg-red-500/30 border-red-400 text-red-300";return<button key={n} onClick={()=>setScaleVal(n)} className={clsx("w-10 h-10 rounded-xl border text-sm font-medium transition-all",scaleVal===n?active:`bg-background/60 ${base}`)} style={{fontFamily:"'DM Mono',monospace"}}>{n}</button>})}</div>{scaleVal!==null&&<button onClick={onSend} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"><Send className="w-3.5 h-3.5"/>Confirmar {scaleVal}/10</button>}</div>}
      {["text","textarea","number"].includes(q.type)&&<div className="flex gap-2.5 items-end">{q.type==="textarea"?<textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder={q.placeholder} onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey){e.preventDefault();onSend();}}} rows={3} className="flex-1 bg-background/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all min-h-[80px] max-h-[140px]" style={{fontFamily:"'DM Sans',sans-serif"}}/>:<input autoFocus type={q.type==="number"?"number":"text"} value={text} onChange={e=>setText(e.target.value)} placeholder={q.placeholder} min={q.type==="number"?0:undefined} onKeyDown={e=>{if(e.key==="Enter")onSend();}} className="flex-1 bg-background/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" style={{fontFamily:"'DM Sans',sans-serif"}}/>}<button onClick={onSend} disabled={!text.trim()} className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-colors"><Send className="w-4 h-4"/></button></div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 4 — DIAGNÓSTICO GEMINI
// ═══════════════════════════════════════════════════════

function DiagnosisPage() {
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || ""); const [keyInput, setKeyInput] = useState("");
  const answers: Record<string, string> = JSON.parse(localStorage.getItem("ch_answers") || "{}");
  const hasAnswers = Object.keys(answers).length > 0;
  const riskColors: Record<string, string> = { BAJO: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", MEDIO: "text-amber-400 bg-amber-500/10 border-amber-500/25", ALTO: "text-orange-400 bg-orange-500/10 border-orange-500/25", CRÍTICO: "text-red-400 bg-red-500/10 border-red-500/25" };
  const prioColors: Record<string, string> = { URGENTE: "text-red-400 bg-red-500/10", PRIORITARIO: "text-amber-400 bg-amber-500/10", RECOMENDADO: "text-teal-400 bg-teal-500/10" };

  async function runDiagnosis(key: string) {
    setLoading(true); setError("");
    try { const result = await callGemini(answers, key); setDiagnosis(result); setApiKey(key); }
    catch (e: any) { setError(e.message || "Error con Gemini. Verifique su API key."); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (hasAnswers && apiKey) runDiagnosis(apiKey); else if (!apiKey) setLoading(false); }, []);

  if (!hasAnswers) return <div className="flex items-center justify-center min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}><div className="text-center max-w-sm"><ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4"/><h2 className="font-medium mb-2">Sin historia clínica</h2><p className="text-sm text-muted-foreground mb-6">Complete primero la evaluación clínica.</p><button onClick={()=>navigate("/historia")} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Ir a evaluación</button></div></div>;
  if (!apiKey && !loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-7">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4"><Sparkles className="w-5 h-5 text-primary"/></div>
        <h2 className="font-semibold mb-1">API Key de Gemini (Gratis)</h2>
        <p className="text-sm text-muted-foreground mb-4">Ingrese su API key de Google Gemini para generar el diagnóstico con IA.</p>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline block mb-4">→ Obtener API key gratuita en Google AI Studio</a>
        <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} placeholder="AIza..." className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"/>
        {error&&<p className="text-xs text-destructive mb-3">{error}</p>}
        <button onClick={()=>{if(keyInput.trim())runDiagnosis(keyInput.trim());}} disabled={!keyInput.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40">Generar diagnóstico</button>
      </div>
    </div>
  );
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}><div className="text-center"><div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5"><Loader2 className="w-7 h-7 text-primary animate-spin"/></div><h2 className="font-medium mb-2">Analizando historia clínica</h2><p className="text-sm text-muted-foreground">Gemini AI · Evaluación psiquiátrica + toxicológica...</p></div></div>;
  if (error) return <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}><div className="text-center max-w-sm"><AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4"/><h2 className="font-medium mb-2">Error</h2><p className="text-sm text-muted-foreground mb-6">{error}</p><button onClick={()=>{setApiKey("");setError("");setLoading(false);}} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Reintentar</button></div></div>;

  const riskClass = riskColors[diagnosis?.nivel_riesgo] || riskColors["MEDIO"];
  const recommendedProgram = PROGRAMS.find(p => p.id === diagnosis?.programa_recomendado) || PROGRAMS[0];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Diagnóstico IA · Gemini · Consultorio Holístico</p>
            <h1 className="text-xl font-semibold">Resultado de Evaluación</h1>
            <p className="text-sm text-muted-foreground mt-1">Paciente: {answers.nombre} · {answers.edad} años</p>
          </div>
          <button onClick={()=>window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"><Printer className="w-3.5 h-3.5"/>Imprimir</button>
        </div>
        {diagnosis?.nivel_riesgo==="CRÍTICO"&&<div className="flex items-start gap-3 bg-red-950/40 border border-red-500/30 rounded-xl p-4"><AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5"/><div><p className="text-sm font-medium text-red-300 mb-1">Riesgo Crítico — Atención inmediata</p><p className="text-xs text-red-300/70">Línea de la Vida: 800-911-2000 · Emergencias: 911</p></div></div>}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3"><h2 className="text-sm font-medium">Resumen Clínico</h2><span className={clsx("text-[10px] font-medium px-2.5 py-1 rounded-full border",riskClass)} style={{fontFamily:"'DM Mono',monospace"}}>Riesgo {diagnosis?.nivel_riesgo}</span></div>
          <p className="text-sm text-muted-foreground leading-relaxed">{diagnosis?.resumen}</p>
          {diagnosis?.toxicologia&&<div className="mt-3 pt-3 border-t border-border"><p className="text-[10px] text-primary/70 uppercase tracking-widest mb-1" style={{fontFamily:"'DM Mono',monospace"}}>Evaluación Toxicológica</p><p className="text-xs text-muted-foreground">{diagnosis.toxicologia}</p></div>}
          {diagnosis?.nivel_riesgo_justificacion&&<p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border">{diagnosis.nivel_riesgo_justificacion}</p>}
        </div>
        {diagnosis?.diagnosticos?.length>0&&<div className="bg-card border border-border rounded-2xl overflow-hidden"><div className="px-5 py-3 border-b border-border"><p className="text-xs font-medium uppercase tracking-wider" style={{fontFamily:"'DM Mono',monospace"}}>Diagnósticos (DSM-5 / CIE-10)</p></div><div className="p-5 space-y-3">{diagnosis.diagnosticos.map((d:any,i:number)=><div key={i} className="flex gap-3"><span className="text-[10px] font-medium text-primary bg-primary/10 rounded-md px-2 py-1 h-fit mt-0.5 shrink-0" style={{fontFamily:"'DM Mono',monospace"}}>{d.codigo}</span><div><p className="text-sm font-medium">{d.nombre}</p><p className="text-xs text-muted-foreground mt-0.5">{d.descripcion}</p></div></div>)}</div></div>}
        {diagnosis?.especialistas?.length>0&&<div className="bg-card border border-border rounded-2xl overflow-hidden"><div className="px-5 py-3 border-b border-border"><p className="text-xs font-medium uppercase tracking-wider" style={{fontFamily:"'DM Mono',monospace"}}>Especialistas Recomendados</p></div><div className="p-5 space-y-3">{diagnosis.especialistas.map((s:any,i:number)=><div key={i} className="flex items-start gap-3"><span className={clsx("text-[10px] font-medium px-2 py-1 rounded-md shrink-0 mt-0.5",prioColors[s.prioridad]||prioColors["RECOMENDADO"])} style={{fontFamily:"'DM Mono',monospace"}}>{s.prioridad}</span><div><p className="text-sm font-medium">{s.especialidad}</p><p className="text-xs text-muted-foreground">{s.razon}</p></div></div>)}</div></div>}
        {diagnosis?.recomendaciones_inmediatas?.length>0&&<div className="bg-card border border-border rounded-2xl p-5"><p className="text-xs font-medium uppercase tracking-wider mb-3" style={{fontFamily:"'DM Mono',monospace"}}>Recomendaciones Inmediatas</p><ul className="space-y-2">{diagnosis.recomendaciones_inmediatas.map((r:string,i:number)=><li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5"/>{r}</li>)}</ul></div>}
        {diagnosis?.plan_tratamiento&&<div className="bg-card border border-border rounded-2xl overflow-hidden"><div className="px-5 py-3 border-b border-border"><p className="text-xs font-medium uppercase tracking-wider" style={{fontFamily:"'DM Mono',monospace"}}>Plan de Tratamiento Holístico</p></div><div className="p-5 grid md:grid-cols-3 gap-4">{[{label:"Primera línea",value:diagnosis.plan_tratamiento.primera_linea},{label:"Complementario",value:diagnosis.plan_tratamiento.segunda_linea},{label:"Seguimiento",value:diagnosis.plan_tratamiento.seguimiento}].map(item=><div key={item.label}><p className="text-[10px] text-primary/70 uppercase tracking-widest mb-1" style={{fontFamily:"'DM Mono',monospace"}}>{item.label}</p><p className="text-xs text-muted-foreground leading-relaxed">{item.value}</p></div>)}</div></div>}
        <div className="bg-card border border-primary/25 rounded-2xl p-5">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-2" style={{fontFamily:"'DM Mono',monospace"}}>Programa recomendado para usted</p>
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-medium">{recommendedProgram.tag}</h3><p className="text-xs text-muted-foreground mt-0.5">{recommendedProgram.sessions.length} tipos de terapias · {recommendedProgram.duration}</p></div>
            <p className="text-xl font-bold text-primary">{formatCOP(recommendedProgram.price)}</p>
          </div>
          <button onClick={()=>navigate("/tratamientos")} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            Ver programas y pagar <ArrowRight className="w-4 h-4"/>
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/30 text-center pb-4" style={{fontFamily:"'DM Mono',monospace"}}>Diagnóstico generado por IA · Requiere validación médica · Documento confidencial</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 5 — PROGRAMAS Y PAGO
// ═══════════════════════════════════════════════════════

function TreatmentsPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [selectedProgram, setSelectedProgram] = useState<typeof PROGRAMS[0] | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Consultorio Holístico IPS</p>
          <h1 className="text-2xl font-semibold">{t("ourPrograms")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("programsSub")}</p>
        </div>

        {/* Payment API info banner */}
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-2.5">
            <CreditCard className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-300 mb-1">Integración Pasarela de Pago (modo demo activo)</p>
              <p className="text-xs text-blue-300/70 leading-relaxed">
                Para activar pagos reales añada la variable <code className="bg-blue-500/20 px-1 py-0.5 rounded text-[10px]">VITE_WOMPI_PUBLIC_KEY</code> (Wompi Colombia) o <code className="bg-blue-500/20 px-1 py-0.5 rounded text-[10px]">VITE_STRIPE_PUBLISHABLE_KEY</code> en el archivo .env. Ver comentario al inicio del código para instrucciones completas.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {PROGRAMS.map(prog => (
            <div key={prog.id} className={clsx("bg-card border rounded-2xl overflow-hidden relative", prog.highlight ? "border-primary/40" : "border-border")}>
              {prog.highlight && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx("text-[10px] font-medium px-2.5 py-1 rounded-full", prog.highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")} style={{ fontFamily: "'DM Mono', monospace" }}>{prog.tag}</span>
                      {prog.highlight && <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">⭐</span>}
                    </div>
                    <h3 className="font-semibold">{t(prog.nameKey)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{prog.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground line-through">{formatCOP(prog.originalPrice)}</p>
                    <p className="text-2xl font-bold text-primary">{formatCOP(prog.price)}</p>
                    <p className="text-[10px] text-emerald-400">Ahorras {formatCOP(prog.originalPrice - prog.price)}</p>
                  </div>
                </div>
                {prog.id === "mes1" && (
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300/80">{t("giftDesc")}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {prog.sessions.map(s => (
                    <div key={s.name} className="flex items-center gap-2 bg-muted/40 rounded-xl p-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><s.icon className="w-3.5 h-3.5 text-primary" /></div>
                      <div className="min-w-0"><p className="text-[10px] font-semibold">{s.count}×</p><p className="text-[10px] text-muted-foreground truncate">{s.name}</p></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 mb-4">{prog.includes.map(inc => <div key={inc} className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5"/>{inc}</div>)}</div>
                <div className="flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 mb-4">
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                  <div><p className="text-[10px] font-medium text-blue-300">Reuniones grupales incluidas</p><p className="text-[10px] text-blue-300/70">Semana 1 y Semana 3 · Virtual o presencial</p></div>
                </div>
                <button onClick={() => { setSelectedProgram(prog); setShowPayment(true); }}
                  className={clsx("w-full py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",
                    prog.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-muted")}>
                  <ShoppingCart className="w-4 h-4" /> Iniciar programa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium mb-4 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-primary" />Servicios adicionales</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { name: "Suero Terapia + Audio Binaural", price: 120000, desc: "Sesión de suero con música binaural y voz del médico", icon: Volume2 },
              { name: "Consulta Toxicológica IA", price: 80000, desc: "Evaluación toxicológica con análisis de IA y reporte médico", icon: Activity },
              { name: "Pack 6 Videos Autohipnosis", price: 200000, desc: "Pack mensual de 6 videos personalizados del Dr.", icon: Video },
            ].map(s => (
              <div key={s.name} className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><s.icon className="w-4 h-4 text-primary" /></div>
                <p className="text-sm font-medium mb-1">{s.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                <p className="text-sm font-semibold text-primary">{formatCOP(s.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showPayment && selectedProgram && (
        <PaymentModal program={selectedProgram} userName={user?.name || ""} onClose={() => setShowPayment(false)} t={t} />
      )}
    </div>
  );
}

function PaymentModal({ program, userName, onClose, t }: { program: typeof PROGRAMS[0]; userName: string; onClose: () => void; t: (k: any) => string }) {
  const [step, setStep] = useState<"form"|"processing"|"success">("form");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: userName });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const confirmId = `CH-${Date.now().toString(36).toUpperCase()}`;

  function fmtCard(v:string){return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();}
  function fmtExp(v:string){const d=v.replace(/\D/g,"").slice(0,4);return d.length>=2?`${d.slice(0,2)}/${d.slice(2)}`:d;}
  function validate(){const e:Record<string,string>={};if(card.number.replace(/\s/g,"").length<16)e.number="Número inválido";if(card.expiry.length<5)e.expiry="Fecha inválida";if(card.cvv.length<3)e.cvv="CVV inválido";if(!card.name.trim())e.name="Ingrese el nombre";setErrors(e);return Object.keys(e).length===0;}
  function submit(e:React.FormEvent){e.preventDefault();if(!validate())return;setStep("processing");
    // Aquí va la integración real: Wompi o Stripe
    // Wompi: fetch('https://api.wompi.co/v1/transactions', { method:'POST', ... })
    // Stripe: stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })
    setTimeout(()=>setStep("success"),2500);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden">
        {step==="success"?(
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4"><Check className="w-7 h-7 text-primary"/></div>
            <h2 className="font-semibold text-lg mb-2">{t("successTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-5">{t("successSub")}</p>
            <div className="bg-muted rounded-xl px-4 py-3 mb-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" style={{fontFamily:"'DM Mono',monospace"}}>{t("confirmNum")}</p><p className="text-base font-semibold text-primary" style={{fontFamily:"'DM Mono',monospace"}}>{confirmId}</p></div>
            {program.id==="mes1"&&<div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 text-left"><Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/><p className="text-xs text-amber-300/80">Su video de autohipnosis + música binaural del Dr. será enviado a su correo en las próximas 2 horas.</p></div>}
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Cerrar</button>
          </div>
        ):step==="processing"?(
          <div className="p-10 text-center"><Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4"/><p className="font-medium mb-1">Procesando pago...</p><p className="text-sm text-muted-foreground">Por favor no cierre esta ventana.</p></div>
        ):(
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div><h2 className="text-sm font-medium">{t("paySecure")}</h2><p className="text-xs text-muted-foreground">{t(program.nameKey)}</p></div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"><X className="w-4 h-4"/></button>
            </div>
            <div className="px-5 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">{t("total")}</p><p className="text-xl font-semibold">{formatCOP(program.price)}</p></div>
              <div className="text-right"><p className="text-xs text-muted-foreground">Ahorro</p><p className="text-sm font-medium text-emerald-400">{formatCOP(program.originalPrice-program.price)}</p></div>
            </div>
            <form onSubmit={submit} className="px-5 py-5 space-y-4">
              <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{fontFamily:"'DM Mono',monospace"}}>TITULAR</label><input value={card.name} onChange={e=>setCard(p=>({...p,name:e.target.value}))} placeholder="Nombre del titular" className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"/>{errors.name&&<p className="text-xs text-destructive mt-1">{errors.name}</p>}</div>
              <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{fontFamily:"'DM Mono',monospace"}}>NÚMERO DE TARJETA</label><div className="relative"><input value={card.number} onChange={e=>setCard(p=>({...p,number:fmtCard(e.target.value)}))} placeholder="0000 0000 0000 0000" maxLength={19} className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40" style={{fontFamily:"'DM Mono',monospace"}}/><CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40"/></div>{errors.number&&<p className="text-xs text-destructive mt-1">{errors.number}</p>}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{fontFamily:"'DM Mono',monospace"}}>VENCIMIENTO</label><input value={card.expiry} onChange={e=>setCard(p=>({...p,expiry:fmtExp(e.target.value)}))} placeholder="MM/AA" maxLength={5} className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40" style={{fontFamily:"'DM Mono',monospace"}}/>{errors.expiry&&<p className="text-xs text-destructive mt-1">{errors.expiry}</p>}</div>
                <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{fontFamily:"'DM Mono',monospace"}}>CVV</label><input value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))} placeholder="•••" type="password" maxLength={4} className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"/>{errors.cvv&&<p className="text-xs text-destructive mt-1">{errors.cvv}</p>}</div>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-2">
                <Lock className="w-4 h-4"/>{t("payBtn")} {formatCOP(program.price)}
              </button>
              <p className="text-[10px] text-muted-foreground/40 text-center" style={{fontFamily:"'DM Mono',monospace"}}>SSL · Wompi / Stripe ready · Consultorio Holístico IPS</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 6 — BIBLIOTECA DE AUDIOS
// ═══════════════════════════════════════════════════════

function AudioPage() {
  const { t } = useLang();
  const [activeCat, setActiveCat] = useState<"all"|"autohipnosis"|"binaural"|"podcasts">("all");
  const [playing, setPlaying] = useState<number|null>(null);
  const filtered = activeCat === "all" ? AUDIOS : AUDIOS.filter(a => a.cat === activeCat);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Audioterapia Holística</p>
          <h1 className="text-2xl font-semibold">{t("audioLib")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("audioSub")}</p>
        </div>

        {/* Suero terapia banner */}
        <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><Volume2 className="w-6 h-6 text-primary"/></div>
          <div className="flex-1">
            <p className="font-medium text-sm">Suero Terapia con Audio Binaural</p>
            <p className="text-xs text-muted-foreground">Audio especializado para acompañar sesiones de suero terapia. Voz del Dr. + música binaural theta (60 min).</p>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full shrink-0" style={{fontFamily:"'DM Mono',monospace"}}>Premium</span>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all","autohipnosis","binaural","podcasts"].map(cat=>(
            <button key={cat} onClick={()=>setActiveCat(cat as any)} className={clsx("px-4 py-2 rounded-xl text-sm border transition-all whitespace-nowrap",activeCat===cat?"border-primary bg-primary/15 text-primary":"border-border text-muted-foreground hover:border-primary/30 hover:text-foreground")}>
              {cat==="all"?"Todos":cat==="autohipnosis"?t("autohipnosis"):cat==="binaural"?t("binaural"):t("podcasts")}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(audio => {
            const isPlaying = playing === audio.id;
            const CatIcon = audio.cat==="autohipnosis"?Mic:audio.cat==="binaural"?Music:Headphones;
            const catColor = audio.cat==="autohipnosis"?"text-purple-400":audio.cat==="binaural"?"text-blue-400":"text-amber-400";
            return (
              <div key={audio.id} className={clsx("bg-card border rounded-2xl p-4 transition-all", isPlaying?"border-primary/40":"border-border hover:border-primary/20")}>
                <div className="flex items-start gap-3">
                  <button onClick={()=>setPlaying(isPlaying?null:audio.free?audio.id:null)}
                    className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",audio.free?"bg-primary/15 hover:bg-primary/25":"bg-muted cursor-not-allowed")}>
                    {!audio.free?<Lock className="w-4 h-4 text-muted-foreground/50"/>:isPlaying?<Pause className="w-4 h-4 text-primary"/>:<Play className="w-4 h-4 text-primary"/>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CatIcon className={clsx("w-3.5 h-3.5 shrink-0",catColor)}/>
                      <span className="text-[10px] text-muted-foreground uppercase" style={{fontFamily:"'DM Mono',monospace"}}>{audio.duration}</span>
                      <span className={clsx("ml-auto text-[10px] px-1.5 py-0.5 rounded-full border",audio.free?"bg-emerald-500/15 text-emerald-400 border-emerald-500/25":"bg-muted text-muted-foreground border-border")} style={{fontFamily:"'DM Mono',monospace"}}>
                        {audio.free?t("free"):t("premium")}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{audio.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{audio.desc}</p>
                    {audio.doctor&&<p className="text-[10px] text-primary/70 mt-1.5">🎙️ Voz del Dr. Nicolás</p>}
                  </div>
                </div>
                {isPlaying&&(
                  <div className="mt-3 flex items-center gap-0.5 h-6">
                    {Array.from({length:28},(_,i)=>(
                      <div key={i} className="bg-primary/60 rounded-full w-1 animate-pulse" style={{height:`${14+Math.sin(i*0.6)*10}px`,animationDelay:`${i*0.05}s`}}/>
                    ))}
                    <span className="ml-3 text-[10px] text-primary" style={{fontFamily:"'DM Mono',monospace"}}>REPRODUCIENDO</span>
                  </div>
                )}
                {!audio.free&&<p className="text-[10px] text-muted-foreground/40 mt-2">{t("locked")}</p>}
              </div>
            );
          })}
        </div>

        {/* Group meetings */}
        <div className="mt-10">
          <h2 className="font-medium mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary"/>{t("groupMeetings")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("groupSub")}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {week:"Semana 1",title:"Sesión de Inicio",desc:"Bienvenida, presentación grupal y establecimiento de metas terapéuticas.",day:"Lunes",hour:"7:00 PM COT"},
              {week:"Semana 3",title:"Sesión de Progreso",desc:"Revisión de avances, ajuste de estrategias y refuerzo motivacional.",day:"Lunes",hour:"7:00 PM COT"},
            ].map(m=>(
              <div key={m.week} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-2.5 py-1 rounded-full" style={{fontFamily:"'DM Mono',monospace"}}>{m.week}</span>
                  <span className="text-[10px] text-muted-foreground" style={{fontFamily:"'DM Mono',monospace"}}>{m.day} · {m.hour}</span>
                </div>
                <h3 className="text-sm font-medium mb-1">{m.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{m.desc}</p>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full"><Video className="w-3 h-3"/>{t("virtual")} (Zoom)</span>
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full"><MapPin className="w-3 h-3"/>{t("presencial")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APP ROUTER
// ═══════════════════════════════════════════════════════

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <NavBar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/historia" element={<PrivateRoute><HistoriaPage /></PrivateRoute>} />
              <Route path="/diagnostico" element={<PrivateRoute><DiagnosisPage /></PrivateRoute>} />
              <Route path="/tratamientos" element={<PrivateRoute><TreatmentsPage /></PrivateRoute>} />
              <Route path="/audios" element={<PrivateRoute><AudioPage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
