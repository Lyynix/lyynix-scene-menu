import { CONST, TEMPLATES } from "./constants.js";
import { MapMenuEditorApplication } from "./editor.js";

Hooks.once("init", async function () {
  foundry.applications.handlebars.loadTemplates(Object.values(TEMPLATES));
});

Hooks.once("setup", function () {
  CONFIG.Canvas.layers.lyynixmapmenu = {
    layerClass: LyynixMapMenuLayer,
    group: "interface",
  };

  window.lyynixMapMenu = {
    toggleTile: LyynixMapMenuLayer.toggleTile,
    setAll: LyynixMapMenuLayer.setAll,
    setByTag: LyynixMapMenuLayer.setByTag,
    setByChance: LyynixMapMenuLayer.setByChance,
  };

  game.keybindings.register("lyynix-scene-menu", "editCurrentScene", {
    name: "Szenenmenü bearbeiten",
    hint: "Öffnet den Editor zum Bearbeiten des Szenenmenüs.",
    uneditable: [
      {
        key: 'KeyE',
        modifiers: ["Shift", "Control", "Alt"]
      }
    ],
    onDown: (context) => { 
      new MapMenuEditorApplication().render();
    },
    restricted: true
  });
})

Hooks.once("ready", async function () {
  Handlebars.registerHelper('escape', function (variable) {
    return variable.replace(/(['"])/g, '\\$1');
  });
});



class LyynixMapMenuLayer extends foundry.canvas.layers.InteractionLayer {
  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: "lyynixmapmenu",
      canDragCreate: false,
      zIndex: 777,
    });
  }

  selectObjects(options) {
    canvas.tokens.selectObjects(options);
  }

  static prepareSceneControls() {

    let tagConfig = game.scenes.current.getFlag("dsa5", "lyynix-map-tags");
    if (!tagConfig) {
      // only show if scene has config
      if (game.canvas.lyynixmapmenu.active)
        // if scene doesn't have flags, and tool is active, deactivate token tool
        game.canvas.tokens.activate();
      return;
    }

    let tools;
    try {
      tools = LyynixMapMenuLayer.getTools(tagConfig);
    } catch (e) {
      // insert dummy tool if error occurs (probably when Tagger is loaded after Map Module)
      console.error("LSM:", e);

      tools = [{ name: "dummy", title: "Etwas ist schief gelaufen", icon: "fa fa-lyynix" }];
    }

    // log(tools)

    return {
      name: "lyynixmapmenu",
      layer: "lyynixmapmenu",
      title: "Szenenmenü",
      icon: "fa fa-lyynix",
      activeTool: "select",
      visible: game.user.isGM,
      onToolChange: () => { },
      tools: tools,
    };
  }

  static getTools(tagConfig) {
    let tools = {};
    let index = 0;

    tools.select = {
      name: "select",
      order: index++,
      title: "CONTROLS.BasicSelect",
      icon: "fa-solid fa-expand",
      // visible: false,
    }

    tools.SunToggle = {
      active: !(canvas.scene?.environment.darknessLevel > 0.5),
      icon: "fa-regular fa-sun lyynix-scene-button",
      name: "SunToggle",
      onChange: (event, active) => {
        // log(event, active);
        canvas.scene.update(
          {
            environment: {
              darknessLevel: active > 0.5 ? 0 : 1,
            },
          },
          { animateDarkness: true }
        );
      },
      order: index++,
      title: "Sonne Umschalten",
      toggle: true,
    };

    // Separator Tiles
    tools.lyynixSeparator1 = {
      name: "lyynixSeparator1",
      title: "Kacheln",
      icon: "lyynixSeparator",
      order: index++,
      onChange: () => { },
      button: false,
    };
    // Constant Tools
    if (tagConfig.tiles.scriptoriumTileTag) {
      tools[tagConfig.tiles.scriptoriumTileTag] =
        LyynixMapMenuLayer.tileTool(
          index++,
          tagConfig.tiles.scriptoriumTileTag,
          "Scriptorium Aventuris",
          "fa-regular fa-eye"
        )
    }
    if (tagConfig.tiles.frameTileTag) {
      tools[tagConfig.tiles.frameTileTag] =
        LyynixMapMenuLayer.tileTool(
          index++,
          tagConfig.tiles.frameTileTag,
          "Rahmen",
          "fa-regular fa-border-outer"
        )
    }

    // Additional Tiles
    if (tagConfig.tiles.scenicTiles) {
      if (tagConfig.tiles.scenicTiles.length < 4) {
        tagConfig.tiles.scenicTiles.forEach((tile) => {
          tools[tile.tag] =
            LyynixMapMenuLayer.tileTool(index++, tile.tag, CONST.frameTileTooltipConfig, tile.icon)
        });
      } else {
        tools.scenicTiles = {
          name: "scenicTiles",
          title: "Zusätzliche Kacheln",
          icon: "fa-solid fa-layer-plus",
          button: true,
          onChange: async () => {
            let content = await foundry.applications.handlebars.renderTemplate(
              TEMPLATES.tiles,
              {
                header: "Zusätzliche Kacheln",
                tags: tagConfig.tiles.scenicTiles.map(tile => tile.tag),
              }
            );
            new foundry.applications.api.DialogV2({
              window: { title: "Zusätzliche Kacheln" },
              content: content,
              buttons: [
                {
                  action: "close",
                  label: "Schließen",
                  default: true,
                },
              ],
              position: { left: 145, top: 73, height: "auto", width: 330 },
              submit: () => { },
            }).render({ force: true });
          },
          order: index++,
        };
      }
    }

    // Separator Lights
    tools.lyynixSeparator2 = {
      name: "lyynixSeparator2",
      title: "Lichter",
      icon: "lyynixSeparator",
      button: true,
      order: index++,
    };
    // Constant Lights
    if (tagConfig.lights.lanternTag) {
      tools[tagConfig.lights.lanternTag] =
        LyynixMapMenuLayer.lightTool(
          index++,
          tagConfig.lights.lanternTag,
          "Laternen",
          "fa-regular fa-lamp-street"
        )
    }
    if (tagConfig.lights.citywallTag) {
      tools[tagConfig.lights.citywallTag] =
        LyynixMapMenuLayer.lightTool(
          index++,
          tagConfig.lights.citywallTag,
          "Stadtmauer",
          "fa-regular fa-fort"
        )
    }
    if (tagConfig.lights.residenceTag) {
      tools[tagConfig.lights.residenceTag] =
        LyynixMapMenuLayer.lightTool(
          index++,
          tagConfig.lights.residenceTag,
          "Wohnhäuser",
          "fa-regular fa-tents"
        )
    }
    // Additional Lights
    if (tagConfig.lights.scenicLights) {
      if (tagConfig.lights.scenicLights.length < 4) {
        tagConfig.lights.scenicLights.forEach((light) => {
          tools[light.tag] =
            LyynixMapMenuLayer.lightTool(index++, light.tag, CONST.frameTileTooltipConfig, light.icon)
        });
      } else {
        tools.scenicTLights = {
          button: true,
          name: "scenicTLights",
          title: "Zusätzliche Lichter",
          icon: "fa-solid fa-layer-plus",
          button: true,
          onChange: async () => {
            let content = await foundry.applications.handlebars.renderTemplate(
              TEMPLATES.lights,
              {
                header: "Zusätzliche Lichter",
                tags: tagConfig.light.scenicLights.map(light => light.tag),
              }
            );
            new foundry.applications.api.DialogV2({
              window: { title: "Zusätzliche Lichter" },
              content: content,
              buttons: [
                {
                  action: "close",
                  label: "Schließen",
                  default: true,
                },
              ],
              position: { left: 145, top: 73, height: "auto", width: 330 },
              submit: () => { },
            }).render({ force: true });
          },
          order: index++,
        };
      }
    }


    // Separator Districts
    tools.lyynixSeparator3 = {
      name: "lyynixSeparator3",
      title: "Stadtteile",
      icon: "lyynixSeparator",
      button: true,
      order: index++,
    };
    tools.districts = {
      button: true,
      name: "districts",
      title: "Stadtteile",
      icon: "fa-regular fa-chart-network",
      button: true,
      order: index++,
      onChange: async () => {
        let content = await foundry.applications.handlebars.renderTemplate(
          TEMPLATES.lights,
          {
            districts: [
              { name: "Stadtteile", tags: tagConfig.lights.districtTags },
            ],
          }
        );
        new foundry.applications.api.DialogV2({
          window: { title: "Stadtteile" },
          content: content,
          buttons: [
            {
              action: "close",
              label: "Schließen",
              default: true,
            },
          ],
          position: { left: 145, top: 73, height: "auto", width: 400 },
          submit: () => { },
        }).render({ force: true });
      },
    };

    // log(tagConfig)
    tools.specialBuildings = {
      button: true,
      name: "specialBuildings",
      title: "Spezielle Gebäude",
      icon: "fa-solid fa-shop",
      button: true,
      order: index++,
      onChange: async () => {
        let content = await foundry.applications.handlebars.renderTemplate(
          TEMPLATES.lights,
          {
            districts: tagConfig.lights.districtTags.map((dTag) => {
              // log(dTag, tagConfig.lights.specialTagsbyDistricts);
              return {
                name: dTag,
                tags: tagConfig.lights.specialTagsbyDistricts[dTag],
              };
            }),
          }
        );
        new foundry.applications.api.DialogV2({
          window: { title: "Stadtteile" },
          content: content,
          buttons: [
            {
              action: "close",
              label: "Schließen",
              default: true,
            },
          ],
          classes: ["lyynixMapMenuDialog"],
          position: { left: 145, top: 73, height: "auto", width: 400 },
          submit: () => { },
        }).render({ force: true });
      },
    };

    return tools;
  }

  static lightTool(
    index,
    lightTag,
    title = lightTag,
    icon = "fa-regular fa-lightbulb"
  ) {
    return {
      toggle: true,
      active: window.Tagger ? !Tagger.getByTag(lightTag)[0].hidden : false,
      name: lightTag,
      title: title,
      icon: icon + " lyynix-scene-button",
      onChange: (event, active) => {
        LyynixMapMenuLayer.setByTag(lightTag, active);
      },
      order: index,
    };
  }
  static tileTool(
    index,
    tileTag,
    title = tileTag,
    icon = "fa-regular fa-cube") {
    return {
      toggle: true,
      active: window.Tagger ? Tagger.getByTag(tileTag)[0].alpha > 0.5 : false,
      name: tileTag,
      title: title,
      icon: icon + " lyynix-scene-button",
      onChange: (event, active) => {
        LyynixMapMenuLayer.setByTag(tileTag, active, "Tile");
      },
      order: index,
    };
  }

  static toggleTile(tag) {
    let items = Tagger.getByTag(tag);

    if (items.length > 0) {
      let a = items[0].alpha > 0.5 ? 0 : 1;
      let b = !items[0].hidden;
      const updates = items.map((i) => ({ _id: i.id, alpha: a }));
      canvas.scene.updateEmbeddedDocuments("Tile", updates);
      // log("set alpha of Tiles with Tag " + tag + " to " + a);
    } // else log("No tiles found with tag " + tag);
  }
  static toggleByTag(tag) {
    let items = Tagger.getByTag(tag);

    if (items.length > 0) {
      let isOn = !items[0].hidden;
      const updates = items.map((i) => ({ _id: i.id, hidden: isOn }));
      canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
    }
  }
  static setAll(on) {
    canvas.lighting.updateAll({ hidden: !on });
  }
  static setByTag(tag, on, docType = "AmbientLight") {
    let items = Tagger.getByTag(tag);

    if (items.length > 0) {
      let updates;
      if (docType == "Tile") {
        let a = on ? 1 : 0;
        updates = items.map((i) => ({ _id: i.id, alpha: a }));
      } else {
        updates = items.map((i) => ({ _id: i.id, hidden: !on }));
      }
      canvas.scene.updateEmbeddedDocuments(docType, updates);
    }
  }
  static setByChance(tag, prob) {
    let items = Tagger.getByTag(tag);

    if (items.length > 0) {
      const updates = items.map((i) => ({
        _id: i.id,
        hidden: Math.random() < prob,
      }));
      canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
    }
  }
}

function log(...params) {
  console.log("LSM |", ...params);
}
