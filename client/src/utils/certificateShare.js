/**
 * Social share helpers for certificate pages.
 * Opens each platform's compose / post screen with pre-filled caption + verify link.
 */

const DEFAULT_SITE = 'https://finlearn.app';

export function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return import.meta.env.VITE_SITE_URL || window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL || DEFAULT_SITE;
}

export function buildVerifyUrl(verifyId) {
  return `${getSiteUrl()}/verify/${verifyId}`;
}

export function buildCertificatePostText({
  platform,
  studentName,
  courseName,
  totalXP = 0,
  verifyId,
}) {
  const siteUrl = getSiteUrl();
  const verifyUrl = buildVerifyUrl(verifyId);
  const firstName = (studentName || 'Learner').split(' ')[0];

  const base = {
    linkedin: `🎓 Excited to share — I just completed "${courseName}" on FinLearn Academy!

📈 Highlights:
• Practical financial skills I can use every day
• ⚡ ${totalXP} XP earned
• 🏆 Verified Certificate of Completion

Proud to keep investing in my financial literacy. If you're learning money management too, check out FinLearn:

🔗 ${siteUrl}
✅ Verify my certificate: ${verifyUrl}

#FinLearn #FinancialLiteracy #PersonalFinance #ContinuousLearning #Certificate`,

    twitter: `🎓 Just earned my certificate in "${courseName}" on @FinLearnApp!

⚡ ${totalXP} XP · Verified completion 🏆

${verifyUrl}

${siteUrl}

#FinLearn #Finance #LearnFinance`,

    facebook: `🎓 I completed "${courseName}" on FinLearn Academy!

⚡ ${totalXP} XP earned · Course certificate unlocked 🏆

View my verified certificate: ${verifyUrl}

Start your own learning journey → ${siteUrl}`,

    whatsapp: `🎓 *${firstName}* just completed *"${courseName}"* on *FinLearn Academy*!

⚡ *${totalXP} XP* earned · 🏆 *Verified certificate*

View certificate 👉 ${verifyUrl}

Learn finance free 👉 ${siteUrl}`,
  };

  return base[platform] || base.linkedin;
}

export function buildCertificateShareUrl(platform, text, verifyUrl) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(verifyUrl);

  switch (platform) {
    case 'linkedin':
      // Opens LinkedIn feed composer with pre-filled text (user can edit before posting)
      return `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}`;
    default:
      return verifyUrl;
  }
}

export const CERTIFICATE_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', color: '#0a66c2' },
  { key: 'twitter', label: 'Twitter / X', color: '#000000' },
  { key: 'facebook', label: 'Facebook', color: '#1877f2' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#25d366' },
];

export function openCertificateShare(platform, payload) {
  const verifyUrl = buildVerifyUrl(payload.verifyId);
  const text = buildCertificatePostText({ platform, ...payload });
  const url = buildCertificateShareUrl(platform, text, verifyUrl);

  const w = 640;
  const h = 720;
  const left = Math.max(0, (window.screen.width - w) / 2);
  const top = Math.max(0, (window.screen.height - h) / 2);
  const features = `width=${w},height=${h},left=${left},top=${top},noopener,noreferrer`;

  const win = window.open(url, '_blank', features);
  if (!win) {
    window.location.href = url;
  }
  return { text, verifyUrl, url };
}

export async function copyCertificateCaption(platform, payload) {
  const text = buildCertificatePostText({ platform, ...payload });
  await navigator.clipboard.writeText(text);
  return text;
}

export async function nativeShareCertificate(payload) {
  const verifyUrl = buildVerifyUrl(payload.verifyId);
  const text = buildCertificatePostText({ platform: 'linkedin', ...payload });
  if (!navigator.share) return false;
  await navigator.share({
    title: `Certificate: ${payload.courseName}`,
    text,
    url: verifyUrl,
  });
  return true;
}
