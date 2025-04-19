import firefly from "@outwalk/firefly/eslint";

export default {
    files: ["src/**/*.{js,ts}"],
    languageOptions: { ...firefly.configs.language },
    rules: { ...firefly.configs.recommended }
}