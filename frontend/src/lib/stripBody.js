/* Strip a full <body> wrapper if GrapesJS exported one. */
export const stripBody = (html) => {
  if (!html) return '';
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
};
