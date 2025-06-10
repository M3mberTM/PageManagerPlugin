import {entryExists} from "./helper";
import {storage} from 'uxp';

const fs = storage.localFileSystem;
const LOG_FILE_PREFIX = "PMlog"
const LOG_LEVEL = {INFO:"INFO" , WARN:"WARN", ERROR:"ERROR"}
// todo create file with important constants
const DATA_FOLDER = await fs.getDataFolder()
const LOG_FOLDER = "logs"

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
const log = (LogLevel, funcArguments, ...args) => {
    // Adds all the necessary information to the log
    const err = new Error()
    const origin = err.stack.split("\n")[3].trim()
    const allInfo = origin.split(" ")
    const funcName = allInfo[1]
    let lineNum = allInfo[2].split("/").reverse()[0]
    lineNum= lineNum.substring(0, lineNum.length - 1)
    const dateTime = new Date().toISOString()
    const formattedString = `${dateTime} - ${LogLevel} - ${funcName}(${funcArguments}) - ${lineNum} - ${args.join(",")}`
    logToFile().then()
}

const info = (funcArguments, ...args) => {
    log(LOG_LEVEL.INFO, funcArguments, ...args)

}

const warning = (funcArguments, ...args) => {
    log(LOG_LEVEL.WARN, funcArguments, ...args)
}

const error = (funcArguments, ...args) => {
    log(LOG_LEVEL.ERROR, funcArguments, ...args)
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
// const logToFile = async () => {
//
// }

/* implement clearLogs function. See info below!
- Search the data folder for log folder
- Get all entries in the log folder
- if number of entries exceeds x, based on a variable, delete the oldest until it matches x
----------Removal----------
- sort them by date created, oldest first
- delete the oldest files

KEEP IN MIND!
Only run this function at the beginning.
This may result in one more file than x, but it is negligible and will be fixed next time user open PS
*/
const clearLogs = async () => {
    const dataFolder = await fs.getDataFolder()
    const file = await dataFolder.getEntry(logFile)
    const metadata = await file.getMetadata()
    const date = new Date(metadata.dateCreated)
    console.log(d.toISOString())
}

// in order to avoid the log file becoming too big, only last 4 days are logged

const logToFile = async (content, isError) => {
    try {
        const dataFolder = await fs.getDataFolder()
        let file = undefined
        if (!await checkForLog()) {
            file = await dataFolder.createFile(logFile)
            await file.write(initialMsg)
        } else {
            file = await dataFolder.getEntry(logFile)
        }
        const contents = await file.read()
        const dayLogs = contents.split(splitter)
        const lastEntries = dayLogs[dayLogs.length-1].split("\n")
        // Check if the last entry is the same date as what is currently. If not, make new day split
        const finalEntry = lastEntries[lastEntries.length-1]
        const currentDate = new Date()
        let newContent = ""
        if (!finalEntry.includes(initialMsg)) {
            // due to some error messages having multiple lines, app goes backwards in the log until it finds a date, then it compares that date
            let entry = ""
            const pattern = /^\w{4}-\w{1,2}-\w{1,2}/
            for (let i =0; i < lastEntries.length; i++) {
                let currEntry = lastEntries[lastEntries.length-1-i]
                if (pattern.exec(currEntry.trim()) != null) {
                    entry = currEntry
                    break
                }
            }
            const dateStamp = entry.substring(0, entry.indexOf(";"))
            const lastDate = new Date(dateStamp)
            if (currentDate.getMonth() != lastDate.getMonth() && currentDate.getDate() != lastDate.getDate()) {
                newContent = splitter
            } else {
                newContent = "\n"
            }
        } else {
            newContent = "\n"
        }
        newContent = `${newContent}${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()};`
        newContent = `${newContent}${currentDate.getHours()}:${currentDate.getMinutes()};${isError ? "ERROR;" : ""}${content}`
        const fileContents = contents + newContent
        await file.write(fileContents)

    } catch (e) {
        // alert("Function logToFile")
        // alert(e)
    }
}

export {info, warning, error, logToFile}