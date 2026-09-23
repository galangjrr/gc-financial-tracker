// Legacy Google Apps Script from Google Spreadsheet
// Saved for business logic and reference migration

const SHEET_TX = "DB_Transactions";
const SHEET_CAT = "Ref_Categories";
const SHEET_WALLET = "Ref_Wallets";
const SHEET_USER = "Ref_Users";
const SHEET_LOG_SYSTEM = "Log_System";
const SHEET_LOG_AUTH = "Log_Auth";
const SHEET_GOAL = "DB_Goals";
const SHEET_DEBT = "DB_Debts";

const BUDGET_SEGMENTS = ["Pengeluaran", "Tagihan", "Liabilitas"];
const OUTFLOW_SEGMENTS = ["Pengeluaran", "Tagihan", "Liabilitas", "Tabungan"];
const BUDGET_HEALTH_SEGMENTS = ["Pengeluaran", "Tagihan", "Liabilitas", "Tabungan"];
const CATEGORY_HEADERS = ["Segment", "Category_Name", "Total_Target_Kumulatif", "Target_Anggaran_Bulanan", "Frekuensi_Target", "Keywords", "Icon"];
const TX_HEADERS = ["ID", "Timestamp", "Date", "Type", "Category", "Sub_Category", "Amount", "Wallet_Source", "Source_Device", "User_Chat_ID", "Notes", "Wallet_Destination", "Status", "Created_By", "Last_Modified"];

function getSS() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚙️ GC Finance")
    .addItem("1. Inisialisasi Database", "initDatabase")
    .addItem("1b. Migrasi v1 → v2", "migrateV1toV2")
    .addSeparator()
    .addItem("2. Set Telegram Bot Token", "setBotTokenPrompt")
    .addItem("3. Set & Pasang Webhook Telegram", "setWebhookPrompt")
    .addItem("4. Set Gemini API Key", "setGeminiKeyPrompt")
    .addSeparator()
    .addItem("Lihat URL Web App Saat Ini", "showWebAppUrl")
    .addToUi();
}

function setBotTokenPrompt() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt(
    "Set Telegram Bot Token",
    "Tempel token dari @BotFather (contoh: 123456:ABC-DEF...):",
    ui.ButtonSet.OK_CANCEL
  );
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const token = res.getResponseText().trim();
  if (!token) {
    ui.alert("Token kosong, tidak disimpan.");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("BOT_TOKEN", token);
  ui.alert("✅ Token tersimpan dengan aman di Script Properties.");
}

function setGeminiKeyPrompt() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt(
    "Set Gemini API Key",
    "Paste API Key dari Google AI Studio:",
    ui.ButtonSet.OK_CANCEL
  );
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const token = res.getResponseText().trim();
  if (!token) {
    ui.alert("Key kosong, tidak disimpan.");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", token);
  ui.alert("✅ Gemini API Key tersimpan dengan aman di Script Properties.");
}

function setWebhookPrompt() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt(
    "Pasang Webhook Telegram",
    "Tempel URL Web App hasil deploy (diakhiri /exec):",
    ui.ButtonSet.OK_CANCEL
  );
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const url = res.getResponseText().trim();
  if (!url) {
    ui.alert("URL kosong, tidak disimpan.");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("WEBAPP_URL", url);
  try {
    const result = setWebhook();
    ui.alert("Hasil pasang webhook:\n" + result);
  } catch (err) {
    ui.alert("Gagal pasang webhook: " + err.message);
  }
}

function showWebAppUrl() {
  const url = PropertiesService.getScriptProperties().getProperty("WEBAPP_URL");
  SpreadsheetApp.getUi().alert(url ? url : "Belum diset. Jalankan menu 'Set & Pasang Webhook Telegram' dulu.");
}

function getBotToken_() {
  const token = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  if (!token) {
    throw new Error('BOT_TOKEN belum diset. Jalankan menu "⚙️ GC Finance > Set Telegram Bot Token" dulu.');
  }
  return token;
}

function logSystem_(level, source, message) {
  try {
    const ss = getSS();
    let sheet = ss.getSheetByName(SHEET_LOG_SYSTEM);
    if (!sheet) return;
    sheet.appendRow([new Date(), level, source, message]);
  } catch (e) { }
}

function logAuth_(action, userName, success, detail) {
  try {
    const ss = getSS();
    let sheet = ss.getSheetByName(SHEET_LOG_AUTH);
    if (!sheet) return;
    sheet.appendRow([new Date(), action, userName || "", success ? "OK" : "FAIL", detail || ""]);
  } catch (e) { }
}

