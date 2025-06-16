import { TEMPLATES } from "./constants.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class MapMenuEditorApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static PARTS = {
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    lights: {
      template: TEMPLATES.editLights
    },
    tiles: {
      template: TEMPLATES.editTiles
    },
    submit: {
      template: TEMPLATES.editSubmit
    }
  }
  static DEFAULT_OPTIONS = {
    position: { width: 500, top: 0 },
    window: {
      icon: "fas fa-money-check-pen",
      contentClasses: ["standard-form"]
    },
    classes: ["standard-form"],
    tag: "form",
    form: {
      handler: MapMenuEditorApplication.formHandler,
      submitOnChange: false,
      closeOnSubmit: false
    }
  }

  

  setScene(scene) {
    this.scene = scene
    this.options.window.title = "Szenenmenü Tags: " + scene.name;
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options);
  
    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
      name: this.scene.name,
      tags: this.scene.flags.dsa5["lyynix-map-tags"]
    });

    console.log("LSM | prepared context:", context);
    
  
    return context;
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
  
    // Default tab for first time it's rendered this session
    // if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'lights';
  
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: 'item',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: '',
      };
  
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'lights':
          tab.id = 'lights';
          tab.label = 'Lichter';
          tab.icon = 'fa-regular fa-lightbulb';
          break;
        case 'tiles':
          tab.id = 'tiles';
          tab.label = 'Kacheln';
          tab.icon = 'fa-regular fa-cube';
          break;
        default:
      }
  
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) {
        tab.cssClass += ' active';
        tab.active = true;
      }
  
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Process form submission for the sheet
   * @this {MapMenuEditorApplication}             The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async formHandler(event, form, formData) {
    console.log("LSM |", event, form, formData);
    
    this.render();
  }
}
