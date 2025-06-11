import {appendToFile, entryExists, showAlert, writeToFile} from "./helper";
import os from "os";
import {storage} from 'uxp';

// todo create file with important and reused constants
const fs = storage.localFileSystem;
const LOG_FILE_PREFIX = "PMlog"
const LOG_LEVEL = {INFO:"INFO" , WARN:"WARN", ERROR:"ERROR"}
const PATH_DELIMITER = os.platform() == "win32" ? "\\" : "/";
const LOG_FOLDER = "logs"
const LOG_FILE_LIMIT = 4

const logFile = 'log.txt'
const splitter =  "\n====================\n"
const initialMsg = "LOG FILE. PLEASE, DON'T CHANGE"

/*
 TODO called function and arguments
 TODO Different file for each log day
 TODO Delete logs older than x days based on variable
 TODO Function for checking if the folder structure and files exist

Log contents example:

2011-10-05T14:48:00.000Z - INFO - getFolder(aaa, bbb) - Import.jsx:18:53 - Extra message if necessary
2011-10-05T14:48:00.000Z - ERROR - getFolder(aaa, bbb) - Import.jsx:18:53 - Something went wrong

Log file name example:
PMlog_2011_10_05.txt
 */

// todo finish sending data to logToFile function
const log = (LogLevel, funcName, funcArguments, ...args) => {
    // Adds all the necessary information to the log
    const err = new Error()
    const origin = err.stack.split("\n")[4].trim()
    const allInfo = origin.split(" ")
    let lineNum = allInfo[2].split("/").reverse()[0]
    lineNum= lineNum.substring(0, lineNum.length - 1)
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
/* implement logToFile fully. Remove the old logToFile function
- Checks if file exits
- If not, writes normally to the file
- if yes, append to the file

Check if file exists:
- Create date and convert to ISO format
- Remove time and leave just date
- Add date after logPrefix and check if it exists
 */
const logToFile = async (content) => {
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

export const funcCaller = async function (funcReference, ...args) {
    try {
        info(funcReference.name, args)
        await funcReference(...args)
    } catch (e) {
        error(funcReference.name, args, e.message)
    }
}

// in order to avoid the log file becoming too big, only last 4 days are logged

// const logToFile = async (content, isError) => {
//     try {
//         const dataFolder = await fs.getDataFolder()
//         let file = undefined
//         if (!await checkForLog()) {
//             file = await dataFolder.createFile(logFile)
//             await file.write(initialMsg)
//         } else {
//             file = await dataFolder.getEntry(logFile)
//         }
//         const contents = await file.read()
//         const dayLogs = contents.split(splitter)
//         const lastEntries = dayLogs[dayLogs.length-1].split("\n")
//         // Check if the last entry is the same date as what is currently. If not, make new day split
//         const finalEntry = lastEntries[lastEntries.length-1]
//         const currentDate = new Date()
//         let newContent = ""
//         if (!finalEntry.includes(initialMsg)) {
//             // due to some error messages having multiple lines, app goes backwards in the log until it finds a date, then it compares that date
//             let entry = ""
//             const pattern = /^\w{4}-\w{1,2}-\w{1,2}/
//             for (let i =0; i < lastEntries.length; i++) {
//                 let currEntry = lastEntries[lastEntries.length-1-i]
//                 if (pattern.exec(currEntry.trim()) != null) {
//                     entry = currEntry
//                     break
//                 }
//             }
//             const dateStamp = entry.substring(0, entry.indexOf(";"))
//             const lastDate = new Date(dateStamp)
//             if (currentDate.getMonth() != lastDate.getMonth() && currentDate.getDate() != lastDate.getDate()) {
//                 newContent = splitter
//             } else {
//                 newContent = "\n"
//             }
//         } else {
//             newContent = "\n"
//         }
//         newContent = `${newContent}${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()};`
//         newContent = `${newContent}${currentDate.getHours()}:${currentDate.getMinutes()};${isError ? "ERROR;" : ""}${content}`
//         const fileContents = contents + newContent
//         await file.write(fileContents)
//
//     } catch (e) {
//         // alert("Function logToFile")
//         // alert(e)
//     }
// }

export {info, warning, error, logToFile}