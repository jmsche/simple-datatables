import {
    isObject
} from "../helpers"

/**
 * Export table to JSON
 */
export const exportJSON = function(dataTable: any, userOptions = {}) {
    if (!dataTable.hasHeadings && !dataTable.hasRows) return false


    const defaults = {
        download: true,
        skipColumn: [],
        replacer: null,
        space: 4
    }

    // Check for the options object
    if (!isObject(userOptions)) {
        return false
    }

    const options = {
        ...defaults,
        ...userOptions
    }

    const columnShown = (index: any) => !options.skipColumn.includes(index) && !dataTable.columnSettings.columns[index]?.hidden

    let rows: any = []
    // Selection or whole table
    // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
    if (options.selection) {
        // Page number
        // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
        if (!isNaN(options.selection)) {
            // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
            rows = rows.concat(dataTable.pages[options.selection - 1].map((row: any) => row.row.filter((_cell: any, index: any) => columnShown(index)).map((cell: any) => cell.type === "node" ? cell : cell.data)))
        // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
        } else if (Array.isArray(options.selection)) {
            // Array of page numbers
            // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
            for (let i = 0; i < options.selection.length; i++) {
                // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
                rows = rows.concat(dataTable.pages[options.selection[i] - 1].map((row: any) => row.row.filter((_cell: any, index: any) => columnShown(index)).map((cell: any) => cell.type === "node" ? cell : cell.data)))
            }
        }
    } else {
        rows = rows.concat(dataTable.data.data.map((row: any) => row.filter((_cell: any, index: any) => columnShown(index)).map((cell: any) => cell.type === "node" ? cell : cell.data)))
    }

    const headers = dataTable.data.headings.filter((_heading: any, index: any) => columnShown(index)).map((header: any) => header.data)

    // Only proceed if we have data
    if (rows.length) {
        const arr: any = []
        rows.forEach((row: any, x: any) => {
            arr[x] = arr[x] || {}
            row.forEach((cell: any, i: any) => {
                arr[x][headers[i]] = cell
            })
        })

        // Convert the array of objects to JSON string
        const str = JSON.stringify(arr, options.replacer, options.space)

        // Download
        if (options.download) {
            // Create a link to trigger the download

            const blob = new Blob(
                [str],
                {
                    type: "data:application/json;charset=utf-8"
                }
            )
            const url = URL.createObjectURL(blob)


            const link = document.createElement("a")
            link.href = url
            // @ts-expect-error TS(2339): Property 'filename' does not exist on type '{ down... Remove this comment to see the full error message
            link.download = `${options.filename || "datatable_export"}.json`

            // Append the link
            document.body.appendChild(link)

            // Trigger the download
            link.click()

            // Remove the link
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }

        return str
    }

    return false
}
