import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './src/server/database';
import { ExtractedCompany, ScanResponse, BatchSaveRequest } from './src/types';

export const app = express();
const PORT = 3000;

// Increase payload limit for scanned image / PDF uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get Gemini AI instance dynamically (re-checks env key)
function getGeminiAI() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';
  return {
    ai: new GoogleGenAI({
      apiKey: apiKey || 'missing-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    }),
    apiKey,
  };
}

const apiRouter = express.Router();

// 1. Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Scan Document (PDF / Image / Camera)
apiRouter.post('/scan', async (req, res) => {
  const startTime = Date.now();
  try {
    const { fileData, mimeType, sourceType } = req.body;

    if (!fileData) {
      return res.status(400).json({ success: false, error: 'No file data provided.' });
    }

    const { ai, apiKey } = getGeminiAI();

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY environment variable is missing on Vercel/Server. Please set GEMINI_API_KEY in Vercel Project Settings -> Environment Variables.',
      });
    }

    // Clean base64 string
    const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
    const validMimeType = mimeType || 'image/jpeg';

    const imagePart = {
      inlineData: {
        mimeType: validMimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Please analyze this document/image containing business listings, visiting cards, directory pages, or trade pamphlets. Extract every distinct company listing accurately into JSON.`,
    };

    const systemInstruction = `You are an expert AI document scanner and OCR parser specialized in business directories, visiting cards, trade listings, and corporate brochures.

Key Objectives:
1. Identify and extract EVERY company, business listing, or visiting card on this page. If there are multiple companies listed on a single page, detect and extract EACH company separately as an individual object in the JSON array.
2. Ignore irrelevant non-business elements: advertisements, promotional banners, page numbers, catalog page headers, and footers.
3. For each detected company, extract the following fields with high accuracy:
   - companyName: Official name of the business or firm.
   - contactPerson: Name of contact person, proprietor, director, or representative.
   - mobile: Primary mobile / cell phone number(s).
   - phone: Office telephone, landline, or toll-free number(s).
   - email: Corporate or personal email address.
   - officeAddress: Full street / suite office address.
   - factoryAddress: Factory, manufacturing plant, or warehouse address if present.
   - city: City or town name.
   - state: State, province, or region.
   - pincode: ZIP code, postal code, or PIN code.
   - category: Product, industry, or business service category (e.g. Machinery, Electronics, Chemical, Logistics, Services, Textile, Food & Beverage, Medical).
   - website: Company website or domain (e.g., www.example.com).

4. Clean up formatting: normalize spacing, format phone numbers cleanly, fix capitalization. If a field is not present in the document, return an empty string "".`;

    const responseSchema = {
      type: Type.ARRAY,
      description: 'List of companies extracted from the document',
      items: {
        type: Type.OBJECT,
        properties: {
          companyName: { type: Type.STRING, description: 'Official business name' },
          contactPerson: { type: Type.STRING, description: 'Contact person or owner name' },
          mobile: { type: Type.STRING, description: 'Mobile phone number' },
          phone: { type: Type.STRING, description: 'Office phone / landline' },
          email: { type: Type.STRING, description: 'Email address' },
          officeAddress: { type: Type.STRING, description: 'Office location address' },
          factoryAddress: { type: Type.STRING, description: 'Factory location address' },
          city: { type: Type.STRING, description: 'City' },
          state: { type: Type.STRING, description: 'State' },
          pincode: { type: Type.STRING, description: 'Postal PIN code' },
          category: { type: Type.STRING, description: 'Business category' },
          website: { type: Type.STRING, description: 'Company website URL' },
        },
        required: ['companyName'],
      },
    };

    let geminiResponse: any = null;
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastModelError: any = null;

    for (const modelCandidate of modelsToTry) {
      try {
        geminiResponse = await ai.models.generateContent({
          model: modelCandidate,
          contents: { parts: [imagePart, textPart] },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
          },
        });
        if (geminiResponse) break;
      } catch (mErr: any) {
        lastModelError = mErr;
        console.warn(`Model ${modelCandidate} failed:`, mErr?.message || mErr);
      }
    }

    if (!geminiResponse) {
      throw new Error(
        lastModelError?.message ||
          'Gemini API error. Please verify your GEMINI_API_KEY in Vercel project environment variables.'
      );
    }

    const processingTimeMs = Date.now() - startTime;
    const rawText = geminiResponse.text ? geminiResponse.text.trim() : '[]';

    let parsedCompanies: any[] = [];
    try {
      parsedCompanies = JSON.parse(rawText);
    } catch (err) {
      console.error('JSON parse error from Gemini output:', err, rawText);
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsedCompanies = JSON.parse(match[0]);
        } catch (e) {
          parsedCompanies = [];
        }
      }
    }

    if (!Array.isArray(parsedCompanies)) {
      if (typeof parsedCompanies === 'object' && parsedCompanies !== null) {
        parsedCompanies = [parsedCompanies];
      } else {
        parsedCompanies = [];
      }
    }

    // Map and perform preliminary duplicate check against local DB
    const processedExtractedCompanies: ExtractedCompany[] = parsedCompanies.map((comp, idx) => {
      const companyName = comp.companyName || 'Unnamed Business';
      const contactPerson = comp.contactPerson || '';
      const mobile = comp.mobile || '';
      const phone = comp.phone || '';
      const email = comp.email || '';
      const officeAddress = comp.officeAddress || '';
      const factoryAddress = comp.factoryAddress || '';
      const city = comp.city || '';
      const state = comp.state || '';
      const pincode = comp.pincode || '';
      const category = comp.category || 'General Industry';
      const website = comp.website || '';

      const dupResult = db.checkDuplicate(companyName, mobile, email);

      return {
        tempId: `temp_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
        companyName,
        contactPerson,
        mobile,
        phone,
        email,
        officeAddress,
        factoryAddress,
        city,
        state,
        pincode,
        category,
        website,
        selected: true,
        duplicateStatus: {
          isDuplicate: dupResult.isDuplicate,
          conflictType: dupResult.conflictType,
          existingCompanyId: dupResult.existingCompanyId,
          existingCompanyName: dupResult.existingCompanyName,
          matchedFields: dupResult.matchedFields,
          action: dupResult.isDuplicate ? 'skip' : 'save_new',
        },
      };
    });

    const responsePayload: ScanResponse = {
      success: true,
      companies: processedExtractedCompanies,
      ocrTextSummary: `Extracted ${processedExtractedCompanies.length} business profile(s) from document.`,
      processingTimeMs,
    };

    res.json(responsePayload);
  } catch (err: any) {
    console.error('Error during AI scanning:', err);
    res.status(500).json({
      success: false,
      companies: [],
      processingTimeMs: Date.now() - startTime,
      error: err?.message || 'Failed to process document with Gemini AI',
    });
  }
});

