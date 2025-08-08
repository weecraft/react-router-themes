import {
  combine,
  ignores,
  imports,
  javascript,
  node,
  typescript,
} from "@antfu/eslint-config"

export default combine(ignores(), javascript(), node(), imports(), typescript())
