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
  editSubmit: "modules/lyynix-scene-menu/templates/editSubmit.hbs",
  editLights: "modules/lyynix-scene-menu/templates/editLights.hbs",
  editTiles: "modules/lyynix-scene-menu/templates/editTiles.hbs",
  lights: "modules/lyynix-scene-menu/templates/lights.hbs",
  tiles: "modules/lyynix-scene-menu/templates/tiles.hbs"
})
