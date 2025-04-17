const fs = require('uxp').storage.localFileSystem;
const logFile = 'log.txt'
const splitter =  "\n====================\n"
const initialMsg = "LOG FILE. PLEASE, DON'T CHANGE"

export const checkForLog = async () => {
    try {
        const dataFolder = await fs.getDataFolder()
        const file = await dataFolder.getEntry(logFile)
        return true
    } catch (e) {
        return false
    }
}
export const clearLog = async () => {
    try {
        const dataFolder = await fs.getDataFolder()
        if (!await checkForLog()) {
            console.log("Creating log file")
            const createdFile = await dataFolder.createFile(logFile)
            createdFile.write(initialMsg)
            return
        }
        const file = await dataFolder.getEntry(logFile)
        const contents = await file.read()
        const dayLogs = contents.split(splitter)
        // remove old data after 4 days of existing
        let cleanedLogs = []
        if (dayLogs.length > 4) {
            cleanedLogs = dayLogs.slice(1, dayLogs.length)
        } else {
            cleanedLogs = dayLogs.slice()
        }
        const newLog = cleanedLogs.join(splitter)
        await file.write(`${newLog}`)
    } catch(e) {
        alert("Function clear Log")
        alert(e)
    }
}
export const logToFile = async (content, isError) => {
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
            const dateStamp = finalEntry.substring(0, finalEntry.indexOf(";"))
            console.log(currentDate.toString())
            const lastDate = new Date(dateStamp)
            console.log(dateStamp)
            console.log(lastDate.toString())
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
        alert("Function logToFile")
        alert(e)
    }
}


