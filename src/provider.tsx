import * as React from "react"
import type { ThemeProviderProps, UseThemeProps } from "./types"
import { Theme } from "./theme"

export const ThemeContext = React.createContext<UseThemeProps | undefined>(
  undefined,
)

export const defaultContext: UseThemeProps = { setTheme: (_) => {}, themes: [] }

export function ThemeProvider(props: ThemeProviderProps) {
  const context = React.useContext(ThemeContext)

  if (context) return <>{props.children}</>

  return <Theme {...props} />
}

export function useTheme() {
  return React.useContext(ThemeContext) ?? defaultContext
}