function initDatabase() {
  const ss = getSS();

  let dbSheet = ss.getSheetByName(SHEET_TX);
  if (!dbSheet) {
    dbSheet = ss.insertSheet(SHEET_TX);
    dbSheet.appendRow(TX_HEADERS);
    dbSheet.getRange("1:1").setFontWeight("bold").setBackground("#d9ead3");
    dbSheet.setFrozenRows(1);

    const rule = SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0).build();
    dbSheet.getRange("G2:G5000").setDataValidation(rule);
  }

  let catSheet = ss.getSheetByName(SHEET_CAT);
  if (!catSheet) {
    catSheet = ss.insertSheet(SHEET_CAT);
    catSheet.appendRow(CATEGORY_HEADERS);
    catSheet.getRange("1:1").setFontWeight("bold").setBackground("#cfe2f3");
    catSheet.setFrozenRows(1);

    const categoriesData = [
      ...["Makan", "Belanja", "Hiburan", "Jajan", "Transport", "Kesehatan", "Fashion", "Top Up", "Traveling", "Lainnya"].map(c => ["Pengeluaran", c, 1000000, 1000000, "Bulanan", c.toLowerCase(), ""]),
      ...["Kos/Kontrakan", "Listrik", "Air", "WiFi", "Cicilan Motor", "Cicilan Mobil", "KPR", "Asuransi", "Langganan", "Lainnya"].map(c => ["Tagihan", c, 500000, 500000, "Bulanan", c.toLowerCase(), ""]),
      ...["Saham", "Crypto", "Reksa Dana", "Emas", "Cash/Tabungan", "Obligasi", "Dana Darurat", "Bisnis", "Properti", "Lainnya"].map(c => ["Tabungan", c, 500000, 500000, "Bulanan", c.toLowerCase(), ""]),
      ...["Gaji", "Jualan", "Bonus", "Saham/Dividen", "Gaji Sampingan", "Freelance", "Lainnya"].map(c => ["Pemasukan", c, 5000000, 5000000, "Bulanan", c.toLowerCase(), ""]),
      ...["KPR/Properti", "Cicilan Kendaraan", "Kartu Kredit", "Pinjaman Pribadi", "Hutang Keluarga", "Pinjaman Online", "Cicilan Elektronik", "Cicilan Furniture", "Hutang Bisnis", "Lainnya"].map(c => ["Liabilitas", c, 1000000, 1000000, "Bulanan", c.toLowerCase(), ""])
    ];
    catSheet.getRange(2, 1, categoriesData.length, 7).setValues(categoriesData);
  }
  ensureCategorySchema_();

  let walSheet = ss.getSheetByName(SHEET_WALLET);
  if (!walSheet) {
    walSheet = ss.insertSheet(SHEET_WALLET);
    walSheet.appendRow(["Wallet_Name", "Initial_Balance"]);
    walSheet.getRange("1:1").setFontWeight("bold").setBackground("#fff2cc");
    walSheet.setFrozenRows(1);

    walSheet.appendRow(["Cash", 500000]);
    walSheet.appendRow(["BCA", 5000000]);
    walSheet.appendRow(["Gopay", 200000]);
  }

  let userSheet = ss.getSheetByName(SHEET_USER);
  if (!userSheet) {
    userSheet = ss.insertSheet(SHEET_USER);
    userSheet.appendRow(["User_Chat_ID", "Family_Name", "Role", "PIN"]);
    userSheet.getRange("1:1").setFontWeight("bold").setBackground("#f4cccc");
    userSheet.setFrozenRows(1);

    userSheet.appendRow(["-", "Admin", "Admin", "123456"]);
  }

  let goalSheet = ss.getSheetByName(SHEET_GOAL);
  if (!goalSheet) {
    goalSheet = ss.insertSheet(SHEET_GOAL);
    goalSheet.appendRow(["ID", "Name", "Target", "Priority", "Saved", "Icon", "Created_At"]);
    goalSheet.getRange("1:1").setFontWeight("bold").setBackground("#d9ead3");
    goalSheet.setFrozenRows(1);
  }

  let debtSheet = ss.getSheetByName(SHEET_DEBT);
  if (!debtSheet) {
    debtSheet = ss.insertSheet(SHEET_DEBT);
    debtSheet.appendRow(["ID", "Date", "Type", "Person", "Amount", "Notes", "Attachment_Url", "Status", "Created_By", "Last_Modified", "Is_Installment", "Installment_DueDate", "Installment_Duration", "Installment_Total", "Installment_Paid"]);
    debtSheet.getRange("1:1").setFontWeight("bold").setBackground("#e6b8af");
    debtSheet.setFrozenRows(1);
  }

  let logSheet = ss.getSheetByName(SHEET_LOG_SYSTEM);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_LOG_SYSTEM);
    logSheet.appendRow(["Timestamp", "Level", "Source", "Message"]);
    logSheet.getRange("1:1").setFontWeight("bold").setBackground("#ead1dc");
    logSheet.setFrozenRows(1);
  }

  let logAuthSheet = ss.getSheetByName(SHEET_LOG_AUTH);
  if (!logAuthSheet) {
    logAuthSheet = ss.insertSheet(SHEET_LOG_AUTH);
    logAuthSheet.appendRow(["Timestamp", "Action", "User", "Result", "Detail"]);
    logAuthSheet.getRange("1:1").setFontWeight("bold").setBackground("#d9d2e9");
    logAuthSheet.setFrozenRows(1);
  }

  Logger.log("Database initialized");
}

