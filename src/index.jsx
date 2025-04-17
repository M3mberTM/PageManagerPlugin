import React from "react";

import "./styles.css";
import {PanelController} from "./controllers/PanelController.jsx";
import {CommandController} from "./controllers/CommandController.jsx";
import {About} from "./components/About.jsx";
import {PanelSelector} from "./components/PanelSelector";
import {entrypoints} from "uxp";

import {Provider} from "react-redux";
import store from "./reducers/store";

const panels = {
    "Import": 0,
    "Naming": 1,
    "Export": 2
}
const aboutController = new CommandController(({dialog}) => <About dialog={dialog}/>, {
    id: "showAbout",
    title: "React Starter Plugin Demo",
    size: {width: 480, height: 480}
});
// const demosController =  new PanelController(() => <Demos/>, {id: "demos", menuItems: [
//     { id: "reload1", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload() },
//     { id: "dialog1", label: "About this Plugin", enabled: true, checked: false, oninvoke: () => aboutController.run() },
// ] });
// const moreDemosController =  new PanelController(() => <MoreDemos/>, { id: "moreDemos", menuItems: [
//     { id: "reload2", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload() }
// ] });

const importController = new PanelController(() => <Provider store={store}><PanelSelector
    panel={panels["Import"]}/></Provider>, {
    id: "import", menuItems: [
        {id: "reload4", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

const namingController = new PanelController(() => <Provider store={store}><PanelSelector
    panel={panels["Naming"]}/></Provider>, {
    id: "naming", menuItems: [
        {id: "reload5", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

const exportController = new PanelController(() => <Provider store={store}><PanelSelector
    panel={panels['Export']}/></Provider>, {
    id: "export", menuItems: [
        {id: "reload6", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload()}]
})

entrypoints.setup({
    panels: {
        import: importController,
        naming: namingController,
        export: exportController
    }
});

