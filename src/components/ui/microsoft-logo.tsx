// Microsoft Logo Komponente
// Wiederverwendbar für Login und Einladungs-Seiten

interface MicrosoftLogoProps {
  className?: string
}

export function MicrosoftLogo({ className = "w-5 h-5" }: MicrosoftLogoProps) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 0L0 0V10.5H10.5V0Z" fill="#F25022"/>
      <path d="M21 0L10.5 0V10.5H21V0Z" fill="#7FBA00"/>
      <path d="M10.5 10.5L0 10.5V21H10.5V10.5Z" fill="#00A4EF"/>
      <path d="M21 10.5L10.5 10.5V21H21V10.5Z" fill="#FFB900"/>
    </svg>
  )
}
