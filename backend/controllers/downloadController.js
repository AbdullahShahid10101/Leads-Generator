const { supabase, adminSupabase } = require("../config/supabase");
const { Parser } = require("json2csv");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");

// -----------------------------------------------------------------------------
// Export leads to various formats
// -----------------------------------------------------------------------------
const exportLeads = async (req, res) => {
  try {
    const {
      format = "csv",
      fields = "company,contact,role,email,phone,website,location,status",
      listName,
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Parse industry & location from listName (format: "Industry — Location")
    let industryFilter = null;
    let locationFilter = null;
    if (listName && listName.includes("—")) {
      const [industry, location] = listName.split("—").map((str) => str.trim());
      industryFilter = industry;
      locationFilter = location;
    }

    const db = adminSupabase || supabase;
    let query = db
      .from("leads")
      .select("*")
      .eq("added_by", req.user.id)
      .order("created_at", { ascending: false });

    // Apply filters if listName chosen
    if (industryFilter) query = query.eq("industry", industryFilter);
    if (locationFilter) query = query.eq("location", locationFilter);

    const { data: leads, error } = await query;
    if (error) throw error;

    if (!leads || leads.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No leads found for download" });
    }

    // Parse requested fields
    const fieldList = fields.split(",").map((field) => field.trim());

    // Prepare data for export - use correct field mapping
    const exportData = leads.map((lead) => ({
      company: lead.company || "N/A",
      name: lead.name || "N/A",
      role: lead.role || "N/A",
      email: lead.email || "N/A",
      phone: lead.phone || "N/A",
      website: lead.source || "N/A",
      location: lead.location || "N/A",
      industry: lead.industry || "N/A",
      status: lead.status || "N/A",
    }));

    let fileContent;
    let fileName;
    let contentType;

    switch (format.toLowerCase()) {
      case "csv": {
        const parser = new Parser({ fields: fieldList });
        fileContent = parser.parse(exportData);
        fileName = `${listName || "leads"}_${Date.now()}.csv`;
        contentType = "text/csv";
        break;
      }

      case "xlsx": {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        fileContent = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });
        fileName = `${listName || "leads"}_${Date.now()}.xlsx`;
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
      }

      case "json": {
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `${listName || "leads"}_${Date.now()}.json`;
        contentType = "application/json";
        break;
      }
      case "pdf": {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          fileContent = Buffer.concat(chunks);
        });

        // Title
        doc.fontSize(18).text("Leads Export", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.text(`Total leads: ${leads.length}`);
        if (listName) {
          doc.text(`List: ${listName}`);
        }
        doc.moveDown(2);

        // Calculate column widths based on content
        const pageWidth = doc.page.width;
        const margin = 40;
        const availableWidth = pageWidth - 2 * margin;
        const minColumnWidth = 60;
        const maxColumnWidth = 120;

        // Calculate optimal column widths
        const columnWidths = fieldList.map(field => {
          let maxWidth = doc.widthOfString(field.toUpperCase(), { fontSize: 10 });

          // Check data content width
          exportData.forEach(lead => {
            const value = String(lead[field] || "");
            const width = doc.widthOfString(value, { fontSize: 9 });
            if (width > maxWidth) maxWidth = width;
          });

          return Math.min(Math.max(maxWidth + 15, minColumnWidth), maxColumnWidth);
        });

        // Adjust column widths to fit page
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        const scaleFactor = availableWidth / totalWidth;
        const adjustedColumnWidths = columnWidths.map(width => width * scaleFactor);

        let yPosition = doc.y + 20;

        // Function to check if we need a new page
        const checkPageBreak = (requiredHeight) => {
          if (yPosition + requiredHeight > doc.page.height - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
          }
          return false;
        };

        // Draw table headers
        doc.fontSize(10).font("Helvetica-Bold");
        let currentX = margin;

        fieldList.forEach((field, i) => {
          doc.text(field.toUpperCase(), currentX, yPosition, {
            width: adjustedColumnWidths[i],
            align: 'left'
          });
          currentX += adjustedColumnWidths[i];
        });

        yPosition += 20;

        // Draw header underline
        doc.moveTo(margin, yPosition).lineTo(margin + availableWidth, yPosition).stroke();
        yPosition += 5;

        doc.font("Helvetica").fontSize(9); // reset font and size

        // Draw table rows
        exportData.forEach((lead, rowIndex) => {
          // Calculate row height
          let rowHeight = 15; // minimum height
          const rowValues = fieldList.map((f) => String(lead[f] || ""));

          rowValues.forEach((val, i) => {
            const textHeight = doc.heightOfString(val, {
              width: adjustedColumnWidths[i] - 5,
              align: "left",
            });
            if (textHeight > rowHeight) rowHeight = textHeight;
          });

          // Check if we need a new page
          if (checkPageBreak(rowHeight + 10)) {
            // Redraw headers on new page
            doc.font("Helvetica-Bold").fontSize(10);
            currentX = margin;
            fieldList.forEach((field, i) => {
              doc.text(field.toUpperCase(), currentX, yPosition, {
                width: adjustedColumnWidths[i],
                align: 'left'
              });
              currentX += adjustedColumnWidths[i];
            });
            yPosition += 20;

            doc.moveTo(margin, yPosition).lineTo(margin + availableWidth, yPosition).stroke();
            yPosition += 5;

            doc.font("Helvetica").fontSize(9);
          }

          // Draw row data
          currentX = margin;
          rowValues.forEach((val, i) => {
            doc.text(val, currentX + 3, yPosition + 4, {
              width: adjustedColumnWidths[i] - 6,
              align: "left",
              lineGap: 1
            });
            currentX += adjustedColumnWidths[i];
          });

          // Draw row separator with more space from text
          doc.moveTo(margin, yPosition + rowHeight + 8)
             .lineTo(margin + availableWidth, yPosition + rowHeight + 8)
             .stroke();

          yPosition += rowHeight + 10;
        });

        doc.end();
        await new Promise((resolve) => doc.on("end", resolve));

        fileContent = Buffer.concat(chunks);
        fileName = `${listName || "leads"}_${Date.now()}.pdf`;
        contentType = "application/pdf";
        break;
      }

      default:
        return res
          .status(400)
          .json({ success: false, error: "Unsupported format" });
    }

    // -------------------------------------------------------------------------
    // ✅ Add CORS + file headers
    // -------------------------------------------------------------------------
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Content-Type", contentType);

    const encodedFileName = encodeURIComponent(fileName);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodedFileName}"`
    );

    // Send file content
    res.send(fileContent);

    // -------------------------------------------------------------------------
    // Save download history
    // -------------------------------------------------------------------------
    try {
      const { error: insertError } = await db.from("downloads").insert({
        file: fileName,
        format: format.toUpperCase(),
        user_id: req.user.id,
        list_name: listName,
        lead_count: leads.length,
      });

      if (insertError) {
        console.error("Failed to save download history:", insertError);
      }
    } catch (historyError) {
      console.error("Error saving download history:", historyError);
    }

    console.log(
      `User ${req.user.id} downloaded ${leads.length} leads as ${format}`
    );
  } catch (error) {
    console.error("Export leads error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Server error" });
  }
};

