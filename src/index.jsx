import React from "react";

import "./styles.css";
import {PanelController} from "./controllers/PanelController.jsx";
import {CommandController} from "./controllers/CommandController.jsx";
import {About} from "./components/About.jsx";
import {entrypoints} from "uxp";
import {Import} from "./panels/Import";
import {Naming} from "./panels/Naming";
import {Export} from "./panels/Export";
import {Provider} from "react-redux";
import store from "./reducers/store";

const aboutController = new CommandController(({dialog}) => <About dialog={dialog}/>, {
    id: "showAbout",
    title: "Page Manager Info",
    size: {width: 480, height: 480} // still don't understand what this line does
});

const importController = new PanelController(() => <Provider store={store}><Import/></Provider>, {
    id: "import", menuItems: [
        {id: "reload4", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

const namingController = new PanelController(() => <Provider store={store}><Naming/></Provider>, {
    id: "naming", menuItems: [
        {id: "reload5", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

const exportController = new PanelController(() => <Provider store={store}><Export/></Provider>, {
    id: "export", menuItems: [
        {id: "reload6", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

entrypoints.setup({
    commands: {
        showAbout: aboutController
    },
    panels: {
        import: importController,
        naming: namingController,
        export: exportController
    }
});

