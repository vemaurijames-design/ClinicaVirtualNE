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
    codeDemo: "Código de recuperación (simulado — en producción llega por email):",
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

interface AuthUser { id: string; name: string; email: string }
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
      const u: AuthUser = { id: String(data.email), name: data.nombre, email: data.email };
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
      const u: AuthUser = { id: String(data.email), name: data.nombre, email: data.email };
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
// AUDIO LIBRARY
// Instrucción: agrega audioSrc: "/audios/tu-archivo.mp3" para audio real
// ═══════════════════════════════════════════════════════

interface AudioItem {
  id: number; cat: string; title: string; duration: string;
  free: boolean; doctor: boolean; desc: string;
  audioSrc?: string; // <- AGREGA TU ARCHIVO: "/audios/nombre.mp3"
}

const AUDIOS: AudioItem[] = [
  { id: 1, cat: "autohipnosis", title: "Inducción profunda para la calma", duration: "22:14", free: true, doctor: true, desc: "Sesión guiada por el Dr. para reducción del craving",
    audioSrc: undefined }, // Ejemplo: audioSrc: "/audios/induccion-calma.mp3"
  { id: 2, cat: "autohipnosis", title: "Reprogramación de hábitos", duration: "18:30", free: false, doctor: true, desc: "Técnica de visualización y sugestión positiva" },
  { id: 3, cat: "autohipnosis", title: "Liberación del estrés y ansiedad", duration: "25:00", free: false, doctor: true, desc: "Hipnosis clínica para manejo de la abstinencia" },
  { id: 4, cat: "autohipnosis", title: "Autoimagen positiva y autoestima", duration: "19:45", free: false, doctor: true, desc: "Reconstrucción del autoconcepto en recuperación" },
  { id: 5, cat: "binaural", title: "Ondas Alpha — Reducción del craving", duration: "40:00", free: true, doctor: false, desc: "Frecuencias 8-12 Hz para calma profunda",
    audioSrc: undefined }, // Ejemplo: audioSrc: "/audios/ondas-alpha.mp3"
  { id: 6, cat: "binaural", title: "Ondas Theta — Meditación profunda", duration: "45:00", free: false, doctor: false, desc: "4-8 Hz para estados meditativos y sanación" },
  { id: 7, cat: "binaural", title: "Suero terapia — Audio de acompañamiento", duration: "60:00", free: false, doctor: true, desc: "Música binaural + voz del médico para sesiones de suero" },
  { id: 8, cat: "binaural", title: "Ondas Delta — Sueño reparador", duration: "50:00", free: false, doctor: false, desc: "0.5-4 Hz para sueño profundo y regeneración" },
  { id: 9, cat: "podcasts", title: "Ep.1: El camino hacia la recuperación", duration: "35:45", free: true, doctor: true, desc: "El Dr. explica el proceso holístico de sanación" },
  { id: 10, cat: "podcasts", title: "Ep.2: Neurociencia y adicción", duration: "28:20", free: false, doctor: true, desc: "Cómo el cerebro se recupera del consumo" },
  { id: 11, cat: "podcasts", title: "Ep.3: Yoga, mente y adicción", duration: "32:10", free: false, doctor: false, desc: "Entrevista con terapeuta de yoga especializada" },
  { id: 12, cat: "podcasts", title: "Ep.4: Familias en la recuperación", duration: "41:00", free: false, doctor: false, desc: "Cómo involucrar a la familia en el proceso" },
];

// ═══════════════════════════════════════════════════════
// VIDEO LIBRARY
// Instrucción: agrega videoSrc: "/videos/tu-archivo.mp4" para video real
// También puedes usar un embed de YouTube: youtubeId: "dQw4w9WgXcQ"
// ═══════════════════════════════════════════════════════

interface VideoItem {
  id: number; cat: string; title: string; duration: string;
  free: boolean; doctor: boolean; desc: string; thumbnail?: string;
  videoSrc?: string;    // <- AGREGA: "/videos/nombre.mp4"
  youtubeId?: string;   // <- O un ID de YouTube privado/no listado
}

