/**
 * CONSULTORIO HOLÍSTICO — Plataforma Digital de Tratamiento de Adicciones
 *
 * ═══ INTEGRACIÓN PASARELA DE PAGO ═══════════════════════════════════════════
 * WOMPI (Colombia):  VITE_WOMPI_PUBLIC_KEY=pub_test_xxx  →  fetch('https://api.wompi.co/v1/transactions')
 * STRIPE (Intl):     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  →  stripe.confirmCardPayment()
 * PAYU (Latam):      iframe widget  →  https://developers.payulatam.com/latam/
 *
 * ═══ CÓMO AGREGAR AUDIOS REALES ══════════════════════════════════════════════
 * 1. Coloca tus archivos .mp3 en:  /public/audios/nombre-del-audio.mp3
 * 2. En el array AUDIOS abajo, agrega:  audioSrc: "/audios/nombre-del-audio.mp3"
 * 3. El reproductor HTML5 <audio> cargará el archivo automáticamente.
 * Nota: En producción usa una CDN (AWS S3, Cloudflare R2) para archivos grandes.
 *
 * ═══ CÓMO AGREGAR VIDEOS REALES ══════════════════════════════════════════════
 * 1. Coloca tus archivos .mp4 en:  /public/videos/nombre-del-video.mp4
 * 2. En el array VIDEOS abajo, agrega:  videoSrc: "/videos/nombre-del-video.mp4"
 * 3. El reproductor <video> cargará el archivo al hacer clic.
 * Nota: Para videos grandes usa YouTube embed o Vimeo (privado) para ahorro de ancho de banda.
 *
 * ═══ GEMINI LOCALMENTE (Backend proxy) ════════════════════════════════════════
 * OPCIÓN A — Solo frontend (actual, gratis):
 *   Agrega VITE_GEMINI_API_KEY=AIza... en tu archivo .env y listo.
 *
 * OPCIÓN B — Backend local Node.js (oculta la key):
 *   1. npm init -y && npm install express cors node-fetch
 *   2. server.js:
 *      const express = require('express'); const app = express();
 *      app.use(require('cors')()); app.use(express.json());
 *      app.post('/api/diagnostico/ia', async (req, res) => {
 *        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
 *          { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(req.body) });
 *        res.json(await r.json());
 *      });
 *      app.listen(3001);
 *   3. GEMINI_KEY=AIza... node server.js
 *   4. En .env del frontend: VITE_API_BASE=http://localhost:3001
 *   5. En callGemini(), cambia el fetch a: fetch(`${import.meta.env.VITE_API_BASE}/api/diagnostico/ia`, ...)
 *
 * OPCIÓN C — Spring Boot Java:
 *   @PostMapping("/api/diagnostico/ia")
 *   public ResponseEntity<String> diagnose(@RequestBody Map<String,Object> body) {
 *     RestTemplate rt = new RestTemplate();
 *     String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey;
 *     return rt.postForEntity(url, body, String.class);
 *   }
 *
 * ═══ CONTRASEÑA OLVIDADA ══════════════════════════════════════════════════════
 * En esta demo el token se muestra en pantalla (simula envío por email).
 * Para producción: conecta un servicio de email (SendGrid, AWS SES, Resend)
 * y envía el código al correo del usuario desde tu backend.
 *
 * ═══ BACKEND JAVA — Endpoints ════════════════════════════════════════════════
 * POST /api/auth/register        { name, email, password }       → { token, user }
 * POST /api/auth/login           { email, password }             → { token, user }
 * POST /api/auth/forgot-password { email }                       → { message }
 * POST /api/auth/reset-password  { token, newPassword }          → { message }
 * POST /api/historia             { userId, answers }             → { historiaId }
 * POST /api/diagnostico/ia       { historiaId, answers }         → DiagnosisResult
 * GET  /api/programas                                            → Program[]
 * POST /api/pagos                { programId, userId, amount }   → { confirmId }
 * GET  /api/audios               { userId }                      → Audio[]
 * GET  /api/videos               { userId }                      → Video[]
 * POST /api/sesiones/grupo       { userId, week, mode }          → { meetingLink }
 * ════════════════════════════════════════════════════════════════════════════
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
  KeyRound, RefreshCw, ExternalLink, Instagram, Facebook, Youtube, Twitter, User,
} from "lucide-react";
import clsx from "clsx";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import doctorPhoto from "@/imports/image-1.png";
import doctorHero from "@/imports/image-3.png";
import clinicLogo from "@/imports/image-2.png";
import clinicHeroBg from "@/imports/descarga.png";

// ═══════════════════════════════════════════════════════
// TRANSLATIONS (ES / EN / FR / DE) — Completo para toda la app
// ═══════════════════════════════════════════════════════

type Lang = "es" | "en" | "fr" | "de" | "pt";

const T = {
  es: {
    clinicName: "Clínica Virtual · Consultorio Holístico",
    tagline: "Centro Holístico de Bienestar",
    heroTitle: "Recupera tu vida.\nEmpieza hoy.",
    heroSub: "Centro especializado en tratamiento holístico de adicciones. Psiquiatría, psicología, hipnosis clínica y medicina integrativa.",
    navServices: "Servicios", navHowWorks: "Cómo funciona", navTeam: "Equipo", navContact: "Contacto",
    startBtn: "Comenzar evaluación gratuita", howWorks: "Cómo funciona",
    ourPrograms: "Nuestros Programas", programsSub: "Tratamiento intensivo y progresivo para tu recuperación completa.",
    month1: "Mes 1 — Programa Intensivo", month2: "Mes 2 — Profundización",
    month3: "Mes 3 — Consolidación", month4: "Mes 4 — Cierre & Bienestar",
    audioLib: "Biblioteca de Audios", audioSub: "Autohipnosis, música binaural y podcasts terapéuticos con la voz del médico.",
    videoLib: "Biblioteca de Videos", videoSub: "Sesiones grabadas de autohipnosis y yoga terapéutico.",
    groupMeetings: "Reuniones Grupales", groupSub: "Semana 1 y Semana 3 de cada mes. Modalidad virtual o presencial.",
    gift: "🎁 Regalo de bienvenida:", giftDesc: "Video de autohipnosis + música binaural (voz del Dr.) en su primera sesión.",
    login: "Iniciar sesión", register: "Registrarse", myPanel: "Mi Panel",
    autohipnosis: "Autohipnosis", binaural: "Música Binaural", podcasts: "Podcasts",
    free: "Gratis", premium: "Premium", locked: "Requiere plan activo",
    virtual: "Virtual", presencial: "Presencial",
    paySecure: "Pago Seguro", total: "Total a pagar", payBtn: "Pagar",
    successTitle: "¡Pago exitoso!", successSub: "Un especialista le contactará en 24 horas.",
    confirmNum: "Número de confirmación",
    forgotPass: "¿Olvidaste tu contraseña?", resetPassword: "Restablecer contraseña",
    sendCode: "Enviar código", enterCode: "Ingresar código", newPassword: "Nueva contraseña",
    backToLogin: "Volver al inicio de sesión", passwordChanged: "¡Contraseña restablecida!",
    passwordChangedSub: "Ya puede iniciar sesión con su nueva contraseña.",
    clinicalHistory: "Historia Clínica", aiDiagnosis: "Diagnóstico IA",
    programs: "Programas", audios: "Audios y Videos",
    watchVideo: "Ver video", playAudio: "Reproducir",
    footerPrivacy: "Política de privacidad", footerTerms: "Términos de uso",
    footerCert: "Certificado ante el Ministerio de Salud",
    footerServices: "Servicios", footerContact: "Contacto", footerLinks: "Accesos rápidos",
    footerCrisis: "Línea de crisis: 800-911-2000",
    allRights: "Todos los derechos reservados",
    includedInPlan: "Incluido en su plan:",
    videosInPlan: "Videos de autohipnosis incluidos:",
    audiosInPlan: "Audios incluidos:",
  },
  en: {
    clinicName: "Virtual Clinic · Holistic Clinic",
    tagline: "Holistic Wellness Center",
    heroTitle: "Reclaim your life.\nStart today.",
    heroSub: "Specialized center for holistic addiction treatment. Psychiatry, psychology, clinical hypnosis and integrative medicine.",
    navServices: "Services", navHowWorks: "How it works", navTeam: "Team", navContact: "Contact",
    startBtn: "Start free assessment", howWorks: "How it works",
    ourPrograms: "Our Programs", programsSub: "Intensive and progressive treatment for your complete recovery.",
    month1: "Month 1 — Intensive Program", month2: "Month 2 — Deepening",
    month3: "Month 3 — Consolidation", month4: "Month 4 — Closure & Wellness",
    audioLib: "Audio Library", audioSub: "Self-hypnosis, binaural music and therapeutic podcasts with the doctor's voice.",
    videoLib: "Video Library", videoSub: "Recorded sessions of self-hypnosis and therapeutic yoga.",
    groupMeetings: "Group Meetings", groupSub: "Week 1 and Week 3 of each month. Virtual or in-person.",
    gift: "🎁 Welcome gift:", giftDesc: "Self-hypnosis video + binaural music (Dr.'s voice) in your first session.",
    login: "Sign in", register: "Sign up", myPanel: "My Dashboard",
    autohipnosis: "Self-Hypnosis", binaural: "Binaural Music", podcasts: "Podcasts",
    free: "Free", premium: "Premium", locked: "Requires active plan",
    virtual: "Virtual", presencial: "In-person",
    paySecure: "Secure Payment", total: "Total to pay", payBtn: "Pay",
    successTitle: "Payment successful!", successSub: "A specialist will contact you within 24 hours.",
    confirmNum: "Confirmation number",
    forgotPass: "Forgot your password?", resetPassword: "Reset password",
    sendCode: "Send code", enterCode: "Enter code", newPassword: "New password",
    codeDemo: "Recovery code (simulated — in production it arrives by email):",
    backToLogin: "Back to sign in", passwordChanged: "Password reset!",
    passwordChangedSub: "You can now sign in with your new password.",
    clinicalHistory: "Clinical History", aiDiagnosis: "AI Diagnosis",
    programs: "Programs", audios: "Audios & Videos",
    watchVideo: "Watch video", playAudio: "Play",
    footerPrivacy: "Privacy policy", footerTerms: "Terms of use",
    footerCert: "Certified by the Ministry of Health",
    footerServices: "Services", footerContact: "Contact", footerLinks: "Quick links",
    footerCrisis: "Crisis line: 800-911-2000",
    allRights: "All rights reserved",
    includedInPlan: "Included in your plan:",
    videosInPlan: "Self-hypnosis videos included:",
    audiosInPlan: "Audios included:",
  },
  fr: {
    clinicName: "Clinique Virtuelle · Consultorio Holístico",
    tagline: "Centre Holistique de Bien-être",
    heroTitle: "Reprenez votre vie.\nCommencez aujourd'hui.",
    heroSub: "Centre spécialisé en traitement holistique des addictions. Psychiatrie, psychologie, hypnose clinique et médecine intégrative.",
    navServices: "Services", navHowWorks: "Comment ça marche", navTeam: "Équipe", navContact: "Contact",
    startBtn: "Commencer l'évaluation gratuite", howWorks: "Comment ça marche",
    ourPrograms: "Nos Programmes", programsSub: "Traitement intensif et progressif pour votre rétablissement complet.",
    month1: "Mois 1 — Programme Intensif", month2: "Mois 2 — Approfondissement",
    month3: "Mois 3 — Consolidation", month4: "Mois 4 — Clôture & Bien-être",
    audioLib: "Bibliothèque Audio", audioSub: "Auto-hypnose, musique binaurale et podcasts thérapeutiques avec la voix du médecin.",
    videoLib: "Bibliothèque Vidéo", videoSub: "Séances enregistrées d'auto-hypnose et de yoga thérapeutique.",
    groupMeetings: "Réunions de Groupe", groupSub: "Semaine 1 et Semaine 3 de chaque mois. Virtuel ou présentiel.",
    gift: "🎁 Cadeau de bienvenue :", giftDesc: "Vidéo d'auto-hypnose + musique binaurale (voix du Dr.) lors de votre première séance.",
    login: "Se connecter", register: "S'inscrire", myPanel: "Mon tableau de bord",
    autohipnosis: "Auto-hypnose", binaural: "Musique Binaurale", podcasts: "Podcasts",
    free: "Gratuit", premium: "Premium", locked: "Nécessite un plan actif",
    virtual: "Virtuel", presencial: "Présentiel",
    paySecure: "Paiement Sécurisé", total: "Total à payer", payBtn: "Payer",
    successTitle: "Paiement réussi !", successSub: "Un spécialiste vous contactera dans les 24 heures.",
    confirmNum: "Numéro de confirmation",
    forgotPass: "Mot de passe oublié ?", resetPassword: "Réinitialiser le mot de passe",
    sendCode: "Envoyer le code", enterCode: "Saisir le code", newPassword: "Nouveau mot de passe",
    codeDemo: "Code de récupération (simulé — en production il arrive par email) :",
    backToLogin: "Retour à la connexion", passwordChanged: "Mot de passe réinitialisé !",
    passwordChangedSub: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
    clinicalHistory: "Dossier Clinique", aiDiagnosis: "Diagnostic IA",
    programs: "Programmes", audios: "Audios & Vidéos",
    watchVideo: "Voir la vidéo", playAudio: "Écouter",
    footerPrivacy: "Politique de confidentialité", footerTerms: "Conditions d'utilisation",
    footerCert: "Certifié par le Ministère de la Santé",
    footerServices: "Services", footerContact: "Contact", footerLinks: "Accès rapides",
    footerCrisis: "Ligne de crise : 800-911-2000",
    allRights: "Tous droits réservés",
    includedInPlan: "Inclus dans votre plan :",
    videosInPlan: "Vidéos d'auto-hypnose incluses :",
    audiosInPlan: "Audios inclus :",
  },
  de: {
    clinicName: "Virtuelle Klinik · Ganzheitliche Klinik",
    tagline: "Ganzheitliches Wellness-Zentrum",
    heroTitle: "Holen Sie sich Ihr Leben zurück.\nFangen Sie heute an.",
    heroSub: "Spezialisiertes Zentrum für ganzheitliche Suchtbehandlung. Psychiatrie, Psychologie, klinische Hypnose und integrative Medizin.",
    navServices: "Dienste", navHowWorks: "Wie es funktioniert", navTeam: "Team", navContact: "Kontakt",
    startBtn: "Kostenlose Bewertung starten", howWorks: "Wie es funktioniert",
    ourPrograms: "Unsere Programme", programsSub: "Intensiv- und progressives Behandlungsprogramm für Ihre vollständige Genesung.",
    month1: "Monat 1 — Intensivprogramm", month2: "Monat 2 — Vertiefung",
    month3: "Monat 3 — Konsolidierung", month4: "Monat 4 — Abschluss & Wohlbefinden",
    audioLib: "Audio-Bibliothek", audioSub: "Selbsthypnose, binaurale Musik und therapeutische Podcasts mit der Stimme des Arztes.",
    videoLib: "Video-Bibliothek", videoSub: "Aufgezeichnete Sitzungen zur Selbsthypnose und therapeutischen Yoga.",
    groupMeetings: "Gruppentreffen", groupSub: "Woche 1 und Woche 3 jedes Monats. Virtuell oder persönlich.",
    gift: "🎁 Willkommensgeschenk:", giftDesc: "Selbsthypnose-Video + binaurale Musik (Dr.-Stimme) bei Ihrer ersten Sitzung.",
    login: "Anmelden", register: "Registrieren", myPanel: "Mein Dashboard",
    autohipnosis: "Selbsthypnose", binaural: "Binaurale Musik", podcasts: "Podcasts",
    free: "Kostenlos", premium: "Premium", locked: "Erfordert aktiven Plan",
    virtual: "Virtuell", presencial: "Persönlich",
    paySecure: "Sichere Zahlung", total: "Zu zahlender Betrag", payBtn: "Zahlen",
    successTitle: "Zahlung erfolgreich!", successSub: "Ein Spezialist meldet sich innerhalb von 24 Stunden.",
    confirmNum: "Bestätigungsnummer",
    forgotPass: "Passwort vergessen?", resetPassword: "Passwort zurücksetzen",
    sendCode: "Code senden", enterCode: "Code eingeben", newPassword: "Neues Passwort",
    codeDemo: "Wiederherstellungscode (simuliert — in der Produktion per E-Mail):",
    backToLogin: "Zurück zur Anmeldung", passwordChanged: "Passwort zurückgesetzt!",
    passwordChangedSub: "Sie können sich jetzt mit Ihrem neuen Passwort anmelden.",
    clinicalHistory: "Krankengeschichte", aiDiagnosis: "KI-Diagnose",
    programs: "Programme", audios: "Audios & Videos",
    watchVideo: "Video ansehen", playAudio: "Abspielen",
    footerPrivacy: "Datenschutzrichtlinie", footerTerms: "Nutzungsbedingungen",
    footerCert: "Zertifiziert vom Gesundheitsministerium",
    footerServices: "Dienste", footerContact: "Kontakt", footerLinks: "Schnellzugriff",
    footerCrisis: "Krisenhotline: 800-911-2000",
    allRights: "Alle Rechte vorbehalten",
    includedInPlan: "In Ihrem Plan enthalten:",
    videosInPlan: "Selbsthypnose-Videos enthalten:",
    audiosInPlan: "Audios enthalten:",
  },
  pt: {
    clinicName: "Clínica Virtual · Consultório Holístico",
    tagline: "Centro Holístico de Bem-estar",
    heroTitle: "Recupere sua vida.\nComece hoje.",
    heroSub: "Centro especializado em tratamento holístico de dependências. Psiquiatria, psicologia, hipnose clínica e medicina integrativa.",
    navServices: "Serviços", navHowWorks: "Como funciona", navTeam: "Equipe", navContact: "Contato",
    startBtn: "Iniciar avaliação gratuita", howWorks: "Como funciona",
    ourPrograms: "Nossos Programas", programsSub: "Tratamento intensivo e progressivo para sua recuperação completa.",
    month1: "Mês 1 — Programa Intensivo", month2: "Mês 2 — Aprofundamento",
    month3: "Mês 3 — Consolidação", month4: "Mês 4 — Encerramento & Bem-estar",
    audioLib: "Biblioteca de Áudios", audioSub: "Auto-hipnose, música binaural e podcasts terapêuticos com a voz do médico.",
    videoLib: "Biblioteca de Vídeos", videoSub: "Sessões gravadas de auto-hipnose e yoga terapêutico.",
    groupMeetings: "Reuniões em Grupo", groupSub: "Semana 1 e Semana 3 de cada mês. Modalidade virtual ou presencial.",
    gift: "🎁 Presente de boas-vindas:", giftDesc: "Vídeo de auto-hipnose + música binaural (voz do Dr.) na sua primeira sessão.",
    login: "Entrar", register: "Cadastrar-se", myPanel: "Meu Painel",
    autohipnosis: "Auto-hipnose", binaural: "Música Binaural", podcasts: "Podcasts",
    free: "Grátis", premium: "Premium", locked: "Requer plano ativo",
    virtual: "Virtual", presencial: "Presencial",
    paySecure: "Pagamento Seguro", total: "Total a pagar", payBtn: "Pagar",
    successTitle: "Pagamento realizado!", successSub: "Um especialista entrará em contato em 24 horas.",
    confirmNum: "Número de confirmação",
    forgotPass: "Esqueceu sua senha?", resetPassword: "Redefinir senha",
    sendCode: "Enviar código", enterCode: "Inserir código", newPassword: "Nova senha",
    codeDemo: "Código de recuperação (simulado — em produção chega por e-mail):",
    backToLogin: "Voltar ao login", passwordChanged: "Senha redefinida!",
    passwordChangedSub: "Agora você pode entrar com sua nova senha.",
    clinicalHistory: "Histórico Clínico", aiDiagnosis: "Diagnóstico IA",
    programs: "Programas", audios: "Áudios e Vídeos",
    watchVideo: "Ver vídeo", playAudio: "Reproduzir",
    footerPrivacy: "Política de privacidade", footerTerms: "Termos de uso",
    footerCert: "Certificado pelo Ministério da Saúde",
    footerServices: "Serviços", footerContact: "Contato", footerLinks: "Acesso rápido",
    footerCrisis: "Linha de crise: 800-911-2000",
    allRights: "Todos os direitos reservados",
    includedInPlan: "Incluído no seu plano:",
    videosInPlan: "Vídeos de auto-hipnose incluídos:",
    audiosInPlan: "Áudios incluídos:",
  },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof T["es"]) => string }>({
  lang: "es", setLang: () => {}, t: (k) => T.es[k],
});
const useLang = () => useContext(LangContext);

function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("ch_lang") as Lang) || "es";
  });
  const setLangAndSave = (l: Lang) => { setLang(l); localStorage.setItem("ch_lang", l); };
  const t = (k: keyof typeof T["es"]) => T[lang][k] || T.es[k];
  return <LangContext.Provider value={{ lang, setLang: setLangAndSave, t }}>{children}</LangContext.Provider>;
}

// ═══════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════

interface AuthUser { id: string; name: string; email: string; rol?: string }
interface AuthCtx {
  user: AuthUser | null;
  login: (e: string, p: string) => Promise<boolean>;
  register: (n: string, e: string, p: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<string | null>;
  resetPassword: (token: string, newPass: string) => Promise<boolean>;
}
const AuthContext = createContext<AuthCtx>({} as AuthCtx);
const useAuth = () => useContext(AuthContext);

// URL base del backend Java — usa variable de entorno o localhost por defecto
const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("ch_user") || "null"); } catch { return null; }
  });

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return false;
      const data = json.data;
      const u: AuthUser = { id: String(data.email), name: data.nombre, email: data.email, rol: data.rol || "PACIENTE" };
      // Guardar token JWT para llamadas futuras al backend
      localStorage.setItem("ch_jwt", data.token);
      localStorage.setItem("ch_user", JSON.stringify(u));
      setUser(u);
      return true;
    } catch {
      // Si el backend no está disponible, fallback a localStorage
      return loginLocal(email, pass);
    }
  };

  const loginLocal = (email: string, pass: string): boolean => {
    const emailNorm = email.trim().toLowerCase();
    const users: any[] = JSON.parse(localStorage.getItem("ch_users") || "[]");
    const found = users.find((u: any) => u.email.toLowerCase() === emailNorm && u.password === pass);
    if (found) {
      const u: AuthUser = { id: found.id, name: found.name, email: found.email };
      setUser(u);
      localStorage.setItem("ch_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: name.trim(), email: email.trim().toLowerCase(), password: pass }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return false;
      const data = json.data;
      const u: AuthUser = { id: String(data.email), name: data.nombre, email: data.email, rol: data.rol || "PACIENTE" };
      localStorage.setItem("ch_jwt", data.token);
      localStorage.setItem("ch_user", JSON.stringify(u));
      setUser(u);
      return true;
    } catch {
      // Si el backend no está disponible, fallback a localStorage
      return registerLocal(name, email, pass);
    }
  };

  const registerLocal = (name: string, email: string, pass: string): boolean => {
    const emailNorm = email.trim().toLowerCase();
    const users: any[] = JSON.parse(localStorage.getItem("ch_users") || "[]");
    if (users.find((u: any) => u.email.toLowerCase() === emailNorm)) return false;
    const nu = { id: Date.now().toString(), name: name.trim(), email: emailNorm, password: pass };
    users.push(nu);
    localStorage.setItem("ch_users", JSON.stringify(users));
    const u: AuthUser = { id: nu.id, name: nu.name, email: nu.email };
    setUser(u);
    localStorage.setItem("ch_user", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ch_user");
    localStorage.removeItem("ch_jwt");
  };

  const forgotPassword = async (email: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return null;
      // El backend retorna el token en modo demo
      return json.data?.token || "DEMO";
    } catch {
      // Fallback localStorage
      const users: any[] = JSON.parse(localStorage.getItem("ch_users") || "[]");
      const found = users.find((u: any) => u.email === email.trim().toLowerCase());
      if (!found) return null;
      const token = Math.random().toString(36).slice(2, 8).toUpperCase();
      const tokens: any[] = JSON.parse(localStorage.getItem("ch_reset_tokens") || "[]");
      const filtered = tokens.filter((t: any) => t.email !== email);
      filtered.push({ email, token, expires: Date.now() + 15 * 60 * 1000 });
      localStorage.setItem("ch_reset_tokens", JSON.stringify(filtered));
      return token;
    }
  };

  const resetPassword = async (token: string, newPass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nuevaPassword: newPass }),
      });
      const json = await res.json();
      return res.ok && json.success;
    } catch {
      // Fallback localStorage
      const tokens: any[] = JSON.parse(localStorage.getItem("ch_reset_tokens") || "[]");
      const entry = tokens.find((t: any) => t.token === token.toUpperCase() && t.expires > Date.now());
      if (!entry) return false;
      const users: any[] = JSON.parse(localStorage.getItem("ch_users") || "[]");
      const idx = users.findIndex((u: any) => u.email === entry.email);
      if (idx === -1) return false;
      users[idx].password = newPass;
      localStorage.setItem("ch_users", JSON.stringify(users));
      localStorage.setItem("ch_reset_tokens", JSON.stringify(tokens.filter((t: any) => t.token !== token.toUpperCase())));
      return true;
    }
  };

  return <AuthContext.Provider value={{ user, login, register, logout, forgotPassword, resetPassword }}>{children}</AuthContext.Provider>;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

// ═══════════════════════════════════════════════════════
// PROGRAMS DATA (con media incluida)
// ═══════════════════════════════════════════════════════

const PROGRAMS = [
  {
    id: "mes1", nameKey: "month1" as const, price: 3200000, originalPrice: 4100000,
    duration: "30 días", highlight: true, tag: "Inicio intensivo",
    description: "Programa de estabilización y evaluación integral. Ideal para iniciar el tratamiento con acompañamiento médico completo.",
    sessions: [
      { name: "Consultas Psiquiatría", count: 2, icon: Brain, note: "IA + médico" },
      { name: "Sesiones Psicología", count: 6, icon: MessageSquare, note: "Individual virtual" },
      { name: "Hipnosis Clínica", count: 4, icon: Sparkles, note: "Con el Dr. Escobar" },
      { name: "Auriculoterapia Láser", count: 4, icon: Zap, note: "Anti-craving" },
      { name: "Yoga & Mindfulness", count: 4, icon: Leaf, note: "Virtual" },
      { name: "Reuniones Grupales", count: 2, icon: Users, note: "Sem. 1 y 3" },
    ],
    includedAudioIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    includedVideoIds: [1, 2, 3, 4],
    includes: [
      "🎁 Video autohipnosis + música binaural (regalo bienvenida)",
      "Evaluación psiquiátrica y toxicológica con IA Gemini",
      "Historia clínica digital completa y consentimiento informado",
      "Biblioteca completa: 12 audios + 4 videos premium",
      "Soporte por WhatsApp directo con el equipo",
    ],
  },
  {
    id: "mes2", nameKey: "month2" as const, price: 2800000, originalPrice: 3600000,
    duration: "30 días", highlight: false, tag: "Profundización",
    description: "Consolidación del proceso terapéutico con enfoque en hábitos saludables y manejo de recaídas.",
    sessions: [
      { name: "Consultas Psiquiatría", count: 2, icon: Brain, note: "Seguimiento" },
      { name: "Hipnosis Clínica", count: 3, icon: Sparkles, note: "Con el Dr. Escobar" },
      { name: "Yoga & Mindfulness", count: 4, icon: Leaf, note: "Full virtual" },
      { name: "Psicología Virtual", count: 4, icon: MessageSquare, note: "Individual" },
      { name: "Auriculoterapia Punta Romana", count: 4, icon: Zap, note: "Anti-ansiedad" },
      { name: "Sesiones Grupales", count: 2, icon: Users, note: "Sem. 1 y 3" },
    ],
    includedAudioIds: [1, 2, 3, 5, 6, 7, 9, 10, 11, 12],
    includedVideoIds: [1, 2, 3, 4, 5, 6],
    includes: [
      "Diagnóstico actualizado + consentimiento informado",
      "Acceso al diagnóstico IA completo al momento del pago",
      "Biblioteca completa de audios y videos",
      "Soporte continuo por WhatsApp",
    ],
  },
  {
    id: "mes3", nameKey: "month3" as const, price: 2400000, originalPrice: 3200000,
    duration: "30 días", highlight: false, tag: "Consolidación",
    description: "Trabajo profundo en familia, manejo emocional avanzado y consolidación de la abstinencia.",
    sessions: [
      { name: "Hipnosis Clínica", count: 2, icon: Sparkles, note: "Con el Dr. Escobar" },
      { name: "Psicología Virtual", count: 4, icon: MessageSquare, note: "Individual + pareja" },
      { name: "Terapia Familiar", count: 1, icon: Users, note: "Sesión familiar virtual" },
      { name: "Sesiones Grupales", count: 2, icon: Users, note: "Sem. 1 y 3" },
      { name: "Yoga & Meditación Full", count: 4, icon: Leaf, note: "Completo virtual" },
    ],
    includedAudioIds: [1, 3, 5, 7, 9, 11, 12],
    includedVideoIds: [1, 3, 5, 6],
    includes: [
      "Terapia familiar incluida",
      "Plan de mantenimiento personalizado",
      "Herramientas para manejo de recaídas",
      "Biblioteca de audios y videos",
    ],
  },
  {
    id: "mes4", nameKey: "month4" as const, price: 2200000, originalPrice: 3000000,
    duration: "30 días", highlight: false, tag: "Cierre & Bienestar",
    description: "Integración holística completa: medicina alternativa, equilibrio energético y cierre del proceso de recuperación.",
    sessions: [
      { name: "Psicología Virtual", count: 2, icon: MessageSquare, note: "Individual" },
      { name: "Terapia Familiar", count: 1, icon: Users, note: "Sesión familiar virtual" },
      { name: "Hipnosis Clínica", count: 2, icon: Sparkles, note: "Con el Dr. Escobar" },
      { name: "Yoga & Meditación", count: 4, icon: Leaf, note: "Programa completo" },
      { name: "Medicina Holística", count: 1, icon: Heart, note: "Consulta integrativa" },
      { name: "Inmunoterapia / Equilibrio Energético", count: 1, icon: Zap, note: "Especialista" },
    ],
    includedAudioIds: [1, 5, 9, 11, 12],
    includedVideoIds: [1, 5, 6],
    includes: [
      "Consulta de medicina holística e inmunoterapia",
      "Plan de vida post-tratamiento",
      "Certificado de proceso terapéutico completado",
      "Acceso a meses 5 y 6 GRATIS al completar los 4 meses",
    ],
  },
];

// Meses 5 y 6 — GRATIS al pagar los 4 meses completos
const BONUS_MONTHS = {
  mes5: {
    tag: "Mes 5 — GRATIS",
    sessions: [
      { name: "Psicología Virtual", count: 1, icon: MessageSquare, note: "Mantenimiento" },
      { name: "Hipnosis Clínica", count: 1, icon: Sparkles, note: "Refuerzo" },
      { name: "Yoga & Meditación", count: 4, icon: Leaf, note: "Continúa" },
    ],
    note: "Incluido sin costo al completar los 4 meses del programa",
  },
  mes6: {
    tag: "Mes 6 — GRATIS",
    sessions: [
      { name: "Terapia Familiar", count: 1, icon: Users, note: "Cierre familiar" },
      { name: "Psicología Virtual", count: 1, icon: MessageSquare, note: "Seguimiento final" },
      { name: "Herramientas abstinencia", count: 1, icon: Shield, note: "Plan de vida" },
      { name: "Yoga & Meditación", count: 4, icon: Leaf, note: "Continúa libre" },
    ],
    note: "Incluido sin costo al completar los 4 meses del programa",
  },
};

// ═══════════════════════════════════════════════════════
// ACCESO POR PLAN
// free → cualquiera logueado
// plans → desbloquea desde ese mes en adelante
// ═══════════════════════════════════════════════════════

type PlanId = "mes1" | "mes2" | "mes3" | "mes4";

function puedeReproducir(
  item: { free: boolean; plans: PlanId[] },
  planActivo: PlanId | null
): boolean {
  if (item.free) return true;
  if (!planActivo) return false;
  return item.plans.includes(planActivo);
}

/** Lee plan guardado tras pago (ajusta la clave si ya usas otra) */
function getPlanActivo(): PlanId | null {
  const p = localStorage.getItem("ch_plan_activo");
  if (p === "mes1" || p === "mes2" || p === "mes3" || p === "mes4") return p;
  return null;
}

