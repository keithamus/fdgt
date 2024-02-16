export const html = String.raw
export const css = (string, ...subs) => {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(String.raw(string, subs))
  return sheet
}