// 3. Batch Check Duplicates
apiRouter.post('/check-duplicates', (req, res) => {
  const { companies } = req.body;
  if (!Array.isArray(companies)) {
    return res.status(400).json({ error: 'Companies list array required' });
  }

  const checked = companies.map((comp: ExtractedCompany) => {
    const dupResult = db.checkDuplicate(comp.companyName, comp.mobile, comp.email);
    return {
      ...comp,
      duplicateStatus: {
        isDuplicate: dupResult.isDuplicate,
        conflictType: dupResult.conflictType,
        existingCompanyId: dupResult.existingCompanyId,
        existingCompanyName: dupResult.existingCompanyName,
        matchedFields: dupResult.matchedFields,
        action: dupResult.isDuplicate ? 'skip' : 'save_new',
      },
    };
  });

  res.json({ companies: checked });
});

// 4. Batch Save / Import Leads (supports both /leads/batch-save and /save-batch)
const handleBatchSave = (req: express.Request, res: express.Response) => {
  try {
    const { leads, sourceType, importedBy, processingTimeMs }: BatchSaveRequest = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'No leads provided for saving' });
    }

    let importedCompanies = 0;
    let duplicatesCount = 0;

    for (const item of leads) {
      const { data, action, targetCompanyId } = item;

      if (action === 'skip') {
        duplicatesCount++;
        continue;
      }

      if (action === 'update_existing' && targetCompanyId) {
        db.updateLead(targetCompanyId, {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          mobile: data.mobile,
          phone: data.phone,
          email: data.email,
          officeAddress: data.officeAddress,
          factoryAddress: data.factoryAddress,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          category: data.category,
          website: data.website,
        });
        importedCompanies++;
        duplicatesCount++;
      } else {
        // action === 'save_new'
        db.saveLead({
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          mobile: data.mobile,
          phone: data.phone,
          email: data.email,
          officeAddress: data.officeAddress,
          factoryAddress: data.factoryAddress,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          category: data.category,
          website: data.website,
        });
        importedCompanies++;
      }
    }

    // Log the import session
    const log = db.addImportLog({
      importedBy: importedBy || 'Scanner User',
      sourceType: sourceType || 'image',
      totalCompanies: leads.length,
      importedCompanies,
      duplicates: duplicatesCount,
      processingTime: processingTimeMs || 1500,
    });

    res.json({
      success: true,
      message: `Successfully processed ${leads.length} lead(s). Saved: ${importedCompanies}, Skipped/Updated: ${duplicatesCount}`,
      importedCompanies,
      duplicatesCount,
      log,
    });
  } catch (err: any) {
    console.error('Error batch saving leads:', err);
    res.status(500).json({ error: err?.message || 'Failed to save leads' });
  }
};

apiRouter.post('/leads/batch-save', handleBatchSave);
apiRouter.post('/save-batch', handleBatchSave);

// 5. Get All Leads
apiRouter.get('/leads', (req, res) => {
  try {
    const leads = db.getAllLeads();
    res.json({ leads });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch leads' });
  }
});

// 6. Update single lead
apiRouter.put('/leads/:id', (req, res) => {
  const { id } = req.params;
  const updated = db.updateLead(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json({ success: true, lead: updated });
});

// 7. Delete single lead
apiRouter.delete('/leads/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteLead(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json({ success: true, id });
});

// 8. Get Dashboard Stats & Recent Imports
apiRouter.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch stats' });
  }
});

// 9. Get Import Logs
apiRouter.get('/import-logs', (req, res) => {
  try {
    const logs = db.getLogs();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch logs' });
  }
});

// Mount router for both '/api' prefix and root '/' to support Vercel serverless path rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal Server Error',
  });
});

export async function startServer() {
  // Vite Middleware for development vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Smart Scanner server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
