import React from "react";
import {PanelController} from "./controllers/PanelController.jsx";
import {CommandController} from "./controllers/CommandController.jsx";
import {About} from "./commands/about/About.jsx";
import {entrypoints} from "uxp";
import {ImportPanel} from "./panels/import/ImportPanel";
import {NamingPanel} from "./panels/naming/NamingPanel";
import {MovementPanel} from "./panels/movement/MovementPanel";
import {Provider} from "react-redux";
import store from "./redux/store";
import {Settings} from "./commands/settings/Settings";

const aboutController = new CommandController(({dialog}) => <About dialog={dialog}/>, {
    id: "showAbout",
    title: "Page Manager Info",
    size: {width: 480, height: 480} // still don't understand what this line does
});

const settingsController = new CommandController(({dialog}) =><Provider store={store}><Settings dialog={dialog}/></Provider>, {
    id: "settings",
    title: "Page Manager Settings",
    size: {width: 480, height: 480} // still don't understand what this line does
});

const importController = new PanelController(() => <Provider store={store}><ImportPanel/></Provider>, {
    id: "import", menuItems: [
        {id: "reload4", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

const namingController = new PanelController(() => <Provider store={store}><NamingPanel/></Provider>, {
    id: "naming", menuItems: [
        {id: "reload5", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

const exportController = new PanelController(() => <Provider store={store}><MovementPanel/></Provider>, {
    id: "export", menuItems: [
        {id: "reload6", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

entrypoints.setup({
    commands: {
        showAbout: aboutController,
        settings: settingsController,
    },
    panels: {
        import: importController,
        naming: namingController,
        export: exportController
    }
});