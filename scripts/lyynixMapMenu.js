import { CONST, TEMPLATES } from "./constants.js";

Hooks.once("init", async function () {
  CONFIG.Canvas.layers.lyynixmapmenu = {
    layerClass: LyynixMapMenuLayer,
    group: "interface",
  };

  loadTemplates(Object.values(TEMPLATES));
});

Hooks.once("ready", async function () {
  Handlebars.registerHelper('escape', function(variable) {
    return variable.replace(/(['"])/g, '\\$1');
  });
});

Hooks.on("getSceneControlButtons", (controls) => {
  // log(controls);

  if (!game.users.current.isGM) return; // only show for GMs

  let tagConfig = game.scenes.current.getFlag("dsa5", "lyynix-map-tags");
  if (!tagConfig) {
    // only show if scene has config
    if (game.canvas.lyynixmapmenu.active)
      // if scene doesn't have flags, and tool is active, deactivate token tool
      game.canvas.tokens.activate();
    return;
  }

  // log(tagConfig);

  let tools;
  try {
    tools = getTools(tagConfig);
  } catch (e) {
    // insert dummy tool if error occurs (probably when Tagger is loaded after Map Module)
    console.error("LSM:", e);
    
    tools = [{ name: "dummy", title: "Etwas ist schief gelaufen", icon: "fa fa-lyynix" }];
  }

  if (controls) {
    controls.push({
      name: "lyynixmapmenu",
      layer: "lyynixmapmenu",
      title: "Szenenmenü",
      icon: "fa fa-lyynix",
      tools: tools,
    });
    log("Lyynix Map control added successfully.");
  } else {
    log("Could not find 'GM Menu' controls to add Lyynix Map control.");
  }
});

function getTools(tagConfig) {
  let tools = [];

  tools.push({
    name: "sun-toggle",
    title: "Sonne Umschalten",
    icon: "fa-regular fa-sun lyynix-tile-button",
    toggle: true,
    active: canvas.scene.environment.darknessLevel > 0.5 ? false : true,
    onClick: async () => {
      await canvas.scene.update(
        {
          environment: {
            darknessLevel: canvas.scene.environment.darknessLevel > 0.5 ? 0 : 1,
          },
        },
        { animateDarkness: true }
      );
    },
  });

  // Separator Tiles
  tools.push({
    name: "lyynix-separator",
    title: "Kacheln",
    icon: "",
    button: true,
    toolclip: CONST.tileTooltipConfig,
  });
  // Constant Tools
  if (tagConfig.tiles.scriptoriumTileTag) {
    tools.push(
      tileTool(
        tagConfig.tiles.scriptoriumTileTag,
        "Scriptorium Aventuris",
        "fa-regular fa-eye"
      )
    );
  }
  if (tagConfig.tiles.frameTileTag) {
    tools.push(
      tileTool(
        tagConfig.tiles.frameTileTag,
        "Rahmen",
        "fa-regular fa-border-outer"
      )
    );
  }

  // Additional Tiles
  if (tagConfig.tiles.scenicTiles) {
    if (tagConfig.tiles.scenicTiles.length < 4) {
      tagConfig.tiles.scenicTiles.forEach((tile) => {
        tools.push(
          tileTool(tile.tag, CONST.frameTileTooltipConfig, tile.icon)
        );
      });
    } else {
      tools.push({
        button: true,
        name: "scenicTiles",
        title: "Zusätzliche Kacheln",
        icon: "fa-solid fa-layer-plus",
        onClick: async () => {
          let content = await renderTemplate(
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
            submit: () => {},
          }).render({ force: true });
        },
      });
    }
  }

  // Separator Lights
  tools.push({
    name: "lyynix-separator",
    title: "Lichter",
    icon: "",
    button: true,
    toolclip: CONST.lightsTooltipConfig,
  });
  // Constant Lights
  if (tagConfig.lights.lanternTag) {
    tools.push(
      lightTool(
        tagConfig.lights.lanternTag,
        "Laternen",
        "fa-regular fa-lamp-street"
      )
    );
  }
  if (tagConfig.lights.citywallTag) {
    tools.push(
      lightTool(
        tagConfig.lights.citywallTag,
        "Stadtmauer",
        "fa-regular fa-fort"
      )
    );
  }
  if (tagConfig.lights.residenceTag) {
    tools.push(
      lightTool(
        tagConfig.lights.residenceTag,
        "Wohnhäuser",
        "fa-regular fa-tents"
      )
    );
  }
  // Additional Lights
  if (tagConfig.lights.scenicLights) {
    if (tagConfig.lights.scenicLights.length < 4) {
      tagConfig.lights.scenicLights.forEach((light) => {
        tools.push(
          lightTool(light.tag, CONST.frameTileTooltipConfig, light.icon)
        );
      });
    } else {
      tools.push({
        button: true,
        name: "scenicTiles",
        title: "Zusätzliche Kacheln",
        icon: "fa-solid fa-layer-plus",
        onClick: async () => {
          let content = await renderTemplate(
            TEMPLATES.lights,
            {
              header: "Zusätzliche Kacheln",
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
            submit: () => {},
          }).render({ force: true });
        },
      });
    }
  }


  // Separator Districts
  tools.push({
    name: "lyynix-separator",
    title: "Stadtteile",
    icon: "",
    button: true,
    toolclip: CONST.lightsTooltipConfig,
  });
  tools.push({
    button: true,
    name: "districts",
    title: "Stadtteile",
    icon: "fa-regular fa-chart-network",
    onClick: async () => {
      let content = await renderTemplate(
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
        position: { left: 145, top: 73, height: "auto", width: 330 },
        submit: () => {},
      }).render({ force: true });
    },
  });

  // log(tagConfig)
  tools.push({
    button: true,
    name: "specialBuildings",
    title: "Spezielle Gebäude",
    icon: "fa-solid fa-shop",
    onClick: async () => {
      let content = await renderTemplate(
        TEMPLATES.lights,
        {
          districts: tagConfig.lights.districtTags.map((dTag) => {
            log(dTag, tagConfig.lights.specialTagsbyDistricts);
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
        position: { left: 145, top: 73, height: "auto", width: 330 },
        submit: () => {},
      }).render({ force: true });
    },
  });

  return tools;
}

function lightTool(
  lightTag,
  title = lightTag,
  icon = "fa-regular fa-lightbulb"
) {
  return {
    toggle: true,
    active: Tagger ? !Tagger.getByTag(lightTag)[0].hidden : false,
    name: lightTag,
    title: title,
    icon: icon,
    onClick: () => {
      toggleByTag(lightTag);
    },
  };
}

function tileTool(tileTag, title = tileTag, icon = "fa-regular fa-cube") {
  return {
    toggle: true,
    active: Tagger ? Tagger.getByTag(tileTag)[0].alpha > 0.5 : false,
    name: tileTag,
    title: title,
    icon: icon + " lyynix-tile-button",
    onClick: () => {
      toggleTile(tileTag);
    },
  };
}

function toggleTile(tag) {
  let items = Tagger.getByTag(tag);

  if (items.length > 0) {
    let a = items[0].alpha > 0.5 ? 0 : 1;
    let b = !items[0].hidden;
    const updates = items.map((i) => ({ _id: i.id, alpha: a }));
    canvas.scene.updateEmbeddedDocuments("Tile", updates);
    log("set alpha of Tiles with Tag " + tag + " to " + a);
  } else log("No tiles found with tag " + tag);
}

function toggleByTag(tag) {
  let items = Tagger.getByTag(tag);

  if (items.length > 0) {
    let isOn = !items[0].hidden;
    const updates = items.map((i) => ({ _id: i.id, hidden: isOn }));
    canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
  }
}

function setAll(on) {
  canvas.lighting.updateAll({ hidden: !on });
}
function setByTag(tag, on) {
  let items = Tagger.getByTag(tag);

  if (items.length > 0) {
    const updates = items.map((i) => ({ _id: i.id, hidden: !on }));
    canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
  }
}

function setByChance(tag, prob) {
  let items = Tagger.getByTag(tag);

  if (items.length > 0) {
    const updates = items.map((i) => ({
      _id: i.id,
      hidden: Math.random() < prob,
    }));
    canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
  }
}
window.lyynixMapMenu = {
  toggleTile: toggleTile,
  setAll: setAll,
  setByTag: setByTag,
  setByChance: setByChance,
};

class LyynixMapMenuLayer extends InteractionLayer {
  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: "lyynixmapmenu",
      canDragCreate: false,
      controllableObjects: true,
      rotatableObjects: true,
      zIndex: 777,
    });
  }

  selectObjects(options) {
    canvas.tokens.selectObjects(options);
  }
}

function log(...params) {
  console.log("Lyynix |", ...params);
}
