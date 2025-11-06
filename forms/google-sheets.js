/**
 * Google Sheets Integration Module
 * This module handles form submissions to Google Sheets
 * 
 * Setup Instructions:
 * 1. Create a Google Sheet with columns matching your form fields
 * 2. Go to Extensions > Apps Script
 * 3. Copy and paste the following code:
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = JSON.parse(e.postData.contents);
 *   
 *   sheet.appendRow([
 *     new Date(),
 *     data.nombre,
 *     data.telefono,
 *     data.email,
 *     data.direccion,
 *     data.servicio,
 *     data.descripcion,
 *     data.fecha,
 *     data.visitaTecnica ? 'Sí' : 'No'
 *   ]);
 *   
 *   return ContentService.createTextOutput(JSON.stringify({
 *     'result': 'success'
 *   })).setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * 4. Deploy as Web App
 * 5. Set "Execute as" to "Me"
 * 6. Set "Who has access" to "Anyone"
 * 7. Copy the deployment URL and replace YOUR_SCRIPT_ID in main.js CONFIG
 */

const GoogleSheetsAPI = {
    /**
     * Submit form data to Google Sheets
     * @param {string} url - Google Apps Script Web App URL
     * @param {object} data - Form data to submit
     * @returns {Promise} - Response from Google Sheets
     */
    async submitForm(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return { success: true, data: response };
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            throw error;
        }
    },

    /**
     * Fetch schedule data from Google Sheets
     * @param {string} url - Google Apps Script Web App URL
     * @returns {Promise} - Schedule data
     */
    async fetchSchedule(url) {
        try {
            const response = await fetch(url + '?action=getSchedule');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            throw error;
        }
    },

    /**
     * Fetch ticket information from Google Sheets
     * @param {string} url - Google Apps Script Web App URL
     * @param {string} ticketNumber - Ticket number to search
     * @returns {Promise} - Ticket data
     */
    async fetchTicket(url, ticketNumber) {
        try {
            const response = await fetch(url + '?action=getTicket&number=' + ticketNumber);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw error;
        }
    }
};

export default GoogleSheetsAPI;