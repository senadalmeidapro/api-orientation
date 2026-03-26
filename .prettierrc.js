module.exports = {
    // ==========================
    // FORMATTAGE GÉNÉRAL
    // ==========================
    printWidth: 100, // largeur max avant retour à la ligne
    tabWidth: 4, // indentation standard
    useTabs: false, // utiliser des espaces plutôt que des tabs
    semi: true, // points-virgules obligatoires
    singleQuote: true, // quotes simples pour les chaînes
    quoteProps: 'as-needed', // quotes sur les propriétés uniquement si nécessaire
    trailingComma: 'all', // virgules finales partout (objets, tableaux, fonctions)
    bracketSpacing: true, // espaces dans les objets { key: value }
    arrowParens: 'always', // toujours inclure les parenthèses des flèches
    endOfLine: 'lf', // forcer LF pour uniformité cross-platform

    // ==========================
    // OBJECT & ARRAY
    // ==========================
    bracketSameLine: false, // > des JSX tags sur ligne séparée
    proseWrap: 'preserve', // ne pas reformatter le texte (MD, etc.)
    htmlWhitespaceSensitivity: 'css', // respecter le CSS pour les espaces HTML

    // ==========================
    // OPTIMISATIONS SUPPLÉMENTAIRES
    // ==========================
    insertPragma: false, // pas besoin de pragma en haut des fichiers
};
