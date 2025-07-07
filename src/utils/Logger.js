import {appendToFile, entryExists, showAlert, writeToFile} from "./helper";
import {storage} from 'uxp';
import {LOG_FILE_PREFIX, LOG_FOLDER, LOG_FILE_LIMIT, PATH_DELIMITER} from "./constants";

const fs = storage.localFileSystem;
const LOG_LEVEL = {INFO:"INFO" , WARN:"WARN", ERROR:"ERROR"}

/*
Log contents example:

2011-10-05T14:48:00.000Z - INFO - getFolder(aaa, bbb) - Import.jsx:18:53 - Extra message if necessary
2011-10-05T14:48:00.000Z - ERROR - getFolder(aaa, bbb) - Import.jsx:18:53 - Something went wrong

Log file name example:
PMlog_2011_10_05.txt
 */

const log = (LogLevel, funcName, funcArguments, ...args) => {
    // Adds all the necessary information to the log
    const err = new Error()
    const origin = err.stack.split("\n")[4].trim()
    const fileInfo = origin.substring(origin.indexOf("("))
    let lineNum = fileInfo.split("/").reverse()[0]
    lineNum = lineNum.substring(0, lineNum.length - 1)
    const dateTime = new Date().toISOString()
    const formattedString = `${dateTime} - ${LogLevel} - ${funcName}(${funcArguments}) - ${lineNum} - ${args.join(",")}\n`
    logToFile(formattedString).then()
}

const info = (funcName, funcArguments, ...args) => {
    log(LOG_LEVEL.INFO, funcName, funcArguments, ...args)
}

const warning = (funcName, funcArguments, ...args) => {
    log(LOG_LEVEL.WARN, funcName, funcArguments, ...args)
}

const error = (funcName, funcArguments, ...args) => {
    log(LOG_LEVEL.ERROR, funcName, funcArguments, ...args)
}
const logToFile = async (content) => {
    // logs to the log file. Creates a new file if necessary
    try {
        const dataFolder = await fs.getDataFolder()
        const logFolderEntry = await dataFolder.getEntry(LOG_FOLDER)
        const currentDate = new Date().toISOString()
        const currentLogFile = `${LOG_FILE_PREFIX}${currentDate.substring(0, currentDate.indexOf("T"))}.txt`
        if (!await entryExists(`${logFolderEntry.nativePath}${PATH_DELIMITER}${currentLogFile}`)) {
            const logFileEntry = await logFolderEntry.createFile(currentLogFile)
            await logFileEntry.write("temp string")
            await writeToFile(`${logFolderEntry.nativePath}${PATH_DELIMITER}${currentLogFile}`, content)
        } else {
            await appendToFile(`${logFolderEntry.nativePath}${PATH_DELIMITER}${currentLogFile}`, content)
        }
    } catch(e) {
        showAlert(e)
    }
}

const clearLogs = async () => {
    // Removes old log files so that it doesn't clutter the system. Set in LOG_FILE_LIMIT variable
    try {
        console.log("==========Clearing logs==========")
        const dataFolder = await fs.getDataFolder()
        const logFolderEntry = await dataFolder.getEntry(LOG_FOLDER)
        const allEntries = await logFolderEntry.getEntries()
        const files = allEntries.filter(entry => entry.isFile)
        if (files.length > LOG_FILE_LIMIT) {
            console.log("Log file exceeded. Deleting old logs")
            const fileMetadatas = await Promise.all(files.map(async (file) => {
                return file.getMetadata();
            }))
            fileMetadatas.sort((a, b) => {
                const isAEarlier = new Date(a.dateCreated) < new Date(b.dateCreated)
                if (isAEarlier) {
                    return -1
                }
                return 1
            })
            for (let i = 0; i < files.length - LOG_FILE_LIMIT; i++) {
                const entry = await logFolderEntry.getEntry(fileMetadatas[i].name)
                await entry.delete()
            }
        }
    } catch(e) {
        showAlert(e)
    }

}

function logDecorator(fn) {
    return async function(...args) {
        let result;
        try {
            info(fn.name, args)
            result = await fn.call(this, ...args)
        } catch (e) {
            error(fn.name, args, e)
            showAlert(fn.name)
            showAlert(e)
        }
        return result
    }
}

function asyncLogDecorator(fn) {
    return function(...args) {
        let result;
        try {
            info(fn.name, args)
            result = fn.call(this, ...args)
        } catch (e) {
            error(fn.name, args, e)
            showAlert(fn.name)
            showAlert(e)
        }
        return result
    }
}

export {info, warning, error, logToFile, logDecorator, asyncLogDecorator, clearLogs}