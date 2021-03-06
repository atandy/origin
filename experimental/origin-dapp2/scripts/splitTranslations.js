const fs = require('fs')
const rawTranslations = fs.readFileSync(
  `${__dirname}/../src/translatedFbts.json`
)
const translations = JSON.parse(rawTranslations)

Object.keys(translations).forEach(lang => {
  fs.writeFileSync(
    `${__dirname}/../public/translations/${lang}.json`,
    JSON.stringify(translations[lang], null, 2)
  )
})