function migrateV1toV2() {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_TX);
  if (!sheet) return;

  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const hasNewCols = headers.indexOf("Wallet_Destination") !== -1;

  if (!hasNewCols) {
    const colStart = headers.length + 1;
    const newHeaders = ["Wallet_Destination", "Status", "Created_By", "Last_Modified"];
    sheet.getRange(1, colStart, 1, newHeaders.length).setValues([newHeaders]);

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const statusCol = headers.length + 2;
      const statusRange = sheet.getRange(2, statusCol, lastRow - 1, 1);
      const statuses = Array.from({ length: lastRow - 1 }, () => ["Active"]);
      statusRange.setValues(statuses);
    }
  }
  initDatabase();
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "dashboard";
    switch (action) {
      case "dashboard": return jsonResponse_(getDashboardData());
      case "transactions": return jsonResponse_(getAllTransactions({ type: e.parameter.type || null, wallet: e.parameter.wallet || null, month: e.parameter.month || null, search: e.parameter.search || null }));
      case "categories": return jsonResponse_(getCategories());
      case "wallets": return jsonResponse_(getWalletsDetailed());
      case "budget": return jsonResponse_(getBudgetAnalysis());
      case "analytics": return jsonResponse_(getAnalyticsData());
      case "family": return jsonResponse_(getFamilyMembers());
      case "report": return jsonResponse_(getMonthlyReportData(e.parameter.month || null));
      case "reportPdf": return jsonResponse_(generateMonthlyReportPDF(e.parameter.month || null));
      case "debts": return jsonResponse_(getDebts());
      case "login": return jsonResponse_({ success: false, message: "Login hanya tersedia via POST", code: 405 });
      default: return jsonResponse_({ success: false, message: "Action tidak dikenal: " + action });
    }
  } catch (err) {
    logSystem_("ERROR", "doGet", err.message);
    return jsonResponse_({ success: false, message: "Server error: " + err.message });
  }
}

function validateLogin(name, pin) {
  try {
    const userSheet = getSS().getSheetByName(SHEET_USER);
    if (!userSheet) return { success: false, message: "Database belum diinisialisasi." };
    const data = userSheet.getDataRange().getValues();
    const nameInput = (name || "").toString().trim().toLowerCase();
    const pinInput = (pin || "").toString().trim();
    for (let i = 1; i < data.length; i++) {
      const rowName = (data[i][1] || "").toString().trim().toLowerCase();
      if (rowName === nameInput && nameInput !== "") {
        const rowPin = (data[i][3] || "").toString().trim();
        if (rowPin && rowPin === pinInput) {
          logAuth_("login", data[i][1], true, "");
          return { success: true, name: data[i][1], role: data[i][2] || "Viewer", chatId: data[i][0] };
        }
        logAuth_("login", data[i][1], false, "PIN salah");
        return { success: false, message: "PIN salah." };
      }
    }
    logAuth_("login", nameInput, false, "User tidak ditemukan");
    return { success: false, message: "Pengguna tidak ditemukan." };
  } catch (err) {
    logSystem_("ERROR", "validateLogin", err.message);
    return { success: false, message: "Error server: " + err.message };
  }
}

function monthKeyOf_(date) { return Utilities.formatDate(new Date(date), "GMT+7", "yyyy-MM"); }
function currentMonthKey_() { return monthKeyOf_(new Date()); }
function monthLabelOf_(monthKey) {
  const parts = monthKey.split("-");
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
  return Utilities.formatDate(d, "GMT+7", "MMMM yyyy");
}
function normalizeAmount_(raw) {
  if (typeof raw === "number") return raw;
  const cleaned = raw.toString().replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}
function generateTxId_() {
  const ts = new Date();
  const randomHex = Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  return "TX-" + Utilities.formatDate(ts, "GMT+7", "yyyyMMddHHmmss") + "-" + randomHex;
}
function getTxSheetData_() {
  const sheet = getSS().getSheetByName(SHEET_TX);
  if (!sheet) return { sheet: null, data: [] };
  return { sheet: sheet, data: sheet.getDataRange().getValues() };
}
function findTxRowIndexById_(data, id) {
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) return i;
  }
  return -1;
}
function txIsActive_(row) {
  if (row.length <= 12 || !row[12]) return true;
  return row[12].toString() === "Active";
}
function calculateSavingsRatio_(totalIncome, totalExpense) {
  if (totalIncome > 0) {
    const ratio = ((totalIncome - totalExpense) / totalIncome) * 100;
    return { ratio: ratio, status: totalIncome >= totalExpense ? "surplus" : "deficit", label: totalIncome >= totalExpense ? "Surplus" : "Defisit" };
  }
  if (totalExpense > 0) {
    return { ratio: null, status: "no_income", label: "Tidak ada pemasukan bulan ini" };
  }
  return { ratio: 0, status: "idle", label: "Tidak ada aktivitas" };
}
