import {
  combine,
  ignores,
  imports,
  javascript,
  typescript,
} from "@antfu/eslint-config"

export default combine(
  ignores(),
  javascript(),
  imports({
    overrides: {
      "unused-imports/no-unused-vars": "off",
    },
  }),
  typescript(),
)
