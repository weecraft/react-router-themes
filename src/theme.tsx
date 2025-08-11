import * as React from "react"
import {
  disableAnimation,
  getSystemTheme,
  getTheme,
  saveToLocalStorage,
  script,
} from "./utils"
import type { Attribute, ThemeProviderProps } from "./types"
import { COLOR_SCHEMAS, DEFAULT_THEMES, MEDIA } from "./constants"
import { ThemeContext } from "./provider"

function ThemeScript({
  forcedTheme,
  storageKey,
  attribute,
  enableSystem,
  enableColorScheme,
  defaultTheme,
  value,
  themes,
  nonce,
  scriptProps,
}: Omit<ThemeProviderProps, "children"> & { defaultTheme: string }) {
  const scriptArgs = JSON.stringify([
    attribute,
    storageKey,
    defaultTheme,
    forcedTheme,
    themes,
    value,
    enableSystem,
    enableColorScheme,
  ]).slice(1, -1)

  return (
    <script
      {...scriptProps}
      suppressHydrationWarning
      nonce={typeof window === "undefined" ? nonce : ""}
      dangerouslySetInnerHTML={{
        __html: `(${script.toString()})(${scriptArgs})`,
      }}
    />
  )
}

export const ThemeScriptMemo = React.memo(ThemeScript)

export function Theme({
  forcedTheme,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = "theme",
  themes = DEFAULT_THEMES,
  defaultTheme = enableSystem ? "system" : "light",
  attribute = "data-theme",
  value,
  children,
  nonce,
  scriptProps,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState(() =>
    getTheme(storageKey, defaultTheme),
  )
  const [resolvedTheme, setResolvedTheme] = React.useState(() =>
    theme === "system" ? getSystemTheme() : theme,
  )
  const attrs = !value ? themes : Object.values(value)

  const applyTheme = React.useCallback(
    (theme: string | undefined) => {
      let resolved = theme
      if (!resolved) return

      // If theme is system, resolve it before setting theme
      if (theme === "system" && enableSystem) {
        resolved = getSystemTheme()
      }

      const name = value ? value[resolved] : resolved
      const enable = disableTransitionOnChange ? disableAnimation(nonce) : null
      const d = document.documentElement

      const handleAttribute = (attr: Attribute) => {
        if (attr === "class") {
          d.classList.remove(...attrs)
          if (name) d.classList.add(name)
        } else if (attr.startsWith("data-")) {
          if (name) {
            d.setAttribute(attr, name)
          } else {
            d.removeAttribute(attr)
          }
        }
      }

      if (Array.isArray(attribute)) attribute.forEach(handleAttribute)
      else handleAttribute(attribute)

      if (enableColorScheme) {
        const fallback = COLOR_SCHEMAS.includes(defaultTheme)
          ? defaultTheme
          : "light"
        const colorScheme = COLOR_SCHEMAS.includes(resolved)
          ? resolved
          : fallback

        d.style.colorScheme = colorScheme
      }

      enable?.()
    },
    [nonce],
  )

  const setTheme = React.useCallback((value) => {
    if (typeof value === "function") {
      setThemeState((prevTheme) => {
        const newTheme = value(prevTheme)

        saveToLocalStorage(storageKey, newTheme)

        return newTheme
      })
    } else {
      setThemeState(value)
      saveToLocalStorage(storageKey, value)
    }
  }, [])

  const handleMediaQuery = React.useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      const resolved = getSystemTheme(e)
      setResolvedTheme(resolved)

      if (theme === "system" && enableSystem && !forcedTheme) {
        applyTheme("system")
      }
    },
    [theme, forcedTheme],
  )

  // Always listen to System preference
  React.useEffect(() => {
    const media = window.matchMedia(MEDIA)

    // Intentionally use deprecated listener methods to support iOS & old browsers
    media.addListener(handleMediaQuery)
    handleMediaQuery(media)

    return () => media.removeListener(handleMediaQuery)
  }, [handleMediaQuery])

  // localStorage event handling
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) {
        return
      }

      // If default theme set, use it if localstorage === null (happens on local storage manual deletion)
      if (!e.newValue) {
        setTheme(defaultTheme)
      } else {
        setThemeState(e.newValue) // Direct state update to avoid loops
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [setTheme])

  // Whenever theme or forcedTheme changes, apply it
  React.useEffect(() => {
    applyTheme(forcedTheme ?? theme)
  }, [forcedTheme, theme])

  const providerValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme: theme === "system" ? resolvedTheme : theme,
      themes: enableSystem ? [...themes, "system"] : themes,
      systemTheme: (enableSystem ? resolvedTheme : undefined) as
        | "light"
        | "dark"
        | undefined,
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, enableSystem, themes],
  )

  return (
    <ThemeContext.Provider value={providerValue}>
      <ThemeScriptMemo
        {...{
          forcedTheme,
          storageKey,
          attribute,
          enableSystem,
          enableColorScheme,
          defaultTheme,
          value,
          themes,
          nonce,
          scriptProps,
        }}
      />

      {children}
    </ThemeContext.Provider>
  )
}