// ═══════════════════════════════════════════════════════
// AUDIO LIBRARY
// Archivos reales en: public/audios/nombre.mp3
// ═══════════════════════════════════════════════════════

interface AudioItem {
  id: number;
  cat: "autohipnosis" | "binaural" | "podcasts";
  title: string;
  duration: string;
  free: boolean;
  doctor: boolean;
  desc: string;
  plans: PlanId[];
  audioSrc?: string;
}

const AUDIOS: AudioItem[] = [
  // —— GRATIS ——
  {
    id: 1,
    cat: "autohipnosis",
    title: "Inducción profunda para la calma",
    duration: "22:14",
    free: true,
    doctor: true,
    desc: "Sesión guiada para reducción del craving. Regalo de bienvenida.",
    plans: [],
    audioSrc: "/audios/Meditacion-Sueroterapia.mp3",
  },
  {
    id: 5,
    cat: "binaural",
    title: "Ondas Alpha — Reducción del craving",
    duration: "40:00",
    free: true,
    doctor: false,
    desc: "Frecuencias 8–12 Hz para calma profunda.",
    plans: [],
    // audioSrc: "/audios/ondas-alpha.mp3",
  },
  {
    id: 9,
    cat: "podcasts",
    title: "Ep.1: El camino hacia la recuperación",
    duration: "35:45",
    free: true,
    doctor: true,
    desc: "Proceso holístico de sanación.",
    plans: [],
    // audioSrc: "/audios/podcast-ep1.mp3",
  },

  // —— MES 1 ——
  {
    id: 2,
    cat: "autohipnosis",
    title: "Reprogramación de hábitos",
    duration: "18:30",
    free: false,
    doctor: true,
    desc: "Visualización y sugestión positiva.",
    plans: ["mes1", "mes2", "mes3", "mes4"],
  },
  {
    id: 3,
    cat: "autohipnosis",
    title: "Liberación del estrés y ansiedad",
    duration: "25:00",
    free: false,
    doctor: true,
    desc: "Hipnosis clínica para manejo de la abstinencia.",
    plans: ["mes1", "mes2", "mes3", "mes4"],
  },
  {
    id: 7,
    cat: "binaural",
    title: "Suero terapia — Audio de acompañamiento",
    duration: "60:00",
    free: false,
    doctor: true,
    desc: "Música binaural + voz del médico.",
    plans: ["mes1", "mes2", "mes3", "mes4"],
  },

  // —— MES 2 ——
  {
    id: 4,
    cat: "autohipnosis",
    title: "Autoimagen positiva y autoestima",
    duration: "19:45",
    free: false,
    doctor: true,
    desc: "Reconstrucción del autoconcepto.",
    plans: ["mes2", "mes3", "mes4"],
  },
  {
    id: 6,
    cat: "binaural",
    title: "Ondas Theta — Meditación profunda",
    duration: "45:00",
    free: false,
    doctor: false,
    desc: "4–8 Hz para meditación y sanación.",
    plans: ["mes2", "mes3", "mes4"],
  },
  {
    id: 10,
    cat: "podcasts",
    title: "Ep.2: Neurociencia y adicción",
    duration: "28:20",
    free: false,
    doctor: true,
    desc: "Cómo el cerebro se recupera del consumo.",
    plans: ["mes2", "mes3", "mes4"],
  },

  // —— MES 3 ——
  {
    id: 8,
    cat: "binaural",
    title: "Ondas Delta — Sueño reparador",
    duration: "50:00",
    free: false,
    doctor: false,
    desc: "Sueño profundo y regeneración.",
    plans: ["mes3", "mes4"],
  },
  {
    id: 11,
    cat: "podcasts",
    title: "Ep.3: Yoga, mente y adicción",
    duration: "32:10",
    free: false,
    doctor: false,
    desc: "Yoga terapéutico y recuperación.",
    plans: ["mes3", "mes4"],
  },

  // —— MES 4 ——
  {
    id: 12,
    cat: "podcasts",
    title: "Ep.4: Familias en la recuperación",
    duration: "41:00",
    free: false,
    doctor: false,
    desc: "Involucrar a la familia en el proceso.",
    plans: ["mes4"],
  },
];

// ═══════════════════════════════════════════════════════
// VIDEO LIBRARY
// public/videos/archivo.mp4  |  youtubeId = solo ID
// ═══════════════════════════════════════════════════════

interface VideoItem {
  id: number;
  cat: "autohipnosis" | "yoga";
  title: string;
  duration: string;
  free: boolean;
  doctor: boolean;
  desc: string;
  plans: PlanId[];
  thumbnail?: string;
  videoSrc?: string;
  youtubeId?: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: 1,
    cat: "autohipnosis",
    title: "Autohipnosis: Sesión de bienvenida (regalo)",
    duration: "18:00",
    free: true,
    doctor: true,
    desc: "Video regalo de bienvenida. Inducción del primer día.",
    plans: [],
    videoSrc: "/videos/autohipnosis.mp4",
    youtubeId: "YV28Owup2ng",
  },
  {
    id: 2,
    cat: "autohipnosis",
    title: "Autohipnosis: Semana 2 — Refuerzo motivacional",
    duration: "22:30",
    free: false,
    doctor: true,
    desc: "Visualización del futuro sin adicción.",
    plans: ["mes1", "mes2", "mes3", "mes4"],
  },
  {
    id: 5,
    cat: "yoga",
    title: "Yoga Terapéutico: Sesión 1 — Respiración",
    duration: "30:00",
    free: false,
    doctor: false,
    desc: "Pranayama para ansiedad por abstinencia.",
    plans: ["mes1", "mes2", "mes3", "mes4"],
  },
  {
    id: 3,
    cat: "autohipnosis",
    title: "Autohipnosis: Semana 3 — Manejo del craving",
    duration: "20:15",
    free: false,
    doctor: true,
    desc: "Anclaje hipnótico ante el impulso.",
    plans: ["mes2", "mes3", "mes4"],
  },
  {
    id: 6,
    cat: "yoga",
    title: "Yoga Terapéutico: Sesión 2 — Equilibrio",
    duration: "35:00",
    free: false,
    doctor: false,
    desc: "Asanas para el sistema nervioso.",
    plans: ["mes2", "mes3", "mes4"],
  },
  {
    id: 4,
    cat: "autohipnosis",
    title: "Autohipnosis: Semana 4 — Consolidación",
    duration: "25:00",
    free: false,
    doctor: true,
    desc: "Autosugestión de consolidación.",
    plans: ["mes3", "mes4"],
  },
];

// ═══════════════════════════════════════════════════════
// CHATBOT DATA
// ═══════════════════════════════════════════════════════

type QType = "text" | "textarea" | "number" | "select" | "multi" | "scale";

