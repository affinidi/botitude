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
  let new_text = text

  let potentialEmoji = []
  for (let i = 0, startIndex = null, endIndex = null; i < new_text.length; i++) {
    const isColon = new_text[Number(i)] === ':'
    if (isColon && startIndex === null) startIndex = i;
    else if (isColon) endIndex = i
    if (startIndex !== null && endIndex !== null) {
      potentialEmoji.push(new_text.slice(startIndex + 1, endIndex))
      startIndex = endIndex
      endIndex = null
    }
  }

  const realEmojis = filterCorruptEmojis(potentialEmoji)

  new_text = convertToEmoji(new_text, realEmojis)

  new_text = new_text.replace(/(:\w+:)/g, '')
  console.log(new_text)
  return new_text
}
