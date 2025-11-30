// CASCADE.md Regel-Checker für AI Assistant

interface CascadeCheck {
  componentSize: number
  hasHardcodedColors: boolean
  usesCentralComponents: boolean
  hasGermanTexts: boolean
  isMinimalChange: boolean
}

export function checkCascadeRules(filePath: string, code: string): CascadeCheck {
  const lines = code.split('\n').length
  
  return {
    componentSize: lines,
    hasHardcodedColors: /bg-(white|gray|red|blue|green|yellow|orange|purple|pink|indigo)/.test(code),
    usesCentralComponents: /from ['"]@\/components\/ui['"]/.test(code),
    hasGermanTexts: /(Lade|Fehler|Aufgabe|Benutzer|Status|Priorität)/.test(code),
    isMinimalChange: lines < 200
  }
}

export function validateCascade(filePath: string, code: string): { valid: boolean; errors: string[] } {
  const check = checkCascadeRules(filePath, code)
  const errors: string[] = []
  
  if (check.componentSize > 200) {
    errors.push(`Komponente zu groß: ${check.componentSize} Zeilen (max. 200)`)
  }
  
  if (check.hasHardcodedColors) {
    errors.push('Hardcoded Farben gefunden - CSS-Variablen nutzen')
  }
  
  if (!check.usesCentralComponents && filePath.includes('/components/')) {
    errors.push('Zentrale UI-Komponenten nicht genutzt')
  }
  
  if (!check.hasGermanTexts && filePath.includes('/app/')) {
    errors.push('Deutsche UI-Texte fehlen')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
