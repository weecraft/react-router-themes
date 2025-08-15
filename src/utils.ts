import { MEDIA } from "./constants"
import type { ScriptFuncProps } from "./types"

const isServer = typeof window === "undefined"

export function script({
  attribute,
  storageKey,
  defaultTheme,
  forcedTheme,
  themes,
  value,
  enableSystem,
  enableColorScheme,
}: ScriptFuncProps) {
  const el = document.documentElement
  const systemThemes = ["light", "dark"]

  function updateDOM(theme: string) {
    const attributes = Array.isArray(attribute) ? attribute : [attribute]

    attributes.forEach((attr) => {
      const isClass = attr === "class"
      const classes =
        isClass && value ? themes.map((t) => value[t] || t) : themes
      if (isClass) {
        el.classList.remove(...classes)
        el.classList.add(value && value[theme] ? value[theme] : theme)
      } else {
        el.setAttribute(attr, theme)
      }
    })

    setColorScheme(theme)
  }

  function setColorScheme(theme: string) {
    if (enableColorScheme && systemThemes.includes(theme)) {
      el.style.colorScheme = theme
    }
  }

  function getSystemColorTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  if (forcedTheme) {
    updateDOM(forcedTheme)
  } else {
    try {
      const themeName = localStorage.getItem(storageKey) || defaultTheme
      const isSystem = enableSystem && themeName === "system"
      const theme = isSystem ? getSystemColorTheme() : themeName
      updateDOM(theme)
    } catch (e) {}
  }
}

export function getTheme(key: string, fallback?: string) {
  if (isServer) return undefined

  let theme: string | undefined
  try {
    theme = localStorage.getItem(key) || undefined
  } catch (e) {}

  return theme || fallback
}

export function getSystemTheme(e?: MediaQueryList | MediaQueryListEvent) {
  if (!e) e = window.matchMedia(MEDIA)
  const isDark = e.matches
  const systemTheme = isDark ? "dark" : "light"
  return systemTheme
}

export function disableAnimation(nonce?: string) {
  const css = document.createElement("style")
  if (nonce) css.setAttribute("nonce", nonce)
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
    ),
  )
  document.head.appendChild(css)

  return () => {
    ;(() => window.getComputedStyle(document.body))()

    setTimeout(() => {
      document.head.removeChild(css)
    }, 1)
  }
}

export function saveToLocalStorage(storageKey: string, value: string) {
  try {
    localStorage.setItem(storageKey, value)
  } catch (e) {}
}
