import React, {useEffect, useState} from "react";
import {storage} from 'uxp';

import "../../CommonStyles.css"
import {SettingOption} from "../../components/typography/SettingOption";
import {logDecorator} from "../../utils/Logger";
import {SETTING_IDS, SETTINGS_FOLDER, SETTINGS_FILE, PATH_DELIMITER} from "../../utils/constants";
import {setDocSaveOnOpen, setZeroNumbering, setSaveBetweenClose, setAllStates} from "../../redux/settingsSlice";
import {useDispatch, useSelector} from "react-redux";
import {readFile, writeToFile} from "../../utils/helper";
import {useSetUp} from "../../utils/presetManager";

const fs = storage.localFileSystem;

export const Settings = ({dialog}) => {
    useSetUp()
    const dispatch = useDispatch()
    const settings = useSelector(state => state.settings)
    const settingsFile = `${SETTINGS_FOLDER}${PATH_DELIMITER}${SETTINGS_FILE}`
    // useStates
    const [allSettings, setAllSettings] = useState(settings)

    useEffect(() => {
        setAllSettings(settings)
    }, [settings])


    const handleSetting = logDecorator(async function handleSetting (settingId, value) {
        let newSettings = {...settings}
        switch(settingId){
            case SETTING_IDS.zeroNumbering:
                dispatch(setZeroNumbering(value))
                newSettings = {...newSettings, zeroNumbering: value}
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