// -----------------------------------------------------------------------------
// Get download history for user
// -----------------------------------------------------------------------------
const getDownloadHistory = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = adminSupabase || supabase;
    const { data, error } = await db
      .from("downloads")
      .select("id, file, format, created, list_name, lead_count")
      .eq("user_id", req.user.id)
      .order("created", { ascending: false });

    if (error) {
      console.error("Database error fetching download history:", error);
      return res.json({ success: true, data: [] });
    }

    const formattedHistory = data.map((download) => ({
      id: download.id,
      file: download.file,
      format: download.format,
      created: download.created,
      list_name: download.list_name,
      lead_count: download.lead_count,
    }));

    return res.json({ success: true, data: formattedHistory });
  } catch (error) {
    console.error("Get download history error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Server error" });
  }
};

// -----------------------------------------------------------------------------
// Get available industry-location combinations from database
// -----------------------------------------------------------------------------
const getAvailableLists = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = adminSupabase || supabase;
    const { data, error } = await db
      .from("leads")
      .select("industry, location")
      .eq("added_by", req.user.id)
      .not("industry", "is", null)
      .not("location", "is", null)
      .order("industry", { ascending: true })
      .order("location", { ascending: true });

    if (error) throw error;

    const uniqueCombinations = {};
    data.forEach((lead) => {
      if (lead.industry && lead.location) {
        const key = `${lead.industry} — ${lead.location}`;
        uniqueCombinations[key] = true;
      }
    });

    const availableLists = Object.keys(uniqueCombinations).sort();

    if (availableLists.length === 0) {
      availableLists.push(
        "Dentists — NYC",
        "IT Services — CA",
        "Law Firms — Florida",
        "Restaurants — Texas"
      );
    }

    return res.json({ success: true, data: availableLists });
  } catch (error) {
    console.error("Get available lists error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Server error" });
  }
};

module.exports = {
  exportLeads,
  getDownloadHistory,
  getAvailableLists,
};
