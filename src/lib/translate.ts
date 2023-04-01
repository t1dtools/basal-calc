import { useEffect, useState } from "react"
const translations = <{[key: string]: {[key: string]: string}}>{
    "en": {
        "Basal Program Calculator": "Basal Program Beregner",
        "Base Program": "Grundprogram",
        "This site aims to help you calculate alternative programs based on a percentage of a base program. Get started by setting up your base program below, and create as many alternative as you <br /> want with the": "Denne side har til formål at hjælpe dig med at beregne alternative programmer baseret på et procentdel af et grundprogram. <br /> Kom i gang ved at indstille dit grundprogram nedenfor, og opret så mange alternative programmer som du <br /> ønsker",
        "Add Program": "Tilføj program",
        "You can also use the": "Du kan også bruge",
        "Share": "Del",
        "button to create a link you can use to share this with others.": "knappen til at oprette et link, du kan bruge til at dele dette med andre.",
    }
}

export const t = (s: string): string => {
    return s
    const [language, setLanguage] = useState("en")

    useEffect(() => {
        setLanguage(navigator.language.substring(0, 2))
    }, [])

    if (language in translations) {
        if (s in translations[language]) {
            return translations[language][s]
        }
    }

    return s
}