export type BadgeName = keyof typeof badgeNames;

export const badgeNames = {
  nuggets_90: () => "Broke",
  nuggets_50: () => "Experiencing Inflation",
  nuggets_20: () => "Generous Benefactor",

  mods_1: () => "You're a Modder, Harry!",
  mods_3: () => "Mod-est Beginnings",
  mods_5: () => "The Modfather",
  mods_10: () => "Modzart",
  mods_25: () => "Modstradamus",
  mods_50: () => "Mod Hatter",
  mods_100: () => "The Ultimate Modding-Form",
};

export class BadgeContext {
  constructor(public me: boolean) {}

  public get you() {
    return this.me ? "you" : "they";
  }
  public get You() {
    return this.me ? "You" : "They";
  }
  public get your() {
    return this.me ? "your" : "their";
  }
  public get Your() {
    return this.me ? "Your" : "Their";
  }
}

export const badgeDescriptions: Record<BadgeName, (cxt: BadgeContext) => React.ReactNode> = {
  nuggets_90: ({ You, Your }) => (
    <>
      {`${You}'ve given nuggets to basically everyone. ${Your} nuggets are worthless as a currency.`}
      <b>{`${Your} nuggets are worth nothing.`}</b>
    </>
  ),
  nuggets_50: ({ You, your, Your }) => (
    <>
      {`${You}'ve given away so many nuggets, that ${your} internal nugget economy is experiencing an inflation.`}
      <b>{`${Your} nuggets are worth less now.`}</b>
    </>
  ),
  nuggets_20: ({ You }) => <>{`${You}'ve generously given away a lot of nuggets.`}</>,

  mods_1: ({ You }) => `${You}'ve authored a mod.`,
  mods_3: ({ You }) => `${You}'ve authored over 3 mods.`,
  mods_5: ({ You }) => `${You}'ve authored over 5 mods.`,
  mods_10: ({ You }) => `${You}'ve authored over 10 mods.`,
  mods_25: ({ You }) => `${You}'ve authored over 25 mods.`,
  mods_50: ({ You }) => `${You}'ve authored over 50 mods.`,
  mods_100: ({ You }) => `${You}'ve authored over 100 mods.`,
};
