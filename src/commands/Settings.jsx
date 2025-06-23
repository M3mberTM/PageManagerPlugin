import React, {useEffect, useState} from "react";
import {storage} from 'uxp';

import "../components/CommonStyles.css"
import {SettingOption} from "../components/SettingOption";
import {logDecorator} from "../helpers/Logger";
import {SETTING_IDS, SETTINGS_FOLDER, SETTINGS_FILE, PATH_DELIMITER} from "../helpers/constants";
import {setDocSaveOnOpen, setZeroNumbering, setSaveBetweenClose, setAllStates} from "../reducers/settingsSlice";
import {useDispatch, useSelector} from "react-redux";
import {readFile, writeToFile} from "../helpers/helper";

const fs = storage.localFileSystem;

export const Settings = ({dialog}) => {
    const dispatch = useDispatch()
    const settings = useSelector(state => state.settingsSlice)
    const settingsFile = `${SETTINGS_FOLDER}${PATH_DELIMITER}${SETTINGS_FILE}`
    const isSetUp = useSelector(state => state.helperSlice.isSetUp)
    // useStates
    const [allSettings, setAllSettings] = useState(settings)

    useEffect(() => {
        const loadSettings = async () => {
            const dataFolder = await fs.getDataFolder()
            const dataFolderPath = dataFolder.nativePath
            const content = await readFile(`${dataFolderPath}${PATH_DELIMITER}${settingsFile}`)
            dispatch(setAllStates(JSON.parse(content)))
            setAllSettings(JSON.parse(content))
        }
        if (isSetUp) {
            loadSettings().then()
        }
    }, [isSetUp])

    const handleSetting = logDecorator(async function handleSetting (settingId, value) {
        let newSettings = {...settings}
        switch(settingId){
            case SETTING_IDS.zeroNumbering:
                dispatch(setZeroNumbering(value))
                newSettings = {...newSettings, zeroNumbering: value}
                break
            case SETTING_IDS.saveBetweenClose:
                dispatch(setSaveBetweenClose(value))
                newSettings = {...newSettings, saveBetweenClose: value}
                break
            case SETTING_IDS.saveOnOpen:
                dispatch(setDocSaveOnOpen(value))
                newSettings = {...newSettings, docSaveOnOpen: value}
                break
            default:
                break
        }
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${settingsFile}`, JSON.stringify(newSettings))
        setAllSettings(newSettings)
    })
    return (
        <div>
            <sp-heading>Page Manager Settings</sp-heading>
            <sp-divider size="large"></sp-divider>
            <div style={{marginTop: "10px"}}>
                <SettingOption isEnabled={allSettings.saveBetweenClose}
                               settingId={SETTING_IDS.saveBetweenClose}
                               description={"All information will be saved between closing of the application"}
                               setter={handleSetting}>Save between opening</SettingOption>
                <SettingOption isEnabled={allSettings.docSaveOnOpen}
                               settingId={SETTING_IDS.saveOnOpen}
                               description={"Saves the document the moment it is opened."}
                               setter={handleSetting}>Save Document on Open</SettingOption>
                <SettingOption isEnabled={allSettings.zeroNumbering}
                               settingId={SETTING_IDS.zeroNumbering}
                               description={"Starts numbering the pages from zero"}
                               setter={handleSetting}>Zero numbering</SettingOption>
            </div>

            <sp-button-group style={{marginTop: "10px"}}>
                <sp-button tabindex={0} autofocus="autofocus" variant="primary" style={{marginLeft: "auto"}} onClick={() => dialog.close("ok")}>Close</sp-button>
            </sp-button-group>
        </div>
    );
}
