export const CONST = Object.freeze({
  tileTooltipConfig: {
    heading: "Kacheln",
    src: "",
    items: [
      {
        heading: "Umschalten",
        reference: "CONTROLS.LeftClick"
      }
    ]
  },
  lightsTooltipConfig: {
    heading: "Lichter",
    src: "",
    items: [
      {
        heading: "Umschalten",
        reference: "CONTROLS.LeftClick"
      }
    ]
  },
})

export const TEMPLATES = Object.freeze({
  lights: "modules/lyynix-scene-menu/templates/lights.hbs",
  tiles: "modules/lyynix-scene-menu/templates/tiles.hbs"
})