interface Question {
  id: string;
  section: string;
  text: string;
  type: QType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

const SECTIONS = [
  { id: "identificacion", label: "Datos de Identificación" },
  { id: "motivo", label: "Motivo de Consulta" },
  { id: "consumo", label: "Historia de Consumo" },
  { id: "psiquiatria", label: "Antecedentes Psiquiátricos" },
  { id: "medicos", label: "Antecedentes Médicos" },
  { id: "social", label: "Situación Social" },
  { id: "cierre", label: "Cierre" },
];

const QUESTIONS: Question[] = [
  // ── Identificación ──────────────────────────────────────
  {
    id: "nombre",
    section: "identificacion",
    text: "Para empezar, ¿cómo prefiere que le llamemos?",
    type: "text",
    placeholder: "Nombre o apodo",
    required: true,
  },
  {
    id: "edad",
    section: "identificacion",
    text: "¿En qué rango de edad se encuentra? (nos ayuda con estadísticas clínicas)",
    type: "select",
    options: [
      "Entre 14 y 18 años",
      "Entre 18 y 24 años",
      "De 24 a 36 años",
      "De 36 a 45 años",
      "De 45 a 60 años",
      "De 60 o más años",
    ],
    required: true,
  },
  {
    id: "genero",
    section: "identificacion",
    text: "¿Con qué género se identifica?",
    type: "select",
    options: ["Mujer", "Hombre", "Otro", "Prefiero no decir"],
  },
  {
    id: "ciudad",
    section: "identificacion",
    text: "¿En qué ciudad o municipio se encuentra actualmente?",
    type: "text",
    placeholder: "Ej. Bogotá, Medellín, Cali…",
  },

  // ── Motivo de consulta ──────────────────────────────────
  {
    id: "motivo_consulta",
    section: "motivo",
    text: "¿Qué le trajo a esta consulta hoy? Elija la opción que mejor describe su situación.",
    type: "select",
    options: [
      "Ansiedad o crisis de pánico",
      "Depresión o decaimiento persistente",
      "Problemas con el consumo de sustancias",
      "Dificultad para dejar o reducir el consumo",
      "Estrés o trauma reciente (incluyendo eventos como sismos u otras emergencias)",
      "Problemas de sueño",
      "Ideas de hacerse daño o crisis emocional",
      "Quiero orientación / evaluación preventiva",
      "Otro motivo relacionado con salud mental",
    ],
    required: true,
  },
  {
    id: "motivo_detalle",
    section: "motivo",
    text: "Si lo desea, cuéntenos un poco más con sus palabras (opcional pero muy útil).",
    type: "textarea",
    placeholder: "Puede escribir libremente…",
  },

  // ── Historia de consumo ─────────────────────────────────
  {
    id: "edad_inicio",
    section: "consumo",
    text: "¿A qué edad probó alguna sustancia por primera vez?",
    type: "select",
    options: [
      "Nunca he consumido",
      "Entre 14 y 18 años",
      "Entre 18 y 24 años",
      "De 24 a 36 años",
      "De 36 a 45 años",
      "De 45 a 60 años",
      "De 60 o más años",
      "No recuerdo con exactitud",
    ],
  },
  {
    id: "sustancias",
    section: "consumo",
    text: "¿Qué sustancias ha consumido alguna vez? Puede seleccionar varias.",
    type: "multi",
    options: [
      "Ninguna",
      "Alcohol",
      "Cigarrillo / tabaco",
      "Cannabis / marihuana",
      "Cocaína",
      "Bazuco / pasta base",
      "Anfetaminas / estimulantes",
      "Benzodiacepinas (sin receta o en exceso)",
      "Opioides / heroína",
      "Inhalantes",
      "Otras sustancias",
    ],
  },
  {
    id: "sustancia_principal",
    section: "consumo",
    text: "¿Cuál es su sustancia principal de consumo actual (si aplica)?",
    type: "select",
    options: [
      "No consumo actualmente",
      "Alcohol",
      "Cigarrillo / tabaco",
      "Cannabis",
      "Cocaína",
      "Bazuco",
      "Benzodiacepinas",
      "Otra",
    ],
  },
  {
    id: "frecuencia",
    section: "consumo",
    text: "¿Con qué frecuencia consume actualmente?",
    type: "select",
    options: [
      "No consumo",
      "Varias veces al día",
      "Diariamente",
      "Varias veces a la semana",
      "Una vez a la semana",
      "Algunas veces al mes",
      "Ocasionalmente",
    ],
  },
  {
    id: "ultimo_consumo",
    section: "consumo",
    text: "¿Cuándo fue la última vez que consumió?",
    type: "select",
    options: [
      "Hoy",
      "Esta semana que pasó",
      "Hace una semana",
      "Hace un mes",
      "Más de un mes",
      "Más de seis meses / no aplica",
    ],
  },
  {
    id: "craving",
    section: "consumo",
    text: "Escala del 1 al 10: ¿qué tan fuerte es su deseo de consumir ahora? (1 = ningún deseo · 10 = deseo muy intenso)",
    type: "scale",
  },
  {
    id: "abstinencia_escala",
    section: "consumo",
    text: "Escala del 1 al 10: ¿qué tan intensos son los síntomas de abstinencia o malestar físico/emocional al no consumir? (1 = ninguno · 10 = muy intensos)",
    type: "scale",
  },

  // ── Antecedentes psiquiátricos ──────────────────────────
  {
    id: "atencion_psicologica",
    section: "psiquiatria",
    text: "¿Ha recibido atención psicológica alguna vez?",
    type: "select",
    options: [
      "Sí, actualmente",
      "Sí, en el pasado",
      "No, nunca",
      "Estoy buscando por primera vez",
    ],
  },
  {
    id: "atencion_psiquiatrica",
    section: "psiquiatria",
    text: "¿Ha recibido atención psiquiátrica alguna vez?",
    type: "select",
    options: [
      "Sí, actualmente",
      "Sí, en el pasado",
      "No, nunca",
      "Estoy buscando por primera vez",
    ],
  },
  {
    id: "diagnosticos",
    section: "psiquiatria",
    text: "¿Le han diagnosticado alguna de estas condiciones? Puede seleccionar varias.",
    type: "multi",
    options: [
      "Ninguna de las anteriores",
      "Trastorno de ansiedad",
      "Depresión",
      "Trastorno bipolar",
      "TEPT / trauma",
      "TDAH",
      "Trastorno por uso de sustancias",
      "Otro diagnóstico de salud mental",
    ],
  },

  // ── Antecedentes médicos ────────────────────────────────
  {
    id: "enfermedades",
    section: "medicos",
    text: "¿Tiene alguna enfermedad médica diagnosticada? Puede seleccionar varias.",
    type: "multi",
    options: [
      "Ninguna",
      "Diabetes",
      "Hipertensión / problemas cardíacos",
      "Hepatitis",
      "VIH",
      "Enfermedad tiroidea",
      "Problemas respiratorios",
      "Dolor crónico",
      "Otra condición metabólica o médica",
    ],
  },
  {
    id: "medicamentos",
    section: "medicos",
    text: "¿Toma actualmente algún medicamento (incluido psiquiátrico)?",
    type: "textarea",
    placeholder: "Nombre del medicamento y dosis aproximada, o escriba “Ninguno”",
  },
  {
    id: "antecedentes_familiares",
    section: "medicos",
    text: "¿Hay historial de adicciones o enfermedades mentales en su familia?",
    type: "select",
    options: ["Sí", "No", "No estoy seguro/a"],
  },
  {
    id: "cuales_familiares",
    section: "medicos",
    text: "Si respondió sí: ¿quiénes? Puede seleccionar varios.",
    type: "multi",
    options: [
      "Padre o madre",
      "Hermanos/as",
      "Abuelos/as",
      "Tíos/as",
      "Otros familiares",
      "No aplica",
    ],
  },

  // ── Situación social ────────────────────────────────────
  {
    id: "situacion_laboral",
    section: "social",
    text: "¿Cuál es su situación laboral o de estudio actual?",
    type: "select",
    options: [
      "Trabajo estable",
      "Trabajo informal / inestable",
      "Estudiante",
      "Desempleado/a",
      "Pensionado/a o incapacidad",
      "Otra",
    ],
  },
  {
    id: "red_apoyo",
    section: "social",
    text: "¿Cuenta con personas de apoyo (familia, pareja, amigos) en este momento?",
    type: "select",
    options: [
      "Sí, una red sólida",
      "Sí, pero limitada",
      "Casi nadie",
      "Me siento solo/a",
    ],
  },
  {
    id: "impacto_evento",
    section: "social",
    text: "¿Algún evento reciente (pérdida, emergencia, sismo u otra crisis) ha afectado su salud mental o su consumo?",
    type: "select",
    options: [
      "Sí, de forma importante",
      "Un poco",
      "No especialmente",
      "Prefiero no detallar",
    ],
  },

  // ── Cierre ──────────────────────────────────────────────
  {
    id: "motivacion",
    section: "cierre",
    text: "En una escala del 1 al 10: ¿qué tan motivado/a se siente a cuidar su salud mental o reducir el consumo? (1 = nada · 10 = totalmente)",
    type: "scale",
  },
  {
    id: "expectativas",
    section: "cierre",
    text: "¿Qué espera de este proceso o de la clínica? (puede ser breve)",
    type: "textarea",
    placeholder: "Ej. sentirme más estable, dejar de consumir, hablar con alguien…",
  },
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
function getAck(q: Question, answer: string | string[]): string | null {
  const val = Array.isArray(answer) ? answer.join(", ") : String(answer);
  if (q.id === "nombre") {
    const first = val.trim().split(/\s+/)[0] || "paciente";
    return `Gracias, ${first}. Sus respuestas están protegidas bajo secreto médico.`;
  }
  return null;
}

async function callGemini(answers: Record<string, string>, apiKey: string): Promise<any> {
  const BACKEND = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";
  const jwt = localStorage.getItem("ch_jwt") || "";

  // ── 1) Backend (recomendado) ──
  try {
    const backendRes = await fetch(`${BACKEND}/api/diagnostico/ia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({
        respuestas: answers,
        historiaId: localStorage.getItem("ch_historia_id")
          ? Number(localStorage.getItem("ch_historia_id"))
          : null,
      }),
    });

    if (backendRes.ok) {
      const backendJson = await backendRes.json();
      if (backendJson.success && backendJson.data) {
        let raw =
          typeof backendJson.data === "string"
            ? backendJson.data
            : JSON.stringify(backendJson.data);
        raw = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(raw);
        // Guardar para no perder el resultado
        localStorage.setItem("ch_diagnosis", JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch {
    // Backend caído → fallback
  }

  // ── 2) Fallback directo a Gemini (solo si hay key) ──
  if (!apiKey) {
    throw new Error(
      "Backend no disponible y no hay API key. Inicie el backend o configure VITE_GEMINI_API_KEY."
    );
  }

  const f = (id: string) => (answers[id] || "No respondido").replace(/"/g, "'");

  const prompt = `Eres el Dr. Nikolas Escobar, médico especialista en adicciones y salud mental.
Analiza esta historia y responde ÚNICAMENTE con JSON válido (sin markdown) con esta estructura:
{
  "resumen": "Resumen clínico en 3-4 oraciones para el paciente",
  "nivel_riesgo": "BAJO|MEDIO|ALTO|CRÍTICO",
  "nivel_riesgo_justificacion": "Por qué ese nivel",
  "diagnosticos": [{"codigo":"F10.2","nombre":"...","descripcion":"..."}],
  "recomendaciones_inmediatas": ["..."],
  "plan_tratamiento": {"primera_linea":"...","segunda_linea":"...","seguimiento":"..."},
  "programa_recomendado": "mes1|mes2|mes3|mes4",
  "programa_justificacion": "Por qué ese programa",
  "mensaje_al_paciente": "Mensaje cálido y claro de qué debe saber y hacer el paciente"
}

HISTORIA:
Nombre: ${f("nombre")} | Edad: ${f("edad")}
Motivo: ${f("motivo_consulta")}
Sustancias: ${f("sustancias")} | Principal: ${f("sustancia_principal")}
Inicio: ${f("edad_inicio")} | Frecuencia: ${f("frecuencia")} | Último: ${f("ultimo_consumo")}
Craving: ${f("craving")}/10 | Abstinencia: ${f("abstinencia_escala")}/10
Psicología: ${f("atencion_psicologica")} | Psiquiatría: ${f("atencion_psiquiatrica")}
Diagnósticos previos: ${f("diagnosticos")}
Enfermedades: ${f("enfermedades")}
Familia: ${f("antecedentes_familiares")} ${f("cuantos_familiares")} ${f("cuales_familiares")}
Motivación: ${f("motivacion")} | Expectativas: ${f("expectativas")}

Responde SOLO el JSON.`;

  // Modelo actual (NO usar gemini-1.5-flash)
  // Modelo actual (NO usar gemini-1.5-flash ni 3.5 si da 404)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini error ${res.status} — verifica tu API key y el modelo`);
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = JSON.parse(
    text.replace(/```json\s*/gi, "").replace(/```/g, "").trim()
  );
  localStorage.setItem("ch_diagnosis", JSON.stringify(parsed));
  return parsed;
}

// ═══════════════════════════════════════════════════════
// LANG SWITCHER
// ═══════════════════════════════════════════════════════

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const langs: { code: Lang; flag: string; label: string }[] = [
    { code: "es", flag: "🇨🇴", label: "Español" }, { code: "en", flag: "🇺🇸", label: "English" },
    { code: "fr", flag: "🇫🇷", label: "Français" }, { code: "de", flag: "🇩🇪", label: "Deutsch" },
    { code: "pt", flag: "🇧🇷", label: "Português" },
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
// NAVBAR (páginas internas)
// ═══════════════════════════════════════════════════════
function NavBar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // No mostrar barra en landing ni auth
  if (!user || ["/", "/auth"].includes(location.pathname)) return null;

  const linkClass = (path: string) =>
    clsx(
      "text-sm px-3 py-1.5 rounded-full transition-colors whitespace-nowrap",
      location.pathname === path || location.pathname.startsWith(path + "/")
        ? "bg-primary/15 text-primary font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
    );

  const isAdmin = user.rol === "ADMIN";
  const isMedico = user.rol === "MEDICO" || user.rol === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo / nombre */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 shrink-0 text-left"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
            <ImageWithFallback src={clinicLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-semibold hidden sm:block max-w-[180px] truncate">
            {t("clinicName")}
          </span>
        </button>

        {/* Links desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-wrap justify-end">
          <Link to="/historia" className={linkClass("/historia")}>
            {t("clinicalHistory")}
          </Link>
          <Link to="/diagnostico" className={linkClass("/diagnostico")}>
            {t("aiDiagnosis")}
          </Link>
          <Link to="/tratamientos" className={linkClass("/tratamientos")}>
            {t("programs")}
          </Link>
          <Link to="/audios" className={linkClass("/audios")}>
            {t("audios")}
          </Link>
          <Link to="/mi-historial" className={linkClass("/mi-historial")}>
            Mi historial
          </Link>
          <Link to="/acompanamiento" className={linkClass("/acompanamiento")}>
            Acompañamiento
          </Link>

          {isAdmin && (
            <Link to="/admin" className={linkClass("/admin")}>
              Admin
            </Link>
          )}
          {isMedico && (
            <Link to="/medico" className={linkClass("/medico")}>
              Panel médico
            </Link>
          )}
        </nav>

        {/* Derecha: idioma + usuario + menú móvil */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Idioma (si tienes setLang en el contexto) */}
          {typeof setLang === "function" && (
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="text-xs bg-muted/40 border border-border rounded-lg px-2 py-1"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="pt">PT</option>
            </select>
          )}

          <span className="text-xs text-muted-foreground hidden sm:inline max-w-[100px] truncate">
            {user.name || user.email}
          </span>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Menú móvil */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Panel móvil */}
      {open && (
        <div className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-1 bg-background">
          <Link to="/historia" className={linkClass("/historia")} onClick={() => setOpen(false)}>
            {t("clinicalHistory")}
          </Link>
          <Link to="/diagnostico" className={linkClass("/diagnostico")} onClick={() => setOpen(false)}>
            {t("aiDiagnosis")}
          </Link>
          <Link to="/tratamientos" className={linkClass("/tratamientos")} onClick={() => setOpen(false)}>
            {t("programs")}
          </Link>
          <Link to="/audios" className={linkClass("/audios")} onClick={() => setOpen(false)}>
            {t("audios")}
          </Link>
          <Link to="/mi-historial" className={linkClass("/mi-historial")} onClick={() => setOpen(false)}>
            Mi historial
          </Link>
          <Link to="/acompanamiento" className={linkClass("/acompanamiento")} onClick={() => setOpen(false)}>
            Acompañamiento
          </Link>
          {isAdmin && (
            <Link to="/admin" className={linkClass("/admin")} onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}
          {isMedico && (
            <Link to="/medico" className={linkClass("/medico")} onClick={() => setOpen(false)}>
              Panel médico
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

// ═══════════════════════════════════════════════════════
// FOOTER COMPARTIDO — con links por servicio
// ═══════════════════════════════════════════════════════

function SiteFooter() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { user } = useAuth();

  const serviceLinks = [
    { label: "Historia Clínica Digital", path: "/historia", anchor: null },
    { label: "Diagnóstico con IA Gemini", path: "/diagnostico", anchor: null },
    { label: "Hipnosis Clínica", path: "/tratamientos", anchor: "#hipnosis" },
    { label: "Auriculoterapia con Láser", path: "/tratamientos", anchor: "#auriculoterapia" },
    { label: "Yoga & Mindfulness", path: "/tratamientos", anchor: "#yoga" },
    { label: "Audioterapia Holística", path: "/audios", anchor: null },
    { label: "Reuniones Grupales", path: "/audios", anchor: "#grupos" },
  ];

  const quickLinks = [
    { label: t("register"), path: "/auth" },
    { label: t("ourPrograms"), path: user ? "/tratamientos" : "/auth" },
    { label: t("audioLib"), path: user ? "/audios" : "/auth" },
    { label: t("videoLib"), path: user ? "/audios" : "/auth" },
  ];

  return (
    <footer id="contacto" className="border-t border-border pt-14 pb-8 px-4 bg-card/30" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
        {/* Marca */}
        <div className="md:col-span-1">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-4 text-left">
            <img src={clinicLogo} alt="Cuídate Salud Plena" className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-sm font-semibold leading-none">{t("clinicName")}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{t("tagline")}</p>
            </div>
          </button>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t("footerCert")}.</p>
          {/* Redes sociales */}
          <div className="flex gap-3">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/cuidatemedellin/", label: "Instagram" },
              { Icon: Facebook, href: "https://facebook.com/consultorioholistico", label: "Facebook" },
              { Icon: Youtube, href: "https://youtube.com/@consultorioholistico", label: "YouTube" },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Servicios con links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-foreground/70" style={{ fontFamily: "'DM Mono', monospace" }}>{t("footerServices")}</p>
          <ul className="space-y-2.5">
            {serviceLinks.map(s => (
              <li key={s.label}>
                <button
                  onClick={() => { navigate(s.path); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors text-left group">
                  <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Accesos rápidos */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-foreground/70" style={{ fontFamily: "'DM Mono', monospace" }}>{t("footerLinks")}</p>
          <ul className="space-y-2.5">
            {quickLinks.map(l => (
              <li key={l.label}>
                <button onClick={() => navigate(l.path)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group">
                  <ArrowRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t border-border/50">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-foreground/70" style={{ fontFamily: "'DM Mono', monospace" }}>Idioma</p>
            <LangSwitcher />
          </div>
        </div>

        {/* Contacto */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-foreground/70" style={{ fontFamily: "'DM Mono', monospace" }}>{t("footerContact")}</p>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li>
              <a href="tel:800-HOLISTIC" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />800-HOLISTIC
              </a>
            </li>
            <li>
              <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <MessageSquare className="w-3.5 h-3.5 text-primary/70 shrink-0" />WhatsApp
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/40" />
              </a>
            </li>
            <li>
              <a href="mailto:info@consultorioholistico.co" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />info@consultorioholistico.co
              </a>
            </li>
            <li className="flex items-center gap-2 text-amber-400/90 bg-amber-500/8 border border-amber-500/15 rounded-lg px-2.5 py-2 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t("footerCrisis")}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-2 text-[10px] text-muted-foreground/40" style={{ fontFamily: "'DM Mono', monospace" }}>
        <span>© 2025 Consultorio Holístico IPS · {t("allRights")}</span>
        <div className="flex gap-4">
          <button className="hover:text-muted-foreground/70 transition-colors">{t("footerPrivacy")}</button>
          <button className="hover:text-muted-foreground/70 transition-colors">{t("footerTerms")}</button>
          <span>Secreto médico garantizado</span>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════
// CONTACT SECTION — formulario de sugerencias y citas
// ═══════════════════════════════════════════════════════

const WA_NUMBER = "573114048112"; // ← Reemplaza con el número real de WhatsApp de la clínica

function ContactSection() {
  const [form, setForm] = useState({ nombre: "", telefono: "", tipo: "", mensaje: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const tipos = [
    "Solicitud de cita médica",
    "Información sobre programas de tratamiento",
    "Consulta sobre adicciones",
    "Consulta sobre salud mental",
    "Sugerencia o comentario",
    "Urgencia o crisis",
    "Otro",
  ];

  const enviarWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.mensaje) return;
    const texto = [
      `*Nueva solicitud — Cuídate Salud Plena*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Nombre:* ${form.nombre}`,
      form.telefono ? `📞 *Teléfono:* ${form.telefono}` : "",
      `📋 *Tipo:* ${form.tipo || "General"}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💬 *Mensaje:*`,
      form.mensaje,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Enviado desde cuidatesaludplena.co_`,
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <section id="contacto-form" className="py-20 px-4 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Contáctanos</p>
        <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>¿En qué podemos ayudarte?</h2>
        <p className="text-sm text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Completa el formulario y te llevaremos directamente a WhatsApp. Respondemos en minutos.
        </p>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Info lateral */}
          <div className="md:col-span-2 space-y-4">
            {/* WhatsApp destacado */}
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 group hover:bg-emerald-500/15 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-400/70 uppercase tracking-wide mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>WhatsApp — respuesta inmediata</p>
                <p className="text-base font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">+57 300 123 4567</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Lunes a sábado · 7am – 8pm</p>
              </div>
            </a>

            {[
              { icon: Phone, label: "Teléfono", value: "800-HOLISTIC", href: "tel:800-HOLISTIC" },
              { icon: Mail, label: "Correo", value: "info@cuidatesaludplena.co", href: "mailto:info@cuidatesaludplena.co" },
              { icon: Instagram, label: "Instagram", value: "@cuidatemedellin", href: "https://www.instagram.com/cuidatemedellin/" },
            ].map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</p>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{value}</p>
                </div>
              </a>
            ))}

            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-xs font-medium text-amber-400">Línea de crisis 24/7</p>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Si estás en crisis, llama ahora:</p>
              <a href="tel:800-911-2000" className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">800-911-2000</a>
            </div>
          </div>

          {/* Formulario → WhatsApp */}
          <div className="md:col-span-3">
            <form onSubmit={enviarWhatsApp} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Enviar por WhatsApp</p>
                  <p className="text-[10px] text-muted-foreground">El formulario abre WhatsApp con tu mensaje listo</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Nombre completo *</label>
                  <input value={form.nombre} onChange={e => set("nombre", e.target.value)} required placeholder="Tu nombre"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Teléfono (opcional)</label>
                  <input value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="+57 300 000 0000" type="tel"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Tipo de solicitud</label>
                <select value={form.tipo} onChange={e => set("tipo", e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground">
                  <option value="">Selecciona una opción...</option>
                  {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Mensaje *</label>
                <textarea value={form.mensaje} onChange={e => set("mensaje", e.target.value)} required rows={4}
                  placeholder="Cuéntanos cómo podemos ayudarte, qué servicio te interesa o déjanos tu consulta..."
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/40 resize-none" />
              </div>

              <button type="submit" disabled={!form.nombre || !form.mensaje}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#fff" }}>
                <MessageSquare className="w-4 h-4" />
                Enviar por WhatsApp ahora
              </button>

              <p className="text-[10px] text-muted-foreground/40 text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
                Se abrirá WhatsApp con tu mensaje · Respuesta en minutos · Confidencial
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
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
    { icon: Brain, title: "Atención Psiquiátrica con IA", desc: "Evaluación y diagnóstico psiquiátrico potenciado por inteligencia artificial, validado por médico especialista.", anchor: "/diagnostico" },
    { icon: Activity, title: "Atención Toxicológica", desc: "Evaluación toxicológica completa del perfil de consumo. Análisis de sustancias, riesgo y protocolo de desintoxicación.", anchor: "/diagnostico" },
    { icon: Sparkles, title: "Hipnosis Clínica", desc: "Sesiones de hipnosis clínica certificada con el médico director para reprogramación de hábitos y reducción del craving.", anchor: "/tratamientos" },
    { icon: Zap, title: "Auriculoterapia con Láser", desc: "Técnica de neuromodulación con puntos auriculares y láser de baja frecuencia para control de la ansiedad.", anchor: "/tratamientos" },
    { icon: Leaf, title: "Yoga & Mindfulness", desc: "Sesiones virtuales de yoga terapéutico y meditación mindfulness adaptadas para personas en recuperación.", anchor: "/tratamientos" },
    { icon: Headphones, title: "Audioterapia Holística", desc: "Música binaural, podcast terapéutico y autohipnosis con la voz del médico. Suero terapia con audio.", anchor: "/audios" },
  ];

  const steps = [
    { n: "01", icon: ClipboardList, title: "Completa tu historia clínica", desc: "20 minutos de evaluación guiada con nuestro asistente virtual. Totalmente confidencial." },
    { n: "02", icon: Brain, title: "Diagnóstico con IA Gemini", desc: "Inteligencia artificial analiza tu historia y genera diagnóstico psiquiátrico y toxicológico detallado." },
    { n: "03", icon: ShoppingCart, title: "Elige tu programa", desc: "Selecciona el Mes 1 intensivo o Mes 2 de consolidación y comienza hoy mismo." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5">
            <img src={clinicLogo} alt="Cuídate Salud Plena" className="w-9 h-9 rounded-full object-cover" />
            <div className="text-left">
              <p className="text-sm font-semibold leading-none">{t("clinicName")}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{t("tagline")}</p>
            </div>
          </button>
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

      {/* Apoyo post-terremoto Colombia 2026 */}
      <div className="mx-auto max-w-5xl px-4 mb-6">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 md:p-5">
          <p className="text-[10px] uppercase tracking-widest text-amber-400/90 mb-1"
             style={{ fontFamily: "'DM Mono', monospace" }}>
            Apoyo en salud mental · Colombia
          </p>
          <h2 className="text-base md:text-lg font-semibold mb-1">
            Si el sismo del 10 de agosto te afectó (o sigues con miedo, insomnio o ansiedad)
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Es normal sentir que “aún tiembla”, dificultad para dormir o mucha angustia.
            Aquí puedes hablar, registrar cómo te sientes y, si lo deseas, avanzar con un
            plan con psicólogos, médicos o psiquiatras de la clínica.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(user ? "/acompanamiento" : "/auth")}
              className="text-sm font-semibold px-4 py-2.5 rounded-xl"
              style={{ background: "linear-gradient(135deg, #0ccec6, #07a8a2)", color: "#031014" }}
            >
              Quiero hablar / acompañamiento
            </button>
            <button
              onClick={() => navigate(user ? "/historia" : "/auth")}
              className="text-sm px-4 py-2.5 rounded-xl border border-border"
            >
              Evaluación de salud mental
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Emergencia: <strong>Línea de la Vida 800-911-2000</strong> · Emergencias <strong>123</strong>
          </p>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────── */}

      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Fondo: imagen de la clínica + overlay degradado */}
        <div className="absolute inset-0 z-0">
          <img src={clinicHeroBg} alt="" className="w-full h-full object-cover object-center" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071a1e]/95 via-[#071a1e]/75 to-[#071a1e]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071a1e] via-transparent to-transparent" />
        </div>

        {/* Orbes decorativos de luz */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-cyan-400/8 blur-2xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 w-full py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Columna izquierda — contenido */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 text-xs text-primary mb-7 backdrop-blur-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Medicina Holística · Psiquiatría · IA Terapéutica
              </div>

              {/* Título */}
              <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {t("heroTitle").split("\n")[0]}<br />
                <span style={{ background: "linear-gradient(135deg, #0ccec6 0%, #4df0ea 50%, #a8f5f2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {t("heroTitle").split("\n")[1]}
                </span>
              </h1>

              {/* Subtítulo */}
              <p className="text-lg text-foreground/70 leading-relaxed mb-8 max-w-md">
                {t("heroSub")}
              </p>

              {/* Badge regalo */}
              <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/25 rounded-2xl p-4 mb-8 backdrop-blur-sm max-w-md">
                <Gift className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">{t("gift")}</p>
                  <p className="text-xs text-amber-300/70 mt-0.5">{t("giftDesc")}</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button onClick={() => navigate("/auth")}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #0ccec6, #07a8a2)", color: "#031014" }}>
                  {t("startBtn")} <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#programas"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-primary/30 text-primary hover:bg-primary/10 transition-all text-sm font-medium backdrop-blur-sm">
                  {t("ourPrograms")}
                </a>
              </div>

              {/* Stats rápidas */}
              <div className="flex flex-wrap gap-6">
                {[["2,400+","Pacientes tratados"],["15 años","Experiencia clínica"],["98%","Satisfacción"]].map(([n,l])=>(
                  <div key={l}>
                    <p className="text-2xl font-bold text-primary">{n}</p>
                    <p className="text-[11px] text-foreground/50 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha — foto del doctor */}
            <div className="hidden lg:flex justify-end">
              <div className="relative">
                {/* Glow ring detrás */}
                <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-105" />
                {/* Tarjeta foto */}
                <div className="relative w-80 h-[440px] rounded-3xl overflow-hidden border border-primary/25 shadow-2xl shadow-primary/15">
                  <ImageWithFallback src={doctorHero} alt="Dr. Nikolas Escobar — Director Médico" className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071a1e]/80 via-transparent to-transparent" />
                  {/* Info superpuesta abajo */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-base font-bold text-white">Dr. Nikolas Escobar</p>
                    <p className="text-xs text-primary mt-0.5">Director Médico · Adicciones & Salud Mental</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_,i)=><Star key={i} className="w-3 h-3 fill-primary text-primary"/>)}
                      <span className="text-[10px] text-white/50 ml-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>4.9 · 15 años exp.</span>
                    </div>
                  </div>
                </div>

                {/* Badge flotante pacientes */}
                <div className="absolute -top-4 -left-4 bg-card/90 backdrop-blur-md border border-primary/25 rounded-2xl px-4 py-3 text-center shadow-xl">
                  <p className="text-2xl font-bold text-primary">2,400+</p>
                  <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>Pacientes</p>
                </div>

                {/* Badge flotante disponible */}
                <div className="absolute -bottom-4 -right-4 bg-card/90 backdrop-blur-md border border-emerald-500/25 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-xl">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-400">Disponible hoy</p>
                    <p className="text-[10px] text-muted-foreground">Agenda tu cita</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Flecha scroll hacia abajo */}
        <a href="#servicios" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-primary/50 hover:text-primary transition-colors">
          <span className="text-[10px]" style={{ fontFamily: "'DM Mono', monospace" }}>SCROLL</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </section>

      {/* Stats bar */}
      <div className="border-y border-primary/10 bg-card/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["2,400+","Pacientes tratados"],["15 años","Experiencia clínica"],["98%","Satisfacción"],["4 Idiomas","ES · EN · FR · DE"]].map(([n,l])=>(
            <div key={l} className="text-center py-1">
              <p className="text-2xl font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{n}</p>
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
              <button key={s.title} onClick={() => navigate(s.anchor)} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group text-left">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-medium mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                <p className="text-[10px] text-primary/50 mt-2 group-hover:text-primary transition-colors flex items-center gap-1">Ver más <ArrowRight className="w-2.5 h-2.5" /></p>
              </button>
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
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {prog.sessions.map(s => (
                    <div key={s.name} className="flex items-center gap-2 bg-muted/40 rounded-xl p-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <s.icon className="w-3 h-3 text-primary" />
                      </div>
                      <div><p className="text-[10px] font-semibold">{s.count}× {s.name}</p><p className="text-[9px] text-muted-foreground">{s.note}</p></div>
                    </div>
                  ))}
                </div>
                {/* Indicador de media incluida */}
                <div className="flex gap-2 mb-3">
                  <span className="flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-full">
                    <Headphones className="w-2.5 h-2.5" />{prog.includedAudioIds.length} audios
                  </span>
                  <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
                    <Video className="w-2.5 h-2.5" />{prog.includedVideoIds.length} videos
                  </span>
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

      {/* Audio/Video preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Audioterapia holística</p>
          <h2 className="text-2xl font-semibold text-center mb-3">{t("audioLib")}</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">{t("audioSub")}</p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {AUDIOS.filter(a => a.free).map(a => (
              <div key={a.id} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  {a.cat === "autohipnosis" ? <Mic className="w-4 h-4 text-purple-400" /> : a.cat === "binaural" ? <Music className="w-4 h-4 text-blue-400" /> : <Headphones className="w-4 h-4 text-amber-400" />}
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{a.duration}</span>
                  <span className="ml-auto text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full">{t("free")}</span>
                </div>
                <p className="text-sm font-medium mb-1">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
                {a.doctor && <p className="text-[10px] text-primary/70 mt-2">🎙️ Voz del Dr. Escobar</p>}
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate("/auth")} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Ver biblioteca completa <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── EQUIPO ─────────────────────────────────────── */}
      <section id="equipo" className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-widest text-center mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Nuestro equipo</p>
          <h2 className="text-3xl font-semibold text-center mb-3">Profesionales al servicio de tu bienestar</h2>
          <p className="text-sm text-muted-foreground text-center mb-14 max-w-xl mx-auto">Cuídate Salud Plena · Atención integral donde le ofrecemos una variedad de opciones para su salud física y mental.</p>

          {/* Doctor principal */}
          <div className="bg-card border border-primary/25 rounded-3xl p-7 mb-10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="flex flex-col md:flex-row gap-7 items-start">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-28 h-36 rounded-2xl border-2 border-primary/25 overflow-hidden relative">
                  <ImageWithFallback src={doctorPhoto} alt="Dr. Nikolas Escobar — Especialista en Adicciones y Salud Mental" className="w-full h-full object-cover object-top" />
                  <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full" style={{ fontFamily: "'DM Mono', monospace" }}>Médico Encargado</span>
                </div>
              </div>
              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="text-xl font-semibold">Dr. Nikolas Escobar</h3>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>Disponible</span>
                </div>
                <p className="text-sm text-primary font-medium mb-3">Especialista en Adicciones y Salud Mental</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Médico con enfoque holístico en el tratamiento de enfermedades adictivas y trastornos de salud mental. Combina medicina convencional con terapias complementarias — hipnoterapia, auriculoterapia láser y yoga terapéutico — para ofrecer una recuperación integral y sostenida a cada paciente.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Adicciones","Salud Mental","Hipnoterapia","Auriculoterapia Láser","Psiquiatría integrativa","Yoga terapéutico"].map(e=>(
                    <span key={e} className="text-[10px] bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-full">{e}</span>
                  ))}
                </div>
              </div>
              {/* Stats */}
              <div className="shrink-0 grid grid-cols-2 md:grid-cols-1 gap-3 md:w-32">
                {[{val:"10+",lbl:"Años exp."},{val:"500+",lbl:"Pacientes"},{val:"98%",lbl:"Satisfacción"}].map(s=>(
                  <div key={s.lbl} className="bg-muted/40 border border-border rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-primary">{s.val}</p>
                    <p className="text-[10px] text-muted-foreground">{s.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lema de la clínica */}
          <div className="bg-gradient-to-br from-primary/8 to-teal-500/5 border border-primary/15 rounded-2xl p-6 mb-10 text-center">
            <Leaf className="w-7 h-7 text-primary mx-auto mb-3" />
            <p className="text-base font-medium mb-2 max-w-2xl mx-auto leading-relaxed">"Cuídate Salud Plena es una propuesta de salud integral, donde le ofrecemos a los usuarios una variedad de opciones de atención para su salud física y mental."</p>
            <p className="text-sm text-muted-foreground">¡Solicita tu cita hoy mismo!</p>
          </div>

          {/* Servicios de la clínica */}
          <p className="text-xs text-primary/70 uppercase tracking-widest text-center mb-6" style={{ fontFamily: "'DM Mono', monospace" }}>Todos nuestros servicios</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: Stethoscope,  name: "Medicina general",       sub: "y especializada" },
              { icon: Activity,     name: "Fisioterapia",            sub: "rehabilitación física" },
              { icon: MessageSquare,name: "Psicología",              sub: "terapia individual y grupal" },
              { icon: Mic,          name: "Hipnoterapia",            sub: "reprogramación subconsciente" },
              { icon: Zap,          name: "Auriculoterapia láser",   sub: "medicina auricular" },
              { icon: Leaf,         name: "Yoga y meditación",       sub: "bienestar cuerpo-mente" },
              { icon: Sparkles,     name: "Medicina alternativa",    sub: "enfoques complementarios" },
              { icon: Star,         name: "Cosmetología",            sub: "estética y cuidado personal" },
              { icon: Award,        name: "Odontología",             sub: "salud oral integral" },
              { icon: Heart,        name: "Salud Mental",            sub: "adicciones y psiquiatría" },
            ].map(sv=>(
              <div key={sv.name} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors group text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-primary/15 transition-colors">
                  <sv.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <p className="text-xs font-semibold leading-tight mb-1">{sv.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{sv.sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={()=>{ const el=document.getElementById("contacto"); el?.scrollIntoView({behavior:"smooth"}); }} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Solicitar cita con el Dr. Escobar <ArrowRight className="w-4 h-4" />
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

      {/* ── FORMULARIO DE CONTACTO ──────────────────────── */}
      <ContactSection />

      <SiteFooter />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 2 — AUTH (con Olvidar Contraseña)
// ═══════════════════════════════════════════════════════

type AuthView = "login" | "register" | "forgot" | "reset" | "changed";

function AuthPage() {
  const { login, register, user, forgotPassword, resetPassword } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [authView, setAuthView] = useState<AuthView>("login");

  // Campos
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  // Campos reset
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null); // token generado (mostrado en demo)
  const [tokenInput, setTokenInput] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  // Navegar cuando user cambia a no-null (después de que React confirme el estado)
  useEffect(() => { if (user) navigate("/historia", { replace: true }); }, [user]);
  useEffect(() => { setAuthView(mode); }, [mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Ingrese su correo electrónico."); return; }
    if (!pass.trim() || pass.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (mode === "register" && !name.trim()) { setError("Ingrese su nombre completo."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        const ok = await login(email.trim().toLowerCase(), pass);
        // No navegamos aquí — el useEffect[user] lo hace después de que React confirme el estado
        if (!ok) setError("Correo o contraseña incorrectos. ¿Ya tiene cuenta registrada?");
      } else {
        const ok = await register(name.trim(), email.trim().toLowerCase(), pass);
        if (!ok) setError("Este correo ya está registrado. Intente iniciar sesión.");
      }
    } catch {
      setError("Ocurrió un error. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await forgotPassword(resetEmail);
      if (!token) {
        setError("No encontramos una cuenta con ese correo.");
        return;
      }
      // NO mostrar el token al usuario en producción
      // El correo ya lo envía el backend (EmailService)
      setResetToken(null);
      setAuthView("reset");
      setError("");
      // Mensaje orientativo (puedes usar un state `info` si prefieres)
      alert(
        "Si el correo existe, enviamos un código a su bandeja. Revise también spam. Luego péguelo en la siguiente pantalla."
      );
    } catch {
      setError("No se pudo enviar el código. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (newPass.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
      const ok = await resetPassword(tokenInput, newPass);
      if (!ok) { setError("Código inválido o expirado. Solicite uno nuevo."); return; }
      setAuthView("changed");
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";
  const labelClass = "text-[10px] text-muted-foreground uppercase tracking-widest block mb-1.5";

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
        <Link to="/" className="relative flex items-center gap-2.5"><img src={clinicLogo} alt="Cuídate Salud Plena" className="w-8 h-8 rounded-full object-cover" /><span className="font-semibold hidden sm:block">{t("clinicName")}</span></Link>
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border mb-5">
            <ImageWithFallback src={doctorHero} alt="Dr. Nikolas Escobar" className="w-full h-full object-cover object-top" />
          </div>
          <blockquote className="text-xl font-light text-foreground/90 leading-relaxed mb-4">"El primer paso hacia la recuperación es pedir ayuda. Hoy usted ya lo está haciendo."</blockquote>
          <p className="text-sm text-muted-foreground">Dr. Nikolas Escobar · Director Médico</p>
          <div className="flex gap-1 mt-2">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}</div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-muted-foreground/60" style={{ fontFamily: "'DM Mono', monospace" }}><Lock className="w-3.5 h-3.5" /> Cifrado · Secreto médico garantizado</div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8"><img src={clinicLogo} alt="Cuídate Salud Plena" className="w-7 h-7 rounded-full object-cover" /><span className="text-sm font-semibold">{t("clinicName")}</span></Link>

          {/* ── Vista: Login / Register ── */}
          {(authView === "login" || authView === "register") && (
            <>
              <div className="flex bg-muted rounded-xl p-1 mb-8">
                {(["login", "register"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setAuthView(m); setError(""); }} className={clsx("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                    {m === "login" ? t("login") : t("register")}
                  </button>
                ))}
              </div>
              <h1 className="text-xl font-semibold mb-6">{mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta gratuita"}</h1>
              <form onSubmit={submit} className="space-y-4">
                {mode === "register" && (
                  <div><label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>NOMBRE COMPLETO</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="María González" className={inputClass} /></div>
                )}
                <div><label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>CORREO</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className={inputClass} /></div>
                <div><label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>CONTRASEÑA</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required className={clsx(inputClass, "pr-11")} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                {mode === "login" && (
                  <div className="text-right">
                    <button type="button" onClick={() => { setAuthView("forgot"); setResetEmail(email); setError(""); }}
                      className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto">
                      <KeyRound className="w-3 h-3" />{t("forgotPass")}
                    </button>
                  </div>
                )}
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
            </>
          )}

          {/* ── Vista: Olvidar contraseña ── */}
          {authView === "forgot" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{t("resetPassword")}</h1>
                  <p className="text-xs text-muted-foreground">Ingrese su correo registrado</p>
                </div>
              </div>
              <form onSubmit={submitForgot} className="space-y-4">
                <div><label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>CORREO REGISTRADO</label>
                  <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="correo@ejemplo.com" required className={inputClass} /></div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}{t("sendCode")}
                </button>
                <button type="button" onClick={() => { setAuthView("login"); setMode("login"); setError(""); }}
                  className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                  ← {t("backToLogin")}
                </button>
              </form>
            </>
          )}

          {/* ── Vista: Ingresar código y nueva contraseña ── */}
          {authView === "reset" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{t("enterCode")}</h1>
                  <p className="text-xs text-muted-foreground">{resetEmail}</p>
                </div>
              </div>
              {/* Banner del token (solo en demo — en producción se envía al email) */}
              {resetToken && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 mb-5">
                  <p className="text-[10px] text-amber-300/70 mb-2 leading-relaxed">{t("codeDemo")}</p>
                  <p className="text-2xl font-bold text-amber-300 tracking-widest text-center" style={{ fontFamily: "'DM Mono', monospace" }}>{resetToken}</p>
                  <p className="text-[10px] text-amber-300/50 text-center mt-1">Válido por 15 minutos</p>
                </div>
              )}

                <form onSubmit={submitReset} className="space-y-4">
                  <div>
                    <label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>
                      CÓDIGO DE VERIFICACIÓN
                    </label>
                    <input
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.trim())}
                      placeholder="Pegue el código que llegó a su correo"
                      required
                      className={clsx(inputClass, "text-sm")}
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>
                      {t("newPassword").toUpperCase()}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className={clsx(inputClass, "pr-11")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("resetPassword")}
                  </button>
                </form>
            </>
          )}

          {/* ── Vista: Contraseña cambiada ── */}
          {authView === "changed" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t("passwordChanged")}</h2>
              <p className="text-sm text-muted-foreground mb-7">{t("passwordChangedSub")}</p>
              <button onClick={() => { setMode("login"); setAuthView("login"); setEmail(resetEmail); setPass(""); setError(""); }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                {t("login")}
              </button>
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
  const [consentAceptado, setConsentAceptado] = useState(
    () => localStorage.getItem("ch_consent_accepted") === "true"
  );
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [qIdx, setQIdx] = useState(0);
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [scaleVal, setScaleVal] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const answeringRef = useRef(false); // ← AQUÍ
  const currentQ = QUESTIONS[qIdx];
  const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";

  useEffect(() => {
    if (!consentAceptado) return;
    const greeting = user?.name ? `Hola, ${user.name.split(" ")[0]}. ` : "";
    setMsgs([
      {
        id: "init",
        role: "bot",
        ts: Date.now(),
        content: greeting + QUESTIONS[0].text,
      },
    ]);
  }, [consentAceptado, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, isTyping]);

  useEffect(() => {
    setText("");
    setSelected([]);
    setScaleVal(null);
  }, [qIdx]);

  function aceptarConsent() {
    localStorage.setItem("ch_consent_accepted", "true");
    setConsentAceptado(true);
  }

  function addMsg(m: Omit<Msg, "id">) {
    setMsgs((p) => [...p, { ...m, id: `${m.role}-${Date.now()}-${Math.random()}` }]);
  }

  async function finalizarHistoria(flat: Record<string, string>) {
    setSaving(true);
    localStorage.setItem("ch_answers", JSON.stringify(flat));
    try {
      const jwt = localStorage.getItem("ch_jwt") || "";
      const res = await fetch(`${API}/api/historia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({
          respuestas: flat,
          consentimientoAceptado: true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const id = json?.data?.id ?? json?.data?.historiaId ?? json?.id;
        if (id) localStorage.setItem("ch_historia_id", String(id));
      }
    } catch {
      // backend no disponible
    } finally {
      setSaving(false);
      addMsg({
        role: "bot",
        ts: Date.now(),
        content: "✓ Evaluación completada. Redirigiendo al análisis diagnóstico con IA...",
      });
      setTimeout(() => navigate("/diagnostico"), 1500);
    }
  }

    function submitAnswer(answer: string | string[]) {
      if (answeringRef.current) return;
      if (answer == null) return;
      if (Array.isArray(answer) && answer.length === 0) return;
      if (typeof answer === "string" && !String(answer).trim()) return;

      const q = QUESTIONS[qIdx];
      if (!q) return;

      answeringRef.current = true;

      addMsg({
        role: "user",
        content: Array.isArray(answer) ? answer.join(", ") : String(answer),
        ts: Date.now(),
      });

      const newAnswers = new Map(answers).set(q.id, answer);
      setAnswers(newAnswers);
      setText("");
      setSelected([]);
      setScaleVal(null);
      setIsTyping(true);

      window.setTimeout(() => {
        try {
          setIsTyping(false);

          const ack = getAck(q, answer);
          const isLast = qIdx >= QUESTIONS.length - 1;
          const isRisk =
            q.id === "ideacion" &&
            String(Array.isArray(answer) ? answer[0] : answer).includes("Actualmente");

          if (ack) {
            addMsg({
              role: "bot",
              content: ack,
              ts: Date.now(),
              isWarning: !!isRisk,
            });
          }

          if (isLast) {
            const flat: Record<string, string> = {};
            newAnswers.forEach((v, k) => {
              flat[k] = Array.isArray(v) ? v.join(", ") : String(v);
            });
            window.setTimeout(() => finalizarHistoria(flat), 500);
            return;
          }

          const nextQ = QUESTIONS[qIdx + 1];
          if (!nextQ) return;

          const sectionChanged = nextQ.section !== q.section;
          const sectionLabel = sectionChanged
            ? SECTIONS.find((s) => s.id === nextQ.section)?.label
            : null;

          setQIdx((i) => i + 1);

          window.setTimeout(() => {
            addMsg({
              role: "bot",
              ts: Date.now(),
              content: sectionLabel
                ? `— ${sectionLabel} —\n\n${nextQ.text}`
                : nextQ.text,
            });
          }, 250);
        } finally {
          answeringRef.current = false;
        }
      }, 350);
    }

    // ── Consentimiento informado (obligatorio) ─────────────────
    if (!consentAceptado) {
      return (
        <div
          className="min-h-screen bg-background flex items-center justify-center px-4 py-10"
          style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
        >
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-primary/10 border-b border-primary/20 px-7 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p
                  className="text-xs text-primary uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Documento médico · Obligatorio
                </p>
                <h2 className="font-bold text-lg">Consentimiento Informado</h2>
              </div>
            </div>

            <div className="px-7 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                <p className="text-sm font-semibold text-primary mb-1">
                  Clínica Virtual · Consultorio Holístico para Adicciones y Salud Mental
                </p>
                <p className="text-xs text-muted-foreground">
                  Dr. Nikolas Escobar — Director Médico
                </p>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed">
                Yo, el/la paciente, manifiesto libre y voluntariamente mi consentimiento para iniciar
                el proceso de evaluación clínica y eventual tratamiento en el{" "}
                <strong>Consultorio Holístico Cuídate Salud Plena</strong>.
              </p>

              <div className="space-y-3">
                {[
                  {
                    title: "1. Confidencialidad",
                    body: "Toda la información que proporcione es estrictamente confidencial y está protegida por el secreto médico profesional, conforme a la Ley 1581 de 2012 y la Resolución 1995 de 1999.",
                  },
                  {
                    title: "2. Finalidad clínica",
                    body: "Las respuestas serán procesadas por IA y revisadas por el equipo médico para orientar el plan terapéutico.",
                  },
                  {
                    title: "3. Almacenamiento de datos",
                    body: "Su información se almacenará de forma segura. No se compartirá con terceros sin autorización, salvo riesgo vital inminente.",
                  },
                  {
                    title: "4. Voluntariedad",
                    body: "Puede detener el proceso y solicitar la eliminación de sus datos en cualquier momento.",
                  },
                  {
                    title: "5. Diagnóstico asistido por IA",
                    body: "La IA es un apoyo clínico y NO reemplaza la evaluación de un profesional de la salud.",
                  },
                  {
                    title: "6. Derechos del paciente",
                    body: "Puede acceder, rectificar o eliminar su información. Escríbanos por WhatsApp o al correo de la clínica.",
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-muted/30 border border-border rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Emergencia de salud mental:{" "}
                  <strong>Línea de la Vida 800-911-2000</strong> o <strong>123</strong>.
                </p>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Al hacer clic en <strong>"Acepto y continúo"</strong> acepta este consentimiento
                informado.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-muted-foreground"
                >
                  Volver al inicio
                </button>
                <button
                  type="button"
                  onClick={aceptarConsent}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #0ccec6, #07a8a2)",
                    color: "#031014",
                  }}
                >
                  <Check className="w-4 h-4" /> Acepto y continúo
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

  const completedSections = new Set<string>();
  for (const q of QUESTIONS.slice(0, qIdx)) completedSections.add(q.section);

  return (
    <div
      className="min-h-screen bg-background flex"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-card/50 p-4 gap-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-2">
          Historia clínica
        </p>
        {SECTIONS.map((sec) => {
          const qs = QUESTIONS.filter((q) => q.section === sec.id);
          const answered = qs.filter((q) => answers.has(q.id)).length;
          const active = currentQ?.section === sec.id;
          const done = completedSections.has(sec.id) && !active;
          return (
            <div
              key={sec.id}
              className={clsx(
                "flex items-center gap-2 px-2 py-2 rounded-lg text-xs",
                active && "bg-primary/10 text-primary",
                done && "text-muted-foreground",
                !active && !done && "text-muted-foreground/60"
              )}
            >
              {done ? (
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Circle className={clsx("w-3.5 h-3.5", active ? "text-primary" : "opacity-40")} />
              )}
              <span className="flex-1">{sec.label}</span>
              <span className="text-[10px] opacity-60">
                {answered}/{qs.length}
              </span>
            </div>
          );
        })}
        <p className="mt-auto text-[10px] text-muted-foreground/50 px-2">
          {qIdx + 1}/{QUESTIONS.length} · Conversación cifrada
        </p>
      </aside>

         <div className="flex-1 flex flex-col min-w-0">
           {/* Mensajes */}
           <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
             {msgs.map((m) => (
               <ChatBubble key={m.id} msg={m} />
             ))}
             {isTyping && <TypingDots />}
             {saving && (
               <p className="text-xs text-center text-muted-foreground">
                 Guardando historia clínica...
               </p>
             )}
             <div ref={bottomRef} />
           </div>

           {/* Input */}
           <div className="border-t border-border bg-card/80 px-4 py-3 pb-6">
             {currentQ && !saving && !isTyping && (
               <ChatInput
                 q={currentQ}
                 text={text}
                 setText={setText}
                 selected={selected}
                 toggleOption={(opt: string) =>
                   setSelected((s) =>
                     s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt]
                   )
                 }
                 scaleVal={scaleVal}
                 setScaleVal={setScaleVal}
                 onSend={() => {
                   if (!currentQ) return;

                   if (currentQ.type === "multi" || currentQ.type === "multiselect") {
                     if (!selected.length) return;
                     submitAnswer(selected);
                     return;
                   }

                   if (currentQ.type === "scale") {
                     if (scaleVal == null) return;
                     submitAnswer(String(scaleVal));
                     return;
                   }

                   // text | textarea | number
                   const value = String(text || "").trim();
                   if (!value) return;
                   submitAnswer(value);
                 }}
                 onChoice={(opt: string) => {
                   if (!opt) return;
                   submitAnswer(opt);
                 }}
               />
             )}
           </div>
         </div>
       </div>
     );
   }

function ChatBubble({ msg }: { msg: Msg }) {
  const isBot = msg.role === "bot";
  return (
    <div className={clsx("flex gap-3 items-end", !isBot && "flex-row-reverse")}>
      {isBot && (
        <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/25 shrink-0 mb-5">
          <ImageWithFallback
            src={doctorHero}
            alt="Dr. Nikolas Escobar"
            className="w-full h-full object-cover object-top"
          />
        </div>
      )}
      <div className="max-w-[72%] md:max-w-[60%]">
        <div
          className={clsx(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
            isBot
              ? msg.isWarning
                ? "bg-amber-950/60 border border-amber-500/35 text-amber-100 rounded-bl-sm"
                : "bg-card border border-border text-foreground rounded-bl-sm"
              : "bg-primary/15 border border-primary/25 text-foreground rounded-br-sm"
          )}
        >
          {msg.isWarning && (
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span
                className="text-[10px] text-amber-400 uppercase tracking-widest"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Alerta de riesgo
              </span>
            </div>
          )}
          {msg.content.startsWith("— ") ? (
            <>
              <p
                className="text-[10px] text-primary/60 uppercase tracking-widest mb-2"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {msg.content.split("\n\n")[0].replace(/^— |—$/g, "")}
              </p>
              <span>{msg.content.split("\n\n").slice(1).join("\n\n")}</span>
            </>
          ) : (
            msg.content
          )}
        </div>
        <p
          className={clsx("text-[10px] text-muted-foreground/40 mt-1", !isBot && "text-right")}
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {formatTs(msg.ts)}
        </p>
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
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatInput({
  q,
  text,
  setText,
  selected,
  toggleOption,
  scaleVal,
  setScaleVal,
  onSend,
  onChoice,
}: any) {
  const isSelect = q?.type === "select" || q?.type === "choice";
  const isMulti = q?.type === "multi" || q?.type === "multiselect";

  return (
    <div className="px-1 pb-2">
      {/* SELECT — un clic guarda y avanza */}
      {isSelect && Array.isArray(q.options) && (
        <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
          {q.options.map((o: string) => (
            <button
              key={o}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof onChoice === "function") {
                  onChoice(o);
                } else {
                  console.error("onChoice no está definido");
                }
              }}
              className="px-3.5 py-2.5 rounded-xl text-sm border border-border bg-background/70 text-foreground hover:border-primary hover:bg-primary/15 transition-colors"
            >
              {o}
            </button>
          ))}
        </div>
      )}

      {/* MULTI */}
      {isMulti && Array.isArray(q.options) && (
        <div>
          <div className="flex flex-wrap gap-2 mb-3 max-h-40 overflow-y-auto">
            {q.options.map((o: string) => (
              <button
                key={o}
                type="button"
                onClick={() => toggleOption(o)}
                className={
                  "px-3.5 py-2 rounded-xl text-sm border transition-colors " +
                  (selected?.includes(o)
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background/70")
                }
              >
                {o}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onSend}
            disabled={!selected || selected.length === 0}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
          >
            Confirmar ({selected?.length || 0})
          </button>
        </div>
      )}

      {/* SCALE — un clic guarda */}
      {q?.type === "scale" && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setScaleVal?.(n);
                if (typeof onChoice === "function") onChoice(String(n));
              }}
              className={
                "w-10 h-10 rounded-xl border text-sm font-medium " +
                (scaleVal === n
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border hover:border-primary/50")
              }
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* TEXT */}
      {["text", "textarea", "number"].includes(q?.type) && (
        <div className="flex gap-2 items-end">
          {q.type === "textarea" ? (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={q.placeholder || "Escribe…"}
              rows={2}
              className="flex-1 bg-background/60 border border-border rounded-xl px-4 py-3 text-sm"
            />
          ) : (
            <input
              autoFocus
              type={q.type === "number" ? "number" : "text"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={q.placeholder || "Escribe…"}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend?.();
              }}
              className="flex-1 bg-background/60 border border-border rounded-xl px-4 py-3 text-sm"
            />
          )}
          <button
            type="button"
            onClick={onSend}
            disabled={!text?.trim()}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 4 — DIAGNÓSTICO GEMINI
// ═══════════════════════════════════════════════════════

function DiagnosisPage() {
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("ch_diagnosis") || "null");
    } catch {
      return null;
    }
  });

  const [answers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("ch_answers") || "{}");
    } catch {
      return {};
    }
  });

  const hasAnswers = Object.keys(answers).length > 0;
  const [loading, setLoading] = useState(!diagnosis && hasAnswers);
  const [error, setError] = useState("");

  const riskColors: Record<string, string> = {
    BAJO: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    MEDIO: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    ALTO: "text-orange-400 bg-orange-500/10 border-orange-500/25",
    CRÍTICO: "text-red-400 bg-red-500/10 border-red-500/25",
    CRITICO: "text-red-400 bg-red-500/10 border-red-500/25",
  };

  const PROGRAMAS: Record<
    string,
    { nombre: string; precio: string; desc: string; incluye: string[] }
  > = {
    mes1: {
      nombre: "Programa Mes 1 — Intensivo",
      precio: "$350.000 COP",
      desc: "Inducción, estabilización y seguimiento cercano.",
      incluye: ["Evaluación médica", "Audios de inducción", "Video de bienvenida", "Seguimiento"],
    },
    mes2: {
      nombre: "Programa Mes 2 — Profundización",
      precio: "$650.000 COP",
      desc: "Hábitos, craving y red de apoyo.",
      incluye: ["Todo lo del mes 1", "Más sesiones", "Biblioteca ampliada"],
    },
    mes3: {
      nombre: "Programa Mes 3 — Consolidación",
      precio: "$900.000 COP",
      desc: "Consolidar avances y prevenir recaídas.",
      incluye: ["Plan de 3 meses", "Reuniones grupales", "Contenido premium"],
    },
    mes4: {
      nombre: "Programa Mes 4 — Cierre y bienestar",
      precio: "$1.100.000 COP",
      desc: "Cierre terapéutico y mantenimiento.",
      incluye: ["Programa completo", "Todos los audios/videos", "Acompañamiento prioritario"],
    },
  };

  async function runDiagnosis() {
    if (!hasAnswers) {
      setError("No hay respuestas de historia clínica.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await callGemini(answers, import.meta.env.VITE_GEMINI_API_KEY || "");
      if (!result || typeof result !== "object") {
        throw new Error("Respuesta de IA inválida");
      }
      setDiagnosis(result);
      localStorage.setItem("ch_diagnosis", JSON.stringify(result));
    } catch (e: any) {
      setError(e?.message || "No se pudo generar el diagnóstico.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasAnswers) {
      setLoading(false);
      return;
    }
    if (!diagnosis) {
      runDiagnosis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ——— Sin historia ———
  if (!hasAnswers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="font-medium">No hay historia clínica</h2>
          <p className="text-sm text-muted-foreground">
            Complete primero la evaluación para generar la orientación con IA.
          </p>
          <button
            onClick={() => navigate("/historia")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #0ccec6, #07a8a2)", color: "#031014" }}
          >
            Ir a historia clínica
          </button>
        </div>
      </div>
    );
  }

  // ——— Cargando ———
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <h2 className="font-medium mb-1">Analizando historia clínica</h2>
          <p className="text-sm text-muted-foreground">Gemini AI · Evaluación en curso...</p>
        </div>
      </div>
    );
  }

  // ——— Error ———
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="font-medium mb-2">Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={runDiagnosis}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate("/historia")}
              className="text-sm text-muted-foreground underline"
            >
              Volver a la historia
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ——— Sin diagnóstico (fallback) ———
  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-3">
          <p className="text-sm text-muted-foreground">No hay diagnóstico para mostrar.</p>
          <button
            onClick={runDiagnosis}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm"
          >
            Generar diagnóstico
          </button>
        </div>
      </div>
    );
  }

  const riskKey = String(diagnosis?.nivel_riesgo || "MEDIO").toUpperCase();
  const riskClass = riskColors[riskKey] || riskColors.MEDIO;
  const progKey = String(diagnosis?.programa_recomendado || "mes1").toLowerCase();
  const prog = PROGRAMAS[progKey] || PROGRAMAS.mes1;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Orientación diagnóstica</h1>
            <p className="text-sm text-muted-foreground">
              Apoyo clínico con IA · validación médica pendiente
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </button>
        </div>

        {(riskKey === "CRÍTICO" || riskKey === "CRITICO") && (
          <div className="flex items-start gap-3 bg-red-950/40 border border-red-500/30 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300 mb-1">Riesgo crítico</p>
              <p className="text-xs text-red-300/70">
                Línea de la Vida: 800-911-2000 · Emergencias: 123
              </p>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h2 className="text-sm font-medium">Resumen clínico</h2>
            <span className={clsx("text-[10px] px-2.5 py-1 rounded-full border", riskClass)}>
              Riesgo {diagnosis?.nivel_riesgo || "MEDIO"}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{diagnosis?.resumen || "Sin resumen"}</p>
        </div>

        {diagnosis?.mensaje_al_paciente && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-medium mb-2">Mensaje para usted</h2>
            <p className="text-sm text-muted-foreground">{diagnosis.mensaje_al_paciente}</p>
          </div>
        )}

        {Array.isArray(diagnosis?.recomendaciones_inmediatas) &&
          diagnosis.recomendaciones_inmediatas.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-medium mb-3">Recomendaciones inmediatas</h2>
              <ul className="space-y-2">
                {diagnosis.recomendaciones_inmediatas.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Paquete recomendado — venta */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Recomendado para usted
          </p>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold">{prog.nombre}</h3>
              <p className="text-sm text-muted-foreground mt-1">{prog.desc}</p>
            </div>
            <p className="text-lg font-bold text-primary shrink-0">{prog.precio}</p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2">
            {prog.incluye.map((item) => (
              <li key={item} className="text-xs text-muted-foreground flex gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            La orientación con IA es un punto de partida. El tratamiento lo acompañan psicólogos,
            médicos y psiquiatras de la clínica.
          </p>
          <button
            onClick={() => navigate("/tratamientos")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20"
            style={{ background: "linear-gradient(135deg, #0ccec6, #07a8a2)", color: "#031014" }}
          >
            Ver paquetes y activar plan
          </button>
        </div>

        {/* Acciones secundarias */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/acompanamiento")}
            className="px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-colors"
          >
            Hablar / desahogarme
          </button>
          <button
            onClick={() => navigate("/mi-historial")}
            className="px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-colors"
          >
            Mi historial
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("ch_diagnosis");
              setDiagnosis(null);
              runDiagnosis();
            }}
            className="px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            Regenerar análisis
          </button>
        </div>
      </div>
    </div>
  );
}

function TreatmentsPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [selectedProgram, setSelectedProgram] = useState<typeof PROGRAMS[0] | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Consultorio Holístico IPS</p>
          <h1 className="text-2xl font-semibold">{t("ourPrograms")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("programsSub")}</p>
        </div>

        <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-2.5">
            <CreditCard className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-300 mb-1">Integración Pasarela de Pago (modo demo activo)</p>
              <p className="text-xs text-blue-300/70 leading-relaxed">
                Para activar pagos reales añada <code className="bg-blue-500/20 px-1 py-0.5 rounded text-[10px]">VITE_WOMPI_PUBLIC_KEY</code> o <code className="bg-blue-500/20 px-1 py-0.5 rounded text-[10px]">VITE_STRIPE_PUBLISHABLE_KEY</code> en el archivo .env
              </p>
            </div>
          </div>
        </div>

        {/* Banner total ahorros si compra los 4 meses */}
        <div className="bg-gradient-to-r from-primary/15 via-teal-500/10 to-primary/5 border border-primary/30 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Oferta programa completo</p>
            <p className="text-sm font-semibold">Al completar los 4 meses — <span className="text-primary">Meses 5 y 6 completamente GRATIS</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">Ahorra $6.200.000 adicionales + continuidad terapéutica garantizada durante 6 meses</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground line-through">$13.300.000</p>
            <p className="text-xl font-bold text-primary">$10.600.000</p>
            <p className="text-[10px] text-emerald-400">4 meses + 2 gratis</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {PROGRAMS.map(prog => (
            <div key={prog.id} className={clsx("bg-card border rounded-2xl overflow-hidden relative", prog.highlight ? "border-primary/40" : "border-border")}>
              {prog.highlight && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx("text-[10px] font-medium px-2.5 py-1 rounded-full", prog.highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")} style={{ fontFamily: "'DM Mono', monospace" }}>{prog.tag}</span>
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
                {/* Media incluida en el plan */}
                <div className="border border-border rounded-xl p-3 mb-4 bg-muted/20">
                  <p className="text-[10px] text-primary/70 uppercase tracking-widest mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>{t("includedInPlan")}</p>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-medium">{prog.includedAudioIds.length}</span>
                      <span className="text-[10px] text-muted-foreground">audios</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium">{prog.includedVideoIds.length}</span>
                      <span className="text-[10px] text-muted-foreground">videos</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {AUDIOS.filter(a => prog.includedAudioIds.includes(a.id)).slice(0, 3).map(a => (
                      <span key={a.id} className="text-[10px] bg-purple-500/10 text-purple-400/80 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">{a.title}</span>
                    ))}
                    {prog.includedAudioIds.length > 3 && <span className="text-[10px] text-muted-foreground/60">+{prog.includedAudioIds.length - 3} más</span>}
                  </div>
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

        {/* Meses 5 y 6 GRATIS */}
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/3 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-primary/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>Incluido sin costo adicional</p>
              <p className="text-sm font-semibold">Meses 5 y 6 — GRATIS al completar el programa</p>
            </div>
            <span className="ml-auto text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full font-medium shrink-0">Valor: $6.200.000</span>
          </div>
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
            {Object.entries(BONUS_MONTHS).map(([key, bonus]) => (
              <div key={key} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>{bonus.tag}</span>
                </div>
                <div className="space-y-2">
                  {bonus.sessions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-muted/30 rounded-xl p-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <s.icon className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium">{s.count}× {s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-3 italic">{bonus.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios adicionales */}
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
  const [step, setStep] = useState<"form"|"processing"|"success"|"error">("form");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: userName });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [payError, setPayError] = useState("");
  const [confirmId] = useState(`CH-${Date.now().toString(36).toUpperCase()}`);

  const wompiKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined;
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  const gatewayActive = !!(wompiKey || stripeKey);
  const gatewayName = wompiKey ? "Wompi" : stripeKey ? "Stripe" : "Demo";

  function fmtCard(v:string){return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();}
  function fmtExp(v:string){const d=v.replace(/\D/g,"").slice(0,4);return d.length>=2?`${d.slice(0,2)}/${d.slice(2)}`:d;}
  function validate(){const e:Record<string,string>={};if(card.number.replace(/\s/g,"").length<16)e.number="Número inválido";if(card.expiry.length<5)e.expiry="Fecha inválida";if(card.cvv.length<3)e.cvv="CVV inválido";if(!card.name.trim())e.name="Ingrese el nombre";setErrors(e);return Object.keys(e).length===0;}

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStep("processing");
    setPayError("");

    try {
      if (wompiKey) {
        // ── WOMPI (Colombia) ──────────────────────────────────────
        // Documentación: https://docs.wompi.co/docs/en/widget
        // Para producción usar el widget de Wompi o llamar al backend:
        //   POST /api/pagos → tu backend llama a Wompi con la clave privada
        //
        // Ejemplo llamada directa (solo con clave pública para tokenizar):
        // const res = await fetch("https://sandbox.wompi.co/v1/tokens/cards", {
        //   method: "POST",
        //   headers: { Authorization: `Bearer ${wompiKey}`, "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     number: card.number.replace(/\s/g,""),
        //     exp_month: card.expiry.split("/")[0],
        //     exp_year: "20" + card.expiry.split("/")[1],
        //     cvc: card.cvv,
        //     card_holder: card.name,
        //   }),
        // });
        // const { data } = await res.json();
        // Luego envía data.id (token) a tu backend para crear la transacción
        console.log("WOMPI — clave configurada:", wompiKey.slice(0, 12) + "...");
        await new Promise(r => setTimeout(r, 2000)); // Remover en producción
        setStep("success");

      } else if (stripeKey) {
        // ── STRIPE (Internacional) ────────────────────────────────
        // Documentación: https://stripe.com/docs/payments/accept-a-payment
        // Requiere: pnpm add @stripe/stripe-js @stripe/react-stripe-js
        //
        // Flujo recomendado:
        // 1. Tu backend crea un PaymentIntent y retorna el clientSecret
        // 2. El frontend usa stripe.confirmCardPayment(clientSecret, {...})
        //
        // const stripe = await loadStripe(stripeKey);
        // const { error } = await stripe!.confirmCardPayment(clientSecret, {
        //   payment_method: {
        //     card: { number: card.number, exp_month, exp_year, cvc: card.cvv },
        //     billing_details: { name: card.name },
        //   },
        // });
        // if (error) throw new Error(error.message);
        console.log("STRIPE — clave configurada:", stripeKey.slice(0, 12) + "...");
        await new Promise(r => setTimeout(r, 2000)); // Remover en producción
        setStep("success");

      } else {
        // ── MODO DEMO (sin clave configurada) ─────────────────────
        await new Promise(r => setTimeout(r, 2500));
        setStep("success");
      }
    } catch (err: any) {
      setPayError(err.message || "Error procesando el pago. Intente de nuevo.");
      setStep("error");
    }
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3 mb-5">
              <Headphones className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <span>{program.includedAudioIds.length} audios + {program.includedVideoIds.length} videos ya disponibles en su cuenta</span>
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Cerrar</button>
          </div>
        ):step==="error"?(
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/15 border border-destructive/25 flex items-center justify-center mx-auto mb-4"><X className="w-7 h-7 text-destructive"/></div>
            <h2 className="font-semibold text-lg mb-2">Error en el pago</h2>
            <p className="text-sm text-muted-foreground mb-6">{payError}</p>
            <button onClick={()=>{setStep("form");setPayError("");}} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Intentar de nuevo</button>
            <button onClick={onClose} className="w-full mt-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          </div>
        ):step==="processing"?(
          <div className="p-10 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4"/>
            <p className="font-medium mb-1">Procesando pago...</p>
            <p className="text-sm text-muted-foreground">Por favor no cierre esta ventana.</p>
            <p className="text-[10px] text-muted-foreground/40 mt-3" style={{fontFamily:"'DM Mono',monospace"}}>Gateway: {gatewayName}</p>
          </div>
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
              {/* Estado del gateway */}
              <div className={clsx("flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs",
                gatewayActive ? "bg-emerald-500/8 border border-emerald-500/20 text-emerald-400" : "bg-amber-500/8 border border-amber-500/20 text-amber-400/80")}>
                <span className={clsx("w-2 h-2 rounded-full shrink-0", gatewayActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400/60")} />
                {gatewayActive
                  ? `Pagos activos — ${gatewayName}`
                  : "Modo demo — Agrega VITE_WOMPI_PUBLIC_KEY o VITE_STRIPE_PUBLISHABLE_KEY en .env"}
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Lock className="w-4 h-4"/>{t("payBtn")} {formatCOP(program.price)}
              </button>
              <p className="text-[10px] text-muted-foreground/40 text-center" style={{fontFamily:"'DM Mono',monospace"}}>SSL · {gatewayName} · Consultorio Holístico IPS</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 6 — BIBLIOTECA DE AUDIOS Y VIDEOS
// Reproductor HTML5 real + modal de video
// ═══════════════════════════════════════════════════════

function AudioPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"audios" | "videos">("audios");
  const [activeCat, setActiveCat] = useState<"all" | "autohipnosis" | "binaural" | "podcasts">("all");
  const [playing, setPlaying] = useState<number | null>(null);
  const [watchingVideo, setWatchingVideo] = useState<VideoItem | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const planActivo = getPlanActivo(); // null | "mes1" | "mes2" | "mes3" | "mes4"
  const filtered = activeCat === "all" ? AUDIOS : AUDIOS.filter((a) => a.cat === activeCat);

  function handlePlay(audio: AudioItem) {
    if (!puedeReproducir(audio, planActivo)) {
      navigate("/tratamientos");
      return;
    }
    if (playing === audio.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (audio.audioSrc) {
      const el = new Audio(audio.audioSrc);
      el.play().catch(() => {});
      el.onended = () => setPlaying(null);
      audioRef.current = el;
      setPlaying(audio.id);
    } else {
      // Sin archivo: solo demo visual
      setPlaying(audio.id);
    }
  }

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>
            Audioterapia Holística
          </p>
          <h1 className="text-2xl font-semibold">
            {t("audioLib")} & {t("videoLib")}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">{t("audioSub")}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Plan activo:{" "}
            <strong className="text-foreground">
              {planActivo ? planActivo.toUpperCase() : "Ninguno (solo contenido gratis)"}
            </strong>
            {!planActivo && (
              <button
                onClick={() => navigate("/tratamientos")}
                className="ml-2 text-primary underline font-medium"
              >
                Ver paquetes
              </button>
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("audios")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "audios" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Headphones className="w-4 h-4" />
            {t("audioLib")}
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "videos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Video className="w-4 h-4" />
            {t("videoLib")}
          </button>
        </div>

        {activeTab === "audios" && (
          <>
            <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Volume2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Suero Terapia con Audio Binaural</p>
                <p className="text-xs text-muted-foreground">
                  Audio para sesiones de suero. Voz del Dr. + binaural theta (60 min). Incluido desde Mes 1.
                </p>
              </div>
              <span
                className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full shrink-0"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Mes 1+
              </span>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {(["all", "autohipnosis", "binaural", "podcasts"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm border transition-all whitespace-nowrap",
                    activeCat === cat
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {cat === "all"
                    ? "Todos"
                    : cat === "autohipnosis"
                    ? t("autohipnosis")
                    : cat === "binaural"
                    ? t("binaural")
                    : t("podcasts")}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((audio) => {
                const unlocked = puedeReproducir(audio, planActivo);
                const isPlaying = playing === audio.id;
                const CatIcon =
                  audio.cat === "autohipnosis" ? Mic : audio.cat === "binaural" ? Music : Headphones;
                const catColor =
                  audio.cat === "autohipnosis"
                    ? "text-purple-400"
                    : audio.cat === "binaural"
                    ? "text-blue-400"
                    : "text-amber-400";

                return (
                  <div
                    key={audio.id}
                    className={clsx(
                      "bg-card border rounded-2xl p-4 transition-all",
                      isPlaying ? "border-primary/40" : "border-border hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handlePlay(audio)}
                        className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          unlocked ? "bg-primary/15 hover:bg-primary/25" : "bg-muted"
                        )}
                      >
                        {!unlocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground/50" />
                        ) : isPlaying ? (
                          <Pause className="w-4 h-4 text-primary" />
                        ) : (
                          <Play className="w-4 h-4 text-primary" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CatIcon className={clsx("w-3.5 h-3.5 shrink-0", catColor)} />
                          <span
                            className="text-[10px] text-muted-foreground uppercase"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {audio.duration}
                          </span>
                          <span
                            className={clsx(
                              "ml-auto text-[10px] px-1.5 py-0.5 rounded-full border",
                              audio.free
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {audio.free ? t("free") : audio.plans[0]?.toUpperCase() || t("premium")}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">{audio.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{audio.desc}</p>
                        {audio.doctor && (
                          <p className="text-[10px] text-primary/70 mt-1.5">🎙️ Voz del Dr. Nikolas Escobar</p>
                        )}
                        {unlocked && !audio.audioSrc && (
                          <p
                            className="text-[10px] text-muted-foreground/40 mt-1"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            Agrega audioSrc para reproducción real
                          </p>
                        )}
                      </div>
                    </div>

                    {isPlaying && (
                      <div className="mt-3 flex items-center gap-0.5 h-6">
                        {Array.from({ length: 28 }, (_, i) => (
                          <div
                            key={i}
                            className="bg-primary/60 rounded-full w-1 animate-pulse"
                            style={{
                              height: `${14 + Math.sin(i * 0.6) * 10}px`,
                              animationDelay: `${i * 0.05}s`,
                            }}
                          />
                        ))}
                        <span
                          className="ml-3 text-[10px] text-primary"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {audio.audioSrc ? "REPRODUCIENDO" : "DEMO VISUAL"}
                        </span>
                      </div>
                    )}

                    {!unlocked && (
                      <button
                        onClick={() => navigate("/tratamientos")}
                        className="text-[10px] text-primary mt-2 underline font-medium"
                      >
                        {t("locked")} — ver paquetes
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "videos" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {VIDEOS.map((video) => {
                const unlocked = puedeReproducir(video, planActivo);
                return (
                  <div
                    key={video.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                          <Video className="w-10 h-10" />
                          <span className="text-[10px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                            {video.duration}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (!unlocked) {
                            navigate("/tratamientos");
                            return;
                          }
                          setWatchingVideo(video);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div
                          className={clsx(
                            "w-14 h-14 rounded-full flex items-center justify-center",
                            unlocked ? "bg-primary/90" : "bg-muted/80"
                          )}
                        >
                          {unlocked ? (
                            <Play className="w-6 h-6 text-white ml-1" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      <span
                        className={clsx(
                          "absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full border",
                          video.free
                            ? "bg-emerald-500/80 text-white border-emerald-500"
                            : "bg-black/50 text-muted-foreground border-border"
                        )}
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {video.free ? t("free") : video.plans[0]?.toUpperCase() || t("premium")}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={clsx(
                            "text-[10px] px-2 py-0.5 rounded-md",
                            video.cat === "autohipnosis"
                              ? "bg-purple-500/15 text-purple-400"
                              : "bg-blue-500/15 text-blue-400"
                          )}
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {video.cat}
                        </span>
                        <span
                          className="text-[10px] text-muted-foreground ml-auto"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {video.duration}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{video.title}</p>
                      <p className="text-xs text-muted-foreground mb-3">{video.desc}</p>
                      {video.doctor && (
                        <p className="text-[10px] text-primary/70 mb-3">🎙️ Con el Dr. Nikolas Escobar</p>
                      )}
                      <button
                        onClick={() => {
                          if (!unlocked) {
                            navigate("/tratamientos");
                            return;
                          }
                          setWatchingVideo(video);
                        }}
                        className={clsx(
                          "w-full py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",
                          unlocked
                            ? "bg-primary/15 text-primary hover:bg-primary/25"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {unlocked ? (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            {t("watchVideo")}
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            {t("locked")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Reuniones grupales */}
        <div className="mt-10" id="grupos">
          <h2 className="font-medium mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {t("groupMeetings")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{t("groupSub")}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                week: "Semana 1",
                title: "Sesión de Inicio",
                desc: "Bienvenida, presentación grupal y metas terapéuticas.",
                day: "Lunes",
                hour: "7:00 PM COT",
              },
              {
                week: "Semana 3",
                title: "Sesión de Progreso",
                desc: "Revisión de avances y refuerzo motivacional.",
                day: "Lunes",
                hour: "7:00 PM COT",
              },
            ].map((m) => (
              <div key={m.week} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-2.5 py-1 rounded-full"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {m.week}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {m.day} · {m.hour}
                  </span>
                </div>
                <h3 className="text-sm font-medium mb-1">{m.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{m.desc}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                    <Video className="w-3 h-3" />
                    {t("virtual")} (Zoom)
                  </span>
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />
                    {t("presencial")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {watchingVideo && (
        <VideoModal video={watchingVideo} onClose={() => setWatchingVideo(null)} t={t} />
      )}
    </div>
  );
}

function VideoModal({
  video,
  onClose,
  t,
}: {
  video: VideoItem;
  onClose: () => void;
  t: (k: any) => string;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-medium">{video.title}</h2>
            <p className="text-xs text-muted-foreground">
              {video.duration} · {video.cat}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="aspect-video bg-black flex items-center justify-center relative">
          {video.videoSrc ? (
            <video
              src={video.videoSrc}
              controls
              autoPlay
              className="w-full h-full"
              style={{ background: "#000" }}
            />
          ) : video.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="text-center text-muted-foreground/40">
              <Video className="w-16 h-16 mx-auto mb-3" />
              <p className="text-sm">Video no disponible aún</p>
              <p className="text-xs mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                Agrega videoSrc o youtubeId en VIDEOS
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground">{video.desc}</p>
          {video.doctor && (
            <p className="text-[10px] text-primary/70 mt-2">🎙️ Con el Dr. Nikolas Escobar</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN ROUTE GUARD
// ═══════════════════════════════════════════════════════

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.rol !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ═══════════════════════════════════════════════════════
// ADMIN PAGE — Panel de administración completo
// ═══════════════════════════════════════════════════════

type AdminTab = "resumen" | "usuarios" | "historias" | "contactos";

interface AdminUsuario {
  id: number; nombre: string; email: string; rol: string; activo: boolean; creadoEn?: string;
}
interface AdminHistoria {
  id: number; usuarioId?: number; respuestas?: Record<string, string>; creadoEn?: string; consentimientoAceptado?: boolean;
}
interface AdminContacto {
  id: number; nombre: string; telefono?: string; tipo?: string; mensaje?: string; estado: string; creadoEn?: string;
}
interface AdminResumen {
  totalUsuarios: number; usuariosActivos: number; totalHistorias: number; totalContactos: number; contactosNuevos: number;
}

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("resumen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumen, setResumen] = useState<AdminResumen | null>(null);
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [historias, setHistorias] = useState<AdminHistoria[]>([]);
  const [contactos, setContactos] = useState<AdminContacto[]>([]);
  // Modal crear/editar usuario
  const [modalUsuario, setModalUsuario] = useState<{ open: boolean; editId?: number }>({ open: false });
  const [formUsuario, setFormUsuario] = useState({ nombre: "", email: "", password: "", rol: "PACIENTE" });
  const [savingUser, setSavingUser] = useState(false);
  // Modal ver historia

  const [historiaVer, setHistoriaVer] = useState<any>(null);

  const jwt = localStorage.getItem("ch_jwt") || "";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` };

  const apiFetch = async (path: string, opts?: RequestInit) => {
    const res = await fetch(`${API_URL}/api/admin${path}`, { headers, ...opts });
    const json = await res.json();
    if (!json.success) throw new Error(json.mensaje || "Error del servidor");
    return json.data;
  };

  const loadTab = async (t: AdminTab) => {
    setLoading(true); setError("");
    try {
      if (t === "resumen") { setResumen(await apiFetch("/resumen")); }
      else if (t === "usuarios") { setUsuarios(await apiFetch("/usuarios")); }
      else if (t === "historias") { setHistorias(await apiFetch("/historias")); }
      else if (t === "contactos") { setContactos(await apiFetch("/contactos")); }
    } catch (e: any) { setError(e.message || "Error al cargar datos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTab(tab); }, [tab]);

  const handleTabChange = (t: AdminTab) => { setTab(t); };

  const toggleActivo = async (u: AdminUsuario) => {
    try {
      if (u.activo) {
        await apiFetch(`/usuarios/${u.id}`, { method: "DELETE" });
      } else {
        await apiFetch(`/usuarios/${u.id}/activar`, { method: "PUT" });
      }
      loadTab("usuarios");
    } catch (e: any) { alert(e.message); }
  };

  const abrirCrearUsuario = () => {
    setFormUsuario({ nombre: "", email: "", password: "", rol: "PACIENTE" });
    setModalUsuario({ open: true });
  };

  const abrirEditarUsuario = (u: AdminUsuario) => {
    setFormUsuario({ nombre: u.nombre, email: u.email, password: "", rol: u.rol });
    setModalUsuario({ open: true, editId: u.id });
  };

  const guardarUsuario = async () => {
    setSavingUser(true);
    try {
      const body: any = { nombre: formUsuario.nombre, rol: formUsuario.rol };
      if (modalUsuario.editId) {
        if (formUsuario.password) body.password = formUsuario.password;
        await apiFetch(`/usuarios/${modalUsuario.editId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        body.email = formUsuario.email;
        body.password = formUsuario.password || "Clinica2024!";
        await apiFetch("/usuarios", { method: "POST", body: JSON.stringify(body) });
      }
      setModalUsuario({ open: false });
      loadTab("usuarios");
    } catch (e: any) { alert(e.message); }
    finally { setSavingUser(false); }
  };

  const cambiarEstadoContacto = async (id: number, estado: string) => {
    try {
      await apiFetch(`/contactos/${id}/estado`, { method: "PUT", body: JSON.stringify({ estado }) });
      loadTab("contactos");
    } catch (e: any) { alert(e.message); }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "resumen", label: "Dashboard", icon: Activity },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "historias", label: "Historias Clínicas", icon: ClipboardList },
    { id: "contactos", label: "Contactos", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      {/* Header Admin */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold">Panel Administrativo</h1>
            <p className="text-xs text-muted-foreground">Consultorio Holístico · Cuídate Salud Plena</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.name}</span>
          <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">ADMIN</span>
          <button onClick={() => navigate("/")} className="ml-2 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => handleTabChange(t.id)}
              className={clsx("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-7 h-7 animate-spin mr-3" /> Cargando...
          </div>
        ) : (
          <>
            {/* ── RESUMEN ── */}
            {tab === "resumen" && resumen && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Total Usuarios", value: resumen.totalUsuarios, icon: Users, color: "text-blue-400 bg-blue-400/10" },
                    { label: "Usuarios Activos", value: resumen.usuariosActivos, icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10" },
                    { label: "Historias Clínicas", value: resumen.totalHistorias, icon: ClipboardList, color: "text-violet-400 bg-violet-400/10" },
                    { label: "Total Contactos", value: resumen.totalContactos, icon: Phone, color: "text-amber-400 bg-amber-400/10" },
                    { label: "Contactos Nuevos", value: resumen.contactosNuevos, icon: MessageSquare, color: "text-red-400 bg-red-400/10" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
                      <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.color)}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Acciones Rápidas</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleTabChange("usuarios")} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm transition-colors">
                      <Users className="w-4 h-4" /> Gestionar Usuarios
                    </button>
                    <button onClick={() => handleTabChange("historias")} className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 px-4 py-2 rounded-xl text-sm transition-colors">
                      <ClipboardList className="w-4 h-4" /> Ver Historias
                    </button>
                    <button onClick={() => handleTabChange("contactos")} className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-sm transition-colors">
                      <MessageSquare className="w-4 h-4" /> Revisar Contactos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── USUARIOS ── */}
            {tab === "usuarios" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Gestión de Usuarios ({usuarios.length})</h2>
                  <button onClick={abrirCrearUsuario}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                    <User className="w-4 h-4" /> Nuevo Usuario
                  </button>
                </div>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Rol</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Estado</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usuarios.map(u => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                                {u.nombre.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{u.nombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium",
                              u.rol === "ADMIN" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                              {u.rol}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium",
                              u.activo ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => abrirEditarUsuario(u)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Editar">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {u.rol !== "ADMIN" && (
                                <button onClick={() => toggleActivo(u)}
                                  className={clsx("p-1.5 rounded-lg transition-colors text-xs",
                                    u.activo ? "text-red-400 hover:bg-red-500/10" : "text-emerald-400 hover:bg-emerald-500/10")}
                                  title={u.activo ? "Desactivar" : "Activar"}>
                                  {u.activo ? <X className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usuarios.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">No hay usuarios registrados</div>
                  )}
                </div>
              </div>
            )}

            {/* ── HISTORIAS ── */}
            {tab === "historias" && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold">Historias Clínicas ({historias.length})</h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">ID</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Paciente</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Consentimiento</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {historias.map(h => (
                        <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{h.id}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                            {h.respuestas?.nombre || h.respuestas?.["nombre"] || `Usuario ${h.usuarioId || ""}`}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {h.creadoEn ? new Date(h.creadoEn).toLocaleDateString("es-CO") : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium",
                              h.consentimientoAceptado ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400")}>
                              {h.consentimientoAceptado ? "Aceptado" : "Pendiente"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setHistoriaVer(h)}
                              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {historias.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">No hay historias clínicas registradas</div>
                  )}
                </div>
              </div>
            )}

            {/* ── CONTACTOS ── */}
            {tab === "contactos" && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold">Mensajes de Contacto ({contactos.length})</h2>
                <div className="space-y-3">
                  {contactos.map(c => (
                    <div key={c.id} className="bg-card border border-border rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{c.nombre}</span>
                            {c.telefono && <span className="text-xs text-muted-foreground">{c.telefono}</span>}
                            {c.tipo && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{c.tipo}</span>}
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium",
                              c.estado === "NUEVO" ? "bg-red-500/15 text-red-400" :
                              c.estado === "LEIDO" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400")}>
                              {c.estado}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{c.mensaje}</p>
                          {c.creadoEn && (
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {new Date(c.creadoEn).toLocaleString("es-CO")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {c.estado !== "LEIDO" && (
                            <button onClick={() => cambiarEstadoContacto(c.id, "LEIDO")}
                              className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
                              Leído
                            </button>
                          )}
                          {c.estado !== "RESPONDIDO" && (
                            <button onClick={() => cambiarEstadoContacto(c.id, "RESPONDIDO")}
                              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                              Respondido
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {contactos.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm bg-card border border-border rounded-2xl">
                      No hay mensajes de contacto
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Crear/Editar Usuario */}
      {modalUsuario.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">{modalUsuario.editId ? "Editar Usuario" : "Crear Usuario"}</h3>
              <button onClick={() => setModalUsuario({ open: false })} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre completo</label>
                <input value={formUsuario.nombre} onChange={e => setFormUsuario(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  placeholder="Juan Carlos Pérez" />
              </div>
              {!modalUsuario.editId && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                  <input type="email" value={formUsuario.email} onChange={e => setFormUsuario(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    placeholder="correo@ejemplo.com" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {modalUsuario.editId ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
                </label>
                <input type="password" value={formUsuario.password} onChange={e => setFormUsuario(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  placeholder={modalUsuario.editId ? "••••••••" : "Mínimo 6 caracteres"} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Rol</label>
                <select value={formUsuario.rol} onChange={e => setFormUsuario(p => ({ ...p, rol: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50">
                  <option value="PACIENTE">PACIENTE</option>
                    <option value="MEDICO">MEDICO</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalUsuario({ open: false })}
                className="flex-1 border border-border rounded-xl py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button onClick={guardarUsuario} disabled={savingUser}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {modalUsuario.editId ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Historia */}
      {historiaVer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 shrink-0">
              <div>
                <p className="text-[10px] text-primary uppercase tracking-widest mb-0.5">
                  Historia clínica · Confidencial
                </p>
                <h2 className="font-semibold text-lg">
                  #{historiaVer.id} · {historiaVer.nombre || "Paciente"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Riesgo: <strong>{historiaVer.nivelRiesgo || "—"}</strong>
                  {" · "}
                  Programa: <strong>{historiaVer.programaRecomendado || "—"}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoriaVer(null)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body scrollable */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
              {/* Datos básicos */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/20 rounded-xl px-3 py-2">
                  <span className="text-muted-foreground">Edad</span>
                  <p className="font-medium text-sm">{historiaVer.edad || "—"}</p>
                </div>
                <div className="bg-muted/20 rounded-xl px-3 py-2">
                  <span className="text-muted-foreground">Género</span>
                  <p className="font-medium text-sm">{historiaVer.genero || "—"}</p>
                </div>
                <div className="bg-muted/20 rounded-xl px-3 py-2">
                  <span className="text-muted-foreground">Ciudad</span>
                  <p className="font-medium text-sm">{historiaVer.ciudad || "—"}</p>
                </div>
                <div className="bg-muted/20 rounded-xl px-3 py-2">
                  <span className="text-muted-foreground">Email usuario</span>
                  <p className="font-medium text-sm break-all">
                    {historiaVer.usuarioEmail || historiaVer.email || "—"}
                  </p>
                </div>
              </div>

              {historiaVer.motivoConsulta && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Motivo de consulta</p>
                  <p className="text-sm bg-muted/20 rounded-xl px-3 py-2">{historiaVer.motivoConsulta}</p>
                </div>
              )}

              {/* Diagnóstico IA */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Diagnóstico IA (solo admin / médico)
                </p>
                {historiaVer.diagnosticoIa ? (
                  <pre className="text-xs bg-muted/30 border border-border rounded-xl p-3 max-h-56 overflow-auto whitespace-pre-wrap">
                    {typeof historiaVer.diagnosticoIa === "string"
                      ? (() => {
                          try {
                            return JSON.stringify(JSON.parse(historiaVer.diagnosticoIa), null, 2);
                          } catch {
                            return historiaVer.diagnosticoIa;
                          }
                        })()
                      : JSON.stringify(historiaVer.diagnosticoIa, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/20 rounded-xl px-3 py-3">
                    Sin diagnóstico IA guardado en esta historia. El paciente debe generar el análisis en
                    /diagnostico.
                  </p>
                )}
              </div>

              {/* Respuestas de la historia */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Respuestas del cuestionario</p>
                <div className="space-y-2">
                  {historiaVer.respuestas &&
                    Object.entries(historiaVer.respuestas).map(([k, v]) => (
                      <div key={k} className="flex gap-3 bg-muted/20 rounded-xl px-3 py-2">
                        <span className="text-xs text-muted-foreground capitalize min-w-[140px] shrink-0">
                          {String(k).replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium break-words">{String(v)}</span>
                      </div>
                    ))}

                  {/* Fallback: campos planos si no hay objeto respuestas */}
                  {!historiaVer.respuestas && (
                    <>
                      {[
                        ["sustancias", historiaVer.sustancias],
                        ["sustancia principal", historiaVer.sustanciaPrincipal],
                        ["frecuencia", historiaVer.frecuencia],
                        ["último consumo", historiaVer.ultimoConsumo],
                        ["ideación", historiaVer.ideacion],
                        ["diagnósticos previos", historiaVer.diagnosticos],
                        ["enfermedades", historiaVer.enfermedades],
                      ]
                        .filter(([, v]) => v != null && String(v).trim() !== "")
                        .map(([k, v]) => (
                          <div key={String(k)} className="flex gap-3 bg-muted/20 rounded-xl px-3 py-2">
                            <span className="text-xs text-muted-foreground capitalize min-w-[140px] shrink-0">
                              {k}
                            </span>
                            <span className="text-sm font-medium break-words">{String(v)}</span>
                          </div>
                        ))}

                      {![
                        historiaVer.sustancias,
                        historiaVer.sustanciaPrincipal,
                        historiaVer.frecuencia,
                        historiaVer.ultimoConsumo,
                        historiaVer.ideacion,
                        historiaVer.diagnosticos,
                        historiaVer.enfermedades,
                      ].some((v) => v != null && String(v).trim() !== "") && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          Sin datos de respuestas
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setHistoriaVer(null)}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function MedicoRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  const rol = String(user.rol || "").toUpperCase();
  if (!["MEDICO", "ADMIN", "PSICOLOGO", "PSIQUIATRA"].includes(rol)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function MedicoDashboard() {
  const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";
  const jwt = localStorage.getItem("ch_jwt") || "";
  const [historias, setHistorias] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [obsList, setObsList] = useState<any[]>([]);
  const [obs, setObs] = useState("");
  const [valida, setValida] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };

  useEffect(() => {
    fetch(`${API}/api/medico/historias`, { headers })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || j.mensaje || "Error al cargar historias");
        setHistorias(Array.isArray(j.data) ? j.data : []);
      })
      .catch((e) => {
        setHistorias([]);
        setError(e.message || "Backend /api/medico no responde");
      })
      .finally(() => setLoading(false));
  }, []);

  function formatDiag(raw: any): string {
    if (raw == null || raw === "") return "";
    if (typeof raw === "object") {
      try {
        return JSON.stringify(raw, null, 2);
      } catch {
        return String(raw);
      }
    }
    const s = String(raw).trim();
    try {
      const p = JSON.parse(s);
      return typeof p === "object" ? JSON.stringify(p, null, 2) : s;
    } catch {
      return s;
    }
  }

  const abrir = async (h: any) => {
    setSel(h);
    setObs("");
    setValida(false);
    setError("");
    try {
      const r = await fetch(`${API}/api/medico/historias/${h.id}/observaciones`, { headers });
      const j = await r.json();
      setObsList(Array.isArray(j.data) ? j.data : []);
    } catch {
      setObsList([]);
    }
  };

  const guardarObs = async () => {
    if (!sel || !obs.trim()) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`${API}/api/medico/historias/${sel.id}/observaciones`, {
        method: "POST",
        headers,
        body: JSON.stringify({ texto: obs.trim(), validaIa: valida }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || j.mensaje || "No se pudo guardar");
      setObs("");
      setValida(false);
      await abrir(sel);
    } catch (e: any) {
      setError(e.message || "No se pudo guardar. Verifique backend /api/medico");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
      {/* Lista */}
      <div>
        <h1 className="text-xl font-bold mb-1">Panel médico</h1>
        <p className="text-xs text-muted-foreground mb-4">
          Acceso confidencial · Diagnósticos e historias de pacientes
        </p>
        {error && !sel && (
          <p className="text-xs text-red-400 mb-3 border border-red-500/30 rounded-lg p-2">{error}</p>
        )}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {historias.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => abrir(h)}
              className={
                "w-full text-left bg-card border rounded-xl p-3 transition-colors " +
                (sel?.id === h.id
                  ? "border-primary/60 bg-primary/5"
                  : "border-border hover:border-primary/40")
              }
            >
              <div className="text-sm font-medium">
                #{h.id} · {h.nombre || "Paciente"}
              </div>
              <div className="text-xs text-muted-foreground">
                Riesgo {h.nivelRiesgo || "—"} · {h.programaRecomendado || "sin programa"}
              </div>
              {h.usuarioEmail && (
                <div className="text-[10px] text-muted-foreground/70 mt-0.5">{h.usuarioEmail}</div>
              )}
              <div className="text-[10px] mt-1">
                {h.diagnosticoIa ? (
                  <span className="text-emerald-400">Diagnóstico IA disponible</span>
                ) : (
                  <span className="text-muted-foreground">Sin diagnóstico IA</span>
                )}
              </div>
            </button>
          ))}
          {historias.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay historias o el backend /api/medico aún no responde.
            </p>
          )}
        </div>
      </div>

      {/* Detalle */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        {!sel ? (
          <p className="text-sm text-muted-foreground">Seleccione una historia para ver el diagnóstico</p>
        ) : (
          <>
            <h2 className="font-semibold">
              Historia #{sel.id} · {sel.nombre || "Paciente"}
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>
                Edad: <strong className="text-foreground">{sel.edad || "—"}</strong>
              </span>
              <span>
                Género: <strong className="text-foreground">{sel.genero || "—"}</strong>
              </span>
              <span>
                Ciudad: <strong className="text-foreground">{sel.ciudad || "—"}</strong>
              </span>
              <span>
                Riesgo: <strong className="text-foreground">{sel.nivelRiesgo || "—"}</strong>
              </span>
              <span className="col-span-2">
                Programa: <strong className="text-foreground">{sel.programaRecomendado || "—"}</strong>
              </span>
            </div>

            {sel.motivoConsulta && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Motivo de consulta</p>
                <p className="text-sm bg-muted/30 rounded-lg p-2">{sel.motivoConsulta}</p>
              </div>
            )}

            {(sel.sustancias || sel.sustanciaPrincipal) && (
              <div className="text-xs space-y-1 bg-muted/20 rounded-lg p-2">
                {sel.sustancias && (
                  <p>
                    Sustancias: <strong>{sel.sustancias}</strong>
                  </p>
                )}
                {sel.sustanciaPrincipal && (
                  <p>
                    Principal: <strong>{sel.sustanciaPrincipal}</strong>
                  </p>
                )}
                {sel.frecuencia && (
                  <p>
                    Frecuencia: <strong>{sel.frecuencia}</strong>
                  </p>
                )}
                {sel.ideacion && (
                  <p className="text-amber-400">
                    Ideación: <strong>{sel.ideacion}</strong>
                  </p>
                )}
              </div>
            )}

            <p className="text-xs font-medium text-muted-foreground">
              Diagnóstico IA (confidencial · solo staff)
            </p>
            <pre className="text-xs bg-muted/30 rounded-xl p-3 max-h-56 overflow-auto whitespace-pre-wrap">
              {formatDiag(sel.diagnosticoIa) ||
                "Sin diagnóstico IA guardado en esta historia.\nEl paciente debe completar evaluación y generar diagnóstico en /diagnostico."}
            </pre>

            <div className="space-y-2">
              <p className="text-xs font-medium">Observaciones del profesional</p>
              {obsList.length === 0 && (
                <p className="text-xs text-muted-foreground">Sin observaciones todavía.</p>
              )}
              {obsList.map((o) => (
                <div key={o.id} className="text-xs border border-border rounded-lg p-2">
                  <p>{o.texto}</p>
                  <p className="text-muted-foreground mt-1">
                    {o.validaIa ? "✓ Valida IA · " : ""}
                    {o.medicoNombre ? `${o.medicoNombre} · ` : ""}
                    {o.creadoEn ? new Date(o.creadoEn).toLocaleString("es-CO") : ""}
                  </p>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={valida}
                onChange={(e) => setValida(e.target.checked)}
              />
              Valido la orientación de la IA (con mis notas)
            </label>

            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={4}
              className="w-full bg-muted/40 border border-border rounded-xl p-3 text-sm"
              placeholder="Observación clínica del profesional..."
            />

            {error && sel && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="button"
              onClick={guardarObs}
              disabled={saving || !obs.trim()}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
            >
              {saving ? "Guardando…" : "Guardar observación"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════
//Acompañamiento
// ══════════════════════════════════════════════════════

function AcompanamientoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";
  const [msgs, setMsgs] = useState<{ role: "user" | "bot"; text: string }[]>([
    {
      role: "bot",
      text:
        `Hola${user?.name ? ", " + String(user.name).split(" ")[0] : ""}. ` +
        "Este es un espacio seguro de acompañamiento. Puede contarme cómo se siente. " +
        "Emergencia: Línea de la Vida 800-911-2000 o 123.",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  // Si no tiene historia clínica → ir a /historia
  useEffect(() => {
    const jwt = localStorage.getItem("ch_jwt") || "";
    if (!jwt) {
      navigate("/auth");
      return;
    }
    fetch(`${API}/api/historia/existe`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((r) => r.json())
      .then((j) => {
        const tiene = j?.data?.tieneHistoria === true;
        if (!tiene) navigate("/historia");
      })
      .catch(() => {
        // Si falla el endpoint, no bloqueamos el chat
      })
      .finally(() => setChecking(false));
  }, [API, navigate]);

  async function enviar() {
    const mensaje = text.trim();
    if (!mensaje || loading) return;
    setText("");
    setMsgs((m) => [...m, { role: "user", text: mensaje }]);
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);

    try {
      const jwt = localStorage.getItem("ch_jwt") || "";
      const r = await fetch(`${API}/api/chat/acompanamiento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ mensaje }),
        signal: controller.signal,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || "No se pudo responder");
      setMsgs((m) => [
        ...m,
        { role: "bot", text: j.data?.respuesta || "Estoy aquí para escucharle." },
      ]);
    } catch (e: any) {
      const msg =
        e?.name === "AbortError"
          ? "La respuesta está tardando demasiado. Intente de nuevo en unos segundos."
          : e?.message?.includes("503") || e?.message?.includes("UNAVAILABLE")
          ? "El servicio de IA está saturado temporalmente. Espere un momento e intente otra vez."
          : e?.message || "Error de conexión. Intente de nuevo.";
      setMsgs((m) => [...m, { role: "bot", text: msg }]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-3xl mx-auto pb-8">
      <header className="px-4 py-4 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">Acompañamiento</h1>
          <p className="text-xs text-muted-foreground">
            Espacio para ser escuchado · Apoyo + equipo clínico
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => navigate("/mi-historial")}
            className="text-xs px-3 py-2 rounded-xl border border-border"
          >
            Mi historial
          </button>
          <button
            onClick={() => navigate("/tratamientos")}
            className="text-xs px-3 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
          >
            Ver paquetes
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 min-h-[50vh]">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] bg-primary/15 border border-primary/25 rounded-2xl px-4 py-3 text-sm"
                : "mr-auto max-w-[85%] bg-card border border-border rounded-2xl px-4 py-3 text-sm"
            }
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Escribiendo…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

     <div className="px-4 pb-2">
       <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
         <span>
           Paso recomendado: <strong className="text-foreground">Programa Mes 1</strong>. Luego agenda consulta.
         </span>
         <div className="flex gap-2 flex-wrap">
           <button
             type="button"
             onClick={() => navigate("/tratamientos")}
             className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium"
           >
             Ver paquetes
           </button>
           <button
             type="button"
             onClick={() => navigate("/agendar-cita")}
             className="text-xs px-3 py-1.5 rounded-lg border border-border"
           >
             Agendar cita
           </button>
         </div>
       </div>
     </div>

      <div className="border-t border-border p-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          placeholder="Escriba cómo se siente…"
          className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm"
        />
        <button
          onClick={enviar}
          disabled={loading || !text.trim()}
          className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
//fin acompañamiento

//mi-historia

function MiHistorialPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";

  useEffect(() => {
    const jwt = localStorage.getItem("ch_jwt");
    if (!jwt) {
      setError("Debe iniciar sesión");
      setLoading(false);
      return;
    }
    fetch(`${API}/api/historia/mias`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || "No se pudo cargar el historial");
        setItems(j.data || []);
      })
      .catch((e) => setError(e.message || "Error de red"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Mi historial clínico</h1>
            <p className="text-sm text-muted-foreground">
              Resumen de sus evaluaciones registradas en la clínica.
            </p>
          </div>
          <button
            onClick={() => navigate("/historia")}
            className="text-xs px-3 py-2 rounded-xl border border-border hover:bg-muted"
          >
            Nueva evaluación
          </button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {items.map((h) => (
          <div key={h.id} className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <div className="flex justify-between gap-2 flex-wrap">
              <span className="text-sm font-medium">Historia #{h.id}</span>
              <span className="text-xs text-muted-foreground">
                {h.creadoEn
                  ? new Date(h.creadoEn).toLocaleString("es-CO")
                  : h.consentimientoFecha
                  ? new Date(h.consentimientoFecha).toLocaleString("es-CO")
                  : "—"}
              </span>
            </div>
            <p className="text-xs">
              Riesgo: <strong>{h.nivelRiesgo || "Pendiente"}</strong>
              {" · "}
              Programa: <strong>{h.programaRecomendado || "—"}</strong>
            </p>
            {h.diagnosticoIa && (
              <p className="text-xs text-muted-foreground line-clamp-3">
                {typeof h.diagnosticoIa === "string"
                  ? h.diagnosticoIa.replace(/[{}\[\]"]/g, " ").slice(0, 220)
                  : "Diagnóstico registrado"}
              </p>
            )}
            <button
              onClick={() => navigate("/diagnostico")}
              className="text-xs text-primary hover:underline"
            >
              Ver orientación / paquetes
            </button>
          </div>
        ))}

        {!error && items.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground border border-border rounded-2xl">
            Aún no tiene historias registradas.
            <div className="mt-3">
              <button
                onClick={() => navigate("/historia")}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
              >
                Iniciar historia clínica
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// AGENDAR CITA + MIS CITAS
// ═══════════════════════════════════════════════════════

function AgendarCitaPage() {
  const navigate = useNavigate();
  const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";
  const [modalidad, setModalidad] = useState<"VIRTUAL_REAL" | "APOYO_IA">("VIRTUAL_REAL");
  const [pros, setPros] = useState<any[]>([]);
  const [profId, setProfId] = useState("");
  const [fecha, setFecha] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const jwt = localStorage.getItem("ch_jwt") || "";
    fetch(`${API}/api/citas/profesionales`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((r) => r.json())
      .then((j) => setPros(Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : []))
      .catch(() => setPros([]));
  }, [API]);

  /** datetime-local → formato que acepta Java LocalDateTime (sin Z ni ms) */
  function toLocalDateTime(value: string): string | null {
    if (!value) return null;
    // "2026-08-19T10:23" → "2026-08-19T10:23:00"
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      return value + ":00";
    }
    // limpia ms / Z si vinieran
    return value
      .replace(/\.\d{3}Z?$/i, "")
      .replace(/Z$/i, "")
      .slice(0, 19);
  }

  async function submit() {
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const jwt = localStorage.getItem("ch_jwt") || "";
      const body: Record<string, unknown> = {
        modalidad,
        notasPaciente: notas?.trim() || null,
      };

      if (modalidad === "VIRTUAL_REAL") {
        if (!profId) throw new Error("Seleccione un profesional");
        if (!fecha) throw new Error("Seleccione fecha y hora");
        body.profesionalId = Number(profId);
        body.fechaHora = toLocalDateTime(fecha); // ✅ sin toISOString
      } else {
        // APOYO_IA
        body.fechaHora = fecha
          ? toLocalDateTime(fecha)
          : toLocalDateTime(new Date().toISOString().slice(0, 16));
      }

      const r = await fetch(`${API}/api/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || j.mensaje || "No se pudo agendar");

      setMsg("Cita registrada. Se notificó por correo.");
      if (modalidad === "APOYO_IA") {
        setTimeout(() => navigate("/acompanamiento"), 1200);
      } else {
        setTimeout(() => navigate("/mis-citas"), 1200);
      }
    } catch (e: any) {
      setErr(e.message || "Error al agendar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-background px-4 py-8"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      <div className="max-w-lg mx-auto space-y-4">
        <button type="button" onClick={() => navigate(-1)} className="text-sm text-muted-foreground">
          ← Volver
        </button>
        <h1 className="text-xl font-bold">Agendar consulta</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Profesional real (videollamada) o apoyo por chat. Crisis:{" "}
          <strong>800-911-2000</strong> · <strong>123</strong>.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModalidad("VIRTUAL_REAL")}
            className={`flex-1 py-2.5 rounded-xl text-sm border ${
              modalidad === "VIRTUAL_REAL" ? "border-primary bg-primary/10" : "border-border"
            }`}
          >
            Profesional real
          </button>
          <button
            type="button"
            onClick={() => setModalidad("APOYO_IA")}
            className={`flex-1 py-2.5 rounded-xl text-sm border ${
              modalidad === "APOYO_IA" ? "border-primary bg-primary/10" : "border-border"
            }`}
          >
            Apoyo IA (chat)
          </button>
        </div>

        {modalidad === "VIRTUAL_REAL" && (
          <select
            value={profId}
            onChange={(e) => setProfId(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="">Seleccione profesional…</option>
            {pros.map((p: any) => (
              <option key={p.id} value={p.id}>
                {(p.nombre || p.name || p.email) +
                  (p.especialidad ? " · " + p.especialidad : p.rol ? " · " + p.rol : "")}
              </option>
            ))}
          </select>
        )}

        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm"
        />

        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          placeholder="Cómo se siente, si el sismo le afectó…"
          className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm"
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading || (modalidad === "VIRTUAL_REAL" && (!profId || !fecha))}
          className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #0ccec6, #07a8a2)", color: "#031014" }}
        >
          {loading ? "Agendando…" : "Confirmar y notificar por correo"}
        </button>

        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        {err && <p className="text-sm text-red-400">{err}</p>}
      </div>
    </div>
  );
}
function MisCitasPage() {
  const navigate = useNavigate();
  const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const jwt = localStorage.getItem("ch_jwt") || "";
    fetch(`${API}/api/citas/mias`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || j.mensaje || "No se pudieron cargar las citas");
        setCitas(Array.isArray(j.data) ? j.data : []);
      })
      .catch((e) => setErr(e.message || "Error de conexión"))
      .finally(() => setLoading(false));
  }, [API]);

  function formatFecha(f: string | null) {
    if (!f) return "Por confirmar";
    try {
      return new Date(f).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return f;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background px-4 py-8"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-primary uppercase tracking-widest">Mis citas</p>
            <h1 className="text-xl font-bold">Consultas agendadas</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Videollamada con profesional o chat de apoyo IA
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/agendar-cita")}
            className="text-sm px-4 py-2 rounded-xl font-medium"
            style={{ background: "linear-gradient(135deg, #0ccec6, #07a8a2)", color: "#031014" }}
          >
            + Nueva cita
          </button>
        </div>

        {err && (
          <p className="text-sm text-red-400 border border-red-500/30 rounded-xl p-3">{err}</p>
        )}

        {citas.length === 0 && !err && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Aún no tiene citas registradas.</p>
            <button
              type="button"
              onClick={() => navigate("/agendar-cita")}
              className="text-sm px-4 py-2 rounded-xl border border-border hover:border-primary/40"
            >
              Agendar ahora
            </button>
          </div>
        )}

        <div className="space-y-3">
          {citas.map((c) => {
            const esIa =
              String(c.modalidad || "").toUpperCase().includes("IA") ||
              String(c.modalidad || "").toUpperCase() === "APOYO_IA";
            const profNombre =
              c.profesional?.nombre ||
              c.profesionalNombre ||
              (esIa ? "Apoyo IA (chat)" : "Profesional");
            const meet = c.meetLink || c.meet_link;

            return (
              <div
                key={c.id}
                className="bg-card border border-border rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      #{c.id} · {profNombre}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatFecha(c.fechaHora || c.fecha_hora)}
                    </p>
                  </div>
                  <span
                    className={
                      "text-[10px] px-2 py-1 rounded-lg border " +
                      (c.estado === "CONFIRMADA"
                        ? "border-emerald-500/30 text-emerald-400"
                        : "border-border text-muted-foreground")
                    }
                  >
                    {c.estado || "PENDIENTE"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Modalidad: <strong className="text-foreground">{c.modalidad || "—"}</strong>
                </p>

                {c.notasPaciente && (
                  <p className="text-xs bg-muted/30 rounded-lg px-3 py-2">{c.notasPaciente}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {esIa ? (
                    <button
                      type="button"
                      onClick={() => navigate("/acompanamiento")}
                      className="text-sm px-4 py-2 rounded-xl font-medium"
                      style={{
                        background: "linear-gradient(135deg, #0ccec6, #07a8a2)",
                        color: "#031014",
                      }}
                    >
                      Entrar al chat de apoyo
                    </button>
                  ) : meet ? (
                    <a
                      href={meet.startsWith("http") ? meet : `https://${meet}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm px-4 py-2 rounded-xl font-medium inline-flex items-center"
                      style={{
                        background: "linear-gradient(135deg, #0ccec6, #07a8a2)",
                        color: "#031014",
                      }}
                    >
                      Unirse a videollamada
                    </a>
                  ) : (
                    <p className="text-xs text-amber-400">
                      El profesional aún no cargó el link de Meet. Se enviará por correo.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WHATSAPP FLOATING BUTTON — visible en toda la app
// ═══════════════════════════════════════════════════════

function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola, vengo desde la web del Consultorio Holístico Cuídate Salud Plena. Quisiera información sobre sus servicios.")}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 group"
      style={{ padding: "12px 18px 12px 14px" }}
      title="Chatear por WhatsApp"
    >
      {/* Ícono WhatsApp SVG */}
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="text-sm font-medium whitespace-nowrap">Chatea ahora</span>
      {/* Ping animado */}
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full">
        <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
      </span>
    </a>
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
          <div
            className="min-h-screen bg-background"
            style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
          >
            <NavBar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />

              <Route path="/historia" element={<PrivateRoute><HistoriaPage /></PrivateRoute>} />
              <Route path="/diagnostico" element={<PrivateRoute><DiagnosisPage /></PrivateRoute>} />
              <Route path="/tratamientos" element={<PrivateRoute><TreatmentsPage /></PrivateRoute>} />
              <Route path="/audios" element={<PrivateRoute><AudioPage /></PrivateRoute>} />
              <Route path="/mi-historial" element={<PrivateRoute><MiHistorialPage /></PrivateRoute>} />
              <Route path="/acompanamiento" element={<PrivateRoute><AcompanamientoPage /></PrivateRoute>} />

              <Route path="/agendar-cita" element={<PrivateRoute><AgendarCitaPage /></PrivateRoute>} />
              <Route path="/mis-citas" element={<PrivateRoute><MisCitasPage /></PrivateRoute>} />

              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/medico" element={<MedicoRoute><MedicoDashboard /></MedicoRoute>} />


              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <WhatsAppFloat />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}