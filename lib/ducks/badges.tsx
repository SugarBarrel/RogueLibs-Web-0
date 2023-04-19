export type BadgeName = keyof typeof badgeNames;

export const badgeNames = {
  nuggets_10: () => "Generous Benefactor",

  releases_1: () => "You're a Modder, Harry!",
  releases_3: () => "Mod-est Beginnings",
  releases_5: () => "The Modfather",
  releases_10: () => "Modzart",
  releases_20: () => "Modstradamus",
  releases_35: () => "Modster Mash",
  releases_50: () => "The Mod Hatter",
  releases_75: () => "Mod Almighty",
  releases_100: () => "The Ultimate Modding-Form",
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
  nuggets_10: ({ You }) => `${You}'ve given away over 10 nuggets.`,

  releases_1: ({ You }) => `${You}'ve authored a mod release.`,
  releases_3: ({ You }) => `${You}'ve authored over 3 mod releases.`,
  releases_5: ({ You }) => `${You}'ve authored over 5 mod releases.`,
  releases_10: ({ You }) => `${You}'ve authored over 10 mod releases.`,
  releases_20: ({ You }) => `${You}'ve authored over 20 mod releases.`,
  releases_35: ({ You }) => `${You}'ve authored over 35 mod releases.`,
  releases_50: ({ You }) => `${You}'ve authored over 50 mod releases.`,
  releases_75: ({ You }) => `${You}'ve authored over 75 mod releases.`,
  releases_100: ({ You }) => `${You}'ve authored over 100 mod releases.`,
};
