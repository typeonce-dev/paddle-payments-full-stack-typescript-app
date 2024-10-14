export const slugFromName = (name: string) =>
  name.replace(/[^a-zA-Z]+/g, "").replace(/ /g, "-");
