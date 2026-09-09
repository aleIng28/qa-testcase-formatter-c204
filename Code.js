function formatExternalSheet() {
var masterSS = SpreadsheetApp.getActiveSpreadsheet();
var masterSheet = masterSS.getActiveSheet();

 // 1. Leer la URL del archivo destino desde la celda B3 de la Consola de Control
var targetUrl = masterSheet.getRange("B3").getValue().toString().trim();

if (targetUrl === "") {
SpreadsheetApp.getUi().alert("Por favor, introduce la URL del archivo de Google Sheets que deseas formatear en la celda B3.");
return;
 }

var ui = SpreadsheetApp.getUi();
var response = ui.alert(
"Confirmar ejecución",
"¿Estás seguro de que deseas aplicar el formato al archivo externo?\n\nURL: " + targetUrl,
 ui.ButtonSet.YES_NO
 );

if (response !== ui.Button.YES) {
return;
 }

try {
 // 2. Abrir el archivo destino de forma remota usando su URL
var ss = SpreadsheetApp.openByUrl(targetUrl);
var sheets = ss.getSheets();
var sheetRegex = /^F\d+$/;
var formattedCount = 0;

 sheets.forEach(function(sheet) {
var sheetName = sheet.getName();

if (sheetRegex.test(sheetName)) {
var lastRow = sheet.getLastRow();
if (lastRow < 10) return; // Saltar si no hay datos

var numRows = lastRow - 9;

 // AUTOMATIZACIÓN: Colocar "En espera" en J, y "No" en N y O si están vacías con contenido alrededor

var rangeAll = sheet.getRange(10, 1, numRows, 15); // Lee columnas A hasta la O (columnas 1 a 15)
var valuesAll = rangeAll.getValues();

var jValues = [];
var noValues = [];
var changedJ = false;
var changedNO = false;

for (var i = 0; i < numRows; i++) {
var row = valuesAll[i];
var colJValue = row[9]; 
var colNValue = row[13]; 
var colOValue = row[14]; 

 // Evaluar J
var hasContentForJ = false;
for (var c = 0; c < 9; c++) {
if (row[c] !== "" && row[c] !== null) { hasContentForJ = true; break; }
 }
if (!hasContentForJ) {
for (var c = 12; c < 15; c++) {
if (row[c] !== "" && row[c] !== null) { hasContentForJ = true; break; }
 }
 }

var finalJ = colJValue;
if ((colJValue === "" || colJValue === null) && hasContentForJ) {
 finalJ = "En espera";
 changedJ = true;
 }
 jValues.push([finalJ]);

 // Evaluar N y O
var hasContentForNO = false;
for (var c = 0; c < 9; c++) {
if (row[c] !== "" && row[c] !== null) { hasContentForNO = true; break; }
 }
if (!hasContentForNO && finalJ !== "" && finalJ !== null) {
 hasContentForNO = true;
 }
if (!hasContentForNO && row[12] !== "" && row[12] !== null) {
 hasContentForNO = true;
 }

var finalN = colNValue;
var finalO = colOValue;

if (hasContentForNO) {
if (colNValue === "" || colNValue === null) { finalN = "No"; changedNO = true; }
if (colOValue === "" || colOValue === null) { finalO = "No"; changedNO = true; }
 }
 noValues.push([finalN, finalO]);
 }

if (changedJ) {
 sheet.getRange(10, 10, numRows, 1).setValues(jValues);
 }
if (changedNO) {
 sheet.getRange(10, 14, numRows, 2).setValues(noValues);
 }

 // 1. Columnas A a F (Alineación horizontal: Centro, Vertical: Medio, Ajuste de texto: Ajustar)
var rangeAF = sheet.getRange(10, 1, numRows, 6);
 rangeAF.setHorizontalAlignment("center");
 rangeAF.setVerticalAlignment("middle");
 rangeAF.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

 // 2. Columnas G a I (Alineación vertical: Arriba, Alineación horizontal: Izquierda)
var rangeGI = sheet.getRange(10, 7, numRows, 3);
 rangeGI.setVerticalAlignment("top");
 rangeGI.setHorizontalAlignment("left");

 // 3. Columnas J, M, N, O (Alineación horizontal: Centro, Vertical: Medio, Ajuste de texto: Ajustar)
var rangeJ = sheet.getRange(10, 10, numRows, 1);
 rangeJ.setHorizontalAlignment("center");
 rangeJ.setVerticalAlignment("middle");
 rangeJ.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

var rangeMO = sheet.getRange(10, 13, numRows, 3);
 rangeMO.setHorizontalAlignment("center");
 rangeMO.setVerticalAlignment("middle");
 rangeMO.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

 // Formato de fuente: Calibri, tamaño 11, color negro
 sheet.getRange(10, 1, numRows, 10) // A:J
 .setFontFamily("Calibri")
 .setFontSize(11)
 .setFontColor("#000000");

 sheet.getRange(10, 13, numRows, 3) // M:O
 .setFontFamily("Calibri")
 .setFontSize(11)
 .setFontColor("#000000");

// Pintar campos vacíos en D:I
// Comparar cantidad de puntos en H vs I

var rangeDI = sheet.getRange(10, 4, numRows, 6);
var valuesDI = rangeDI.getValues();

rangeDI.setBackground(null);

for (var fila = 0; fila < numRows; fila++) {

 // 1. Extraer todos los valores de la fila actual (Columnas D hasta I)
var rowValues = valuesDI[fila];

 // 2. Comprobar si toda la fila (D:I) está completamente vacía
var isRowEmpty = true;
for (var c = 0; c < 6; c++) {
var cellValue = rowValues[c];
if (cellValue !== "" && cellValue !== null && cellValue.toString().trim() !== "") {
 isRowEmpty = false;
break; // Encontramos al menos un dato, por lo que la fila NO está vacía
 }
 }

 // Si la fila está vacía, terminamos el ciclo (fin de la tabla)
if (isRowEmpty) {
break;
 // Nota: Si solo quisieras saltar esta fila pero seguir buscando abajo, usarías 'continue;' en lugar de 'break;'
 }

 // VALIDAR VACÍOS D:I
for (var col = 0; col < 6; col++) {
var valor = rowValues[col];

if (
 valor === "" ||
 valor === null ||
 valor.toString().trim() === ""
 ) {
 sheet.getRange(fila + 10, col + 4)
 .setBackground("#FFC7CE");
 }
 }

 // VALIDAR H vs I
var hValue = rowValues[4]; // H
var iValue = rowValues[5]; // I

 sheet.getRange(fila + 10, 8).setNote("");
 sheet.getRange(fila + 10, 9).setNote("");

if (hValue || iValue) {
var hCount = 0;
var iCount = 0;

if (hValue) {
var hMatches = hValue.toString().match(/\b\d+\./g);
 hCount = hMatches ? hMatches.length : 0;
 }

if (iValue) {
var iMatches = iValue.toString().match(/\b\d+\./g);
 iCount = iMatches ? iMatches.length : 0;
 }

if (hCount < iCount) {
 sheet.getRange(fila + 10, 8) // H
 .setBackground("#FFC7CE")
 .setNote("La columna H tiene menos puntos que la columna I.");
 } elseif (iCount < hCount) { // <- Corregido de elseif a else if
 sheet.getRange(fila + 10, 9) // I
 .setBackground("#FFC7CE")
 .setNote("La columna I tiene menos puntos que la columna H.");
 }
 }
}

// 4. Buscar "Objetivo" en la columna G
// Todo el texto en negro y únicamente desde la ÚLTIMA línea con texto
// que empiece por "Objetivo" hasta el final en rojo y negrita.
// Si existe una línea "Objetivo..." pero NO es la última línea con texto,
// la celda se marca con fondo rojo para revisión.

var rangeG = sheet.getRange(10, 7, numRows, 1);
var valuesG = rangeG.getValues();
var richTextValues = rangeG.getRichTextValues();

var backgrounds = [];

var blackStyle = SpreadsheetApp.newTextStyle()
 .setForegroundColor("#000000")
 .build();

var redBoldStyle = SpreadsheetApp.newTextStyle()
 .setBold(true)
 .setForegroundColor("#FF0000")
 .build();

var regexObjetivo = /^objetivo\b.*$/i;

var notes = [];

for (var i = 0; i < valuesG.length; i++) {

var cellText = valuesG[i][0];

 // Sin error por defecto
 backgrounds.push(["#FFFFFF"]);

 notes.push([""]);

if (cellText && typeof cellText === 'string') {

var rtvBuilder = SpreadsheetApp.newRichTextValue()
 .setText(cellText);

 // Todo el texto en negro
 rtvBuilder.setTextStyle(0, cellText.length, blackStyle);

var lines = cellText.split(/\r?\n/);

 // Última línea con contenido
var lastLineIndex = -1;
var lastLineText = "";

for (var j = lines.length - 1; j >= 0; j--) {
if (lines[j].trim() !== "") {
 lastLineIndex = j;
 lastLineText = lines[j].trim();
break;
 }
 }

 // Buscar cualquier línea que empiece con "objetivo"
var objetivoLineIndex = -1;

for (var j = 0; j < lines.length; j++) {
if (regexObjetivo.test(lines[j].trim())) {
 objetivoLineIndex = j;
break;
 }
 }

if (objetivoLineIndex !== -1) {

 // Caso correcto: la línea objetivo es la última con contenido
if (
 lastLineIndex !== -1 &&
 objetivoLineIndex === lastLineIndex
 ) {

var startPos = 0;

for (var k = 0; k < objetivoLineIndex; k++) {
 startPos += lines[k].length + 1;
 }

 rtvBuilder.setTextStyle(
 startPos,
 cellText.length,
 redBoldStyle
 );

 } else {

 // ERROR:
 // Hay una línea Objetivo pero existe texto después.
 backgrounds[i][0] = "#FFC7CE"; // Rojo suave
 notes[i][0] = "El objetivo debe ser la última línea de texto en el campo.";
 }
 }

 richTextValues[i][0] = rtvBuilder.build();
 }
}

rangeG.setRichTextValues(richTextValues);
rangeG.setBackgrounds(backgrounds);
rangeG.setNotes(notes);

 // 5. Auto-ajustar altura de las filas (Doble clic automático)
 sheet.autoResizeRows(10, numRows);

 // 6. Nueva implementación Responsable de la funcion
var fg7 = sheet.getRange("F7:G7"); //variable
 fg7.clearContent(); // limpiamos contenido
 fg7.setValue("Fabrica de pruebas"); // colocamos responsable

 formattedCount++;
 }
 });

 ui.alert("¡Éxito!", "Se ha aplicado el formato correctamente a " + formattedCount + " pestaña(s) de funciones en el archivo destino.", ui.ButtonSet.OK);

 } catch (e) {
 ui.alert("Error", "No se pudo abrir o formatear el archivo. Asegúrate de tener permisos de edición sobre él y de que la URL sea correcta.\n\nDetalle: " + e.message, ui.ButtonSet.OK);
 }
  }
