import punycode from 'punycode'
import emoji_data from './emoji_pretty.json'

const convertToEmoji = (text: string, realEmojis: string[]) => {
  var updatedText = text

  realEmojis.forEach((emoji: string) => {
    const ed = emoji_data.find((el) => {
      return el.short_name == emoji
    })
    if (ed) {
      let points: string[] = ed.unified.split('-')
      let temp: number[] = points.map((p: string) => {
        return parseInt(p, 16)
      })
      updatedText = updatedText.replace(`:${emoji}:`, punycode.ucs2.encode(temp))
    }
  })

  return updatedText
}

const filterCorruptEmojis = (arr: string[]) => {
  return arr.filter(el => el.indexOf(' ') < 0).filter(el => el.length !== 2)
}

export const slackToUnicode = (text: string): string => {
  // Limit the text size
  let new_text = text.slice(0, 10000)

  let potentialEmoji = []
  for (let i = 0, startIndex = null, endIndex = null; i < new_text.length; i++) {
    const isColon = new_text[Number(i)] === ':'
    if (isColon && startIndex === null) startIndex = i;
    else if (isColon) endIndex = i

    // Limit the emoji name size
    if (i - startIndex > 250) {
      startIndex = null
    }

    if (startIndex !== null && endIndex !== null) {
      potentialEmoji.push(new_text.slice(startIndex + 1, endIndex))
      startIndex = endIndex
      endIndex = null
    }
  }

  const realEmojis = filterCorruptEmojis(potentialEmoji)

  new_text = convertToEmoji(new_text, realEmojis)

  new_text = new_text.replace(/(:\w+:)/g, '')
  return new_text
}
