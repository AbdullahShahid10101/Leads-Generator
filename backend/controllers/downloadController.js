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

    // Prepare data for export
    const exportData = leads.map((lead) => ({
      company: lead.company || "",
      contact: lead.name || "",
      role: lead.industry || "",
      email: lead.email || "",
      phone: lead.phone || "",
      website: lead.source || "",
      location: lead.location || "",
      status: "New",
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
        doc.moveDown();

        const startX = 50;
        let yPosition = doc.y + 20;
        const columnWidth = (doc.page.width - 2 * startX) / fieldList.length;

        // ---- Draw table headers ----
        doc.fontSize(10).font("Helvetica-Bold");
        fieldList.forEach((field, i) => {
          doc.text(field.toUpperCase(), startX + i * columnWidth, yPosition, {
            width: columnWidth - 5,
            ellipsis: true,
          });
        });

        yPosition += 20;
        doc.font("Helvetica"); // reset font

        // ---- Draw table rows ----
        exportData.forEach((lead) => {
          if (yPosition > doc.page.height - 50) {
            doc.addPage();
            yPosition = 50;
          }

          // Calculate row height (max height among all fields)
          let rowHeight = 0;
          const rowValues = fieldList.map((f) => String(lead[f] || ""));

          rowValues.forEach((val, i) => {
            const h = doc.heightOfString(val, {
              width: columnWidth - 5,
              align: "left",
            });
            if (h > rowHeight) rowHeight = h;
          });

          // Draw each cell
          rowValues.forEach((val, i) => {
            doc.text(val, startX + i * columnWidth, yPosition, {
              width: columnWidth - 5,
              continued: false,
            });
          });

          yPosition += rowHeight + 10; // move to next row
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