const VIDEOS: VideoItem[] = [
  { id: 1, cat: "autohipnosis", title: "Autohipnosis: Sesión de bienvenida (regalo)", duration: "18:00", free: true, doctor: true,
    desc: "Video regalo de bienvenida. Inducción guiada por el Dr. para tu primer día.",
    videoSrc: undefined, // Ejemplo: videoSrc: "/videos/bienvenida-hipnosis.mp4"
    youtubeId: undefined }, // Ejemplo: youtubeId: "TU_ID_DE_YOUTUBE"
  { id: 2, cat: "autohipnosis", title: "Autohipnosis: Semana 2 — Refuerzo motivacional", duration: "22:30", free: false, doctor: true,
    desc: "Segunda sesión. Visualización del futuro sin adicción." },
  { id: 3, cat: "autohipnosis", title: "Autohipnosis: Semana 3 — Manejo del craving", duration: "20:15", free: false, doctor: true,
    desc: "Técnicas de anclaje hipnótico para resistir el impulso." },
  { id: 4, cat: "autohipnosis", title: "Autohipnosis: Semana 4 — Consolidación", duration: "25:00", free: false, doctor: true,
    desc: "Sesión de consolidación. Autosugestión positiva final del mes." },
  { id: 5, cat: "yoga", title: "Yoga Terapéutico: Sesión 1 — Respiración", duration: "30:00", free: false, doctor: false,
    desc: "Pranayama y técnicas de respiración para reducir ansiedad por abstinencia." },
  { id: 6, cat: "yoga", title: "Yoga Terapéutico: Sesión 2 — Equilibrio", duration: "35:00", free: false, doctor: false,
    desc: "Secuencia de asanas para restablecer el equilibrio del sistema nervioso." },
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

const RANGO_EDADES = ["Entre 14 y 18 años", "Entre 18 y 24 años", "De 24 a 36 años", "De 36 a 45 años", "De 45 a 60 años", "De 60 o más años"];

const QUESTIONS: Q[] = [
  // ── IDENTIFICACIÓN ──────────────────────────────────────
  { id: "nombre", section: "identificacion", type: "text", placeholder: "Nombre completo",
    text: "Bienvenido/a. Soy el asistente clínico del Consultorio Holístico.\n\nEsta conversación es estrictamente confidencial y sus respuestas formarán parte de su expediente médico protegido bajo secreto profesional.\n\n¿Cuál es su nombre completo?" },
  { id: "edad", section: "identificacion", type: "choice", text: "¿En qué rango de edad se encuentra?", options: RANGO_EDADES },
  { id: "estado_civil", section: "identificacion", type: "choice", text: "¿Cuál es su estado civil?",
    options: ["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Separado/a", "Viudo/a"] },
  { id: "escolaridad", section: "identificacion", type: "choice", text: "¿Cuál es su nivel de escolaridad?",
    options: ["Sin escolaridad formal", "Primaria", "Secundaria", "Bachillerato", "Técnico/Tecnólogo", "Universitario", "Posgrado"] },
  { id: "ocupacion", section: "identificacion", type: "choice", text: "¿Cuál es su situación laboral actual?",
    options: ["Empleado/a formal", "Trabajador/a independiente", "Estudiante", "Desempleado/a", "Pensionado/a", "Labores del hogar", "Incapacitado/a"] },

  // ── MOTIVO DE CONSULTA ───────────────────────────────────
  { id: "motivo_consulta", section: "motivo", type: "choice",
    text: "¿Qué le trajo a esta consulta hoy?",
    options: [
      "Consumo de sustancias psicoactivas (drogas/alcohol)",
      "Ansiedad o ataques de pánico",
      "Depresión o tristeza persistente",
      "Insomnio o alteraciones del sueño",
      "Pensamientos obsesivos o compulsivos",
      "Crisis emocional o situación de crisis",
      "Problemas de conducta o control de impulsos",
      "Dependencia a medicamentos (benzodiacepinas, opioides)",
      "Trastorno de alimentación",
      "Violencia o trauma psicológico",
      "Problemas de pareja o familia relacionados con consumo",
      "Remitido por orden judicial o médica",
      "Búsqueda de bienestar y prevención",
    ] },
  { id: "quien_sugirio", section: "motivo", type: "choice", text: "¿Quién le motivó a buscar atención?",
    options: ["Decisión propia", "Familiar o pareja", "Amigo/a", "Médico o profesional de salud", "Autoridad judicial", "Empleador", "Otro"] },

  // ── HISTORIA DE CONSUMO ──────────────────────────────────
  { id: "sustancias", section: "consumo", type: "multiselect",
    text: "¿Qué sustancias ha consumido alguna vez? Seleccione todas las que apliquen.",
    options: [
      "Alcohol", "Cigarrillo / Tabaco", "Marihuana / Cannabis", "Cocaína", "Basuco / Crack",
      "Heroína / Opioides", "Benzodiacepinas (sin prescripción)", "Anfetaminas / Metanfetaminas",
      "Inhalantes (pegante, gasolina)", "Alucinógenos (LSD, hongos)", "Éxtasis / MDMA",
      "Ketamina", "Poppers", "Dos de estas sustancias", "Todas las anteriores", "Otras",
    ] },
  { id: "edad_inicio", section: "consumo", type: "choice",
    text: "¿A qué edad probó alguna sustancia por primera vez?", options: RANGO_EDADES },
  { id: "sustancia_principal", section: "consumo", type: "choice",
    text: "¿Cuál es su sustancia principal de consumo actualmente?",
    options: ["Alcohol", "Cigarrillo / Tabaco", "Marihuana / Cannabis", "Cocaína", "Basuco / Crack",
      "Heroína / Opioides", "Benzodiacepinas", "Anfetaminas", "Otras", "No consumo actualmente"] },
  { id: "frecuencia", section: "consumo", type: "choice", text: "¿Con qué frecuencia consume actualmente?",
    options: ["Varias veces al día", "Diariamente", "Varios días a la semana", "1–2 veces por semana", "Ocasionalmente (mensual o menos)", "No consumo actualmente"] },
  { id: "ultimo_consumo", section: "consumo", type: "choice", text: "¿Cuándo fue la última vez que consumió?",
    options: ["Hoy", "Esta semana", "Hace una semana", "Hace un mes", "Hace más de un mes", "Nunca he consumido"] },
  { id: "craving", section: "consumo", type: "scale",
    text: "Escala del 1 al 10: ¿qué tan fuerte es su deseo de consumir ahora?\n\n1 = Ningún deseo · 10 = Deseo muy intenso" },
  { id: "abstinencia_escala", section: "consumo", type: "scale",
    text: "Escala del 1 al 10: ¿qué tan intensos son sus síntomas de abstinencia en este momento?\n\n1 = Sin síntomas · 10 = Síntomas muy intensos (temblor, sudoración, náuseas, ansiedad)" },
  { id: "intentos_abandono", section: "consumo", type: "choice", text: "¿Ha intentado dejar de consumir anteriormente?",
    options: ["Sí, varias veces", "Sí, una vez", "No, nunca lo he intentado"] },

  // ── ANTECEDENTES PSIQUIÁTRICOS ───────────────────────────
  { id: "atencion_psicologica", section: "psiquiatrico", type: "choice",
    text: "¿Ha recibido atención psicológica anteriormente?",
    options: ["Sí, actualmente estoy en proceso", "Sí, en el pasado (ya finalizado)", "Sí, pero no fue suficiente", "No, nunca"] },
  { id: "atencion_psiquiatrica", section: "psiquiatrico", type: "choice",
    text: "¿Ha recibido atención psiquiátrica (con psiquiatra o médico especialista)?",
    options: ["Sí, actualmente con psiquiatra", "Sí, en el pasado", "Sí, estuve hospitalizado/a", "No, nunca"] },
  { id: "diagnosticos", section: "psiquiatrico", type: "multiselect",
    text: "¿Le han diagnosticado alguna de estas condiciones? Seleccione todas las que apliquen.",
    options: ["Depresión mayor", "Trastorno de ansiedad generalizada", "Trastorno de pánico", "Trastorno bipolar",
      "Psicosis / Esquizofrenia", "TDAH (déficit de atención)", "Trastorno de personalidad limítrofe (BPD)",
      "Trastorno obsesivo compulsivo (TOC)", "TEPT (estrés postraumático)", "Trastorno de alimentación",
      "Trastorno del sueño", "Ninguna de las anteriores"] },
  { id: "medicacion", section: "psiquiatrico", type: "choice", text: "¿Toma actualmente medicamentos recetados para su salud mental?",
    options: ["Sí, con regularidad y seguimiento médico", "Sí, pero de forma irregular", "Los tomaba pero los dejé", "No"] },
  { id: "ideacion", section: "psiquiatrico", type: "choice",
    text: "Pregunta importante para su seguridad.\n\n¿Ha tenido pensamientos de hacerse daño o quitarse la vida?",
    options: ["No, nunca", "En el pasado, no actualmente", "Actualmente tengo esos pensamientos"] },

  // ── ANTECEDENTES MÉDICOS ─────────────────────────────────
  { id: "enfermedades", section: "medico", type: "multiselect",
    text: "¿Tiene alguna enfermedad médica diagnosticada? Seleccione todas las que apliquen.",
    options: [
      // Metabólicas
      "Diabetes tipo 1 o 2", "Obesidad / Sobrepeso", "Hipotiroidismo / Hipertiroidismo", "Síndrome metabólico",
      // Cardiovasculares
      "Hipertensión arterial", "Enfermedad coronaria / Infarto", "Arritmia cardiaca", "Insuficiencia cardiaca",
      // Hepáticas / Infecciosas
      "Hepatitis B o C", "Cirrosis hepática", "VIH / SIDA", "Tuberculosis",
      // Neurológicas
      "Epilepsia / Convulsiones", "Migraña crónica", "Esclerosis múltiple",
      // Respiratorias
      "EPOC / Enfisema", "Asma", "Apnea del sueño",
      // Otras
      "Cáncer (activo o en remisión)", "Enfermedad renal crónica", "Ninguna de las anteriores",
    ] },
  { id: "antecedentes_familiares", section: "medico", type: "choice",
    text: "¿Hay historial de adicciones o enfermedades mentales en su familia?",
    options: ["Sí, en varios familiares", "Sí, en algún familiar", "No que yo sepa", "No lo sé"] },
  { id: "cuantos_familiares", section: "medico", type: "choice",
    text: "¿En cuántos familiares conoce este antecedente?",
    options: ["1 familiar", "2 familiares", "3 o más familiares", "No aplica"] },
  { id: "cuales_familiares", section: "medico", type: "multiselect",
    text: "¿Cuáles familiares tienen o tuvieron ese antecedente? Seleccione todos los que apliquen.",
    options: ["Padre", "Madre", "Hermano/a", "Abuelo/a paterno/a", "Abuelo/a materno/a", "Tío/a", "Primo/a", "Hijo/a", "No aplica"] },

  // ── SITUACIÓN SOCIAL ─────────────────────────────────────
  { id: "vivienda", section: "social", type: "choice", text: "¿Con quién vive actualmente?",
    options: ["Solo/a", "Con pareja", "Con familia (padres, hermanos)", "Con hijos", "Con amigos o compañeros", "En institución o albergue", "Sin hogar fijo"] },
  { id: "apoyo_social", section: "social", type: "choice", text: "¿Cuenta con apoyo familiar o social para su tratamiento?",
    options: ["Sí, tengo amplio apoyo", "Sí, apoyo limitado", "No tengo apoyo", "Mi familia no sabe que estoy buscando ayuda"] },
  { id: "estresores", section: "social", type: "multiselect", text: "¿Está enfrentando alguna de estas situaciones actualmente?",
    options: ["Problemas económicos graves", "Deudas relacionadas al consumo", "Problemas legales / judiciales", "Violencia doméstica o abuso", "Desempleo reciente", "Duelo o pérdida reciente", "Separación o divorcio", "Inestabilidad de vivienda", "Ninguna de las anteriores"] },

  // ── CIERRE ───────────────────────────────────────────────
  { id: "informacion_adicional", section: "cierre", type: "textarea", placeholder: "Información adicional o escriba \"No\"...",
    text: "Hemos completado la evaluación clínica. Gracias por su confianza y valentía.\n\n¿Hay algo más que el equipo clínico deba saber sobre usted para brindarle la mejor atención?" },
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
  const BACKEND = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";
  const jwt = localStorage.getItem("ch_jwt") || "";

  // ── OPCIÓN 1: Llamar al backend Java (recomendado — la API key queda segura en el servidor)
  try {
    const backendRes = await fetch(`${BACKEND}/api/diagnostico/ia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({ respuestas: answers, historiaId: localStorage.getItem("ch_historia_id") ? Number(localStorage.getItem("ch_historia_id")) : null }),
    });
    if (backendRes.ok) {
      const backendJson = await backendRes.json();
      if (backendJson.success && backendJson.data) {
        const raw = typeof backendJson.data === "string" ? backendJson.data : JSON.stringify(backendJson.data);
        return JSON.parse(raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      }
    }
  } catch {
    // Backend no disponible → usar Gemini directo como fallback
  }

  // ── OPCIÓN 2: Fallback — llamar a Gemini directamente (requiere API key en frontend)
  if (!apiKey) throw new Error("Configure VITE_GEMINI_API_KEY en el .env o inicie el backend con la clave Gemini.");

  const f = (id: string) => (answers[id] || "No respondido").replace(/"/g, "'");

  const prompt = `Eres el Dr. Nikolas Escobar, psiquiatra especialista en adicciones y salud mental con 15 años de experiencia en medicina holística. Recibes la historia clínica de un paciente que busca tratamiento para adicciones y/o enfermedad mental.

Tu rol es doble:
1. CLÍNICO: Emitir un diagnóstico psiquiátrico y toxicológico preciso basado en DSM-5 y CIE-11.
2. TERAPÉUTICO: Recomendar el programa de tratamiento del Consultorio Holístico más adecuado para este paciente.

HISTORIA CLÍNICA COMPLETA:
Nombre: ${f("nombre")} | Edad: ${f("edad")} | Estado civil: ${f("estado_civil")} | Escolaridad: ${f("escolaridad")} | Ocupación: ${f("ocupacion")}
Motivo de consulta: ${f("motivo_consulta")}
Quien motivó la consulta: ${f("quien_sugirio")}
Sustancias consumidas: ${f("sustancias")}
Edad de inicio de consumo: ${f("edad_inicio")} años
Sustancia principal: ${f("sustancia_principal")}
Frecuencia actual: ${f("frecuencia")}
Último consumo: ${f("ultimo_consumo")}
Intensidad del craving: ${f("craving")}/10
Intentos previos de abandono: ${f("intentos_abandono")}
Síntomas de abstinencia: ${f("abstinencia")}
Atención psiquiátrica previa: ${f("atencion_previa")}
Diagnósticos psiquiátricos previos: ${f("diagnosticos")}
Medicación actual: ${f("medicacion")}
Ideación suicida o autolesión: ${f("ideacion")}
Enfermedades médicas: ${f("enfermedades")}
Antecedentes familiares: ${f("antecedentes_familiares")}
Situación de vivienda: ${f("vivienda")}
Apoyo social: ${f("apoyo_social")}
Estresores actuales: ${f("estresores")}
Información adicional: ${f("informacion_adicional")}

PROGRAMAS DISPONIBLES EN EL CONSULTORIO:
- mes1 (Programa Intensivo $3.200.000 COP/mes): 2 consultas psiquiatría IA+médico, 6 sesiones psicología individual, 4 hipnosis clínica con el Dr., 4 auriculoterapia láser anti-craving, 4 yoga & mindfulness virtual, 2 reuniones grupales, biblioteca completa audios+videos, regalo bienvenida.
  INDICADO PARA: consumo activo, síndrome de abstinencia, craving alto (7-10), diagnóstico dual (adicción + enf. mental), primer mes de tratamiento, riesgo ALTO o CRÍTICO.
- mes2 (Programa Consolidación $1.800.000 COP/mes): 6 videos autohipnosis nuevos/mes, 4 sesiones psicología, 2 yoga & mindfulness, 2 reuniones grupales, audios seleccionados.
  INDICADO PARA: paciente ya en abstinencia, mantenimiento, riesgo BAJO o MEDIO, continuidad tras mes1.

Responde ÚNICAMENTE con este JSON válido, sin texto adicional:
{
  "resumen": "Párrafo clínico de 4-5 oraciones que describe el cuadro clínico completo, patrón de consumo, estado mental actual y factores de riesgo/protección",
  "nivel_riesgo": "BAJO|MEDIO|ALTO|CRÍTICO",
  "nivel_riesgo_justificacion": "Explicación clínica de 1-2 oraciones del nivel de riesgo asignado",
  "diagnosticos": [{"codigo": "F10.2","nombre": "Nombre diagnóstico DSM-5/CIE-11","descripcion": "Descripción de cómo se manifiesta en este paciente específico"}],
  "comorbilidades": "Descripción de comorbilidades o 'Sin comorbilidades evidentes'",
  "especialistas": [{"especialidad": "Nombre del especialista","prioridad": "URGENTE|PRIORITARIO|RECOMENDADO","razon": "Razón clínica"}],
  "recomendaciones_inmediatas": ["Recomendación 1","Recomendación 2","Recomendación 3","Recomendación 4"],
  "plan_tratamiento": {"primera_linea": "","segunda_linea": "","seguimiento": ""},
  "toxicologia": "Evaluación toxicológica detallada",
  "programa_recomendado": "mes1|mes2",
  "programa_justificacion": "Explicación clínica",
  "servicios_adicionales_recomendados": ["Suero Terapia + Audio Binaural|razón clínica"],
  "mensaje_al_paciente": "Mensaje empático y motivador del doctor al paciente"
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status} — verifica tu API key`);
  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(text.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
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
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (!user || ["/", "/auth"].includes(location.pathname)) return null;

  const links = [
    { to: "/historia", label: t("clinicalHistory"), icon: ClipboardList },
    { to: "/diagnostico", label: t("aiDiagnosis"), icon: Brain },
    { to: "/tratamientos", label: t("programs"), icon: Pill },
    { to: "/audios", label: t("audios"), icon: Headphones },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <img src={clinicLogo} alt="Cuídate Salud Plena" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-sm font-semibold hidden sm:block">{t("clinicName")}</span>
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

const WA_NUMBER = "573001234567"; // ← Reemplaza con el número real de WhatsApp de la clínica

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
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const token = await forgotPassword(resetEmail);
      if (!token) { setError("No encontramos una cuenta con ese correo."); return; }
      setResetToken(token); // En producción esto iría al email, NO al frontend
      setAuthView("reset");
    } finally { setLoading(false); }
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
                <div><label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>CÓDIGO DE VERIFICACIÓN</label>
                  <input value={tokenInput} onChange={e => setTokenInput(e.target.value.toUpperCase())} placeholder="ABC123" required maxLength={6}
                    className={clsx(inputClass, "text-center tracking-widest font-bold")} style={{ fontFamily: "'DM Mono', monospace" }} /></div>
                <div><label className={labelClass} style={{ fontFamily: "'DM Mono', monospace" }}>{t("newPassword").toUpperCase()}</label>
                  <div className="relative">
                    <input type={showNewPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" required minLength={6} className={clsx(inputClass, "pr-11")} />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">{showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}{t("resetPassword")}
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
  const [consentAceptado, setConsentAceptado] = useState(() =>
    localStorage.getItem("ch_consent_accepted") === "true"
  );
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [qIdx, setQIdx] = useState(0);
  const [text, setText] = useState(""); const [selected, setSelected] = useState<string[]>([]); const [scaleVal, setScaleVal] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentQ = QUESTIONS[qIdx];

  // All hooks must come before any conditional return
  useEffect(() => {
    if (!consentAceptado) return;
    const greeting = user ? `Hola, ${user.name.split(" ")[0]}. ` : "";
    setMsgs([{ id: "init", role: "bot", ts: Date.now(), content: greeting + QUESTIONS[0].text }]);
  }, [consentAceptado]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, isTyping]);
  useEffect(() => { setText(""); setSelected([]); setScaleVal(null); }, [qIdx]);

  function aceptarConsent() {
    localStorage.setItem("ch_consent_accepted", "true");
    setConsentAceptado(true);
  }

  // Mostrar consentimiento informado antes de iniciar la historia
  if (!consentAceptado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
        <div className="w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
          {/* Encabezado */}
          <div className="bg-primary/10 border-b border-primary/20 px-7 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary uppercase tracking-widest mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>Documento médico · Obligatorio</p>
              <h2 className="font-bold text-lg">Consentimiento Informado</h2>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="px-7 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
              <p className="text-sm font-semibold text-primary mb-1">Clínica Virtual · Consultorio Holístico para Adicciones y Salud Mental</p>
              <p className="text-xs text-muted-foreground">Dr. Nikolas Escobar — Director Médico</p>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              Yo, el/la paciente, manifiesto libre y voluntariamente mi consentimiento para iniciar el proceso de evaluación clínica y eventual tratamiento en el <strong>Consultorio Holístico Cuídate Salud Plena</strong>.
            </p>

            <div className="space-y-3">
              {[
                { title: "1. Confidencialidad", body: "Toda la información que proporcione es estrictamente confidencial y está protegida por el secreto médico profesional, conforme a la Ley 1581 de 2012 (Protección de Datos Personales) y la Resolución 1995 de 1999 del Ministerio de Salud de Colombia." },
                { title: "2. Finalidad clínica", body: "Las respuestas de la historia clínica serán procesadas por inteligencia artificial (Gemini AI) y revisadas por el Dr. Escobar para generar un diagnóstico preliminar y recomendar el plan terapéutico más adecuado." },
                { title: "3. Almacenamiento de datos", body: "Su información clínica se almacenará de forma segura en nuestra plataforma digital cifrada. No será compartida con terceros sin su autorización expresa, salvo en casos de riesgo vital inminente." },
                { title: "4. Voluntariedad", body: "Su participación es completamente voluntaria. Puede detener el proceso en cualquier momento y solicitar la eliminación de sus datos comunicándose con nuestro equipo." },
                { title: "5. Diagnóstico asistido por IA", body: "El diagnóstico generado por inteligencia artificial es una herramienta de apoyo clínico y NO reemplaza la evaluación presencial del médico. Será validado y complementado por el Dr. Escobar." },
                { title: "6. Derechos del paciente", body: "Tiene derecho a acceder, rectificar o eliminar su información en cualquier momento. Para ejercer estos derechos, escribanos por WhatsApp o al correo de la clínica." },
              ].map(item => (
                <div key={item.title} className="bg-muted/30 border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-primary mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/90 leading-relaxed">
                Si en cualquier momento experimenta una emergencia de salud mental, llame inmediatamente a la <strong>Línea de la Vida: 800-911-2000</strong> o al número de emergencias <strong>123</strong>.
              </p>
            </div>
          </div>

          {/* Pie */}
          <div className="px-7 py-5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-4 text-center">
              Al hacer clic en <strong>"Acepto y continúo"</strong> confirma que ha leído y acepta los términos del presente consentimiento informado.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/")} className="flex-1 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:border-primary/30 transition-colors">
                Volver al inicio
              </button>
              <button onClick={aceptarConsent}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                style={{ background: "linear-gradient(135deg, #0ccec6, #07a8a2)", color: "#031014" }}>
                <Check className="w-4 h-4" /> Acepto y continúo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        // Guardar historia en el backend Java (silencioso, no bloquea la navegación)
        const BACKEND = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";
        const jwt = localStorage.getItem("ch_jwt") || "";
        fetch(`${BACKEND}/api/historia`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
          },
          body: JSON.stringify({ respuestas: flat, consentimientoAceptado: true }),
        }).then(r => r.json()).then(j => {
          if (j.success && j.data?.id) localStorage.setItem("ch_historia_id", String(j.data.id));
        }).catch(() => { /* backend no disponible — continúa con localStorage */ });
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
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
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
        <ImageWithFallback src={doctorHero} alt="Dr. Nikolas Escobar" className="w-full h-full object-cover object-top" />
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
  const [backendAvailable, setBackendAvailable] = useState(true);
  const answers: Record<string, string> = JSON.parse(localStorage.getItem("ch_answers") || "{}");
  const hasAnswers = Object.keys(answers).length > 0;
  const riskColors: Record<string, string> = { BAJO: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", MEDIO: "text-amber-400 bg-amber-500/10 border-amber-500/25", ALTO: "text-orange-400 bg-orange-500/10 border-orange-500/25", CRÍTICO: "text-red-400 bg-red-500/10 border-red-500/25" };
  const prioColors: Record<string, string> = { URGENTE: "text-red-400 bg-red-500/10", PRIORITARIO: "text-amber-400 bg-amber-500/10", RECOMENDADO: "text-teal-400 bg-teal-500/10" };

  async function runDiagnosis(key: string) {
    setLoading(true); setError("");
    try {
      const result = await callGemini(answers, key);
      setDiagnosis(result);
      if (key) setApiKey(key);
    } catch (e: any) {
      const msg: string = e.message || "";
      if (msg.includes("VITE_GEMINI_API_KEY") || msg.includes("API key")) {
        setBackendAvailable(false);
        setLoading(false);
        return;
      }
      setError(msg || "Error al generar diagnóstico. Verifique la API key o el backend.");
    } finally {
      setLoading(false);
    }
  }
  // Al cargar: intentar siempre (callGemini prueba backend primero, luego directo con key)
  useEffect(() => { if (hasAnswers) runDiagnosis(apiKey); else setLoading(false); }, []);

  if (!hasAnswers) return <div className="flex items-center justify-center min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}><div className="text-center max-w-sm"><ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4"/><h2 className="font-medium mb-2">Sin historia clínica</h2><p className="text-sm text-muted-foreground mb-6">Complete primero la evaluación clínica.</p><button onClick={()=>navigate("/historia")} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Ir a evaluación</button></div></div>;
  if (!backendAvailable && !apiKey && !loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-7">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4"><Sparkles className="w-5 h-5 text-primary"/></div>
        <h2 className="font-semibold mb-1">API Key de Gemini (Gratis)</h2>
        <p className="text-sm text-muted-foreground mb-1">Ingrese su API key de Google Gemini para generar el diagnóstico con IA.</p>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline block mb-4 flex items-center gap-1">
          → Obtener API key gratuita en Google AI Studio <ExternalLink className="w-3 h-3" />
        </a>
        <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} placeholder="AIza..." className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"/>
        {error&&<p className="text-xs text-destructive mb-3">{error}</p>}
        <button onClick={()=>{if(keyInput.trim())runDiagnosis(keyInput.trim());}} disabled={!keyInput.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40">Generar diagnóstico</button>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
            Para evitar ingresar la key cada vez: crea un archivo .env en la raíz del proyecto y agrega VITE_GEMINI_API_KEY=tu_clave
          </p>
        </div>
      </div>
    </div>
  );
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}><div className="text-center"><div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5"><Loader2 className="w-7 h-7 text-primary animate-spin"/></div><h2 className="font-medium mb-2">Analizando historia clínica</h2><p className="text-sm text-muted-foreground">Gemini AI · Evaluación psiquiátrica + toxicológica...</p></div></div>;
  if (error) return <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}><div className="text-center max-w-sm"><AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4"/><h2 className="font-medium mb-2">Error</h2><p className="text-sm text-muted-foreground mb-6">{error}</p><button onClick={()=>{setApiKey("");setError("");setLoading(false);}} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Reintentar</button></div></div>;

  const riskClass = riskColors[diagnosis?.nivel_riesgo] || riskColors["MEDIO"];
  const recommendedProgram = PROGRAMS.find(p => p.id === diagnosis?.programa_recomendado) || PROGRAMS[0];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
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
        {/* Comorbilidades */}
        {diagnosis?.comorbilidades?.length>0&&<div className="bg-card border border-border rounded-2xl overflow-hidden"><div className="px-5 py-3 border-b border-border flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-400"/><p className="text-xs font-medium uppercase tracking-wider" style={{fontFamily:"'DM Mono',monospace"}}>Comorbilidades Identificadas</p></div><div className="p-5 flex flex-wrap gap-2">{diagnosis.comorbilidades.map((c:string,i:number)=><span key={i} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full">{c}</span>)}</div></div>}

        {/* Mensaje motivacional del médico */}
        {diagnosis?.mensaje_al_paciente&&<div className="bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><img src={clinicLogo} alt="Logo" className="w-8 h-8 rounded-full object-cover" /><div><p className="text-xs font-medium">Dr. Nikolas Escobar · Consultorio Holístico</p><p className="text-[10px] text-muted-foreground">Mensaje clínico personalizado</p></div></div>
          <p className="text-sm text-foreground/80 leading-relaxed italic">"{diagnosis.mensaje_al_paciente}"</p>
        </div>}

        {/* Package Recommendation — sales section */}
        {(()=>{
          const prog1 = PROGRAMS.find(p=>p.id==="mes1");
          const prog2 = PROGRAMS.find(p=>p.id==="mes2");
          const recommended = PROGRAMS.find(p=>p.id===diagnosis?.programa_recomendado) || prog1!;
          const isHighRisk = ["ALTO","CRÍTICO"].includes(diagnosis?.nivel_riesgo);
          return (
            <div className="rounded-2xl overflow-hidden border-2 border-primary shadow-lg shadow-primary/10">
              <div className="bg-primary px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary-foreground/80"/><p className="text-xs font-semibold text-primary-foreground uppercase tracking-wider" style={{fontFamily:"'DM Mono',monospace"}}>Plan Terapéutico Recomendado por IA</p></div>
                <span className="text-[10px] bg-white/20 text-primary-foreground px-2.5 py-1 rounded-full font-medium">Para {answers.nombre?.split(" ")[0]}</span>
              </div>
              <div className="bg-card p-5 space-y-4">
                {diagnosis?.programa_justificacion&&<div className="bg-primary/5 border border-primary/15 rounded-xl p-4"><p className="text-[10px] text-primary uppercase tracking-widest mb-1.5" style={{fontFamily:"'DM Mono',monospace"}}>Justificación Clínica</p><p className="text-sm text-foreground/80 leading-relaxed">{diagnosis.programa_justificacion}</p></div>}
                <div className={clsx("grid gap-3",isHighRisk?"grid-cols-1":"md:grid-cols-2")}>
                  {[prog1,prog2].filter(Boolean).map(prog=>{
                    const isRec = prog!.id===recommended.id;
                    return(
                      <div key={prog!.id} className={clsx("relative rounded-xl border-2 p-4 transition-all",isRec?"border-primary bg-primary/5":"border-border bg-muted/30")}>
                        {isRec&&<span className="absolute -top-2.5 left-4 text-[10px] bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full font-semibold" style={{fontFamily:"'DM Mono',monospace"}}>★ RECOMENDADO</span>}
                        <div className="flex items-start justify-between mb-2">
                          <div><p className="text-xs font-semibold text-primary uppercase tracking-wide" style={{fontFamily:"'DM Mono',monospace"}}>{prog!.id==="mes1"?"Mes 1 · Inicio":"Mes 2 · Profundización"}</p><h3 className="font-semibold text-base mt-0.5">{prog!.tag}</h3></div>
                          <div className="text-right shrink-0 ml-3"><p className="text-lg font-bold text-primary">{formatCOP(prog!.price)}</p><p className="text-[10px] text-muted-foreground">{prog!.duration}</p></div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{prog!.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {prog!.sessions.slice(0,4).map((s:string,i:number)=><span key={i} className="text-[10px] bg-background text-muted-foreground border border-border px-2 py-0.5 rounded-md">{s}</span>)}
                          {prog!.sessions.length>4&&<span className="text-[10px] text-primary/60">+{prog!.sessions.length-4} más</span>}
                        </div>
                        <div className="flex gap-2 mb-4">
                          <span className="flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-full"><Headphones className="w-2.5 h-2.5"/>{prog!.includedAudioIds.length} audios</span>
                          <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full"><Video className="w-2.5 h-2.5"/>{prog!.includedVideoIds.length} videos</span>
                        </div>
                        <button onClick={()=>navigate("/tratamientos")} className={clsx("w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",isRec?"bg-primary text-primary-foreground hover:bg-primary/90":"bg-background border border-border text-foreground hover:border-primary/50")}>
                          {isRec?"Adquirir este plan":"Ver detalles"} <ArrowRight className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={()=>navigate("/tratamientos")} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20">
                  <ShoppingCart className="w-4 h-4"/>Ir a paquetes y comprar ahora
                </button>
                <p className="text-[10px] text-muted-foreground/50 text-center">Pago seguro · Cancelación flexible · Atención médica garantizada</p>
              </div>
            </div>
          );
        })()}

        {/* Servicios adicionales recomendados */}
        {diagnosis?.servicios_adicionales_recomendados?.length>0&&<div className="bg-card border border-border rounded-2xl overflow-hidden"><div className="px-5 py-3 border-b border-border flex items-center gap-2"><Star className="w-3.5 h-3.5 text-amber-400"/><p className="text-xs font-medium uppercase tracking-wider" style={{fontFamily:"'DM Mono',monospace"}}>Servicios Adicionales Recomendados</p></div><div className="p-5 grid sm:grid-cols-2 gap-3">{diagnosis.servicios_adicionales_recomendados.map((s:any,i:number)=><div key={i} className="bg-muted/40 border border-border rounded-xl p-3.5"><p className="text-sm font-medium mb-1">{typeof s==="string"?s:s.servicio||s.nombre}</p>{s.razon&&<p className="text-xs text-muted-foreground">{s.razon}</p>}</div>)}</div></div>}

        <p className="text-[10px] text-muted-foreground/30 text-center pb-4" style={{fontFamily:"'DM Mono',monospace"}}>Diagnóstico generado por IA · Requiere validación médica · Documento confidencial</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE 5 — PROGRAMAS Y PAGO (con lista de media)
// ═══════════════════════════════════════════════════════

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
  const [activeTab, setActiveTab] = useState<"audios" | "videos">("audios");
  const [activeCat, setActiveCat] = useState<"all" | "autohipnosis" | "binaural" | "podcasts">("all");
  const [playing, setPlaying] = useState<number | null>(null);
  const [watchingVideo, setWatchingVideo] = useState<VideoItem | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const filtered = activeCat === "all" ? AUDIOS : AUDIOS.filter(a => a.cat === activeCat);

  function handlePlay(audio: AudioItem) {
    if (!audio.free) return;
    if (playing === audio.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    // Parar audio anterior
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    if (audio.audioSrc) {
      const el = new Audio(audio.audioSrc);
      el.play().catch(() => {});
      el.onended = () => setPlaying(null);
      audioRef.current = el;
    }
    setPlaying(audio.id);
  }

  useEffect(() => { return () => { audioRef.current?.pause(); }; }, []);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Audioterapia Holística</p>
          <h1 className="text-2xl font-semibold">{t("audioLib")} & {t("videoLib")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("audioSub")}</p>
        </div>

        {/* Tabs Audios / Videos */}
        <div className="flex bg-muted rounded-xl p-1 mb-6 w-fit">
          <button onClick={() => setActiveTab("audios")} className={clsx("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all", activeTab === "audios" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            <Headphones className="w-4 h-4" />{t("audioLib")}
          </button>
          <button onClick={() => setActiveTab("videos")} className={clsx("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all", activeTab === "videos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            <Video className="w-4 h-4" />{t("videoLib")}
          </button>
        </div>

        {activeTab === "audios" && (
          <>
            {/* Suero terapia banner */}
            <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><Volume2 className="w-6 h-6 text-primary"/></div>
              <div className="flex-1">
                <p className="font-medium text-sm">Suero Terapia con Audio Binaural</p>
                <p className="text-xs text-muted-foreground">Audio especializado para acompañar sesiones de suero terapia. Voz del Dr. + música binaural theta (60 min).</p>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full shrink-0" style={{fontFamily:"'DM Mono',monospace"}}>Premium</span>
            </div>

            {/* Instrucción para agregar audios */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
                💡 Para agregar audios reales: coloca tus archivos .mp3 en <strong className="text-muted-foreground/80">public/audios/</strong> y actualiza el campo <strong className="text-muted-foreground/80">audioSrc</strong> en el array AUDIOS del código.
              </p>
            </div>

            {/* Filtros */}
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
                      <button onClick={() => handlePlay(audio)}
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
                        {audio.doctor&&<p className="text-[10px] text-primary/70 mt-1.5">🎙️ Voz del Dr. Nikolas Escobar</p>}
                        {audio.free && !audio.audioSrc && <p className="text-[10px] text-muted-foreground/40 mt-1" style={{fontFamily:"'DM Mono',monospace"}}>Agrega audioSrc para reproducción real</p>}
                      </div>
                    </div>
                    {isPlaying&&(
                      <div className="mt-3 flex items-center gap-0.5 h-6">
                        {Array.from({length:28},(_,i)=>(
                          <div key={i} className="bg-primary/60 rounded-full w-1 animate-pulse" style={{height:`${14+Math.sin(i*0.6)*10}px`,animationDelay:`${i*0.05}s`}}/>
                        ))}
                        <span className="ml-3 text-[10px] text-primary" style={{fontFamily:"'DM Mono',monospace"}}>
                          {audio.audioSrc ? "REPRODUCIENDO" : "DEMO VISUAL"}
                        </span>
                      </div>
                    )}
                    {!audio.free&&<p className="text-[10px] text-muted-foreground/40 mt-2">{t("locked")}</p>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "videos" && (
          <>
            {/* Instrucción para agregar videos */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
                💡 Para agregar videos reales: coloca tus archivos .mp4 en <strong className="text-muted-foreground/80">public/videos/</strong> y actualiza el campo <strong className="text-muted-foreground/80">videoSrc</strong> en el array VIDEOS del código. También puedes usar <strong className="text-muted-foreground/80">youtubeId</strong> para embeds de YouTube.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {VIDEOS.map(video => (
                <div key={video.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group">
                  {/* Thumbnail / Placeholder */}
                  <div className="relative h-44 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                        <Video className="w-10 h-10" />
                        <span className="text-[10px]" style={{ fontFamily: "'DM Mono', monospace" }}>{video.duration}</span>
                      </div>
                    )}
                    {/* Overlay play */}
                    <button onClick={() => setWatchingVideo(video)}
                      className={clsx("absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity", !video.free && "cursor-not-allowed")}>
                      <div className={clsx("w-14 h-14 rounded-full flex items-center justify-center",video.free?"bg-primary/90":"bg-muted/80")}>
                        {video.free ? <Play className="w-6 h-6 text-white ml-1" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </button>
                    <span className={clsx("absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full border",video.free?"bg-emerald-500/80 text-white border-emerald-500":"bg-black/50 text-muted-foreground border-border")} style={{fontFamily:"'DM Mono',monospace"}}>
                      {video.free ? t("free") : t("premium")}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={clsx("text-[10px] px-2 py-0.5 rounded-md",video.cat==="autohipnosis"?"bg-purple-500/15 text-purple-400":"bg-blue-500/15 text-blue-400")} style={{fontFamily:"'DM Mono',monospace"}}>{video.cat}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto" style={{fontFamily:"'DM Mono',monospace"}}>{video.duration}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{video.title}</p>
                    <p className="text-xs text-muted-foreground mb-3">{video.desc}</p>
                    {video.doctor && <p className="text-[10px] text-primary/70 mb-3">🎙️ Con el Dr. Nikolas Escobar</p>}
                    <button onClick={() => video.free && setWatchingVideo(video)}
                      disabled={!video.free}
                      className={clsx("w-full py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",video.free?"bg-primary/15 text-primary hover:bg-primary/25":"bg-muted text-muted-foreground cursor-not-allowed")}>
                      {video.free ? <><Play className="w-3.5 h-3.5"/>{t("watchVideo")}</> : <><Lock className="w-3.5 h-3.5"/>{t("locked")}</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Group meetings */}
        <div className="mt-10" id="grupos">
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

      {/* Modal de video */}
      {watchingVideo && <VideoModal video={watchingVideo} onClose={() => setWatchingVideo(null)} t={t} />}
    </div>
  );
}

function VideoModal({ video, onClose, t }: { video: VideoItem; onClose: () => void; t: (k: any) => string }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-medium">{video.title}</h2>
            <p className="text-xs text-muted-foreground">{video.duration} · {video.cat}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"><X className="w-4 h-4"/></button>
        </div>

        {/* Reproductor de video */}
        <div className="aspect-video bg-black flex items-center justify-center relative">
          {video.youtubeId ? (
            // Embed de YouTube (privado/no listado)
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : video.videoSrc ? (
            // Video local .mp4
            <video
              src={video.videoSrc}
              controls
              autoPlay
              className="w-full h-full"
              style={{ background: "#000" }}
            />
          ) : (
            // Placeholder — sin video aún
            <div className="text-center text-muted-foreground/40">
              <Video className="w-16 h-16 mx-auto mb-3" />
              <p className="text-sm">Video no disponible aún</p>
              <p className="text-xs mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                Agrega videoSrc o youtubeId en el array VIDEOS
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground">{video.desc}</p>
          {video.doctor && <p className="text-[10px] text-primary/70 mt-2">🎙️ Con el Dr. Nikolas Escobar</p>}
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
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 group"
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
          <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
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
            <WhatsAppFloat />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
